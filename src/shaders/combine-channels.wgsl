@group(0) @binding(0)
var<storage, read> red: array<f32>;

@group(0) @binding(1)
var<storage, read> green: array<f32>;

@group(0) @binding(2)
var<storage, read> blue: array<f32>;

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

    var r: f32;
    if arrayLength(&red) <= 4u {
        r = red[0];
    } else {
        r = red[index];
    }

    var g: f32;
    if arrayLength(&green) <= 4u {
        g = green[0];
    } else {
        g = green[index];
    }

    var b: f32;
    if arrayLength(&blue) <= 4u {
        b = blue[0];
    } else {
        b = blue[index];
    }

    output[index] = vec3f(r, g, b);
}

