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

export type ShaderNode = Node<NodeData>;

let layerId = 0;
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
  view: {
    zoom: number;
  };
};

export type Project = {
  layers: Layer[];
  currentLayer: number;
  properties: ProjectProperties;
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

  setNodes: (nodes: ShaderNode[]) => void; // TODO, agregado addNode, puede que no se esté usando más setNodes
  setEdges: (edges: Edge[]) => void;

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
  importProject: (json: string) => void;

  addNode: (
    type: NodeData["type"],
    position: { x: number; y: number },
    parameters?: NodeData["parameters"],
  ) => void;

  changeLayerName: (name: string, idx: number) => void;
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

function modifyNode(
  nodes: ShaderNode[],
  id: string,
  f: (node: ShaderNode) => Partial<ShaderNode>,
): ShaderNode[] {
  const node = nodes.find((n) => n.id === id);
  if (!node) return nodes;

  return [
    ...nodes.filter((n) => n.id !== id),
    {
      ...node,
      ...f(node),
      id: node.id,
    },
  ];
}

export const useStore = create<Project & ProjectActions>((set, get) => ({
  /*
   * State
   */
  layers: [
    {
      nodes: [...initialNodes],
      edges: [...initialEdges],
      position: { x: 0, y: 0 },
      size: initialSize,
      id: `layer_${layerId++}`,
      name: "Background",
    },
  ],
  currentLayer: 0,
  properties: { canvas: initialSize, view: { zoom: 1 } },

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
        layers: modifyLayer(layers, currentLayer, ({ nodes }) => ({
          nodes: modifyNode(nodes, id, (node) => ({
            data: {
              ...node.data,
              defaultValues: { ...node.data.defaultValues, [input]: value },
            },
          })),
        })),
      };
    }),

  updateNodeParameter: (id, param, value) =>
    set(({ layers, currentLayer }) => {
      return {
        layers: modifyLayer(layers, currentLayer, ({ nodes }) => ({
          nodes: modifyNode(nodes, id, (node) => ({
            data: {
              ...node.data,
              parameters: { ...node.data.parameters, [param]: { value } },
            },
          })),
        })),
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
    set(({ layers }) => ({
      layers: [
        ...layers,
        {
          nodes: [...initialNodes],
          edges: [...initialEdges],
          position: { x: 0, y: 0 },
          size: initialSize,
          id: `layer_${layerId++}`,
          name: `Layer ${layers.length}`,
        },
      ],
    })),

  setLayerBounds: (x, y, width, height) =>
    set(({ layers, currentLayer }) => ({
      layers: modifyLayer(layers, currentLayer, (layer) => ({
        ...layer,
        position: { x, y },
        size: { width, height },
      })),
    })),

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

  importLayer: (json) => {
    set(({ layers }) => {
      const parsedLayer: Layer = JSON.parse(json);

      parsedLayer.id = "layer_" + layerId++;

      return {
        layers: [...layers, parsedLayer],
      };
    });
  },

  exportProject: () => {
    const project = get();
    return JSON.stringify(project, null, 2);
  },

  importProject: (json) => {
    set(({ layers, currentLayer, properties }) => {
      const parsedProject: Project = JSON.parse(json);

      layerId = parsedProject.layers.length;

      return {
        layers: parsedProject.layers,
        currentLayer: parsedProject.currentLayer,
        properties: parsedProject.properties,
      };
    });
  },

  addNode: (type, position, parameters = {}) => {
    const { layers, currentLayer } = get();

    const getId = () => `node_${layers[currentLayer].nodes.length}`;

    const currId = `${type.startsWith("__input") || type === "__output" ? `${type}_` : ""}${getId()}`;

    const defaultValues: NodeData["defaultValues"] = {};
    for (const [key, input] of Object.entries(NODE_TYPES[type].inputs)) {
      defaultValues[key] = input.type === "number" ? 0.5 : [0.8, 0.8, 0.8, 1];
    }

    const newNode: ShaderNode = {
      id: currId,
      type: "RenderShaderNode",
      position,
      data: {
        type,
        defaultValues,
        parameters,
      },
    };

    set({
      layers: modifyLayer(layers, currentLayer, (layer) => ({
        nodes: [...layer.nodes, newNode],
      })),
    });
  },

  changeLayerName: (name, idx) => {
    const { layers } = get();

    const newLayers = layers.map((layer, i) =>
      i === idx ? { ...layer, name } : layer,
    );

    set({ layers: newLayers });
  },
}));
