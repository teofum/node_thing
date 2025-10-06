import { RenderPipeline } from "@/app/components/renderer/pipeline";
import { createNode } from "@/utils/node";
import { NODE_TYPES } from "@/utils/node-type";

describe("RenderPipeline", () => {
  const output = createNode("__output", { x: 0, y: 0 }, NODE_TYPES, {});
  const mix = createNode("mix", { x: 0, y: 0 }, NODE_TYPES, {});

  const makePipelineFactory =
    (...args: Parameters<typeof RenderPipeline.create>) =>
    () =>
      RenderPipeline.create(...args);

  it("should throw when called with empty arguments", () => {
    const create = makePipelineFactory({ nodes: [], edges: [] }, {});

    expect(create).toThrow(/no output/i);
  });

  it("should throw when called without nodes", () => {
    const create = makePipelineFactory({ nodes: [], edges: [] }, NODE_TYPES);

    expect(create).toThrow(/no output/i);
  });

  it("should throw when only an output node is present", () => {
    const create = makePipelineFactory(
      { nodes: [output], edges: [] },
      NODE_TYPES,
    );

    expect(create).toThrow(/disconnected/i);
  });

  it("should throw when the output node is disconnected", () => {
    const create = makePipelineFactory(
      { nodes: [output, mix], edges: [] },
      NODE_TYPES,
    );

    expect(create).toThrow(/disconnected/i);
  });
});

describe("RenderPipeline.tryCreate", () => {
  it("should return null when called with invalid input", () => {
    const pipeline = RenderPipeline.tryCreate({ nodes: [], edges: [] }, {});

    expect(pipeline).toBeNull();
  });
});
