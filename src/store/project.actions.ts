import { Edge, EdgeChange, Node, NodeChange } from "@xyflow/react";
import { nanoid } from "nanoid";

import { NodeType, ShaderNode } from "@/schemas/node.schema";
import {
  Project,
  Layer,
  NodeTypeDescriptor,
  HandleDescriptor,
  NodeTypes,
  StoredProject,
  NodeTypeDependency,
  isShader,
  Graph,
  isGroup,
} from "./project.types";
import { NODE_TYPES } from "@/utils/node-type";
import { Command } from "./types/command";
import { diff, revertChangeset } from "json-diff-ts";

const initialNodes: ShaderNode[] = [
  {
    id: "__output",
    position: { x: 0, y: 0 },
    data: { type: "__output", defaultValues: {}, parameters: {} },
    type: "RenderShaderNode",
    deletable: false,
  },
];
const initialEdges: Edge[] = [];
const initialSize = { width: 1920, height: 1080 };

export function prepareProjectForExport(project: Project): StoredProject {
  return {
    ...project,
    nodeTypes: { custom: project.nodeTypes.custom },
    externalDependencies: {
      nodeTypes: getNodeTypeDependencies(project),
    },
  };
}

function getNodeTypeDependencies(project: Project): NodeTypeDependency[] {
  const projectNodeTypes = new Set(
    project.layers
      .flatMap((layer) =>
        layer.nodes.map((node) => (isShader(node) ? node.data.type : "")),
      )
      .filter((type) => Object.hasOwn(project.nodeTypes.external, type))
      .map((type) => [type, project.nodeTypes.external[type]] as const),
  );

  return [...projectNodeTypes].map(([id, type]) => ({
    id,
    name: type.name,
    externalId: type.externalShaderId ?? "",
  }));
}

export function getAllNodeTypes(nodeTypes: {
  default: NodeTypes;
  custom: NodeTypes;
  external: NodeTypes;
}) {
  return {
    ...nodeTypes.default,
    ...nodeTypes.custom,
    ...nodeTypes.external,
  };
}

export function modifyNode(
  state: Project,
  id: string,
  updater: (node: ShaderNode) => Partial<ShaderNode>,
): Partial<Project> {
  return modifyGroup(state, ({ nodes }) => {
    const node = nodes.find((n) => n.id === id);
    if (!node || !isShader(node)) return {};

    return {
      nodes: [
        ...nodes.filter((n) => n.id !== id),
        {
          ...node,
          ...updater(node),
          id: node.id,
        },
      ],
    };
  });
}

export function modifyGroup(
  state: Project,
  updater: (data: Graph) => Partial<Graph>,
): Partial<Project> {
  const modify = (data: Graph, groupPath: string[]): Partial<Graph> => {
    if (groupPath.length === 0) return updater(data);

    const group = data.nodes.filter(isGroup).find((n) => n.id === groupPath[0]);
    if (!group) return {};

    return {
      nodes: [
        ...data.nodes.filter((n) => n.id !== group.id),
        {
          ...group,
          data: { ...group.data, ...modify(group.data, groupPath.slice(1)) },
        },
      ],
    };
  };

  return modifyLayer(state, (layer) => modify(layer, state.currentGroup));
}

export function modifyLayer(
  state: Project,
  updater: (layer: Layer) => Partial<Layer>,
  idx?: number,
): Partial<Project> {
  const { layers, currentLayer } = state;

  const layerIdx = idx ?? currentLayer;
  const layerToModify = layers[layerIdx];
  if (!layerToModify) return {};

  const layersUnder = layers.slice(0, layerIdx);
  const layersOver = layers.slice(layerIdx + 1);

  return {
    layers: [
      ...layersUnder,
      {
        ...layerToModify,
        ...updater(layerToModify),
      },
      ...layersOver,
    ],
  };
}

export function updateNodeType(
  name: string,
  desc: NodeTypeDescriptor,
): (state: Project) => Partial<Project> {
  return ({ nodeTypes }: Project) => {
    const inputs = createHandles(desc.inputs);
    const outputs = createHandles(desc.outputs);

    const newNodeType: NodeType = {
      name: desc.name,
      category: "Custom",
      shader: desc.code,
      inputs,
      outputs,
      parameters: {},
    };

    return {
      nodeTypes: {
        ...nodeTypes,
        custom: { ...nodeTypes.custom, [name]: newNodeType },
      },
    };
  };
}

