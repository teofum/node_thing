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

export const useProjectStore = create(
  persist(
    combine(createInitialState(), (set, get) => ({
      setActiveLayer: (idx: number) => {
        const state = get();
        const { history, done, layers, currentLayer } = state;

        const before = state.currentLayer;

        const slicedHist = history.slice(done);
        set({
          currentLayer: idx,
          history: historyPush(slicedHist, {
            command: "switchLayer",
            data: { before: before, after: idx },
          }),
          done: 0,
        });
      },

      onNodesChange: (changes: NodeChange<Node>[]) =>
        set(
          modifyLayer((layer) => ({
            nodes: applyNodeChanges(changes, layer.nodes) as ShaderNode[],
          })),
        ),

      onEdgesChange: (changes: EdgeChange<Edge>[]) => {
        const state = get();
        const { history, done, layers, currentLayer } = state;

        // TODO: podria guardar los changes invertidos
        const beforeEdges = layers[currentLayer].edges;
        if (!beforeEdges) return;

        const newState = modifyLayer((layer) => ({
          edges: applyEdgeChanges(changes, layer.edges),
        }))(state);
        if (!newState.layers) return;

        const afterEdges = newState.layers[currentLayer].edges;
        if (!afterEdges) return;

        const slicedHist = history.slice(done);
        set({
          ...newState,
          history: historyPush(slicedHist, {
            command: "edgeChanges",
            data: {
              before: beforeEdges,
              after: afterEdges,
              layer: currentLayer,
            },
          }),
          done: 0,
        });
      },

      onConnect: (connection: Connection) => {
        const state = get();
        const { history, done, layers, currentLayer } = state;

        const beforeEdges = layers[currentLayer].edges;
        if (!beforeEdges) return;

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
        if (!newState.layers) return;

        const afterEdges = newState.layers[currentLayer].edges;
        if (!afterEdges) return;

        const slicedHist = history.slice(done);
        set({
          ...newState,
          history: historyPush(slicedHist, {
            command: "edgeChanges",
            data: {
              before: beforeEdges,
              after: afterEdges,
              layer: currentLayer,
            },
          }),
          done: 0,
        });
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
      ) => {
        const state = get();
        const { history, done, layers, currentLayer } = state;

        const beforeNode = layers[currentLayer].nodes.find(
          (node) => node.id === id,
        );
        if (!beforeNode) return;

        const newState = modifyNode(id, (node) => ({
          data: {
            ...node.data,
            parameters: { ...node.data.parameters, [param]: { value } },
          },
        }))(state);
        if (!newState.layers) return; // H

        const afterNode = newState.layers[currentLayer].nodes.find(
          (node) => node.id === id,
        );
        if (!afterNode) return;

        const slicedHist = history.slice(done);
        set({
          ...newState,
          history: historyPush(slicedHist, {
            command: "modifyNode",
            data: { before: beforeNode, after: afterNode, layer: currentLayer },
          }),
          done: 0,
        });
      },

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

      addLayer: () => {
        const state = get();
        const { layers, properties, history, done } = state;

        const newLayer = createLayer(
          `Layer ${layers.length}`,
          properties.canvas,
        );
        const newLayers = [...layers, newLayer];
        const newCurrentLayer = newLayers.length - 1;

        const slicedHist = history.slice(done);
        set({
          layers: newLayers,
          currentLayer: newCurrentLayer,
          history: historyPush(slicedHist, {
            command: "addLayer",
            data: {
              layer: newLayer,
            },
          }),
          done: 0,
        });
      },

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

      importLayer: (json: string) => {
        const state = get();
        const { layers, history, done } = state;

        const parsedLayer: Layer = JSON.parse(json);
        parsedLayer.id = newLayerId();
        const newLayers = [...layers, parsedLayer];
        const newCurrentLayer = newLayers.length - 1;

        const slicedHist = history.slice(done);
        set({
          layers: newLayers,
          currentLayer: newCurrentLayer,
          history: historyPush(slicedHist, {
            command: "importLayer",
            data: {
              layer: parsedLayer,
            },
          }),
          done: 0,
        });
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
        const { nodeTypes, history, done, currentLayer } = state;
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

        const slicedHist = history.slice(done);
        set({
          ...newState(state),
          history: historyPush(slicedHist, {
            command: "createNode",
            data: { node: node, layer: currentLayer },
          }),
          done: 0,
        });
      },

      // TODO: Falta el delete con backspace
      removeNode: (id: string) => {
        const state = get();
        const { history, done, layers, currentLayer } = state;
        const slicedHist = history.slice(done);

        const node = layers[currentLayer].nodes.find((node) => node.id === id);
        if (!node) return;

        const newState = modifyLayer((layer) => ({
          nodes: layer.nodes.filter((node) => node.id !== id),
        }));

        set({
          ...newState(state),
          history: historyPush(slicedHist, {
            command: "removeNode",
            data: { node: node, layer: currentLayer },
          }),
          done: 0,
        });
      },

      changeLayerName: (name: string, idx: number) => {
        const state = get();
        const { history, done } = state;

        const before = state.layers[idx].name;

        const newState = modifyLayer(() => ({ name }), idx)(state);

        const slicedHist = history.slice(done);
        set({
          ...newState,
          history: historyPush(slicedHist, {
            command: "renameLayer",
            data: {
              before: before,
              after: name,
              index: idx,
            },
          }),
          done: 0,
        });
      },

      removeLayer: (i: number) => {
        const state = get();
        const { layers, currentLayer, history, done } = state;

        if (layers.length <= 1) return; // don't remove the last layer

        const layerToRemove = layers[i];
        const newLayers = [...layers.slice(0, i), ...layers.slice(i + 1)];
        const newCurrentLayer =
          i <= currentLayer ? Math.max(0, currentLayer - 1) : currentLayer;

        const slicedHist = history.slice(done);
        set({
          layers: newLayers,
          currentLayer: newCurrentLayer,
          history: historyPush(slicedHist, {
            command: "removeLayer",
            data: {
              layer: layerToRemove,
            },
          }),
          done: 0,
        });
      },

      duplicateLayer: (i: number) => {
        const state = get();
        const { layers, history, done } = state;

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

        const slicedHist = history.slice(done);
        set({
          layers: newLayers,
          currentLayer: newLayerIdx,
          history: historyPush(slicedHist, {
            command: "duplicateLayer",
            data: {
              layer: newLayer,
              index: newLayerIdx,
            },
          }),
          done: 0,
        });
      },

      /**
       * TODO:
       * todos los actions tienen que hacer adjustHistory
       *
       * podria haber una acccion inicial en el history de crear leyer¿
       * o el done arranca en -1
       *
       * indexing: "done" seria la cant de redoables
       * o el indice del ultimo action "vivo"
       */
      adjustHistory: () => {
        const { history, done } = get();

        // solo agarra los qu estan hechos
        const slicedHist = history.slice(done);
        set((state) => ({
          history: slicedHist,
          done: 0,
        }));
      },

      undo: () => {
        const state = get();
        const { history, done } = state;

        // si es la primera accion no se puede undo
        if (history.length - done <= 1) return;

        // el ultimo action done
        const lastCommand = history[done];

        console.log("undo " + lastCommand.command); // TODO: borrar testing

        switch (lastCommand.command) {
          case "createNode": {
            set(
              modifyLayer(
                (layer) => ({
                  nodes: layer.nodes.filter(
                    (node) => node.id !== lastCommand.data.node.id,
                  ),
                }),
                lastCommand.data.layer,
              ),
            );
            break;
          }
          case "removeNode": {
            const newState = modifyLayer((layer) => {
              return {
                nodes: [
                  ...layer.nodes.map((node) => ({ ...node, selected: false })),
                  lastCommand.data.node,
                ],
              };
            }, lastCommand.data.layer);
            set({
              ...newState(state),
            });
            break;
          }
          case "modifyNode": {
            const { before } = lastCommand.data;
            const newState = modifyLayer(
              (layer) => ({
                nodes: layer.nodes.map((node) =>
                  node.id === before.id ? before : node,
                ),
              }),
              lastCommand.data.layer,
            );
            set({
              ...newState(state),
            });
            break;
          }
          case "edgeChanges": {
            const { before, layer } = lastCommand.data;
            const newState = modifyLayer(
              (l) => ({ ...l, edges: before }),
              layer,
            );
            set({
              ...newState(state),
            });
            break;
          }
          case "switchLayer": {
            set({ currentLayer: lastCommand.data.before });
            break;
          }
          case "addLayer":
          case "importLayer": {
            set(({ layers }) => {
              const newLayers = layers.slice(0, -1);
              const newCurrent = Math.max(0, newLayers.length - 1);

              return {
                layers: newLayers,
                currentLayer: newCurrent,
              };
            });
            break;
          }
          case "duplicateLayer": {
            set(({ layers }) => {
              const idx = lastCommand.data.index;
              const newLayers = layers.filter((_, i) => i !== idx);
              const newCurrent = Math.max(0, newLayers.length - 1);

              return {
                layers: newLayers,
                currentLayer: newCurrent,
              };
            });
            break;
          }
          case "removeLayer": {
            const { layers } = get();

            const newLayers = [...layers, lastCommand.data.layer];
            const newCurrentLayer = newLayers.length - 1;

            set({
              layers: newLayers,
              currentLayer: newCurrentLayer,
            });
            break;
          }
          case "renameLayer": {
            const newState = modifyLayer(
              (layer) => ({ name: lastCommand.data.after }),
              lastCommand.data.index,
            )(state);

            set(newState);
            break;
          }
          default: {
            console.warn("not implemented");
            set((state) => ({ done: state.done - 1 })); // TODO: parche por caso not impl
          }
        }

        set((state) => ({ done: state.done + 1 }));
      },

      redo: () => {
        const state = get();
        const { history, done } = state;

        // no hay cosas para redoear
        if (done <= 0) return;

        // el primer redoable
        const commandToRedo = history[done - 1];

        console.log("reoo " + commandToRedo.command); // TODO: borrar testing

        switch (commandToRedo.command) {
          case "createNode": {
            const newState = modifyLayer((layer) => {
              return {
                nodes: [
                  ...layer.nodes.map((node) => ({ ...node, selected: false })),
                  commandToRedo.data.node,
                ],
              };
            }, commandToRedo.data.layer);
            set({
              ...newState(state),
            });
            break;
          }
          case "removeNode": {
            set(
              modifyLayer(
                (layer) => ({
                  nodes: layer.nodes.filter(
                    (node) => node.id !== commandToRedo.data.node.id,
                  ),
                }),
                commandToRedo.data.layer,
              ),
            );
            break;
          }
          case "modifyNode": {
            const { after } = commandToRedo.data;
            const newState = modifyLayer(
              (layer) => ({
                nodes: layer.nodes.map((node) =>
                  node.id === after.id ? after : node,
                ),
              }),
              commandToRedo.data.layer,
            );
            set({
              ...newState(state),
            });
            break;
          }
          case "edgeChanges": {
            const { after, layer } = commandToRedo.data;
            const newState = modifyLayer(
              (l) => ({ ...l, edges: after }),
              layer,
            );
            set({
              ...newState(state),
            });
            break;
          }
          case "switchLayer": {
            set({ currentLayer: commandToRedo.data.after });
            break;
          }
          case "addLayer":
          case "importLayer": {
            const { layers } = get();

            const newLayers = [...layers, commandToRedo.data.layer];
            const newCurrentLayer = newLayers.length - 1;

            set({
              layers: newLayers,
              currentLayer: newCurrentLayer,
            });
            break;
          }
          case "duplicateLayer": {
            const { layer, index } = commandToRedo.data;

            set(({ layers }) => {
              const newLayers = [
                ...layers.slice(0, index),
                layer,
                ...layers.slice(index),
              ];

              return {
                layers: newLayers,
                currentLayer: index,
              };
            });
            break;
          }
          case "renameLayer": {
            const newState = modifyLayer(
              (layer) => ({ name: commandToRedo.data.after }),
              commandToRedo.data.index,
            )(state);

            set(newState);
            break;
          }
          case "renameLayer": {
            const newState = modifyLayer(
              (l) => ({ name: commandToRedo.data.before }),
              commandToRedo.data.index,
            )(state);

            set({ ...newState });
            break;
          }
          default: {
            console.warn("not implemented");
            set((state) => ({ done: state.done + 1 })); // TODO: parche por caso not impl
          }
        }

        set((state) => ({ done: state.done - 1 }));
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
