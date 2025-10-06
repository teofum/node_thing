import { RenderPipeline } from "@/app/components/renderer/pipeline";
import { createNode } from "@/utils/node";
import { NODE_TYPES } from "@/utils/node-type";

describe("RenderPipeline", () => {
  const output = createNode("__output", { x: 0, y: 0 }, NODE_TYPES, {});
  const mix = createNode("mix", { x: 0, y: 0 }, NODE_TYPES, {});
  const gray = createNode("grayscale", { x: 0, y: 0 }, NODE_TYPES, {});
  const input = createNode("__input_image", { x: 0, y: 0 }, NODE_TYPES, {});

  const edge1 = {
    id: "edge_1",
    source: mix.id,
    sourceHandle: "output",
    target: output.id,
    targetHandle: "color",
  };

  const edge2 = {
    id: "edge_2",
    source: gray.id,
    sourceHandle: "output",
    target: mix.id,
    targetHandle: "input_a",
  };

  const edge3 = {
    id: "edge_3",
    source: input.id,
    sourceHandle: "color",
    target: output.id,
    targetHandle: "color",
  };

  const edge4 = {
    id: "edge_4",
    source: mix.id,
    sourceHandle: "output",
    target: gray.id,
    targetHandle: "input",
  };

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

  it("should create a pipeline object", () => {
    const create = makePipelineFactory(
      { nodes: [output, mix], edges: [edge1] },
      NODE_TYPES,
    );

    expect(create).not.toThrow();
  });

  it("should have a valid output buffer", () => {
    const pipeline = RenderPipeline.create(
      { nodes: [output, mix], edges: [edge1] },
      NODE_TYPES,
    );

    expect(pipeline.outputBuffer).toBeGreaterThanOrEqual(0);
  });

  it("should have a render pass with the correct node type", () => {
    const pipeline = RenderPipeline.create(
      { nodes: [output, mix], edges: [edge1] },
      NODE_TYPES,
    );

    expect(pipeline.passes.length).toBe(1);
    expect(pipeline.passes[0].nodeType).toBe("mix");
  });

  it("should use the correct output buffer", () => {
    const pipeline = RenderPipeline.create(
      { nodes: [output, mix], edges: [edge1] },
      NODE_TYPES,
    );

    expect(pipeline.passes[0].outputBindings.output).toBe(
      pipeline.outputBuffer,
    );
  });

  it("should ignore disconnected nodes", () => {
    const pipeline = RenderPipeline.create(
      { nodes: [output, mix, gray], edges: [edge1] },
      NODE_TYPES,
    );

    expect(pipeline.passes.length).toBe(1);
    expect(pipeline.passes[0].nodeType).toBe("mix");
  });

  it("should ignore dead ends", () => {
    const pipeline = RenderPipeline.create(
      { nodes: [output, mix, gray], edges: [edge1, edge4] },
      NODE_TYPES,
    );

    expect(pipeline.passes.length).toBe(1);
    expect(pipeline.passes[0].nodeType).toBe("mix");
  });

  it("should use the same buffer for both ends of an edge", () => {
    const pipeline = RenderPipeline.create(
      { nodes: [output, mix, gray], edges: [edge1, edge2] },
      NODE_TYPES,
    );

    expect(pipeline.passes[0].outputBindings.output).toBe(
      pipeline.passes[1].inputBindings.input_a,
    );
    expect(pipeline.passes[1].outputBindings.output).toBe(
      pipeline.outputBuffer,
    );
  });

  it("should have null inputs when disconnected", () => {
    const pipeline = RenderPipeline.create(
      { nodes: [output, mix], edges: [edge1] },
      NODE_TYPES,
    );

    expect(pipeline.passes[0].inputBindings.input_a).toBeNull();
    expect(pipeline.passes[0].inputBindings.input_b).toBeNull();
  });

  it("should create no inputs with no input nodes", () => {
    const pipeline = RenderPipeline.create(
      { nodes: [output, mix], edges: [edge1] },
      NODE_TYPES,
    );

    expect(pipeline.inputs.length).toBe(0);
  });

  it("should have an input with the correct type", () => {
    const pipeline = RenderPipeline.create(
      { nodes: [output, input], edges: [edge3] },
      NODE_TYPES,
    );

    expect(pipeline.inputs.length).toBe(1);
    expect(pipeline.inputs[0].type).toBe("__input_image");
  });

  it("should have matching buffers for input connections", () => {
    const pipeline = RenderPipeline.create(
      { nodes: [output, input], edges: [edge3] },
      NODE_TYPES,
    );

    expect(pipeline.inputs[0].outputBindings.color).toBe(pipeline.outputBuffer);
  });
});

describe("RenderPipeline.tryCreate", () => {
  it("should return null when called with invalid input", () => {
    const pipeline = RenderPipeline.tryCreate({ nodes: [], edges: [] }, {});

    expect(pipeline).toBeNull();
  });
});
