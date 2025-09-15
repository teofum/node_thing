@group(0) @binding(0)
var<storage, read_write> output: array<vec3f>;

@group(0) @binding(1)
var<storage, read_write> alpha_out: array<f32>;

@group(0) @binding(2)
var tex: texture_2d<f32>;

struct Uniforms {
    width: u32,
    height: u32,
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

    let tex_coord = vec2<f32>(
        f32(id.x) / f32(u.width),
        f32(id.y) / f32(u.height),
    );
    let dim = textureDimensions(tex);
    let load_coord = vec2<u32>(tex_coord * vec2<f32>(dim));

    let color = textureLoad(tex, load_coord, 0);

    output[index] = color.rgb;
    alpha_out[index] = color.a;
}
