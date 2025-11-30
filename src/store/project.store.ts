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
import { applyChangeset, revertChangeset } from "json-diff-ts";
import { nanoid } from "nanoid";
import { create } from "zustand";
import { combine, persist } from "zustand/middleware";

import { getPurchasedShaders } from "@/app/(with-nav)/marketplace/actions";
import { NodeData, NodeType, ShaderNode } from "@/schemas/node.schema";
import { createNode } from "@/utils/node";
import { Point } from "@/utils/point";
import {
  deleteShader,
  getCustomShaders,
  saveNewShader,
  updateShader,
} from "./actions";
import {
  createHandles,
  createInitialState,
  createLayer,
  getAllNodeTypes,
  getNodeChangesByType,
  mergeProject,
  modifyLayer,
  modifyNode,
  newLayerId,
  prepareProjectForExport,
  updateNodeType,
  withHistory,
} from "./project.actions";
import { Layer, NodeTypeDescriptor, Project } from "./project.types";

interface ProjectStore extends ReturnType<typeof createInitialState> {
  undo: () => void;
  redo: () => void;
}

export const useProjectStore = create(
  persist(
    combine(createInitialState(), (set, get) => ({
      setActiveLayer: (idx: number) => {
        set({ currentLayer: idx });
      },

      onNodesChange: (changes: NodeChange<Node>[]) => {
        let state = get();
        const { layers, currentLayer } = state;

        const layer = layers[currentLayer];
        if (!layer) return;

        const { tracked, untracked, collapsed } = getNodeChangesByType(changes);

        // Apply untracked changes
        if (untracked.length) {
          const withUntracked = modifyLayer((l) => ({
            ...l,
            nodes: applyNodeChanges(untracked, layer.nodes) as ShaderNode[],
          }))(state);
          set(withUntracked);
        }

        // Apply collapsed changes
        if (collapsed.length) {
          state = get();
          const withCollapsed = modifyLayer((l) => ({
            ...l,
            nodes: applyNodeChanges(collapsed, layer.nodes) as ShaderNode[],
          }))(state);

          set(
            withHistory(state, withCollapsed, "moveNodes", { collapse: true }),
          );
        }

        // Apply tracked changes
        if (tracked.length) {
          state = get();
          const newState = modifyLayer((l) => ({
            ...l,
            nodes: applyNodeChanges(tracked, layer.nodes) as ShaderNode[],
          }))(state);

          set(withHistory(state, newState, "nodesChange"));
        }
      },

      onEdgesChange: (changes: EdgeChange<Edge>[]) => {
        const state = get();
        const { layers, currentLayer } = state;

        const layer = layers[currentLayer];
        if (!layer) return;

        const newState = modifyLayer((l) => ({
          ...l,
          edges: applyEdgeChanges(changes, layer.edges),
        }))(state);

        set(withHistory(state, newState, "nodesEdgesChange"));
      },

      onConnect: (connection: Connection) => {
        const state = get();
        const newState = modifyLayer((layer) => {
          const edgesWithoutConflictingConnections = layer.edges.filter(
            (e) =>
              e.target !== connection.target ||
              e.targetHandle !== connection.targetHandle,
          );
          return {
            edges: addEdge(connection, edgesWithoutConflictingConnections),
          };
        })(state);

        set(withHistory(state, newState, "connect"));
      },

      updateNodeDefaultValue: (
        id: string,
        input: string,
        value: number | number[],
      ) => {
        const state = get();
        const newState = modifyNode(id, (node) => ({
          data: {
            ...node.data,
            defaultValues: { ...node.data.defaultValues, [input]: value },
          },
        }))(state);

        set(withHistory(state, newState, "updateNodeDefaultValue"));
      },

      updateNodeParameter: (
        id: string,
        param: string,
        value: string | null,
      ) => {
        const state = get();
        const newState = modifyNode(id, (node) => ({
          data: {
            ...node.data,
            parameters: { ...node.data.parameters, [param]: { value } },
          },
        }))(state);

        set(withHistory(state, newState, "updateNodeParameter"));
      },

      updateNodeUniform: (
        id: string,
        name: string,
        value: number | number[],
      ) => {
        const state = get();
        const newState = modifyNode(id, (node) => ({
          data: {
            ...node.data,
            uniforms: { ...node.data.uniforms, [name]: value },
          },
        }))(state);

        set(withHistory(state, newState, "updateNodeUniform"));
      },

      /*
       * Actions: canvas
       */
      setCanvasSize: (width: number, height: number) => {
        const state = get();
        const newState = {
          properties: {
            ...state.properties,
            canvas: { ...state.properties.canvas, width, height },
          },
        };

        set(withHistory(state, newState, "setCanvasSize"));
      },

      addLayer: () => {
        const state = get();
        const newState = {
          layers: [
            ...state.layers,
            createLayer(
              `Layer ${state.layers.length}`,
              state.properties.canvas,
            ),
          ],
          currentLayer: state.layers.length,
        };

        set(withHistory(state, newState, "addLayer"));
      },

      setLayerBounds: (x: number, y: number, width: number, height: number) => {
        const state = get();
        const newState = modifyLayer((layer) => ({
          ...layer,
          position: { x, y },
          size: { width, height },
        }))(state);

        set(withHistory(state, newState, "setLayerBounds"));
      },

      reorderLayers: (from: number, to: number) => {
        const state = get();
        const { layers, currentLayer } = state;

        const newLayers = layers.slice();
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

        const newState = {
          layers: newLayers,
          currentLayer: newCurrent,
        };

        set(withHistory(state, newState, "reorderLayer"));
      },

      exportLayer: (i: number) => {
        const layers = get().layers;
        const layer = layers[i];
        return JSON.stringify(layer, null, 2);
      },

      importLayer: (json: string) => {
        const state = get();

        const parsedLayer: Layer = JSON.parse(json);
        parsedLayer.id = newLayerId();

        const newState = {
          layers: [...state.layers, parsedLayer],
          currentLayer: state.layers.length,
        };

        set(withHistory(state, newState, "importLayer"));
      },

      exportProject: () => {
        const project = get();
        return prepareProjectForExport(project);
      },

      importProject: (project: Project) =>
        set((current) => {
          return mergeProject(project, current);
        }),

      loadNodeTypes: async () => {
        const purchased = await getPurchasedShaders();
        const external = Object.fromEntries(
          purchased
            .filter(
              (shader): shader is NonNullable<typeof shader> =>
                shader !== null && shader.node_config !== null,
            )
            .map((shader) => {
              const config = shader.node_config as NodeType;
              return [
                shader.id,
                {
                  ...config,
                  externalShaderId: shader.id,
                },
              ];
            }),
        );

        const custom = await getCustomShaders();
        const customNodeTypes = Object.fromEntries(
          custom
            .filter((shader) => shader.node_config)
            .map((shader) => {
              const config = shader.node_config as NodeTypeDescriptor;
              const inputs = createHandles(
                Array.isArray(config.inputs) ? config.inputs : [],
              );
              const outputs = createHandles(
                Array.isArray(config.outputs) ? config.outputs : [],
              );

              const nodeType = {
                name: config.name ?? shader.title ?? "Custom",
                category: "Custom",
                shader: config.code ?? "",
                inputs,
                outputs,
                parameters: {},
                externalShaderId: shader.id,
              };
              return [`custom_${nodeType.externalShaderId}`, nodeType];
            }),
        );

        set(({ nodeTypes }) => ({
          nodeTypes: { ...nodeTypes, external, custom: customNodeTypes },
        }));
      },

      createNodeType: async (desc: NodeTypeDescriptor) => {
        const data = await saveNewShader(desc);
        const id = data ? data.id : nanoid();
        const key = `custom_${id}`;
        set(updateNodeType(key, desc));
        if (data) {
          set(({ nodeTypes }) => ({
            nodeTypes: {
              ...nodeTypes,
              custom: {
                ...nodeTypes.custom,
                [key]: { ...nodeTypes.custom[key], externalShaderId: id },
              },
            },
          }));
        }
      },

      updateNodeType: async (id: string, desc: NodeTypeDescriptor) => {
        const { nodeTypes } = get();
        const remoteId = nodeTypes.custom[id].externalShaderId;
        set(updateNodeType(id, desc));
        if (remoteId) {
          const data = await updateShader(desc, remoteId);
          if (!data) return;
          set(({ nodeTypes }) => ({
            nodeTypes: {
              ...nodeTypes,
              custom: {
                ...nodeTypes.custom,
                [id]: { ...nodeTypes.custom[id], externalShaderId: remoteId },
              },
            },
          }));
        }
      },

      deleteNodeType: async (name: string) => {
        const { nodeTypes } = get();
        const remoteId = nodeTypes.custom[name].externalShaderId;
        if (remoteId) await deleteShader(remoteId);

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
      ) => {
        const state = get();
        const allNodeTypes = getAllNodeTypes(state.nodeTypes);
        const newState = modifyLayer((layer) => ({
          nodes: [
            ...layer.nodes.map((node) => ({ ...node, selected: false })),
            createNode(type, position, allNodeTypes, parameters),
          ],
        }))(state);

        set(withHistory(state, newState, "addNode"));
      },

      removeNode: (id: string) => {
        const state = get();
        const newState = modifyLayer((layer) => ({
          nodes: layer.nodes.filter((node) => node.id !== id),
        }))(state);

        set(withHistory(state, newState, "removeNode"));
      },

      changeLayerName: (name: string, idx: number) => {
        const state = get();
        const newState = modifyLayer(() => ({ name }), idx)(state);

        set(withHistory(state, newState, "renameLayer"));
      },

      removeLayer: (i: number) => {
        const state = get();
        const { layers, currentLayer } = state;

        if (layers.length <= 1) return; // don't remove the last layer

        const newLayers = [...layers.slice(0, i), ...layers.slice(i + 1)];
        const newCurrentLayer =
          i <= currentLayer ? Math.max(0, currentLayer - 1) : currentLayer;

        const newState = {
          layers: newLayers,
          currentLayer: newCurrentLayer,
        };

        set(withHistory(state, newState, "removeLayer"));
      },

      duplicateLayer: (i: number) => {
        const state = get();
        const { layers } = state;

        const sourceLayer = layers[i];
        const newLayerIdx = i + 1;

        const newLayer: Layer = {
          ...sourceLayer,
          name: sourceLayer.name + " copy",
          id: newLayerId(),
        };

        const newLayers = [
          ...layers.slice(0, newLayerIdx),
          newLayer,
          ...layers.slice(newLayerIdx),
        ];

        const newState = {
          layers: newLayers,
          currentLayer: newLayerIdx,
        };

        set(withHistory(state, newState, "duplicateLayer"));
      },

      goTo: (to: number) => {
        const state = get() as ProjectStore;
        let { done } = state;
        if (to === done) return;

        const { undo, redo } = state;
        if (to > done) {
          while (done !== to) {
            undo();
            done++;
          }
        } else {
          while (done !== to) {
            redo();
            done--;
          }
        }
      },

      undo: () => {
        const state = get();
        const { history, done } = state;

        if (history.length <= done) return;

        const newState = revertChangeset(state, history[done].diff);
        const newState2 = JSON.parse(JSON.stringify(newState));
        set({ ...newState2, done: done + 1 });
      },

      redo: () => {
        const state = get();
        const { history, done } = state;

        if (done <= 0) return;

        const newState = applyChangeset(state, history[done - 1].diff);
        const newState2 = JSON.parse(JSON.stringify(newState));
        set({ ...newState2, done: done - 1 });
      },
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
