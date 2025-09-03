@group(0) @binding(0)
var<storage, read_write> input: array<vec4f>;

@group(0) @binding(1)
var<storage, read_write> output: array<vec4f>;

@compute @workgroup_size(16, 16)
fn main(
    @builtin(global_invocation_id) id: vec3u,
) {
    // Avoid accessing the buffer out of bounds
    if id.x >= 300u || id.y >= 200u {
        return;
    }

    let luma = vec3f(0.2126, 0.7152, 0.0722);
    let in = input[id.x + id.y * 300u].xyz;
    let val = dot(in, luma);

    output[id.x + id.y * 300u] = vec4f(val, val, val, 1.0);
}

