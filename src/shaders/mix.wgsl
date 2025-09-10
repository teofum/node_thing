@group(0) @binding(0)
var<storage, read_write> input_a: array<vec3f>;

@group(0) @binding(1)
var<storage, read_write> input_b: array<vec3f>;

@group(0) @binding(2)
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

    output[index] = (input_a[index] + input_b[index]) * 0.5;
}

