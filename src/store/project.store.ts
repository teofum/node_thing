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
import type { RealtimeChannel } from "@supabase/supabase-js";
import type * as Y from "yjs";
import type { Awareness } from "y-protocols/awareness";

import { getPurchasedShaders } from "@/app/(with-nav)/marketplace/actions";
import { NodeData, NodeType, ShaderNode } from "@/schemas/node.schema";
import { createNode } from "@/utils/node";
import { Point } from "@/utils/point";
import {
  saveNewShader,
  updateShader,
  deleteShader,
  getCustomShaders,
} from "./actions";
import { Project, Layer, NodeTypeDescriptor } from "./project.types";
import {
  createLayer,
  modifyLayer,
  getAllNodeTypes,
  modifyNode,
  newLayerId,
  prepareProjectForExport,
  updateNodeType,
  createInitialState,
  createHandles,
  mergeProject,
} from "./project.actions";

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
        setActiveLayer: (idx: number) => set({ currentLayer: idx }),

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
              set(modifyLayer(() => ({ nodes })));
            });

            yEdges.observe(() => {
              const edges = Array.from(yEdges.values()) as Edge[];
              set(modifyLayer(() => ({ edges })));
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
          const { yjsDoc, collaborationEnabled, currentLayer, layers } = get();
          const newNodes = applyNodeChanges(
            changes,
            layers[currentLayer].nodes,
          ) as ShaderNode[];

          set(modifyLayer(() => ({ nodes: newNodes })));

          if (collaborationEnabled && yjsDoc) {
            const yNodes = yjsDoc.getMap("nodes");
            yjsDoc.transact(() => {
              for (const node of newNodes) {
                yNodes.set(node.id, node);
              }
              const currentIds = new Set(newNodes.map((n) => n.id));
              for (const key of yNodes.keys()) {
                if (!currentIds.has(key)) {
                  yNodes.delete(key);
                }
              }
            });
          }
        },

        onEdgesChange: (changes: EdgeChange<Edge>[]) => {
          const { yjsDoc, collaborationEnabled, currentLayer, layers } = get();
          const newEdges = applyEdgeChanges(
            changes,
            layers[currentLayer].edges,
          );

          set(modifyLayer(() => ({ edges: newEdges })));

          if (collaborationEnabled && yjsDoc) {
            const yEdges = yjsDoc.getMap("edges");
            yjsDoc.transact(() => {
              for (const edge of newEdges) {
                yEdges.set(edge.id, edge);
              }
              const currentIds = new Set(newEdges.map((e) => e.id));
              for (const key of yEdges.keys()) {
                if (!currentIds.has(key)) {
                  yEdges.delete(key);
                }
              }
            });
          }
        },

        onConnect: (connection: Connection) => {
          const { yjsDoc, collaborationEnabled, currentLayer, layers } = get();
          const edgesWithoutConflictingConnections = layers[
            currentLayer
          ].edges.filter(
            (e) =>
              e.target !== connection.target ||
              e.targetHandle !== connection.targetHandle,
          );
          const newEdges = addEdge(
            connection,
            edgesWithoutConflictingConnections,
          );

          set(modifyLayer(() => ({ edges: newEdges })));

          if (collaborationEnabled && yjsDoc) {
            const yEdges = yjsDoc.getMap("edges");
            yjsDoc.transact(() => {
              for (const edge of newEdges) {
                yEdges.set(edge.id, edge);
              }
              const currentIds = new Set(newEdges.map((e) => e.id));
              for (const key of yEdges.keys()) {
                if (!currentIds.has(key)) {
                  yEdges.delete(key);
                }
              }
            });
          }
        },

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

        updateNodeParameter: (
          id: string,
          param: string,
          value: string | null,
        ) =>
          set(
            modifyNode(id, (node) => ({
              data: {
                ...node.data,
                parameters: { ...node.data.parameters, [param]: { value } },
              },
            })),
          ),

        updateNodeUniform: (
          id: string,
          name: string,
          value: number | number[],
        ) =>
          set(
            modifyNode(id, (node) => ({
              data: {
                ...node.data,
                uniforms: { ...node.data.uniforms, [name]: value },
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
