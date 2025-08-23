import { NODE_TYPE_NAMES } from "@/utils/node-type";
import * as z from "zod/v4";

const parameterTypeSchema = z.enum([
  "number",
  "color",
  "vec2",
  "vec3",
  "select",
  "string",
]);

export type ParameterType = z.infer<typeof parameterTypeSchema>;

const handleTypeSchema = parameterTypeSchema.extract([
  "number",
  "color",
  "vec2",
  "vec3",
]);

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

  inputs: z.record(z.string(), handleSchema),
  outputs: z.record(z.string(), handleSchema),
  parameters: z.record(z.string(), parameterSchema),
});

export type NodeType = z.infer<typeof nodeTypeSchema>;

const nodeTypeIdSchema = z.enum(NODE_TYPE_NAMES);

export const nodeSchema = z.object({
  id: z.uuid(),
  type: nodeTypeIdSchema,
});

export type Node = z.infer<typeof nodeSchema>;

export const edgeSchema = z.object({
  from: z.object({ nodeId: z.uuid(), output: z.string() }),
  to: z.object({ nodeId: z.uuid(), input: z.string() }),
});

export type Edge = z.infer<typeof edgeSchema>;
