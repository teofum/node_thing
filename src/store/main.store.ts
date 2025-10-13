import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  Edge,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
} from "@xyflow/react";
import { nanoid } from "nanoid";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { getPurchasedShaders } from "@/app/(with-nav)/marketplace/actions";
import { NodeData, NodeType, ShaderNode } from "@/schemas/node.schema";
import { NODE_TYPES } from "@/utils/node-type";
import { createNode } from "@/utils/node";

export type Layer = {
  nodes: ShaderNode[];
  edges: Edge[];

  position: { x: number; y: number };
  size: { width: number; height: number };

  id: string;
  name: string;
};

export type AnimationState = "running" | "stopped";
export type ProjectProperties = {
  canvas: {
    width: number;
    height: number;
  };
  view: {
    zoom: number;
  };
  animation: {
    state: AnimationState;
    animationSpeed: number;
    framerateLimit: number;
    time: number;
    frameIndex: number;

    duration: number;
    repeat: boolean;
  };
};

export type Project = {
  layers: Layer[];
  currentLayer: number;
  properties: ProjectProperties;
  nodeTypes: Record<string, NodeType>;
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

type ProjectActions = {
  setActiveLayer: (idx: number) => void;

  loadNodeTypes: () => Promise<void>;
  createNodeType: (desc: NodeTypeDescriptor) => void;
  updateNodeType: (id: string, desc: NodeTypeDescriptor) => void;
  deleteNodeType: (id: string) => void;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  updateNodeDefaultValue: (
    id: string,
    input: string,
    value: number | number[],
  ) => void;

  updateNodeParameter: (
    id: string,
    param: string,
    value: string | null,
  ) => void;

  setZoom: (zoom: number) => void;
  setCanvasSize: (width: number, height: number) => void;

  addLayer: () => void;
  setLayerBounds: (x: number, y: number, width: number, height: number) => void;

  reorderLayers: (from: number, to: number) => void;

  exportLayer: (i: number) => string;
  importLayer: (json: string) => void;

  exportProject: () => string;
  importProject: (json: string | Project) => void;

  addNode: (
    type: NodeData["type"],
    position: { x: number; y: number },
    parameters?: NodeData["parameters"],
  ) => void;
  removeNode: (id: string) => void;

  changeLayerName: (name: string, idx: number) => void;

  removeLayer: (i: number) => void;
  duplicateLayer: (i: number) => void;

  toggleAnimationState: (state?: AnimationState) => void;
  updateAnimationTimer: (deltaTime: number) => void;
  resetAnimationTimer: () => void;
  setAnimationSpeed: (value: number) => void;
  setFramerateLimit: (value: number) => void;
  setAnimationDuration: (value: number) => void;
  setAnimationRepeat: (value: boolean) => void;
};

export const useMainStore = create<Project & ProjectActions>()(
  persist(
    (set, get) => ({
      /*
       * State
       */
      layers: [createLayer("Background")],
      currentLayer: 0,
      properties: {
        canvas: initialSize,
        view: { zoom: 1 },
        animation: {
          state: "stopped",
          animationSpeed: 1,
          framerateLimit: 30,
          time: 0,
          frameIndex: 0,
          duration: 10,
          repeat: false,
        },
      },
      nodeTypes: NODE_TYPES,
      layerId: 0,
      projectName: "Untitled Project",

      /*
       * Actions
       */
      setActiveLayer: (idx) => set({ currentLayer: idx }),

      onNodesChange: (changes) =>
        set(
          modifyLayer((layer) => ({
            nodes: applyNodeChanges(changes, layer.nodes) as ShaderNode[],
          })),
        ),

      onEdgesChange: (changes) =>
        set(
          modifyLayer((layer) => ({
            edges: applyEdgeChanges(changes, layer.edges),
          })),
        ),

      onConnect: (connection) =>
        set(
          modifyLayer((layer) => {
            const { nodeTypes } = get();
            if (!isConnectionValid(layer, connection, nodeTypes)) return {};

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

      updateNodeDefaultValue: (id, input, value) =>
        set(
          modifyNode(id, (node) => ({
            data: {
              ...node.data,
              defaultValues: { ...node.data.defaultValues, [input]: value },
            },
          })),
        ),

      updateNodeParameter: (id, param, value) =>
        set(
          modifyNode(id, (node) => ({
            data: {
              ...node.data,
              parameters: { ...node.data.parameters, [param]: { value } },
            },
          })),
        ),

      /*
       * Actions: view
       */
      setZoom: (zoom) =>
        set(({ properties }) => ({
          properties: {
            ...properties,
            view: { ...properties.view, zoom },
          },
        })),

      /*
       * Actions: canvas
       */
      setCanvasSize: (width, height) =>
        set(({ properties }) => ({
          properties: {
            ...properties,
            canvas: { ...properties.canvas, width, height },
          },
        })),

      addLayer: () =>
        set(({ layers }) => {
          return {
            layers: [...layers, createLayer(`Layer ${layers.length}`)],
            currentLayer: layers.length,
          };
        }),

      setLayerBounds: (x, y, width, height) =>
        set(
          modifyLayer((layer) => ({
            ...layer,
            position: { x, y },
            size: { width, height },
          })),
        ),

      reorderLayers: (from, to) =>
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

      exportLayer: (i) => {
        const layers = get().layers;
        const layer = layers[i];
        return JSON.stringify(layer, null, 2);
      },

      importLayer: (json) =>
        set(({ layers }) => {
          const parsedLayer: Layer = JSON.parse(json);
          parsedLayer.id = newLayerId();

          return {
            layers: [...layers, parsedLayer],
          };
        }),

      exportProject: () => {
        const project = get();
        return JSON.stringify(project, null, 2);
      },

      importProject: (jsonOrObj: string | Project) =>
        set((state) => {
          const parsedProject: Project =
            typeof jsonOrObj === "string" ? JSON.parse(jsonOrObj) : jsonOrObj;

          return {
            layers: parsedProject.layers,
            currentLayer: parsedProject.currentLayer,
            properties: parsedProject.properties,
            nodeTypes: state.nodeTypes,
            projectName: parsedProject.projectName,
          };
        }),

      loadNodeTypes: async () => {
        const purchased = await getPurchasedShaders();
        const purchasedNodeTypes = Object.fromEntries(
          purchased
            .filter((shader) => shader.node_config)
            .map((shader) => {
              const config = shader.node_config as NodeType;
              return [
                shader.id,
                {
                  ...config,
                  shader: config.shader,
                  isPurchased: true,
                },
              ];
            }),
        );

        set(({ nodeTypes }) => ({
          nodeTypes: { ...nodeTypes, ...purchasedNodeTypes },
        }));
      },

      createNodeType: (desc) => {
        set(updateNodeType(`custom_${nanoid()}`, desc));
      },

      updateNodeType: (id, desc) => {
        set(updateNodeType(id, desc));
      },

      deleteNodeType: (name) => {
        set(({ nodeTypes, layers }) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [name]: _, ...rest } = nodeTypes;
          return {
            nodeTypes: rest,
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

      addNode: (type, position, parameters = {}) =>
        set(
          modifyLayer((layer) => {
            const { nodeTypes } = get();
            return {
              nodes: [
                ...layer.nodes,
                createNode(type, position, nodeTypes, parameters),
              ],
            };
          }),
        ),

      removeNode: (id) =>
        set(
          modifyLayer((layer) => ({
            nodes: layer.nodes.filter((node) => node.id !== id),
          })),
        ),

      changeLayerName: (name, idx) => set(modifyLayer(() => ({ name }), idx)),

      removeLayer: (i) => {
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

      /*
       * Animation
       */
      toggleAnimationState: (state) =>
        set(({ properties }) => ({
          properties: {
            ...properties,
            animation: {
              ...properties.animation,
              state:
                state ??
                (properties.animation.state === "running"
                  ? "stopped"
                  : "running"),
            },
          },
        })),

      resetAnimationTimer: () =>
        set(({ properties }) => ({
          properties: {
            ...properties,
            animation: {
              ...properties.animation,
              time: 0,
              frameIndex: 0,
            },
          },
        })),

      setAnimationSpeed: (speed) =>
        set(({ properties }) => ({
          properties: {
            ...properties,
            animation: {
              ...properties.animation,
              animationSpeed: speed,
            },
          },
        })),

      setFramerateLimit: (fps) =>
        set(({ properties }) => ({
          properties: {
            ...properties,
            animation: {
              ...properties.animation,
              framerateLimit: fps,
            },
          },
        })),

      updateAnimationTimer: (deltaTime) =>
        set(({ properties }) => {
          let time = properties.animation.time + deltaTime;
          let frameIndex = properties.animation.frameIndex + 1;

          if (
            properties.animation.repeat &&
            time > properties.animation.duration * 1000
          ) {
            time = 0;
            frameIndex = 0;
          }

          return {
            properties: {
              ...properties,
              animation: {
                ...properties.animation,
                time,
                frameIndex,
              },
            },
          };
        }),

      setAnimationDuration: (val) =>
        set(({ properties }) => ({
          properties: {
            ...properties,
            animation: {
              ...properties.animation,
              duration: val,
            },
          },
        })),

      setAnimationRepeat: (val) =>
        set(({ properties }) => ({
          properties: {
            ...properties,
            animation: {
              ...properties.animation,
              repeat: val,
            },
          },
        })),
    }),
    {
      name: "main-store",
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Project),
        nodeTypes: {
          ...current.nodeTypes,
          ...(persisted as Project).nodeTypes,
          ...NODE_TYPES,
        },
        properties: {
          ...current.properties,
          ...(persisted as Project).properties,
          animation: {
            ...current.properties.animation,
            ...(persisted as Project).properties.animation,
            time: 0,
            frameIndex: 0,
          },
        },
      }),
    },
  ),
);

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
      nodeTypes: { ...nodeTypes, [name]: newNodeType },
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

function createLayer(name: string): Layer {
  return {
    nodes: [...initialNodes],
    edges: [...initialEdges],
    position: { x: 0, y: 0 },
    size: initialSize,
    id: newLayerId(),
    name,
  };
}

function newLayerId(): string {
  return `layer_${nanoid()}`;
}
