@group(0) @binding(0)
var<storage, read_write> out_u: array<f32>;

@group(0) @binding(1)
var<storage, read_write> out_v: array<f32>;

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

    out_u[index] = f32(id.x) / f32(u.width);
    out_v[index] = f32(id.y) / f32(u.height);
}

