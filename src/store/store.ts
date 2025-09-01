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

// !! cuidado: Node que se guarda es de RF
// tiene campos id: y type: pero no son los de nuestro node.schema.ts
// en Node[] se guardarían solamente ShaderNode, que en data.node: y data.id: se guarda lo de nuestro node.schema.ts

// TODO, sería acá hacer una función de key, y eliminar redundancia de doble id

// DEBUG

const initialNodes: Node[] = [
  { id: "1", data: { label: "Node 1" }, position: { x: 5, y: 5 } },
  { id: "2", data: { label: "Node 2" }, position: { x: 5, y: 100 } },

  // ejemplo de uso de ShaderNode
  {
    id: "test1",
    type: "ShaderNode",
    data: {
      node: {
        id: "testid1",
        type: "input",
      },
    },
    position: { x: 0, y: 5 },
  },
  {
    id: "test2",
    type: "ShaderNode",
    data: {
      node: {
        id: "testid2",
        type: "middle",
      },
    },
    position: { x: 30, y: 5 },
  },
  {
    id: "test3",
    type: "ShaderNode",
    data: {
      node: {
        id: "testid3",
        type: "output",
      },
    },
    position: { x: 60, y: 5 },
  },
];

const initialEdges: Edge[] = [{ id: "e1-2", source: "1", target: "2" }];

//

export type Layer = {
  nodes: Node[];
  edges: Edge[];
};

export type Project = {
  layers: Layer[];
  currentLayer: number;
};

type ProjectActions = {
  setActiveLayer: (idx: number) => void;

  setNodes: (nodes: Node[]) => void;
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

export const useStore = create<Project & ProjectActions>((set, get) => ({
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
        nodes: applyNodeChanges(changes, layer.nodes),
      })),
    })),

  onEdgesChange: (changes) =>
    set(({ layers, currentLayer }) => ({
      layers: modifyLayer(layers, currentLayer, (layer) => ({
        edges: applyEdgeChanges(changes, layer.edges),
      })),
    })),

  onConnect: (connection) =>
    set(({ layers, currentLayer }) => ({
      layers: modifyLayer(layers, currentLayer, (layer) => ({
        edges: addEdge(connection, layer.edges),
      })),
    })),
}));
