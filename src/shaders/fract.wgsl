@group(0) @binding(0)
var<storage, read> input: array<f32>;

@group(0) @binding(1)
var<storage, read_write> out_floor: array<f32>;

@group(0) @binding(2)
var<storage, read_write> out_fract: array<f32>;

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

    var in: f32;
    if arrayLength(&input) <= 4u {
        in = input[0];
    } else {
        in = input[index];
    }

    out_fract[index] = fract(in);
    out_floor[index] = floor(in);
}
