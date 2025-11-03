import { ShaderNode } from "@/schemas/node.schema";
import { Edge } from "@xyflow/react";
import { Layer } from "../project.types";

type GenericCommand<K extends string, T extends object> = {
  command: K;
  data: T;
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
export type EdgeChangesCommand = GenericCommand<
  "edgeChanges",
  { before: Edge[]; after: Edge[]; layer: number }
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
    before: number | number[];
    after: number | number[];
  }
>;

export type Command =
  | CreateNodeCommand
  | RemoveNodeCommand
  | ModifyNodeCommand
  | EdgeChangesCommand
  | SwitchLayerCommand
  | AddLayerCommand
  | ImportLayerCommand
  | RemoveLayerCommand
  | RenameLayerCommand
  | DuplicateLayerCommand
  | ReorderLayerCommand
  | SetCanvasSizeCommand
  | SetLayerBoundsCommand
  | SpdateNodeDefaultValueCommand;
