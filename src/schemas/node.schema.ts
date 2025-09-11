import { NODE_TYPE_NAMES } from "@/utils/node-type";
import * as z from "zod/v4";

const parameterTypeSchema = z.enum(["number", "color", "select", "string"]);

export type ParameterType = z.infer<typeof parameterTypeSchema>;

const handleTypeSchema = parameterTypeSchema.extract(["number", "color"]);

export type HandleType = z.infer<typeof handleTypeSchema>;

const handleSchema = z.object({
  name: z.string(),
  type: handleTypeSchema,
});

const parameterSchema = z.object({
  name: z.string(),
  type: parameterTypeSchema,

  // Only used for select type parameter
  options: z
    .object({
      name: z.string(),
      value: z.string(),
    })
    .array()
    .optional(),
});

export const nodeTypeSchema = z.object({
  name: z.string(),
  category: z.string(),

  inputs: z.record(z.string(), handleSchema),
  outputs: z.record(z.string(), handleSchema),
  parameters: z.record(z.string(), parameterSchema),

  shader: z.string(),
});

export type NodeType = z.infer<typeof nodeTypeSchema>;

const nodeTypeIdSchema = z.enum(NODE_TYPE_NAMES);

export const nodeDataSchema = z.object({
  type: nodeTypeIdSchema,
  defaultValues: z.record(
    z.string(),
    z.union([z.number(), z.number().array()]),
  ),
});

export type NodeData = z.infer<typeof nodeDataSchema>;
