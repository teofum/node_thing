import { RenderPipeline } from "@/app/components/renderer/pipeline";

describe("Pipeline Builder", () => {
  it("should return null when called with empty arguments", () => {
    const pipeline = RenderPipeline.create({ nodes: [], edges: [] }, {});

    expect(pipeline).toBeNull();
  });
});
