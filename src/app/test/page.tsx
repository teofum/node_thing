"use client";

import { Layer } from "@/store/store";
import { buildRenderPipeline } from "@/app/components/renderer/pipeline";

const testGraph: Layer = {
  nodes: [
    { id: "__input", type: "__input" },
    { id: "__input_aux", type: "__input" },
    { id: "aaa", type: "test_node_1to1" },
    { id: "bbb", type: "test_node_1to1" },
    { id: "ccc", type: "test_node_1to2" },
    { id: "dddhhh", type: "test_node_2to1" },
    { id: "eee", type: "test_node_1to1" },
    { id: "fff", type: "test_node_1to1" },
    { id: "ggg", type: "test_node_1to2" },
    { id: "iii", type: "test_node_3to1" },
    { id: "jjj", type: "test_node_2to1" },
    { id: "kkk", type: "test_node_1to1" },
    { id: "__output", type: "__output" },
  ],
  edges: [
    {
      from: { nodeId: "__input", output: "out_a" },
      to: { nodeId: "aaa", input: "in_a" },
    },
    {
      from: { nodeId: "__input_aux", output: "out_a" },
      to: { nodeId: "bbb", input: "in_a" },
    },
    {
      from: { nodeId: "aaa", output: "out_a" },
      to: { nodeId: "ccc", input: "in_a" },
    },
    {
      from: { nodeId: "bbb", output: "out_a" },
      to: { nodeId: "dddhhh", input: "in_b" },
    },
    {
      from: { nodeId: "ccc", output: "out_a" },
      to: { nodeId: "eee", input: "in_a" },
    },
    {
      from: { nodeId: "ccc", output: "out_a" },
      to: { nodeId: "fff", input: "in_a" },
    },
    {
      from: { nodeId: "ccc", output: "out_b" },
      to: { nodeId: "ggg", input: "in_a" },
    },
    {
      from: { nodeId: "eee", output: "out_a" },
      to: { nodeId: "iii", input: "in_a" },
    },
    {
      from: { nodeId: "fff", output: "out_a" },
      to: { nodeId: "iii", input: "in_b" },
    },
    {
      from: { nodeId: "ggg", output: "out_a" },
      to: { nodeId: "dddhhh", input: "in_a" },
    },
    {
      from: { nodeId: "ggg", output: "out_b" },
      to: { nodeId: "jjj", input: "in_b" },
    },
    {
      from: { nodeId: "dddhhh", output: "out_a" },
      to: { nodeId: "iii", input: "in_c" },
    },
    {
      from: { nodeId: "iii", output: "out_a" },
      to: { nodeId: "jjj", input: "in_a" },
    },
    {
      from: { nodeId: "jjj", output: "out_a" },
      to: { nodeId: "kkk", input: "in_a" },
    },
    {
      from: { nodeId: "kkk", output: "out_a" },
      to: { nodeId: "__output", input: "in_a" },
    },
  ],
};

export default function TestPagePleaseIgnore() {
  return (
    <div>
      <button onClick={() => buildRenderPipeline(testGraph)}>teset</button>
    </div>
  );
}
