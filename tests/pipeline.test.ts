import { RenderPipeline } from "@/app/components/renderer/pipeline";
import { NODE_TYPES } from "@/utils/node-type";
import { edge, getNodesForTesting } from "./pipeline.mock";

describe("RenderPipeline", () => {
  const { output, mix, gray, threshold, input } = getNodesForTesting();

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
      {
        nodes: [output, mix],
        edges: [edge(mix, output).with("output", "color")],
      },
      NODE_TYPES,
    );

    expect(create).not.toThrow();
  });

  it("should have a valid output buffer", () => {
    const pipeline = RenderPipeline.create(
      {
        nodes: [output, mix],
        edges: [edge(mix, output).with("output", "color")],
      },
      NODE_TYPES,
    );

    expect(pipeline.outputBuffer).toBeGreaterThanOrEqual(0);
  });

  it("should have a render pass with the correct node type", () => {
    const pipeline = RenderPipeline.create(
      {
        nodes: [output, mix],
        edges: [edge(mix, output).with("output", "color")],
      },
      NODE_TYPES,
    );

    expect(pipeline.passes.length).toBe(1);
    expect(pipeline.passes[0].nodeType).toBe("mix");
  });

  it("should use the correct output buffer", () => {
    const pipeline = RenderPipeline.create(
      {
        nodes: [output, mix],
        edges: [edge(mix, output).with("output", "color")],
      },
      NODE_TYPES,
    );

    expect(pipeline.passes[0].outputBindings.output).toBe(
      pipeline.outputBuffer,
    );
  });

  it("should ignore disconnected nodes", () => {
    const pipeline = RenderPipeline.create(
      {
        nodes: [output, mix, gray],
        edges: [edge(mix, output).with("output", "color")],
      },
      NODE_TYPES,
    );

    expect(pipeline.passes.length).toBe(1);
    expect(pipeline.passes[0].nodeType).toBe("mix");
  });

  it("should ignore dead ends", () => {
    const pipeline = RenderPipeline.create(
      {
        nodes: [output, mix, gray],
        edges: [
          edge(mix, output).with("output", "color"),
          edge(mix, gray).with("output", "input"),
        ],
      },
      NODE_TYPES,
    );

    expect(pipeline.passes.length).toBe(1);
    expect(pipeline.passes[0].nodeType).toBe("mix");
  });

  it("should use the same buffer for both ends of an edge", () => {
    const pipeline = RenderPipeline.create(
      {
        nodes: [output, mix, gray],
        edges: [
          edge(mix, output).with("output", "color"),
          edge(gray, mix).with("output", "input_a"),
        ],
      },
      NODE_TYPES,
    );

    expect(pipeline.passes[0].outputBindings.output).toBe(
      pipeline.passes[1].inputBindings.input_a,
    );
    expect(pipeline.passes[1].outputBindings.output).toBe(
      pipeline.outputBuffer,
    );
  });

  it("should use the same buffer for inputs connected to the same output", () => {
    const pipeline = RenderPipeline.create(
      {
        nodes: [output, mix, gray],
        edges: [
          edge(mix, output).with("output", "color"),
          edge(gray, mix).with("output", "input_a"),
          edge(gray, mix).with("output", "input_b"),
        ],
      },
      NODE_TYPES,
    );

    expect(pipeline.passes[0].outputBindings.output).toBe(
      pipeline.passes[1].inputBindings.input_a,
    );
    expect(pipeline.passes[0].outputBindings.output).toBe(
      pipeline.passes[1].inputBindings.input_b,
    );
  });

  it("should have null inputs when disconnected", () => {
    const pipeline = RenderPipeline.create(
      {
        nodes: [output, mix],
        edges: [edge(mix, output).with("output", "color")],
      },
      NODE_TYPES,
    );

    expect(pipeline.passes[0].inputBindings.input_a).toBeNull();
    expect(pipeline.passes[0].inputBindings.input_b).toBeNull();
  });

  it("should create no inputs with no input nodes", () => {
    const pipeline = RenderPipeline.create(
      {
        nodes: [output, mix],
        edges: [edge(mix, output).with("output", "color")],
      },
      NODE_TYPES,
    );

    expect(pipeline.inputs.length).toBe(0);
  });

  it("should have an input with the correct type", () => {
    const pipeline = RenderPipeline.create(
      {
        nodes: [output, input],
        edges: [edge(input, output).with("color", "color")],
      },
      NODE_TYPES,
    );

    expect(pipeline.inputs.length).toBe(1);
    expect(pipeline.inputs[0].type).toBe("__input_image");
  });

  it("should have matching buffers for input connections", () => {
    const pipeline = RenderPipeline.create(
      {
        nodes: [output, input],
        edges: [edge(input, output).with("color", "color")],
      },
      NODE_TYPES,
    );

    expect(pipeline.inputs[0].outputBindings.color).toBe(pipeline.outputBuffer);
  });

  it("should throw if there is a loop in the graph", () => {
    const create = makePipelineFactory(
      {
        nodes: [output, mix, gray],
        edges: [
          edge(mix, output).with("output", "color"),
          edge(gray, mix).with("output", "input_a"),
          edge(mix, gray).with("output", "input"),
        ],
      },
      NODE_TYPES,
    );

    expect(create).toThrow();
  });

  it("should not have loop false positives", () => {
    const create = makePipelineFactory(
      {
        nodes: [output, mix, gray, threshold],
        edges: [
          edge(mix, output).with("output", "color"),
          edge(gray, mix).with("output", "input_a"),
          edge(gray, threshold).with("output", "input"),
          edge(threshold, mix).with("output", "input_b"),
        ],
      },
      NODE_TYPES,
    );

    expect(create).not.toThrow();
  });

  it("should handle a complex dependency chain", () => {
    const pipeline = RenderPipeline.create(
      {
        nodes: [output, mix, gray, threshold],
        edges: [
          edge(mix, output).with("output", "color"),
          edge(gray, mix).with("output", "input_a"),
          edge(gray, threshold).with("output", "input"),
          edge(threshold, mix).with("output", "input_b"),
        ],
      },
      NODE_TYPES,
    );

    expect(pipeline.passes[0].nodeType).toBe("grayscale");
    expect(pipeline.passes[1].nodeType).toBe("threshold");
    expect(pipeline.passes[2].nodeType).toBe("mix");

    expect(pipeline.passes[0].outputBindings.output).toBe(
      pipeline.passes[1].inputBindings.input,
    );
    expect(pipeline.passes[0].outputBindings.output).toBe(
      pipeline.passes[2].inputBindings.input_a,
    );
    expect(pipeline.passes[1].outputBindings.output).toBe(
      pipeline.passes[2].inputBindings.input_b,
    );
  });
});

describe("RenderPipeline.tryCreate", () => {
  it("should return null when called with invalid input", () => {
    const pipeline = RenderPipeline.tryCreate({ nodes: [], edges: [] }, {});

    expect(pipeline).toBeNull();
  });
});
