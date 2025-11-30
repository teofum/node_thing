import { ShaderNode } from "@/schemas/node.schema";
import { Edge } from "@xyflow/react";
import { Changeset } from "json-diff-ts";

import { Layer } from "../project.types";

type GenericCommand<K extends string, T extends object> = {
  command: K;
  data: T;
};

export type NodesChangePatch =
  | {
      type: "position";
      id: string;
      before: { x: number; y: number };
      after: { x: number; y: number };
    }
  | {
      type: "dimensions";
      id: string;
      before: { width?: number; height?: number };
      after: { width?: number; height?: number };
    }
  | {
      type: "selection";
      id: string;
      before: { selected: boolean };
      after: { selected: boolean };
    }
  | { type: "add"; id: string; index: number; node: ShaderNode }
  | { type: "remove"; id: string; index: number; node: ShaderNode }
  | { type: "replace"; id: string; before: ShaderNode; after: ShaderNode };

export type EdgesChangePatch =
  | {
      type: "add";
      edge: Edge;
      index: number;
    }
  | {
      type: "remove";
      edge: Edge;
      index: number;
    }
  | {
      type: "replace";
      before: Edge;
      after: Edge;
    };

export type CreateNodeCommand = GenericCommand<
  "createNode",
  { node: ShaderNode; layer: number }
>;
export type RemoveNodeCommand = GenericCommand<
  "removeNode",
  { node: ShaderNode; layer: number }
>;
export type ModifyNodeCommand = GenericCommand<
  "modifyNode",
  { before: ShaderNode; after: ShaderNode; layer: number }
>;
export type NodesChangeCommand = GenericCommand<
  // react flow
  "nodesChange",
  { layer: number; patch: NodesChangePatch }
>;
export type EdgeChangesCommand = GenericCommand<
  "edgeChanges",
  { before: Edge[]; after: Edge[]; layer: number }
>;
export type EdgesChangeCommand = GenericCommand<
  // react flow
  "edgesChange",
  { layer: number; patches: EdgesChangePatch[] }
>;
export type SwitchLayerCommand = GenericCommand<
  "switchLayer",
  { before: number; after: number }
>;
export type AddLayerCommand = GenericCommand<"addLayer", { layer: Layer }>;
export type ImportLayerCommand = GenericCommand<
  "importLayer",
  { layer: Layer }
>;
export type DuplicateLayerCommand = GenericCommand<
  "duplicateLayer",
  { layer: Layer; index: number }
>;
export type RemoveLayerCommand = GenericCommand<
  "removeLayer",
  { layer: Layer }
>;
export type RenameLayerCommand = GenericCommand<
  "renameLayer",
  { before: string; after: string; index: number }
>;
export type ReorderLayerCommand = GenericCommand<
  "reorderLayer",
  { from: number; to: number }
>;
export type SetCanvasSizeCommand = GenericCommand<
  "setCanvasSize",
  {
    before: { width: number; height: number };
    after: { width: number; height: number };
  }
>;
export type SetLayerBoundsCommand = GenericCommand<
  "setLayerBounds",
  {
    before: {
      position: { x: number; y: number };
      size: { width: number; height: number };
    };
    after: {
      position: { x: number; y: number };
      size: { width: number; height: number };
    };
  }
>;
export type SpdateNodeDefaultValueCommand = GenericCommand<
  "updateNodeDefaultValue",
  {
    input: string;
    id: string;
    before: number | number[];
    after: number | number[];
  }
>;
export type UpdateNodeUniformsCommand = GenericCommand<
  "updateNodeUniforms",
  {
    name: string;
    id: string;
    before: number | number[];
    after: number | number[];
  }
>;

export type Command = {
  command: string;
  diff: Changeset;
};
