import { NodeType } from "@/schemas/node.schema";
import { RenderPass } from "./pipeline";

export function generateShaderCode(
  pass: RenderPass,
  nodeTypes: Record<string, NodeType>,
) {
  const passIdx = getPassIndex(pass);
  const type = nodeTypes[pass.nodeType];
  const inputs = getInputsForPass(passIdx, type);
  const outputs = getOutputsForPass(passIdx, type);

  const bindingCode = generateBindingCode(inputs, outputs);
  const computeAttributes = `@compute @workgroup_size(16, 16)`;
  const initializationCode = generateInitializationCode(inputs);

  const shaderCode =
    passIdx === 0 ? type.shader : type.additionalPasses![passIdx - 1].shader;

  const shaderMainPosition = shaderCode.indexOf("fn main");
  const shaderMainBodyPosition = shaderCode.indexOf("{", shaderMainPosition);
  const shaderMainFirstLinePosition =
    shaderCode.indexOf("\n", shaderMainBodyPosition) + 1;

  const codeBeforeMain = shaderCode.substring(0, shaderMainPosition);
  const codeMainPrototype = shaderCode.substring(
    shaderMainPosition,
    shaderMainFirstLinePosition,
  );
  const codeMainBody = shaderCode.substring(shaderMainFirstLinePosition);

  const code = [
    bindingCode,
    codeBeforeMain,
    computeAttributes,
    codeMainPrototype,
    initializationCode,
    codeMainBody,
  ].join("\n");

  return code;
}

function generateInitializationCode(
  inputs: { name: string; type: "number" | "color" }[],
) {
  const indexCode = `
    if id.x >= u.width || id.y >= u.height {
        return;
    }
    let index = id.x + id.y * u.width;
    `;

  const inputMappings = inputs.map(
    ({ name, type }) => `
    var ${name}: ${getWgslType(type)};
    if arrayLength(&raw_${name}) <= ${type === "color" ? 1 : 4}u {
        ${name} = raw_${name}[0];
        ${type === "color" ? `${name} = pow(${name}, vec3f(2.2));` : ""}
    } else {
        ${name} = raw_${name}[index];
    }
    `,
  );

  const initializationCode = [indexCode, ...inputMappings].join("");
  return initializationCode;
}

function generateBindingCode(
  inputs: { name: string; type: "number" | "color" }[],
  outputs: { name: string; type: "number" | "color" }[],
) {
  const inputBindings = inputs.map(
    ({ name, type }, i) => `
@group(0) @binding(${i})
var<storage, read> raw_${name}: array<${getWgslType(type)}>;
`,
  );
  const outputBindings = outputs.map(
    ({ name, type }, i) => `
@group(0) @binding(${i + inputBindings.length})
var<storage, read_write> ${name}: array<${getWgslType(type)}>;
`,
  );

  const uniformsCode = `
struct Uniforms {
  width: u32,
  height: u32,
  x: u32,
  y: u32,
  global_width: u32,
  global_height: u32,
  has_alpha: u32,
};

@group(1) @binding(0)
var<uniform> u: Uniforms;
`;

  const bindingCode = [...inputBindings, ...outputBindings, uniformsCode].join(
    "",
  );
  return bindingCode;
}

function getWgslType(type: string) {
  return type === "color" ? "vec3f" : "f32";
}

function getOutputsForPass(passIdx: number, type: NodeType) {
  return passIdx === (type.additionalPasses?.length ?? 0)
    ? Object.entries(type.outputs).map(([name, output]) => ({
        name,
        type: output.type,
      }))
    : (type.additionalPasses?.[passIdx].buffers ?? []);
}

function getInputsForPass(passIdx: number, type: NodeType) {
  return passIdx === 0
    ? Object.entries(type.inputs).map(([name, input]) => ({
        name,
        type: input.type,
      }))
    : (type.additionalPasses?.[passIdx - 1].buffers ?? []);
}

function getPassIndex(pass: RenderPass) {
  return pass.shader === "main" ? 0 : Number(pass.shader.substring(5)) + 1;
}
