@group(0) @binding(0)
var<storage, read> input: array<vec3f>;

@group(0) @binding(1)
var<storage, read> in_ev: array<f32>;

@group(0) @binding(2)
var<storage, read_write> output: array<vec3f>;

struct Uniforms {
    width: u32,
    height: u32,
};

@group(1) @binding(0)
var<uniform> u: Uniforms;

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {

    if id.x >= u.width || id.y >= u.height {
        return;
    }
    let index = id.x + id.y * u.width;

    var ev: f32 = 0.0;
    if arrayLength(&in_ev) <= 4u {
        ev = in_ev[0];
    } else {
        ev = in_ev[index];
    }

    var in: vec3f;
    if arrayLength(&input) == 1u {
        in = input[0];
    } else {
        in = input[index];
    }

    output[index] = in * exp2(ev);
}
