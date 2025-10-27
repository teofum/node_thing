import { Edge } from "@xyflow/react";

import { NodeType, ShaderNode } from "@/schemas/node.schema";
import { DeepPartial } from "@/utils/deep-partial";
import { Command } from "./types/command";

export type Layer = {
  nodes: ShaderNode[];
  edges: Edge[];

  position: { x: number; y: number };
  size: { width: number; height: number };

  id: string;
  name: string;
};

export type ProjectProperties = {
  canvas: {
    width: number;
    height: number;
  };
};

export type NodeTypes = Record<string, NodeType>;

export type Project = {
  layers: Layer[];
  currentLayer: number;
  properties: ProjectProperties;
  nodeTypes: {
    default: NodeTypes;
    custom: NodeTypes;
    external: NodeTypes;
  };
  projectName: string;
  history: Command[];
  historySize: number;
  done: number;
};

export type NodeTypeDependency = {
  name: string;
  id: string;
  externalId: string;
};

export type ProjectDependencies = {
  externalDependencies: {
    nodeTypes: NodeTypeDependency[];
  };
};

export type StoredProject = DeepPartial<Project> & Partial<ProjectDependencies>;

export type HandleDescriptor = {
  id: string;
  name: string;
  display: string;
  type: "color" | "number";
};

export type NodeTypeDescriptor = {
  name: string;
  inputs: HandleDescriptor[];
  outputs: HandleDescriptor[];
  code: string;
};
