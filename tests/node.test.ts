import { createNode } from "@/utils/node";
import { NODE_TYPES } from "@/utils/node-type";
import { z } from "zod/v4";

describe("createNode", () => {
  const nodePosition = { x: 1, y: 2 };
  const nodeParameters = { test: { value: "test" } };

  const createTestNode = () =>
    createNode("mix", nodePosition, NODE_TYPES, nodeParameters);

  it("should have an appropriate id", () => {
    const node = createTestNode();

    expect(() => z.nanoid().parse(node.id)).not.toThrow();
  });

  it("should have a correctly prefixed id for input and ouptut nodes", () => {
    const inputNode = createNode("__input_image", nodePosition, NODE_TYPES, {});
    const outputNode = createNode("__output", nodePosition, NODE_TYPES, {});

    expect(inputNode.id).toMatch(/^__input_image_/);
    expect(outputNode.id).toMatch(/^__output_/);
  });

  it("should have the correct React Flow node type", () => {
    const node = createTestNode();

    expect(node.type).toBe("RenderShaderNode");
  });

  it("should have the position passed to the factory", () => {
    const node = createTestNode();

    expect(node.position).toEqual(nodePosition);
  });

  it("should have the correct node type", () => {
    const node = createTestNode();

    expect(node.data.type).toBe("mix");
  });

  it("should have values for all parameters", () => {
    const node = createTestNode();

    expect(node.data.parameters.mode.value).toEqual("0");
  });

  it("should have the parameters object passed to the factory", () => {
    const node = createTestNode();

    expect(node.data.parameters.test).toEqual(nodeParameters.test);
  });

  it("uses the type's default values", () => {
    const node = createNode("gaussBlur", nodePosition, NODE_TYPES, {});

    expect(node.data.defaultValues.std_dev).toEqual(
      NODE_TYPES.gaussBlur.inputs.std_dev.default,
    );
  });

  it("uses an appropriate fallback default value", () => {
    const node = createNode("mix", nodePosition, NODE_TYPES, {});
    const node2 = createNode("add", nodePosition, NODE_TYPES, {});

    expect(node.data.defaultValues.factor).toEqual(0.5);
    expect(node2.data.defaultValues.x).toEqual(0);
  });
});
