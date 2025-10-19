import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
} from "@xyflow/react";
import { nanoid } from "nanoid";
import { create } from "zustand";
import { combine, persist } from "zustand/middleware";

import { getPurchasedShaders } from "@/app/(with-nav)/marketplace/actions";
import { NodeData, NodeType, ShaderNode } from "@/schemas/node.schema";
import { NODE_TYPES } from "@/utils/node-type";
import { createNode } from "@/utils/node";
import { DeepPartial } from "@/utils/deep-partial";

export type Layer = {
  nodes: ShaderNode[];
  edges: Edge[];

  position: { x: number; y: number };
  size: { width: number; height: number };

  id: string;
  name: string;
};

export type ProjectProperties = {
  canvas: {
    width: number;
    height: number;
  };
};

type NodeTypes = Record<string, NodeType>;

export type Project = {
  layers: Layer[];
  currentLayer: number;
  properties: ProjectProperties;
  nodeTypes: {
    default: NodeTypes;
    custom: NodeTypes;
    external: NodeTypes;
  };
  projectName: string;
};

export type HandleDescriptor = {
  id: string;
  name: string;
  display: string;
  type: "color" | "number";
};

type NodeTypeDescriptor = {
  name: string;
  inputs: HandleDescriptor[];
  outputs: HandleDescriptor[];
  code: string;
};

type Point = {
  x: number;
  y: number;
};

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

function createInitialState(): Project {
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
  };
}