export function createHandles(desc: HandleDescriptor[]) {
  const handles: NodeType["inputs" | "outputs"] = {};
  for (const { name, display, type } of desc) {
    handles[name] = { name: display, type };
  }
  return handles;
}

export function createLayer(
  name: string,
  size = { width: 1920, height: 1080 },
): Layer {
  return {
    nodes: [...initialNodes],
    edges: [...initialEdges],
    position: { x: 0, y: 0 },
    size,
    id: newLayerId(),
    name,
  };
}

export function newLayerId(): string {
  return `layer_${nanoid()}`;
}

export function createInitialState(): Project {
  return {
    layers: [createLayer("Background")],
    currentLayer: 0,
    currentGroup: [],

    properties: { canvas: initialSize },
    nodeTypes: {
      default: NODE_TYPES,
      custom: {},
      external: {},
    },
    projectName: "Untitled Project",

    history: [],
    done: -1, // todo, deberia haber un action inicial y arrancar en 0
  };
}

export function mergeProject(imported: unknown, current: Project): Project {
  return {
    ...current,
    ...(imported as Project),
    nodeTypes: {
      ...current.nodeTypes,
      custom: (imported as Project).nodeTypes.custom,
    },
    properties: {
      ...current.properties,
      ...(imported as Project).properties,
    },
  };
}

export function historyPush(h: Project["history"], cmd: Command) {
  return [cmd, ...h];
}

type HistoryOptions = {
  collapse?: boolean;
};

export function withHistory(
  state: Project,
  newState: Partial<Project>,
  command: string,
  options: HistoryOptions = {
    collapse: false,
  },
) {
  const {
    history,
    done,
    currentRoomId,
    yjsDoc,
    realtimeChannel,
    awareness,
    collaborationEnabled,
    connectedUsers,
    ...cleanState
  } = state as Project & {
    currentRoomId?: string | null;
    yjsDoc?: unknown;
    realtimeChannel?: unknown;
    awareness?: unknown;
    collaborationEnabled?: boolean;
    connectedUsers?: unknown[];
  };
  const serializable = JSON.parse(JSON.stringify(cleanState));
  const fullNewState = { ...serializable, ...newState };

  if (
    options.collapse &&
    done === 0 &&
    history[done]?.command === command &&
    history[done]?.diff
  ) {
    const oldState = revertChangeset(serializable, history[done].diff);
    return {
      ...newState,
      history: historyPush(history.slice(done + 1), {
        command,
        diff: diff(oldState, fullNewState),
        layerIdx: fullNewState.currentLayer,
      }),
      done: 0,
    };
  }

  return {
    ...newState,
    history: historyPush(history.slice(done), {
      command,
      diff: diff(serializable, fullNewState),
      layerIdx: fullNewState.currentLayer,
    }),
    done: 0,
  };
}

const nodeChangeTypes = {
  add: "tracked",
  remove: "tracked",
  replace: "tracked",
  position: "collapsed",
  dimensions: "untracked",
  select: "untracked",
} satisfies Record<
  NodeChange<Node>["type"],
  "tracked" | "collapsed" | "untracked"
>;

export function getNodeChangesByType(changes: NodeChange<Node>[]) {
  return {
    tracked: changes.filter(
      (change) => nodeChangeTypes[change.type] === "tracked",
    ),
    collapsed: changes.filter(
      (change) => nodeChangeTypes[change.type] === "collapsed",
    ),
    untracked: changes.filter(
      (change) => nodeChangeTypes[change.type] === "untracked",
    ),
  };
}

const edgeChangeTypes = {
  add: "tracked",
  remove: "tracked",
  replace: "tracked",
  select: "untracked",
} satisfies Record<EdgeChange<Edge>["type"], "tracked" | "untracked">;

export function getEdgeChangesByType(changes: EdgeChange<Edge>[]) {
  return {
    tracked: changes.filter(
      (change) => edgeChangeTypes[change.type] === "tracked",
    ),
    untracked: changes.filter(
      (change) => edgeChangeTypes[change.type] === "untracked",
    ),
  };
}
