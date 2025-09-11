import { HandleType, NodeData } from "@/schemas/node.schema";
import { Layer, ShaderNode } from "@/store/store";
import { NODE_TYPES } from "@/utils/node-type";

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
  outputBindings: Record<string, number>;
};

export type RenderPass = {
  nodeType: NodeData["type"];
  inputBindings: Record<string, number | null>;
  outputBindings: Record<string, number>;
  defaultInputValues: Record<string, number | number[]>;
};

export type RenderPipeline = {
  passes: RenderPass[];
  inputs: Input[];
  outputBuffer: number;
  outputAlphaBuffer: number;
  bufferTypes: HandleType[];
};

export function buildRenderPipeline({
  nodes,
  edges,
}: Layer): RenderPipeline | null {
  const queue: ShaderNode[] = [];
  const buffers: Buffer[] = [];
  const passes: RenderPass[] = [];
  const inputs: Input[] = [];
  let outputBuffer = -1;
  let outputAlphaBuffer = -1;

  /*
   * Find outputs for pre-process culling step
   */
  const outputs = nodes.filter((node) => node.data.type === "__output");

  // If there are no outputs, do nothing!
  if (outputs.length === 0) return null;

  if (outputs.length > 1) console.warn("More than one output in render graph!");
  const output = outputs[0]; // There shouldn't be multiple outputs per graph!

  /*
   * Graph culling: start from the output and work backwards, tagging all
   * connected nodes. This ensures any disconnected nodes or dead ends are
   * ignored when we traverse the graph later.
   */
  queue.push(output);

  const connectedIds = new Set<string>();
  while (queue.length > 0) {
    // We just asserted the array has items, unshift will never return undefined
    const node = queue.shift() as ShaderNode;
    const nodeType = NODE_TYPES[node.data.type];

    // // Detect loops
    // if (connectedIds.has(node.id)) {
    //   console.error("loop detected in shader graph");
    //   return null;
    // }

    // Tag the node as connected to output
    connectedIds.add(node.id);

    // Enqueue any inputs that aren't already in queue
    for (const input of Object.keys(nodeType.inputs)) {
      edges
        .filter(
          (edge) => edge.target === node.id && edge.targetHandle === input,
        )
        .forEach((edge) => {
          const outputNode = nodes.find((n) => n.id === edge.source);
          if (outputNode && !queue.includes(outputNode)) {
            queue.push(outputNode);
          }
        });
    }
  }

  // Clear the queue
  queue.splice(0);

  // Cull the nodes array, removing all nodes not connected to the output
  nodes = nodes.filter((node) => connectedIds.has(node.id));

  /*
   * Find the root nodes we're starting from.
   * A node is a root if it has no inputs, or if all of its inputs are static
   * (main input, aux image input)
   */
  const roots = nodes.filter((node) => {
    const inputs = edges.filter((edge) => edge.target === node.id);
    return inputs.length === 0;
  });

  queue.push(...roots);

  /*
   * Helper function.
   * Get a buffer of the right type suitable for writing, or create one if there are none.
   */
  const findOrCreateBuffer = (type: Buffer["type"], used: Buffer["idx"][]) => {
    let freeBuffer = buffers.find(
      (buf) =>
        buf.type === type && buf.users.length === 0 && !used.includes(buf.idx),
    );
    if (!freeBuffer) {
      freeBuffer = { idx: buffers.length, users: [], type };
      buffers.push(freeBuffer);
    }

    return freeBuffer;
  };

  /*
   * Explore the graph in order
   */
  let i = 0;
  while (queue.length > 0) {
    if (i++ > 1000) {
      console.error("max iteration count exceeded");
      return null;
    }

    // We just asserted the array has items, unshift will never return undefined
    const node = queue.shift() as ShaderNode;
    const nodeType = NODE_TYPES[node.data.type];

    /*
     * Get a list of dependencies
     */
    const deps = Object.keys(nodeType.inputs)
      .filter((input) =>
        edges.some(
          (edge) => edge.target === node.id && edge.targetHandle === input,
        ),
      )
      .map((input) => ({
        input,
        buf: buffers.find((buf) =>
          buf.users.some((u) => u.input === input && u.nodeId === node.id),
        ),
      }));

    /*
     * If there are unresolved dependencies, push the node to the end of the
     * queue and skip it for now
     */
    const hasUnresolvedDeps = deps.some((d) => d.buf === undefined);
    if (hasUnresolvedDeps) {
      queue.push(node);
      continue;
    }
    const dependencies = deps as { input: string; buf: Buffer }[];

    if (node.data.type === "__output") {
      outputBuffer = dependencies[0]
        ? buffers.indexOf(dependencies[0].buf)
        : -1;
      outputAlphaBuffer = dependencies[1]
        ? buffers.indexOf(dependencies[1].buf)
        : -1;
      break;
    }

    /*
     * Build render pass for this node
     */
    const pass: RenderPass = {
      nodeType: node.data.type,
      inputBindings: {},
      outputBindings: {},
      defaultInputValues: node.data.defaultValues,
    };

    // Add input bindings
    for (const input of Object.keys(nodeType.inputs)) {
      pass.inputBindings[input] =
        dependencies.find((dep) => dep.input === input)?.buf.idx ?? null;
    }

    /*
     * Assign a buffer to each output, making sure not to reuse buffers.
     * This may allocate more buffers than actually necessary for nodes with
     * multiple unused outputs. Too bad! Limitation of WebGPU's bindful API.
     */
    const buffersUsed: Buffer["idx"][] = [];
    for (const [outputKey, output] of Object.entries(nodeType.outputs)) {
      const buf = findOrCreateBuffer(output.type, buffersUsed);
      buffersUsed.push(buf.idx);

      edges
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
          const inputNode = nodes.find((n) => n.id === edge.target);
          if (inputNode && !queue.includes(inputNode)) {
            queue.push(inputNode);
          }
        });

      // Add render pass output bindings
      pass.outputBindings[outputKey] = buf.idx;
    }

    /*
     * Unlink this node from all buffers it depends on
     */
    for (const dep of dependencies) {
      dep.buf.users = dep.buf.users.filter((user) => user.nodeId !== node.id);
    }

    /*
     * Add the render pass to the list
     * If it's an input, add it to the input list instead
     */
    if (node.data.type.startsWith("__input")) {
      inputs.push({
        nodeId: node.id,
        type: node.data.type,
        outputBindings: pass.outputBindings,
      });
    } else {
      passes.push(pass);
    }
  }

  return {
    passes,
    inputs,
    outputBuffer,
    outputAlphaBuffer,
    bufferTypes: buffers.map((buf) => buf.type),
  };
}
