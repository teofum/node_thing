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
fn main(
    @builtin(global_invocation_id) id: vec3u,
) {
    // Avoid accessing the buffer out of bounds
    if id.x >= u.width || id.y >= u.height {
        return;
    }
    let index = id.x + id.y * u.width;

    var in: vec3f;
    if arrayLength(&input) == 1u {
        in = input[0];
        in = pow(in, vec3f(2.2));
    } else {
        in = input[index];
    }

    let luma = vec3f(0.2126, 0.7152, 0.0722);
    let val = dot(in, luma);

    output[index] = vec3f(val);
}

