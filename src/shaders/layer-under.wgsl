@group(0) @binding(0)
var<storage, read_write> output: array<vec3f>;

@group(0) @binding(1)
var<storage, read_write> alpha_out: array<f32>;

@group(0) @binding(2)
var tex: texture_2d<f32>;

@group(0) @binding(3)
var s: sampler;

struct Uniforms {
    width: u32,
    height: u32,
    x: u32,
    y: u32,
    global_width: u32,
    global_height: u32,
};

@group(1) @binding(0)
var<uniform> u: Uniforms;

@compute @workgroup_size(16, 16)
fn main(
    @builtin(global_invocation_id) id: vec3u
) {
    // Avoid accessing the buffer out of bounds
    if id.x >= u.width || id.y >= u.height {
        return;
    }
    let index = id.x + id.y * u.width;

    let tex_coord = vec2f(
        f32(id.x + u.x) / f32(u.global_width),
        f32(id.y + u.y) / f32(u.global_height),
    );

    let color = textureSampleLevel(tex, s, tex_coord, 0.0);

    output[index] = color.rgb;
    alpha_out[index] = color.a;
}
