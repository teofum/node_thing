import { Edge } from "@xyflow/react";
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
} from "./project.types";
import { NODE_TYPES } from "@/utils/node-type";
import { Command } from "./types/command";

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
      .flatMap((layer) => layer.nodes.map((node) => node.data.type))
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
  id: string,
  updater: (node: ShaderNode) => Partial<ShaderNode>,
): (state: Project) => Partial<Project> {
  return modifyLayer(({ nodes }) => {
    const node = nodes.find((n) => n.id === id);
    if (!node) return {};

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

export function modifyLayer(
  updater: (layer: Layer) => Partial<Layer>,
  idx?: number,
): (state: Project) => Partial<Project> {
  return ({ layers, currentLayer }) => {
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
