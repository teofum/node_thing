@group(0) @binding(0)
var<storage, read> input: array<vec3f>;

@group(0) @binding(1)
var<storage, read_write> output: array<vec3f>;

struct Uniforms {
    width: u32,
    height: u32,
};

@group(1) @binding(0)
var<uniform> u: Uniforms;

const threshhold: f32 = 0.5;

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
    if id.x >= u.width || id.y >= u.height {
        return;
    }
    let index = id.x + id.y * u.width;

    let val: f32 = (dot(input[index].xyz, vec3<f32>(1.0, 1.0, 1.0)) / 3.0);

    if val > threshhold {
        output[index] = vec3f(1.0);
    } else {
        output[index] = vec3f(0.0);
    }
}

