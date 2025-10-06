import { createNode } from "@/utils/node";
import { NODE_TYPES } from "@/utils/node-type";

export function getNodesAndEdgesForTesting() {
  const output = createNode("__output", { x: 0, y: 0 }, NODE_TYPES, {});
  const mix = createNode("mix", { x: 0, y: 0 }, NODE_TYPES, {});
  const gray = createNode("grayscale", { x: 0, y: 0 }, NODE_TYPES, {});
  const input = createNode("__input_image", { x: 0, y: 0 }, NODE_TYPES, {});

  const mixToOutput = {
    id: "edge_1",
    source: mix.id,
    sourceHandle: "output",
    target: output.id,
    targetHandle: "color",
  };

  const grayToMixA = {
    id: "edge_2",
    source: gray.id,
    sourceHandle: "output",
    target: mix.id,
    targetHandle: "input_a",
  };

  const inputToOutput = {
    id: "edge_3",
    source: input.id,
    sourceHandle: "color",
    target: output.id,
    targetHandle: "color",
  };

  const mixToGray = {
    id: "edge_4",
    source: mix.id,
    sourceHandle: "output",
    target: gray.id,
    targetHandle: "input",
  };

  return {
    output,
    mix,
    gray,
    input,
    mixToOutput,
    grayToMixA,
    inputToOutput,
    mixToGray,
  };
}
