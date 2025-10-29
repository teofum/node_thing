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
  historyPush,
} from "./project.actions";
import { Underdog } from "next/font/google";

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

      updateNodeUniform: (id: string, name: string, value: number | number[]) =>
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
        const { nodeTypes, history } = state;
        const allNodeTypes = getAllNodeTypes(nodeTypes);

        const node = createNode(type, position, allNodeTypes, parameters);

        const newState = modifyLayer((layer) => {
          return {
            nodes: [
              ...layer.nodes.map((node) => ({ ...node, selected: false })),
              node,
            ],
          };
        });

        set({
          ...newState(state),
          history: historyPush(history, { command: "createNode", data: node }),
        });
      },

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

      /**
       * TODO:
       * todos los actions tienen que hacer adjustHistory
       *
       * podria haber una acccion inicial en el history de crear leyer¿
       * o el done arranca en -1
       *
       * indexing: "done" seria la cant de redoables o el indice del ultimo action "vivo"
       */
      adjustHistory: () => {
        const { history, done } = get();

        const slicedHist = history.slice(done); // solo agarra los qu estan hechos

        set((state) => ({
          history: slicedHist,
          done: 0,
        }));
      },

      undo: () => {
        const { history, done } = get();

        if (history.length - done <= 1) return; // si es la primera accion no se puede undo

        const lastCommand = history[done]; // el ultimo action done

        switch (lastCommand.command) {
          case "createNode": {
            set(
              modifyLayer((layer) => ({
                nodes: layer.nodes.filter(
                  (node) => node.id !== lastCommand.data.id,
                ),
              })),
            );
            break;
          }
          case "removeNode": {
          }
          default: {
            console.warn("not implemented");
          }
        }

        set((state) => ({ done: state.done + 1 }));
      },

      redo: () => {
        const { history, done } = get();

        if (done <= 0) return; // no hay cosas para redoear

        const commandToRedo = history[done - 1]; // el primer redoable

        switch (commandToRedo.command) {
          case "createNode": {
            const newState = modifyLayer((layer) => {
              return {
                nodes: [
                  ...layer.nodes.map((node) => ({ ...node, selected: false })),
                  commandToRedo.data,
                ],
              };
            });
            set((state) => ({
              ...newState,
              done: state.done - 1,
            }));
            break;
          }
          default: {
            console.warn("not implemented");
          }
        }
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
