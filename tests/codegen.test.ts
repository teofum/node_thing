import { RenderPass } from "@/app/components/renderer/pipeline";
import { generateShaderCode } from "@/app/components/renderer/shader-codegen";
import { mockNodeTypes } from "./node.mock";

const mixRenderPass: RenderPass = {
  nodeType: "mix",
  shader: "main",
  inputBindings: { input_a: 0 },
  outputBindings: {},
  defaultInputValues: {},
  parameters: { test: "42" },
};

describe("Shader code generation", () => {
  it("includes binding code for all inputs", () => {
    const code = generateShaderCode(mixRenderPass, mockNodeTypes, []);

    expect(code).toMatch(
      /@group\(0\) @binding\(0\)\nvar<storage, read> raw_input_a: array<(vec3f|vec3<f32>)>;/,
    );
    expect(code).toMatch(
      /@group\(0\) @binding\(1\)\nvar<storage, read> raw_input_b: array<(vec3f|vec3<f32>)>;/,
    );
    expect(code).toMatch(
      /@group\(0\) @binding\(2\)\nvar<storage, read> raw_factor: array<f32>;/,
    );
  });

  it("uses received buffer type for input bindings", () => {
    const code = generateShaderCode(mixRenderPass, mockNodeTypes, ["number"]);

    expect(code).toMatch(
      /@group\(0\) @binding\(0\)\nvar<storage, read> raw_input_a: array<f32>;/,
    );
  });

  it("includes binding code for all outputs after inputs", () => {
    const code = generateShaderCode(mixRenderPass, mockNodeTypes, []);

    expect(code).toMatch(
      /@group\(0\) @binding\(3\)\nvar<storage, read_write> output: array<(vec3f|vec3<f32>)>;/,
    );
  });

  it("includes uniform struct definition", () => {
    const code = generateShaderCode(mixRenderPass, mockNodeTypes, []);

    expect(code).toMatch(/struct CommonUniforms \{/);
  });

  it("includes uniform binding code", () => {
    const code = generateShaderCode(mixRenderPass, mockNodeTypes, []);

    expect(code).toMatch(
      /@group\(1\) @binding\(0\)\nvar<uniform> u: CommonUniforms;/,
    );
  });

  it("includes local uniform binding code", () => {
    const code = generateShaderCode(mixRenderPass, mockNodeTypes, []);

    expect(code).toMatch(/struct LocalUniforms \{/);
    expect(code).toMatch(/bob: f32,/);
    expect(code).toMatch(/mike: vec3(f|<f32>),/);
    expect(code).toMatch(
      /@group\(1\) @binding\(1\)\nvar<uniform> lu: LocalUniforms;/,
    );
  });

  it("includes compute attributes before main", () => {
    const code = generateShaderCode(mixRenderPass, mockNodeTypes, []);

    expect(code).toMatch(/@compute @workgroup_size\(\d+,\s*\d+\)\nfn main/);
  });

  it("includes a valid main declaration", () => {
    const code = generateShaderCode(mixRenderPass, mockNodeTypes, []);

    expect(code).toMatch(
      /fn main\(.*@builtin\(global_invocation_id\) id: vec3(u|<u32>),?.*\) \{/s,
    );
  });

  it("includes a bounds check", () => {
    const code = generateShaderCode(mixRenderPass, mockNodeTypes, []);

    expect(code).toMatch(
      /if id\.x >= u\.width \|\| id\.y >= u\.height \{.*return;.*}/s,
    );
  });

  it("includes the index variable definition", () => {
    const code = generateShaderCode(mixRenderPass, mockNodeTypes, []);

    expect(code).toMatch(/let index = id\.x \+ id\.y \* u\.width;/);
  });

  it("includes initialization code for all inputs", () => {
    const code = generateShaderCode(mixRenderPass, mockNodeTypes, []);

    expect(code).toMatch(
      /var input_a: vec3(f|<f32>);.*if arrayLength\(&raw_input_a\) <= 1u\s*\{.*input_a = raw_input_a\[0\];.*input_a = pow\(input_a,\s*vec3(f|<f32>)\(2\.2\)\);.*\}.*else.*\{.*input_a = raw_input_a\[index\];.*\}/s,
    );
    expect(code).toMatch(
      /var input_b: vec3(f|<f32>);.*if arrayLength\(&raw_input_b\) <= 1u\s*\{.*input_b = raw_input_b\[0\];.*input_b = pow\(input_b,\s*vec3(f|<f32>)\(2\.2\)\);.*\}.*else.*\{.*input_b = raw_input_b\[index\];.*\}/s,
    );
    expect(code).toMatch(
      /var factor: f32;.*if arrayLength\(&raw_factor\) <= 4u\s*\{.*factor = raw_factor\[0\];.*\}.*else.*\{.*factor = raw_factor\[index\];.*\}/s,
    );
  });

  it("correctly adapts types in initialization code", () => {
    const code = generateShaderCode(mixRenderPass, mockNodeTypes, ["number"]);

    expect(code).toMatch(/input_a = vec3(f|<f32>)\(raw_input_a\[index\]\);/);
  });

  it("includes parameter initialization code", () => {
    const code = generateShaderCode(mixRenderPass, mockNodeTypes, []);

    expect(code).toMatch(/const test: u32 = 42u;/);
  });

  it("includes parameter constants", () => {
    const code = generateShaderCode(mixRenderPass, mockNodeTypes, []);

    expect(code).toMatch(/const test_foo_bar: u32 = 0u;/);
    expect(code).toMatch(/const test_bob: u32 = 1u;/);
  });
});
