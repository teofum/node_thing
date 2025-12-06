import { Layer } from "@/store/project.types";
import { ShaderNode } from "@/schemas/node.schema";
import { isShader, Project } from "@/store/project.types";
import { ExtractState, StoreApi, UseBoundStore } from "zustand";
import { useTutorialStore } from "@/store/tutorial.store";

export function inLayer(layer: number) {
  return (p: Project) => p.currentLayer === layer;
}

export function layerExists(fn: (l: Layer) => boolean) {
  return (p: Project) => p.layers.some(fn);
}

export function nodeExists(fn: (node: ShaderNode) => boolean) {
  return (p: Project) =>
    p.layers[p.currentLayer].nodes.filter(isShader).some(fn);
}

export function edgeExistsBetween(
  source: `${string}:${string}`,
  target: `${string}:${string}`,
) {
  return (p: Project) => {
    const { nodes, edges } = p.layers[p.currentLayer];
    return edges.some((e) => {
      const s = nodes.find((n) => n.id === e.source);
      const t = nodes.find((n) => n.id === e.target);

      const [sourceType, sourceHandle] = source.split(":");
      const [targetType, targetHandle] = target.split(":");

      return (
        s &&
        t &&
        isShader(s) &&
        isShader(t) &&
        s.data.type === sourceType &&
        t.data.type === targetType &&
        e.sourceHandle === sourceHandle &&
        e.targetHandle === targetHandle
      );
    });
  };
}

export function and<T>(...fns: ((p: T) => boolean)[]) {
  return (p: T) => fns.every((fn) => fn(p));
}

export function or<T>(...fns: ((p: T) => boolean)[]) {
  return (p: T) => fns.some((fn) => fn(p));
}

export function not<T>(fn: (p: T) => boolean) {
  return (p: T) => !fn(p);
}

export function externalNextCondition<S extends StoreApi<unknown>>(
  store: UseBoundStore<S>,
  condition: (state: ExtractState<S>) => boolean,
) {
  const unsubscribe = store.subscribe((state) => {
    if (condition(state as ExtractState<S>)) {
      useTutorialStore.getState().nextStep();
      unsubscribe();
    }
  });
}
