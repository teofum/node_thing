import {
  HandleType,
  NodeData,
  NodePassBufferDescriptor,
  NodeType,
  ShaderNode,
} from "@/schemas/node.schema";
import {
  FlatGraph,
  Graph,
  GroupNode,
  isEdgeBetweenShaders,
  isGroup,
  isShader,
  Layer,
} from "@/store/project.types";
import { isGroupIO } from "@/utils/edge";
import { Edge } from "@xyflow/react";

type Buffer = {
  idx: number;
  type: HandleType;
  users: {
    nodeId: string;
    input: string;
  }[];
};

type Input = {
  nodeId: string;
  type: string;
  image: string | null;
  outputBindings: Record<string, number>;
};

export type RenderPass = {
  nodeId: string;
  nodeType: NodeData["type"];
  shader: string;
  inputBindings: Record<string, number | null>;
  outputBindings: Record<string, number>;
  parameters: Record<string, string>;
};

const MAX_ITERATIONS = 1000;
export class RenderPipeline {
  passes: RenderPass[] = [];
  inputs: Input[] = [];
  bufferTypes: HandleType[] = [];
  outputBuffer = -1;
  outputAlphaBuffer = -1;

  private nodes: ShaderNode[] = [];
  private edges: Edge[] = [];
  private nodeTypes: Record<string, NodeType>;
  private buffers: Buffer[] = [];
  private queue: ShaderNode[] = [];

  public static tryCreate(
    layer: Pick<Layer, "nodes" | "edges">,
    nodeTypes: Record<string, NodeType>,
  ) {
    try {
      return new RenderPipeline(layer, nodeTypes);
    } catch (e: unknown) {
      console.warn((e as Error).message);
      return null;
    }
  }

  public static create(
    layer: Pick<Layer, "nodes" | "edges">,
    nodeTypes: Record<string, NodeType>,
  ) {
    return new RenderPipeline(layer, nodeTypes);
  }

  public get graph(): FlatGraph {
    return { nodes: this.nodes, edges: this.edges };
  }

  private constructor(
    layer: Pick<Layer, "nodes" | "edges">,
    nodeTypes: Record<string, NodeType>,
  ) {
    const graph = expandGroups(layer);
    this.nodes = graph.nodes;
    this.edges = graph.edges;
    this.nodeTypes = nodeTypes;

    this.findConnectedNodes();

    const roots = this.findRoots();
    this.queue.push(...roots);

    let i = 0;
    while (this.queue.length > 0) {
      if (i++ > MAX_ITERATIONS) throw new Error("max iteration count exceeded");

      // We just asserted the array has items, unshift will never return undefined
      const node = this.queue.shift() as ShaderNode;

      const { dependencies, hasUnresolved } = this.findDependencies(node);
      if (hasUnresolved) {
        this.queue.push(node);
        continue;
      }

      if (isOutput(node)) {
        this.outputBuffer = this.indexOfDependency(dependencies[0]);
        this.outputAlphaBuffer = this.indexOfDependency(dependencies[1]);
        break;
      } else if (isInput(node)) {
        const input = createInput(node, this.getOutputBindings(node));
        this.inputs.push(input);
      } else {
        const passes = this.buildRenderPasses(node, dependencies);
        this.passes.push(...passes);
      }
    }

    this.bufferTypes = this.buffers.map((buf) => buf.type);

    if (this.outputBuffer < 0) {
      throw new Error("Output is disconnected");
    }
  }

  private indexOfDependency(dependency: { input: string; buf: Buffer }) {
    return dependency ? this.buffers.indexOf(dependency.buf) : -1;
  }

  private findOutputNode() {
    const outputs = this.nodes.filter(isOutput);

    // If there are no outputs, do nothing!
    if (outputs.length === 0) return null;

    if (outputs.length > 1)
      console.warn("More than one output in render graph!");
    return outputs[0]; // There shouldn't be multiple outputs per graph!
  }

