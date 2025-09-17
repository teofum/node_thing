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

const factor: f32 = 10.0;

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {

    if id.x >= u.width || id.y >= u.height {
        return;
    }
    let index = id.x + id.y * u.width;

    let or = clamp(input[index].x * factor, 0.0, 1.0);
    let og = clamp(input[index].y * factor, 0.0, 1.0);
    let ob = clamp(input[index].z * factor, 0.0, 1.0);

    output[index] = vec3<f32>( or, og, ob);
}
