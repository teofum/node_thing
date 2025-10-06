import { RenderPipeline } from "@/app/components/renderer/pipeline";
import { NODE_TYPES } from "@/utils/node-type";

describe("Pipeline Builder", () => {
  it("should return null when called with empty arguments", () => {
    const pipeline = RenderPipeline.create({ nodes: [], edges: [] }, {});

    expect(pipeline).toBeNull();
  });

  it("should return null when called without nodes", () => {
    const pipeline = RenderPipeline.create(
      { nodes: [], edges: [] },
      NODE_TYPES,
    );

    expect(pipeline).toBeNull();
  });
});
