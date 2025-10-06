import { RenderPipeline } from "@/app/components/renderer/pipeline";
import { NODE_TYPES } from "@/utils/node-type";
import { getNodesAndEdgesForTesting } from "./mock-pipeline";

describe("RenderPipeline", () => {
  const {
    output,
    mix,
    gray,
    input,
    mixToOutput,
    grayToMixA,
    inputToOutput,
    mixToGray,
  } = getNodesAndEdgesForTesting();

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
      { nodes: [output, mix], edges: [mixToOutput] },
      NODE_TYPES,
    );

    expect(create).not.toThrow();
  });

  it("should have a valid output buffer", () => {
    const pipeline = RenderPipeline.create(
      { nodes: [output, mix], edges: [mixToOutput] },
      NODE_TYPES,
    );

    expect(pipeline.outputBuffer).toBeGreaterThanOrEqual(0);
  });

  it("should have a render pass with the correct node type", () => {
    const pipeline = RenderPipeline.create(
      { nodes: [output, mix], edges: [mixToOutput] },
      NODE_TYPES,
    );

    expect(pipeline.passes.length).toBe(1);
    expect(pipeline.passes[0].nodeType).toBe("mix");
  });

  it("should use the correct output buffer", () => {
    const pipeline = RenderPipeline.create(
      { nodes: [output, mix], edges: [mixToOutput] },
      NODE_TYPES,
    );

    expect(pipeline.passes[0].outputBindings.output).toBe(
      pipeline.outputBuffer,
    );
  });

  it("should ignore disconnected nodes", () => {
    const pipeline = RenderPipeline.create(
      { nodes: [output, mix, gray], edges: [mixToOutput] },
      NODE_TYPES,
    );

    expect(pipeline.passes.length).toBe(1);
    expect(pipeline.passes[0].nodeType).toBe("mix");
  });

  it("should ignore dead ends", () => {
    const pipeline = RenderPipeline.create(
      { nodes: [output, mix, gray], edges: [mixToOutput, mixToGray] },
      NODE_TYPES,
    );

    expect(pipeline.passes.length).toBe(1);
    expect(pipeline.passes[0].nodeType).toBe("mix");
  });

  it("should use the same buffer for both ends of an edge", () => {
    const pipeline = RenderPipeline.create(
      { nodes: [output, mix, gray], edges: [mixToOutput, grayToMixA] },
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
      { nodes: [output, mix], edges: [mixToOutput] },
      NODE_TYPES,
    );

    expect(pipeline.passes[0].inputBindings.input_a).toBeNull();
    expect(pipeline.passes[0].inputBindings.input_b).toBeNull();
  });

  it("should create no inputs with no input nodes", () => {
    const pipeline = RenderPipeline.create(
      { nodes: [output, mix], edges: [mixToOutput] },
      NODE_TYPES,
    );

    expect(pipeline.inputs.length).toBe(0);
  });

  it("should have an input with the correct type", () => {
    const pipeline = RenderPipeline.create(
      { nodes: [output, input], edges: [inputToOutput] },
      NODE_TYPES,
    );

    expect(pipeline.inputs.length).toBe(1);
    expect(pipeline.inputs[0].type).toBe("__input_image");
  });

  it("should have matching buffers for input connections", () => {
    const pipeline = RenderPipeline.create(
      { nodes: [output, input], edges: [inputToOutput] },
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
