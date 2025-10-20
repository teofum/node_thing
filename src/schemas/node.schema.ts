import * as z from "zod/v4";
import { Node } from "@xyflow/react";

const handleSchema = z
  .object({
    name: z.string(),
  })
  .and(
    z.union([
      z.object({ type: z.literal("color") }),
      z.object({
        type: z.literal("number"),
        min: z.number().optional(),
        max: z.number().optional(),
        step: z.number().optional(),
      }),
    ]),
  );

export type HandleType = z.infer<typeof handleSchema>["type"];

const parameterSchema = z
  .object({
    name: z.string(),
  })
  .and(
    z.union([
      z.object({
        type: z.literal("image"),
      }),
      z.object({
        type: z.literal("select"),
        options: z.string().array(),
      }),
    ]),
  );

const passBufferSchema = z.object({
  name: z.string(),
  type: z.enum(["color", "number"]),
});

export type NodePassBufferDescriptor = z.infer<typeof passBufferSchema>;

export const nodeTypeSchema = z.object({
  name: z.string(),
  category: z.string(),

  inputs: z.record(z.string(), handleSchema),
  outputs: z.record(z.string(), handleSchema),
  parameters: z.record(z.string(), parameterSchema),

  shader: z.string(),
  additionalPasses: z
    .object({
      shader: z.string(),
      buffers: passBufferSchema.array(),
    })
    .array()
    .optional(),

  isPurchased: z.boolean().optional(),
  remoteId: z.string().optional(),
});

export type NodeType = z.infer<typeof nodeTypeSchema>;

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
export type ShaderNode = Node<NodeData>;