  private findConnectedNodes() {
    const output = this.findOutputNode();
    if (!output) throw new Error("No output node");

    const queue: ShaderNode[] = [output];

    const connectedIds = new Set<string>();
    while (queue.length > 0) {
      const node = queue.shift() as ShaderNode;
      const nodeType = this.nodeTypes[node.data.type];

      // Tag the node as connected to output
      connectedIds.add(node.id);

      // Enqueue any inputs that aren't already in queue
      for (const input of Object.keys(nodeType.inputs)) {
        this.edges
          .filter(
            (edge) => edge.target === node.id && edge.targetHandle === input,
          )
          .forEach((edge) => {
            const outputNode = this.nodes.find((n) => n.id === edge.source);
            if (
              outputNode &&
              !queue.includes(outputNode) &&
              !connectedIds.has(outputNode.id)
            ) {
              queue.push(outputNode);
            }
          });
      }
    }

    // Cull the nodes array, removing all nodes not connected to the output
    this.nodes = this.nodes.filter((node) => connectedIds.has(node.id));
  }

  private findRoots() {
    return this.nodes.filter((node) => {
      const inputs = this.edges.filter((edge) => edge.target === node.id);
      return inputs.length === 0;
    });
  }

  private findDependencies(node: ShaderNode) {
    const nodeType = this.nodeTypes[node.data.type];

    const deps = Object.keys(nodeType.inputs)
      .filter((input) =>
        this.edges.some(
          (edge) => edge.target === node.id && edge.targetHandle === input,
        ),
      )
      .map((input) => ({
        input,
        buf: this.buffers.find((buf) =>
          buf.users.some((u) => u.input === input && u.nodeId === node.id),
        ),
      }));

    const hasUnresolved = deps.some((d) => d.buf === undefined);
    const dependencies = deps as { input: string; buf: Buffer }[];

    return { dependencies, hasUnresolved };
  }

  private findOrCreateBuffer(type: Buffer["type"], used: Buffer["idx"][]) {
    let freeBuffer = this.buffers.find(
      (buf) =>
        buf.type === type && buf.users.length === 0 && !used.includes(buf.idx),
    );
    if (!freeBuffer) {
      freeBuffer = { idx: this.buffers.length, users: [], type };
      this.buffers.push(freeBuffer);
    }

    return freeBuffer;
  }

  private getInputBindings(
    node: ShaderNode,
    dependencies: { input: string; buf: Buffer }[],
  ) {
    const nodeType = this.nodeTypes[node.data.type];
    const inputBindings: Record<string, number | null> = {};

    for (const input of Object.keys(nodeType.inputs)) {
      inputBindings[input] =
        dependencies.find((dep) => dep.input === input)?.buf.idx ?? null;
    }

    return inputBindings;
  }

  private getOutputBindings(node: ShaderNode) {
    const nodeType = this.nodeTypes[node.data.type];
    const buffersUsed: Buffer["idx"][] = [];
    const outputBindings: RenderPass["outputBindings"] = {};

    for (const [outputKey, output] of Object.entries(nodeType.outputs)) {
      const buf = this.findOrCreateBuffer(output.type, buffersUsed);
      buffersUsed.push(buf.idx);

      this.edges
        .filter(
          (edge) => edge.source === node.id && edge.sourceHandle === outputKey,
        )
        .forEach((edge) => {
          // Connect relevant inputs to buffer
          buf.users.push({
            nodeId: edge.target,
            input: edge.targetHandle ?? "",
          });

          // Queue the connected node if it's not queued already
          const inputNode = this.nodes.find((n) => n.id === edge.target);
          if (inputNode && !this.queue.includes(inputNode)) {
            this.queue.push(inputNode);
          }
        });

      // Add render pass output bindings
      outputBindings[outputKey] = buf.idx;
    }

    return outputBindings;
  }

  private getPassOutputBindings(buffers: NodePassBufferDescriptor[]) {
    const buffersUsed: Buffer["idx"][] = [];
    const outputBindings: RenderPass["outputBindings"] = {};

    for (const buffer of buffers) {
      const buf = this.findOrCreateBuffer(buffer.type, buffersUsed);
      buffersUsed.push(buf.idx);

      outputBindings[buffer.name] = buf.idx;
    }

    return outputBindings;
  }

