// import { NODE_TYPE_NAMES } from "@/utils/node-type";
import * as z from "zod/v4";

const parameterTypeSchema = z.enum(["select", "image"]);

export type ParameterType = z.infer<typeof parameterTypeSchema>;

const handleTypeSchema = z.enum(["number", "color"]);

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
  isPurchased: z.boolean().optional(),
});

export type NodeType = z.infer<typeof nodeTypeSchema>;

// no sabía como incluir los default y los purchased acá
// no sé si usar z.string() está bien
const nodeTypeIdSchema = z.string();

export const nodeDataSchema = z.object({
  type: nodeTypeIdSchema,
  defaultValues: z.record(
    z.string(),
    z.union([z.number(), z.number().array()]),
  ),
  parameters: z.record(
    z.string(),
    z.object({
      value: z.string().nullable(),
    }),
  ),
});

export type NodeData = z.infer<typeof nodeDataSchema>;
