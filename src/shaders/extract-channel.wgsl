@group(0) @binding(0)
var<storage, read> input: array<vec3f>;

@group(0) @binding(1)
var<storage, read_write> red: array<f32>;

@group(0) @binding(2)
var<storage, read_write> green: array<f32>;

@group(0) @binding(3)
var<storage, read_write> blue: array<f32>;

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

    red[index] = in.r;
    green[index] = in.g;
    blue[index] = in.b;
}
