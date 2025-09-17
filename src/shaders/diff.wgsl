@group(0) @binding(0)
var<storage, read> input_a: array<vec3f>;

@group(0) @binding(1)
var<storage, read> input_b: array<vec3f>;

@group(0) @binding(2)
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

    var diff = abs(input_a[index] - input_b[index]);
    
    let or = clamp(diff.x, 0.0, 1.0);
    let og = clamp(diff.y, 0.0, 1.0);
    let ob = clamp(diff.z, 0.0, 1.0);
    output[index] = vec3f(or ,og ,ob );
}

