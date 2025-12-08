import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  NodePositionChange,
} from "@xyflow/react";
import { applyChangeset, revertChangeset } from "json-diff-ts";
import { nanoid } from "nanoid";
import { create } from "zustand";
import { combine, persist } from "zustand/middleware";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type * as Y from "yjs";
import type { Awareness } from "y-protocols/awareness";

import { getPurchasedShaders } from "@/app/(with-nav)/marketplace/actions";
import { NodeData, NodeType, ShaderNode } from "@/schemas/node.schema";
import { createGroup, createNode } from "@/utils/node";
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
  getEdgeChangesByType,
  getNodeChangesByType,
  mergeProject,
  modifyGroup,
  modifyLayer,
  modifyNode,
  newLayerId,
  prepareProjectForExport,
  updateNodeType,
  withHistory,
} from "./project.actions";
import {
  isGroup,
  isShader,
  Layer,
  NodeTypeDescriptor,
  Project,
} from "./project.types";

type ProjectStoreState = ReturnType<typeof createInitialState> & {
  currentRoomId: string | null;
  yjsDoc: Y.Doc | null;
  realtimeChannel: RealtimeChannel | null;
  awareness: Awareness | null;
  collaborationEnabled: boolean;
  connectedUsers: Array<{
    id: string;
    name: string;
    avatar: string;
    color: string;
    selectedNode?: string | null;
  }>;
};

interface ProjectStore extends ProjectStoreState {
  undo: () => void;
  redo: () => void;
}