export const useProjectStore = create(
  persist(
    combine(createInitialState(), (set, get) => ({
      setActiveLayer: (idx: number) => set({ currentLayer: idx }),

      onNodesChange: (changes: NodeChange<Node>[]) =>
        set(
          modifyLayer((layer) => ({
            nodes: applyNodeChanges(changes, layer.nodes) as ShaderNode[],
          })),
        ),

      onEdgesChange: (changes: EdgeChange<Edge>[]) =>
        set(
          modifyLayer((layer) => ({
            edges: applyEdgeChanges(changes, layer.edges),
          })),
        ),

      onConnect: (connection: Connection) =>
        set(
          modifyLayer((layer) => {
            const { nodeTypes } = get();
            const allNodeTypes = getAllNodeTypes(nodeTypes);
            if (!isConnectionValid(layer, connection, allNodeTypes)) return {};

            const edgesWithoutConflictingConnections = layer.edges.filter(
              (e) =>
                e.target !== connection.target ||
                e.targetHandle !== connection.targetHandle,
            );

            return {
              edges: addEdge(connection, edgesWithoutConflictingConnections),
            };
          }),
        ),

      updateNodeDefaultValue: (
        id: string,
        input: string,
        value: number | number[],
      ) =>
        set(
          modifyNode(id, (node) => ({
            data: {
              ...node.data,
              defaultValues: { ...node.data.defaultValues, [input]: value },
            },
          })),
        ),

      updateNodeParameter: (id: string, param: string, value: string | null) =>
        set(
          modifyNode(id, (node) => ({
            data: {
              ...node.data,
              parameters: { ...node.data.parameters, [param]: { value } },
            },
          })),
        ),

      /*
       * Actions: canvas
       */
      setCanvasSize: (width: number, height: number) =>
        set(({ properties }) => ({
          properties: {
            ...properties,
            canvas: { ...properties.canvas, width, height },
          },
        })),

      addLayer: () =>
        set(({ layers, properties }) => {
          return {
            layers: [
              ...layers,
              createLayer(`Layer ${layers.length}`, properties.canvas),
            ],
            currentLayer: layers.length,
          };
        }),

      setLayerBounds: (x: number, y: number, width: number, height: number) =>
        set(
          modifyLayer((layer) => ({
            ...layer,
            position: { x, y },
            size: { width, height },
          })),
        ),

      reorderLayers: (from: number, to: number) =>
        set(({ layers, currentLayer }) => {
          const newLayers = [...layers];
          const [moved] = newLayers.splice(from, 1);
          newLayers.splice(to, 0, moved);

          let newCurrent = currentLayer;

          if (currentLayer === from) {
            newCurrent = to;
          } else if (from < currentLayer && to >= currentLayer) {
            newCurrent = currentLayer - 1;
          } else if (from > currentLayer && to <= currentLayer) {
            newCurrent = currentLayer + 1;
          }

          return {
            layers: newLayers,
            currentLayer: newCurrent,
          };
        }),

      exportLayer: (i: number) => {
        const layers = get().layers;
        const layer = layers[i];
        return JSON.stringify(layer, null, 2);
      },

      importLayer: (json: string) =>
        set(({ layers }) => {
          const parsedLayer: Layer = JSON.parse(json);
          parsedLayer.id = newLayerId();

          return {
            layers: [...layers, parsedLayer],
          };
        }),

      exportProject: () => {
        const project = get();
        return JSON.stringify(prepareProjectForExport(project), null, 2);
      },

      importProject: (jsonOrObj: string | Project) =>
        set((current) => {
          const imported: Project =
            typeof jsonOrObj === "string" ? JSON.parse(jsonOrObj) : jsonOrObj;

          return mergeProject(imported, current);
        }),

      loadNodeTypes: async () => {
        const purchased = await getPurchasedShaders();
        const external = Object.fromEntries(
          purchased
            .filter((shader) => shader.node_config)
            .map((shader) => {
              const config = shader.node_config as NodeType;
              return [
                shader.id,
                {
                  ...config,
                  isPurchased: true,
                },
              ];
            }),
        );

        set(({ nodeTypes }) => ({
          nodeTypes: { ...nodeTypes, external },
        }));
      },

      createNodeType: (desc: NodeTypeDescriptor) => {
        set(updateNodeType(`custom_${nanoid()}`, desc));
      },

      updateNodeType: (id: string, desc: NodeTypeDescriptor) => {
        set(updateNodeType(id, desc));
      },

      deleteNodeType: (name: string) => {
        set(({ nodeTypes, layers }) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [name]: _, ...rest } = nodeTypes.custom;
          return {
            nodeTypes: { ...nodeTypes, custom: rest },
            layers: layers.map((layer) => ({
              ...layer,
              nodes: layer.nodes.filter((n) => n.data.type !== name),
              edges: layer.edges.filter((e) => {
                const source = layer.nodes.find((n) => n.id === e.source);
                const target = layer.nodes.find((n) => n.id === e.target);
                return source?.data.type !== name && target?.data.type !== name;
              }),
            })),
          };
        });
      },

      addNode: (
        type: string,
        position: Point,
        parameters: NodeData["parameters"] = {},
      ) =>
        set(
          modifyLayer((layer) => {
            const { nodeTypes } = get();
            const allNodeTypes = getAllNodeTypes(nodeTypes);
            return {
              nodes: [
                ...layer.nodes.map((node) => ({ ...node, selected: false })),
                createNode(type, position, allNodeTypes, parameters),
              ],
            };
          }),
        ),

      removeNode: (id: string) =>
        set(
          modifyLayer((layer) => ({
            nodes: layer.nodes.filter((node) => node.id !== id),
          })),
        ),

      changeLayerName: (name: string, idx: number) =>
        set(modifyLayer(() => ({ name }), idx)),

      removeLayer: (i: number) => {
        set(({ layers, currentLayer }) => {
          if (layers.length <= 1) return {};

          return {
            layers: [...layers.slice(0, i), ...layers.slice(i + 1)],
            currentLayer: i <= currentLayer ? currentLayer - 1 : currentLayer,
          };
        });
      },

      duplicateLayer: (i: number) =>
        set(({ layers }) => {
          const sourceLayer = layers[i];
          const newLayerIdx = i + 1;

          const newLayer: Layer = {
            ...sourceLayer,
            name: sourceLayer.name + " copy",
            id: newLayerId(),
          };

          return {
            layers: [
              ...layers.slice(0, newLayerIdx),
              newLayer,
              ...layers.slice(newLayerIdx),
            ],
            currentLayer: newLayerIdx,
          };
        }),
    })),
    {
      name: "main-store",
      merge: (persisted, current) => ({
        ...current,
        ...mergeProject(persisted, current),
      }),
      partialize: prepareProjectForExport,
    },
  ),
);

function mergeProject(imported: unknown, current: Project): Project {
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

function prepareProjectForExport(project: Project): DeepPartial<Project> {
  return {
    ...project,
    nodeTypes: { custom: project.nodeTypes.custom },
  };
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

function isConnectionValid(
  layer: Layer,
  connection: Connection,
  nodeTypes: Record<string, NodeType>,
) {
  const targetType = layer.nodes.find((node) => node.id === connection.target)!
    .data.type;
  const sourceType = layer.nodes.find((node) => node.id === connection.source)!
    .data.type;

  const targetHandleType =
    nodeTypes[targetType].inputs[connection.targetHandle ?? ""].type;
  const sourceHandleType =
    nodeTypes[sourceType].outputs[connection.sourceHandle ?? ""].type;

  return targetHandleType === sourceHandleType;
}

function modifyNode(
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

function modifyLayer(
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

function updateNodeType(
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

function createHandles(desc: HandleDescriptor[]) {
  const handles: NodeType["inputs" | "outputs"] = {};
  for (const { name, display, type } of desc) {
    handles[name] = { name: display, type };
  }
  return handles;
}

function createLayer(name: string, size = initialSize): Layer {
  return {
    nodes: [...initialNodes],
    edges: [...initialEdges],
    position: { x: 0, y: 0 },
    size,
    id: newLayerId(),
    name,
  };
}

function newLayerId(): string {
  return `layer_${nanoid()}`;
}
