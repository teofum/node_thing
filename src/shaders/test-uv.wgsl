@group(0) @binding(0)
var<storage, read_write> output: array<vec4f>;

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

    output[index] = vec4f(
        fract(f32(id.x) / 100.0),
        fract(f32(id.y) / 100.0),
        0.0, 1.0
    );
}