  private buildRenderPasses(
    node: ShaderNode,
    dependencies: { input: string; buf: Buffer }[],
  ) {
    const nodeType = this.nodeTypes[node.data.type];
    const inputBindings = this.getInputBindings(node, dependencies);
    const outputBindings = this.getOutputBindings(node);

    const additionalPasses = nodeType.additionalPasses ?? [];

    const parameters: RenderPass["parameters"] = {};
    for (const [key, { value }] of Object.entries(node.data.parameters)) {
      if (value && nodeType.parameters[key].type === "select")
        parameters[key] = value;
    }

    const basePass: RenderPass = {
      nodeId: node.id,
      nodeType: node.data.type,
      shader: "main",
      inputBindings,
      outputBindings: additionalPasses.length
        ? this.getPassOutputBindings(additionalPasses[0].buffers)
        : outputBindings,
      parameters,
    };

    const passes = [basePass];
    for (let i = 0; i < additionalPasses.length; i++) {
      const lastPassOutputBindings = passes.at(-1)!.outputBindings;
      const thisPassOutputBindings =
        i < additionalPasses.length - 1
          ? this.getPassOutputBindings(additionalPasses[i + 1].buffers)
          : outputBindings;

      passes.push({
        nodeId: node.id,
        nodeType: node.data.type,
        shader: `pass_${i}`,
        inputBindings: lastPassOutputBindings,
        outputBindings: thisPassOutputBindings,
        parameters,
      });
    }

    unlinkDependencies(dependencies, node);

    return passes;
  }
}

function getInputEdges(group: GroupNode, edges: Edge[]): Edge[] {
  const externalInputEdges = edges.filter((e) => e.target === group.id);
  const internalInputEdges = group.data.edges.filter((e) =>
    e.source.startsWith("__group_input"),
  );

  const joinedInputEdges = internalInputEdges
    .map((ie) => {
      const ee = externalInputEdges.find((e) => e.targetHandle === ie.source);
      if (!ee) return null;

      return {
        ...ie,
        source: ee.source,
        target: `${group.id}::${ie.target}`,
        sourceHandle: ee.sourceHandle,
        targetHandle: ie.targetHandle,
      };
    })
    .filter((ie) => ie !== null);

  return joinedInputEdges;
}

function getOutputEdges(group: GroupNode, edges: Edge[]): Edge[] {
  const externalOutputEdges = edges.filter((e) => e.source === group.id);
  const internalOutputEdges = group.data.edges.filter((e) =>
    e.target.startsWith("__group_output"),
  );

  const joinedOutputEdges = internalOutputEdges
    .map((ie) => {
      const ee = externalOutputEdges.find((e) => e.sourceHandle === ie.target);
      if (!ee) return null;

      return {
        ...ie,
        target: ee.target,
        source: `${group.id}::${ie.source}`,
        targetHandle: ee.targetHandle,
        sourceHandle: ie.sourceHandle,
      };
    })
    .filter((ie) => ie !== null);

  return joinedOutputEdges;
}

export function expandGroups({ nodes, edges }: Graph): FlatGraph {
  const expandedNodes = nodes.filter((n) => isShader(n));
  const expandedEdges = edges.filter((e) => isEdgeBetweenShaders(e, nodes));

  const groups = nodes.filter((n) => isGroup(n));
  for (const group of groups) {
    const { nodes: groupNodes, edges: groupEdges } = expandGroups(group.data);

    const expandedGroupNodes = groupNodes
      .filter((n) => !n.data.type.startsWith("__group_"))
      .map((n) => ({ ...n, id: `${group.id}::${n.id}` }));

    const expandedGroupEdges = groupEdges
      .filter((e) => !isGroupIO(e, groupNodes))
      .map((e) => ({
        ...e,
        source: `${group.id}::${e.source}`,
        target: `${group.id}::${e.target}`,
      }));

    const groupInputEdges = getInputEdges(group, edges);
    const groupOutputEdges = getOutputEdges(group, edges);

    expandedNodes.push(...expandedGroupNodes);
    expandedEdges.push(...expandedGroupEdges);
    expandedEdges.push(...groupInputEdges);
    expandedEdges.push(...groupOutputEdges);
  }

  return { nodes: expandedNodes, edges: expandedEdges };
}

function unlinkDependencies(
  dependencies: { input: string; buf: Buffer }[],
  node: ShaderNode,
) {
  for (const dep of dependencies) {
    dep.buf.users = dep.buf.users.filter((user) => user.nodeId !== node.id);
  }
}

function isInput(node: ShaderNode) {
  return node.data.type.startsWith("__input");
}

function isOutput(node: ShaderNode) {
  return node.data.type === "__output";
}

function createInput(node: ShaderNode, outputBindings: Record<string, number>) {
  return {
    nodeId: node.id,
    type: node.data.type,
    image: node.data.parameters.image?.value ?? null,
    outputBindings,
  };
}
