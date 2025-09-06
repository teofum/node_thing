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

import { NodeData } from "@/schemas/node.schema";

// !! cuidado: Node que se guarda es de RF
// tiene campos id: y type: pero no son los de nuestro node.schema.ts
// en Node[] se guardarían solamente ShaderNode, que en data.node: y data.id: se guarda lo de nuestro node.schema.ts

// TODO, sería acá hacer una función de key, y eliminar redundancia de doble id

export type ShaderNode = Node<NodeData>;

export type Layer = {
  nodes: ShaderNode[];
  edges: Edge[];
};

export type Project = {
  layers: Layer[];
  currentLayer: number;
};

const initialNodes: ShaderNode[] = [];
const initialEdges: Edge[] = [];

type ProjectActions = {
  setActiveLayer: (idx: number) => void;

  setNodes: (nodes: ShaderNode[]) => void;
  setEdges: (edges: Edge[]) => void;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
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
  layers: [
    { nodes: [...initialNodes], edges: [...initialEdges] }, // debug, le enchufo valores iniciales en la capa 0
    { nodes: [], edges: [] }, // debug, si le mando + 1
  ],
  currentLayer: 0,

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

      const filteredEdges = layer.edges.filter(
        (e) =>
          e.target !== connection.target ||
          e.targetHandle !== connection.targetHandle,
      );

      const newEdges = addEdge(connection, filteredEdges);

      return {
        layers: modifyLayer(layers, currentLayer, (layer) => ({
          edges: newEdges,
        })),
      };
    }),
}));
