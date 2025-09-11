@group(0) @binding(0)
var<storage, read> input_a: array<vec3f>;

@group(0) @binding(1)
var<storage, read> input_b: array<vec3f>;

@group(0) @binding(2)
var<storage, read> factor: array<f32>;

@group(0) @binding(3)
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

    var in_a: vec3f;
    if arrayLength(&input_a) == 1u {
        in_a = input_a[0];
    } else {
        in_a = input_a[index];
    }

    var in_b: vec3f;
    if arrayLength(&input_b) == 1u {
        in_b = input_b[0];
    } else {
        in_b = input_b[index];
    }

    var fac: f32;
    if arrayLength(&factor) <= 4u {
        fac = factor[0];
    } else {
        fac = factor[index];
    }

    output[index] = in_a * (1.0 - fac) + in_b * fac;
}

