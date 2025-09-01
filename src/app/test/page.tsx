"use client";

import { Layer } from "@/store/store";
import { buildRenderPipeline } from "@/app/components/renderer/pipeline";

const testGraph: Layer = {
  nodes: [
    { id: "__input", data: { type: "__input" }, position: { x: 0, y: 0 } },
    { id: "__input_aux", data: { type: "__input" }, position: { x: 0, y: 0 } },
    { id: "aaa", data: { type: "test_node_1to1" }, position: { x: 0, y: 0 } },
    { id: "bbb", data: { type: "test_node_1to1" }, position: { x: 0, y: 0 } },
    { id: "ccc", data: { type: "test_node_1to2" }, position: { x: 0, y: 0 } },
    {
      id: "dddhhh",
      data: { type: "test_node_2to1" },
      position: { x: 0, y: 0 },
    },
    { id: "eee", data: { type: "test_node_1to1" }, position: { x: 0, y: 0 } },
    { id: "fff", data: { type: "test_node_1to1" }, position: { x: 0, y: 0 } },
    { id: "ggg", data: { type: "test_node_1to2" }, position: { x: 0, y: 0 } },
    { id: "iii", data: { type: "test_node_3to1" }, position: { x: 0, y: 0 } },
    { id: "jjj", data: { type: "test_node_2to1" }, position: { x: 0, y: 0 } },
    { id: "kkk", data: { type: "test_node_1to1" }, position: { x: 0, y: 0 } },
    { id: "__output", data: { type: "__output" }, position: { x: 0, y: 0 } },
  ],
  edges: [
    {
      id: "1",
      source: "__input",
      sourceHandle: "out_a",
      target: "aaa",
      targetHandle: "in_a",
    },
    {
      id: "1",
      source: "__input_aux",
      sourceHandle: "out_a",
      target: "bbb",
      targetHandle: "in_a",
    },
    {
      id: "1",
      source: "aaa",
      sourceHandle: "out_a",
      target: "ccc",
      targetHandle: "in_a",
    },
    {
      id: "1",
      source: "bbb",
      sourceHandle: "out_a",
      target: "dddhhh",
      targetHandle: "in_b",
    },
    {
      id: "1",
      source: "ccc",
      sourceHandle: "out_a",
      target: "eee",
      targetHandle: "in_a",
    },
    {
      id: "1",
      source: "ccc",
      sourceHandle: "out_a",
      target: "fff",
      targetHandle: "in_a",
    },
    {
      id: "1",
      source: "ccc",
      sourceHandle: "out_b",
      target: "ggg",
      targetHandle: "in_a",
    },
    {
      id: "1",
      source: "eee",
      sourceHandle: "out_a",
      target: "iii",
      targetHandle: "in_a",
    },
    {
      id: "1",
      source: "fff",
      sourceHandle: "out_a",
      target: "iii",
      targetHandle: "in_b",
    },
    {
      id: "1",
      source: "ggg",
      sourceHandle: "out_a",
      target: "dddhhh",
      targetHandle: "in_a",
    },
    {
      id: "1",
      source: "ggg",
      sourceHandle: "out_b",
      target: "jjj",
      targetHandle: "in_b",
    },
    {
      id: "1",
      source: "dddhhh",
      sourceHandle: "out_a",
      target: "iii",
      targetHandle: "in_c",
    },
    {
      id: "1",
      source: "iii",
      sourceHandle: "out_a",
      target: "jjj",
      targetHandle: "in_a",
    },
    {
      id: "1",
      source: "jjj",
      sourceHandle: "out_a",
      target: "kkk",
      targetHandle: "in_a",
    },
    {
      id: "1",
      source: "kkk",
      sourceHandle: "out_a",
      target: "__output",
      targetHandle: "in_a",
    },
  ],
};

export default function TestPagePleaseIgnore() {
  return (
    <div>
      <button onClick={() => console.log(buildRenderPipeline(testGraph))}>
        test
      </button>
    </div>
  );
}
