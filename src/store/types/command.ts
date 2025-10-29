import { ShaderNode } from "@/schemas/node.schema";

type GenericCommand<K extends string, T extends object> = {
  command: K;
  data: T;
};

export type CreateNodeCommand = GenericCommand<"createNode", ShaderNode>;
export type RemoveNodeCommand = GenericCommand<"removeNode", ShaderNode>;

export type Command = CreateNodeCommand | RemoveNodeCommand;
