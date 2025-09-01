import { Edge, Node } from "@/schemas/node.schema";
import { create } from "zustand";

// !! cuidado: Node que se guarda es de RF
// tiene campos id: y type: pero no son los de nuestro node.schema.ts
// en Node[] se guardarían solamente ShaderNode, que en data.node: y data.id: se guarda lo de nuestro node.schema.ts

// TODO, sería acá hacer una función de key, y eliminar redundancia de doble id

export type Layer = {
  nodes: Node[];
  edges: Edge[];
};

export type Project = {
  layers: Layer[];
};

type ProjectActions = {
  addNode: (type: Node["type"], layerIdx: number) => void;
  removeNode: (id: Node["id"], layerIdx: number) => void;
};

function modifyLayer(
  layers: Layer[],
  layerIdx: number,
  f: (layer: Layer) => Partial<Layer>,
) {
  const layerToModify = layers[layerIdx];
  if (!layerToModify) return {}; // out of bounds

  const layersUnder = layers.slice(0, layerIdx);
  const layersOver = layers.slice(layerIdx + 1);
  return {
    layers: [
      ...layersUnder,
      {
        ...layerToModify,
        ...f(layerToModify),
      },
      ...layersOver,
    ],
  };
}

export const useStore = create<Project & ProjectActions>((set) => ({
  /*
   * State
   */
  layers: [],

  /*
   * Actions
   */
  addNode: (type, layerIdx) =>
    set(({ layers }) =>
      modifyLayer(layers, layerIdx, (layer) => ({
        nodes: [...layer.nodes, { type, id: "TODO" }],
      })),
    ),

  removeNode: (id, layerIdx) =>
    set(({ layers }) =>
      modifyLayer(layers, layerIdx, (layer) => ({
        nodes: layer.nodes.filter((node) => node.id !== id),
      })),
    ),
}));
