@group(0) @binding(0)
var<storage, read> input: array<vec3f>;

@group(0) @binding(1)
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

    var in: vec3f;
    if arrayLength(&input) == 1u {
        in = input[0];
    } else {
        in = input[index];
    }

    let E = in.x * in.x;
    let F = in.x * in.y;
    let G = in.y * in.y;

    let lambda = (E + G + sqrt((E - G) * (E - G) + 4.0 * F * F)) * 0.5;

    let tangent = vec3f(lambda - E, -F, 0.0);

    output[index] = normalize(tangent);
}