export const useProjectStore = create(
  persist(
    combine(
      {
        ...createInitialState(),
        currentRoomId: null as string | null,
        yjsDoc: null as Y.Doc | null,
        realtimeChannel: null as RealtimeChannel | null,
        awareness: null as Awareness | null,
        collaborationEnabled: false,
        connectedUsers: [] as Array<{
          id: string;
          name: string;
          avatar: string;
          color: string;
          selectedNode?: string | null;
        }>,
      },
      (set, get) => ({
        setActiveLayer: (idx: number) => {
          set({ currentLayer: idx, currentGroup: [] });
        },

        openGroup: (id: string) => {
          const { currentGroup } = get();
          set({ currentGroup: [...currentGroup, id] });
        },

        closeGroup: (level?: number) => {
          const { currentGroup } = get();
          set({ currentGroup: currentGroup.slice(0, level ?? -1) });
        },

        toggleCollaboration: async (enabled: boolean) => {
          if (enabled) {
            const { currentRoomId } = get();
            if (!currentRoomId) return;

            const [{ createClient }, { initYjsSync }] = await Promise.all([
              import("@/lib/supabase/client"),
              import("@/lib/collaboration/yjs-sync"),
            ]);
            const supabase = createClient();
            const {
              data: { user },
            } = await supabase.auth.getUser();
            const channel = supabase.channel(`room:${currentRoomId}`);
            await channel.subscribe();
            const { ydoc, awareness } = initYjsSync(currentRoomId, channel, {
              name:
                user?.user_metadata?.full_name || user?.email || "Anonymous",
              avatar: user?.user_metadata?.avatar_url || "",
            });

            const yNodes = ydoc.getMap("nodes");
            const yEdges = ydoc.getMap("edges");

            yNodes.observe(() => {
              const nodes = Array.from(yNodes.values()) as ShaderNode[];
              set(modifyLayer(get(), () => ({ nodes })));
            });

            yEdges.observe(() => {
              const edges = Array.from(yEdges.values()) as Edge[];
              set(modifyLayer(get(), () => ({ edges })));
            });

            const updateUsers = () => {
              const states = awareness.getStates();
              const users: Array<{
                id: string;
                name: string;
                avatar: string;
                color: string;
                selectedNode?: string | null;
              }> = [];
              const localClientId = awareness.clientID;

              states.forEach(
                (
                  state: {
                    user?: { name: string; avatar: string; color: string };
                    selectedNode?: string | null;
                  },
                  clientId: number,
                ) => {
                  if (state.user && clientId !== localClientId) {
                    users.push({
                      id: String(clientId),
                      name: state.user.name || "Anonymous",
                      avatar: state.user.avatar || "",
                      color: state.user.color || "#3b82f6",
                      selectedNode: state.selectedNode,
                    });
                  }
                },
              );

              set({ connectedUsers: users });
            };

            awareness.on("change", updateUsers);
            updateUsers();

            set({
              yjsDoc: ydoc,
              realtimeChannel: channel,
              awareness,
              collaborationEnabled: true,
            });
          } else {
            const { realtimeChannel } = get();
            if (realtimeChannel) {
              realtimeChannel.unsubscribe();
            }
            set({
              yjsDoc: null,
              realtimeChannel: null,
              awareness: null,
              collaborationEnabled: false,
              connectedUsers: [],
            });
          }
        },

        onNodesChange: (changes: NodeChange<Node>[]) => {
          let state = get();
          const { layers, currentLayer, yjsDoc, collaborationEnabled } = state;

          const layer = layers[currentLayer];
          if (!layer) return;

          const { tracked, untracked, collapsed } =
            getNodeChangesByType(changes);

          const apply = (state: Project, changes: NodeChange<Node>[]) => {
            return modifyGroup(state, (l) => ({
              ...l,
              nodes: applyNodeChanges(changes, l.nodes) as ShaderNode[],
            }));
          };

          if (untracked.length) set(apply(state, untracked));

          if (collapsed.length) {
            state = get();
            set(
              withHistory(
                state,
                apply(state, collapsed),
                `moveNodes::${collapsed.map((c) => (c as NodePositionChange).id).join(":")}`,
                { collapse: true },
              ),
            );
          }

          if (tracked.length) {
            state = get();
            set(withHistory(state, apply(state, tracked), "nodesChange"));
          }

          if (collaborationEnabled && yjsDoc) {
            const updatedState = get();
            const currentGraph = updatedState.layers[updatedState.currentLayer];
            const yNodes = yjsDoc.getMap("nodes");
            yjsDoc.transact(() => {
              for (const node of currentGraph.nodes) {
                yNodes.set(node.id, node);
              }
              const currentIds = new Set(currentGraph.nodes.map((n) => n.id));
              for (const key of yNodes.keys()) {
                if (!currentIds.has(key)) {
                  yNodes.delete(key);
                }
              }
            });
          }
        },

        onEdgesChange: (changes: EdgeChange<Edge>[]) => {
          let state = get();
          const { layers, currentLayer, yjsDoc, collaborationEnabled } = state;

          const layer = layers[currentLayer];
          if (!layer) return;

          const { tracked, untracked } = getEdgeChangesByType(changes);

          const apply = (state: Project, changes: EdgeChange<Edge>[]) => {
            return modifyGroup(state, (l) => ({
              ...l,
              edges: applyEdgeChanges(changes, l.edges),
            }));
          };

          if (untracked.length) set(apply(state, untracked));

          if (tracked.length) {
            state = get();
            set(withHistory(state, apply(state, tracked), "edgesChange"));
          }

          if (collaborationEnabled && yjsDoc) {
            const updatedState = get();
            const currentGraph = updatedState.layers[updatedState.currentLayer];
            const yEdges = yjsDoc.getMap("edges");
            yjsDoc.transact(() => {
              for (const edge of currentGraph.edges) {
                yEdges.set(edge.id, edge);
              }
              const currentIds = new Set(currentGraph.edges.map((e) => e.id));
              for (const key of yEdges.keys()) {
                if (!currentIds.has(key)) {
                  yEdges.delete(key);
                }
              }
            });
          }
        },

        onConnect: (connection: Connection) => {
          const state = get();
          const { yjsDoc, collaborationEnabled } = state;
          const newState = modifyGroup(state, (layer) => {
            const edgesWithoutConflictingConnections = layer.edges.filter(
              (e) =>
                e.target !== connection.target ||
                e.targetHandle !== connection.targetHandle,
            );
            return {
              edges: addEdge(connection, edgesWithoutConflictingConnections),
            };
          });

          set(withHistory(state, newState, "connect"));

          if (collaborationEnabled && yjsDoc) {
            const updatedState = get();
            const currentGraph = updatedState.layers[updatedState.currentLayer];
            const yEdges = yjsDoc.getMap("edges");
            yjsDoc.transact(() => {
              yEdges.clear();
              for (const edge of currentGraph.edges) {
                yEdges.set(edge.id, edge);
              }
            });
          }
        },

        updateNodeDefaultValue: (
          id: string,
          input: string,
          value: number | number[],
        ) => {
          const state = get();
          const newState = modifyNode(state, id, (node) => ({
            data: {
              ...node.data,
              defaultValues: { ...node.data.defaultValues, [input]: value },
            },
          }));

          const command = `updateNodeDefaultValue::${id}::${input}`;
          set(withHistory(state, newState, command, { collapse: true }));
        },

        updateNodeParameter: (
          id: string,
          param: string,
          value: string | null,
        ) => {
          const state = get();
          const newState = modifyNode(state, id, (node) => ({
            data: {
              ...node.data,
              parameters: { ...node.data.parameters, [param]: { value } },
            },
          }));

          set(withHistory(state, newState, "updateNodeParameter"));
        },

        updateNodeUniform: (
          id: string,
          name: string,
          value: number | number[],
        ) => {
          const state = get();
          const newState = modifyNode(state, id, (node) => ({
            data: {
              ...node.data,
              uniforms: { ...node.data.uniforms, [name]: value },
            },
          }));

          const command = `updateNodeUniform::${id}::${name}`;
          set(withHistory(state, newState, command, { collapse: true }));
        },

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
            currentGroup: [],
          };

          set(withHistory(state, newState, "addLayer"));
        },

        setLayerBounds: (
          x: number,
          y: number,
          width: number,
          height: number,
        ) => {
          const state = get();
          const newState = modifyLayer(state, (layer) => ({
            ...layer,
            position: { x, y },
            size: { width, height },
          }));

          const command = `setLayerBounds::${state.layers[state.currentLayer].id}`;
          set(withHistory(state, newState, command, { collapse: true }));
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
            currentGroup: [],
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
                nodes: layer.nodes.filter(
                  (n) => !isShader(n) || n.data.type !== name,
                ),
                edges: layer.edges.filter((e) => {
                  const source = layer.nodes.find((n) => n.id === e.source);
                  const target = layer.nodes.find((n) => n.id === e.target);

                  if (
                    !source ||
                    !target ||
                    !isShader(source) ||
                    !isShader(target)
                  )
                    return true;

                  return (
                    source?.data.type !== name && target?.data.type !== name
                  );
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
          const newState = modifyGroup(state, (layer) => ({
            nodes: [
              ...layer.nodes.map((node) => ({ ...node, selected: false })),
              createNode(type, position, allNodeTypes, parameters),
            ],
          }));

          set(withHistory(state, newState, "addNode"));
        },

        addGroup: (position: Point) => {
          const state = get();
          const allNodeTypes = getAllNodeTypes(state.nodeTypes);
          const newState = modifyGroup(state, (graph) =>
            createGroup(position, graph, allNodeTypes),
          );

          set(withHistory(state, newState, "addGroup"));
        },

        renameGroup: (name: string, id: string) => {
          const state = get();
          const newState = modifyGroup(state, (layer) => {
            const group = layer.nodes.find((n) => n.id === id);
            if (!group || !isGroup(group)) return {};

            return {
              nodes: [
                ...layer.nodes.filter((n) => n.id !== id),
                { ...group, data: { ...group.data, name } },
              ],
            };
          });

          set(withHistory(state, newState, "renameGroup"));
        },

        removeNode: (id: string) => {
          const state = get();
          const newState = modifyGroup(state, (layer) => ({
            nodes: layer.nodes.filter((node) => node.id !== id),
          }));

          set(withHistory(state, newState, "removeNode"));
        },

        changeLayerName: (name: string, idx: number) => {
          const state = get();
          const newState = modifyLayer(state, () => ({ name }), idx);

          set(withHistory(state, newState, "renameLayer"));
        },

        removeLayer: (i: number) => {
          const state = get();
          const { layers, currentLayer, currentGroup } = state;

          if (layers.length <= 1) return;

          const newLayers = [...layers.slice(0, i), ...layers.slice(i + 1)];
          const newCurrentLayer =
            i <= currentLayer ? Math.max(0, currentLayer - 1) : currentLayer;

          const newState = {
            layers: newLayers,
            currentLayer: newCurrentLayer,
            currentGroup: newCurrentLayer === currentLayer ? currentGroup : [],
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
            currentGroup: [],
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
          } = state as typeof state & {
            currentRoomId?: string | null;
            yjsDoc?: unknown;
            realtimeChannel?: unknown;
            awareness?: unknown;
            collaborationEnabled?: boolean;
            connectedUsers?: unknown[];
          };

          if (history.length <= done) return;

          const serializable = JSON.parse(JSON.stringify(cleanState));
          const newState = revertChangeset(serializable, history[done].diff);

          set({
            ...newState,
            done: done + 1,
            currentLayer: history[done].layerIdx ?? 0,
          });

          if (collaborationEnabled && yjsDoc) {
            const updatedState = get();
            const currentGraph = updatedState.layers[updatedState.currentLayer];
            const yNodes = yjsDoc.getMap("nodes");
            const yEdges = yjsDoc.getMap("edges");
            yjsDoc.transact(() => {
              yNodes.clear();
              yEdges.clear();
              for (const node of currentGraph.nodes) {
                yNodes.set(node.id, node);
              }
              for (const edge of currentGraph.edges) {
                yEdges.set(edge.id, edge);
              }
            });
          }
        },

        redo: () => {
          const state = get();
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
          } = state as typeof state & {
            currentRoomId?: string | null;
            yjsDoc?: unknown;
            realtimeChannel?: unknown;
            awareness?: unknown;
            collaborationEnabled?: boolean;
            connectedUsers?: unknown[];
          };

          if (done <= 0) return;

          const serializable = JSON.parse(JSON.stringify(cleanState));
          const newState = applyChangeset(serializable, history[done - 1].diff);

          set({
            ...newState,
            done: done - 1,
            currentLayer: history[done - 1].layerIdx ?? 0,
          });

          if (collaborationEnabled && yjsDoc) {
            const updatedState = get();
            const currentGraph = updatedState.layers[updatedState.currentLayer];
            const yNodes = yjsDoc.getMap("nodes");
            const yEdges = yjsDoc.getMap("edges");
            yjsDoc.transact(() => {
              yNodes.clear();
              yEdges.clear();
              for (const node of currentGraph.nodes) {
                yNodes.set(node.id, node);
              }
              for (const edge of currentGraph.edges) {
                yEdges.set(edge.id, edge);
              }
            });
          }
        },
      }),
    ),
    {
      name: "main-store",
      merge: (persisted, current) => ({
        ...current,
        ...mergeProject(persisted, current),
      }),
      partialize: (state) => {
        const {
          currentRoomId,
          yjsDoc,
          realtimeChannel,
          awareness,
          collaborationEnabled,
          connectedUsers,
          ...rest
        } = state;
        return prepareProjectForExport(rest);
      },
    },
  ),
);
