@group(0) @binding(0)
var<storage, read> input: array<vec3f>;

@group(0) @binding(1)
var<storage, read> alpha: array<f32>;

@group(0) @binding(2)
var tex: texture_storage_2d<rgba8unorm, write>;

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

@compute @workgroup_size(16, 16)
fn main(
    @builtin(global_invocation_id) id: vec3u
) {
    // Avoid accessing the buffer out of bounds
    if id.x >= u.width || id.y >= u.height {
        return;
    }
    let index = id.x + id.y * u.width;

    let offset = vec2i(vec2u(u.x, u.y));

    let color = input[index];
    if u.has_alpha != 0u {
        textureStore(tex, vec2i(id.xy) + offset, vec4f(color * alpha[index], alpha[index]));
    } else {
        textureStore(tex, vec2i(id.xy) + offset, vec4f(color, 1.0));
    }
}

