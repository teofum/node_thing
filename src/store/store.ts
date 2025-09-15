import {
  Node,
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
} from "@xyflow/react";
import { create } from "zustand";

import { NodeData, NodeType } from "@/schemas/node.schema";
import { NODE_TYPES } from "@/utils/node-type";

// !! cuidado: Node que se guarda es de RF
// tiene campos id: y type: pero no son los de nuestro node.schema.ts
// en Node[] se guardarían solamente ShaderNode, que en data.node: y data.id: se guarda lo de nuestro node.schema.ts

// TODO, sería acá hacer una función de key, y eliminar redundancia de doble id

export type ShaderNode = Node<NodeData>;

export type Layer = {
  nodes: ShaderNode[];
  edges: Edge[];
};

export type ProjectProperties = {
  canvas: {
    width: number;
    height: number;
  };
  view: {
    zoom: number;
  };
};

export type Project = {
  layers: Layer[];
  currentLayer: number;
  layersDim: number;
  properties: ProjectProperties;
};

const initialNodes: ShaderNode[] = [
  {
    id: "__output",
    position: { x: 0, y: 0 },
    data: { type: "__output", defaultValues: {} },
    type: "RenderShaderNode",
    deletable: false,
  },
];
const initialEdges: Edge[] = [];

type ProjectActions = {
  setActiveLayer: (idx: number) => void;

  setNodes: (nodes: ShaderNode[]) => void;
  setEdges: (edges: Edge[]) => void;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  updateNodeDefaultValue: (
    id: string,
    input: string,
    value: number | number[],
  ) => void;

  setZoom: (zoom: number) => void;
  setCanvasSize: (width: number, height: number) => void;

  addLayer: () => void;
};

function modifyLayer(
  layers: Layer[],
  layerIdx: number,
  f: (layer: Layer) => Partial<Layer>,
): Layer[] {
  const layerToModify = layers[layerIdx];
  if (!layerToModify) return layers; // out of bounds

  const layersUnder = layers.slice(0, layerIdx);
  const layersOver = layers.slice(layerIdx + 1);
  return [
    ...layersUnder,
    {
      ...layerToModify,
      ...f(layerToModify),
    },
    ...layersOver,
  ];
}

export const useStore = create<Project & ProjectActions>((set) => ({
  /*
   * State
   */
  layers: [{ nodes: [...initialNodes], edges: [...initialEdges] }],
  layersDim: 1,
  currentLayer: 0,
  properties: { canvas: { width: 1920, height: 1080 }, view: { zoom: 1 } },

  /*
   * Actions
   */
  setActiveLayer: (idx) => set({ currentLayer: idx }),

  setNodes: (nodes) =>
    set(({ layers, currentLayer }) => ({
      layers: modifyLayer(layers, currentLayer, () => ({ nodes })),
    })),

  setEdges: (edges) =>
    set(({ layers, currentLayer }) => ({
      layers: modifyLayer(layers, currentLayer, () => ({ edges })),
    })),

  onNodesChange: (changes) =>
    set(({ layers, currentLayer }) => ({
      layers: modifyLayer(layers, currentLayer, (layer) => ({
        nodes: applyNodeChanges(changes, layer.nodes) as ShaderNode[], // TODO: actually check this
      })),
    })),

  onEdgesChange: (changes) =>
    set(({ layers, currentLayer }) => ({
      layers: modifyLayer(layers, currentLayer, (layer) => ({
        edges: applyEdgeChanges(changes, layer.edges),
      })),
    })),

  onConnect: (connection) =>
    set(({ layers, currentLayer }) => {
      const layer = layers[currentLayer];

      const targetType = layer.nodes.find(
        (node) => node.id === connection.target,
      )!.data.type;
      const sourceType = layer.nodes.find(
        (node) => node.id === connection.source,
      )!.data.type;

      const targetHandleType = (
        NODE_TYPES[targetType].inputs as NodeType["inputs"]
      )[connection.targetHandle ?? ""].type;
      const sourceHandleType = (
        NODE_TYPES[sourceType].outputs as NodeType["outputs"]
      )[connection.sourceHandle ?? ""].type;

      if (targetHandleType !== sourceHandleType) return {};

      const filteredEdges = layer.edges.filter(
        (e) =>
          e.target !== connection.target ||
          e.targetHandle !== connection.targetHandle,
      );

      const newEdges = addEdge(connection, filteredEdges);

      return {
        layers: modifyLayer(layers, currentLayer, () => ({
          edges: newEdges,
        })),
      };
    }),

  updateNodeDefaultValue: (id, input, value) =>
    set(({ layers, currentLayer }) => {
      return {
        layers: modifyLayer(layers, currentLayer, ({ nodes }) => {
          const node = nodes.find((n) => n.id === id);
          if (!node) return {};

          return {
            nodes: [
              ...nodes.filter((n) => n.id !== id),
              {
                ...node,
                data: {
                  ...node.data,
                  defaultValues: { ...node.data.defaultValues, [input]: value },
                },
              },
            ],
          };
        }),
      };
    }),

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
    set(({ layers, layersDim }) => ({
      layers: [
        ...layers,
        {
          nodes: [...initialNodes],
          edges: [...initialEdges],
        },
      ],
      layersDim: layersDim + 1,
    })),
}));
