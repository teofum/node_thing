@group(0) @binding(0)
var<storage, read> input: array<vec3f>;

@group(0) @binding(1)
var<storage, read> in_steps: array<f32>;

@group(0) @binding(2)
var<storage, read_write> output: array<vec3f>;

struct Uniforms {
    width: u32,
    height: u32,
};
@group(1) @binding(0)
var<uniform> u: Uniforms;

@compute @workgroup_size(16, 16) 
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    if id.x >= u.width || id.y >= u.height {
        return;
    }
    let index = id.x + id.y * u.width;

    var steps: f32;
    if arrayLength(&in_steps) <= 4u {
        steps = in_steps[0];
    } else {
        steps = in_steps[index];
    }
    steps = floor(steps);

    var in: vec3f;
    if arrayLength(&input) == 1u {
        in = input[0];
        in = pow(in, vec3f(2.2));
    } else {
        in = input[index];
    }

    let luminance = 0.2126 * in.r + 0.7152 * in.g + 0.0722 * in.b;

    let r = floor(in.r * steps) / (steps - 1.0);
    let g = floor(in.g * steps) / (steps - 1.0);
    let b = floor(in.b * steps) / (steps - 1.0);

    output[index] = vec3<f32>(r, g, b);
    return;
}
