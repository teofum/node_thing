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
  { before: number; after: number; layer: 0 }
>;

export type Command =
  | CreateNodeCommand
  | RemoveNodeCommand
  | ModifyNodeCommand
  | EdgeChangesCommand
  | SwitchLayerCommand;
