import { ShaderNode } from "@/schemas/node.schema";

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

export type Command = CreateNodeCommand | RemoveNodeCommand | ModifyNodeCommand;
