@group(0) @binding(0)
var<storage, read_write> output: array<vec4f>;

@compute @workgroup_size(16, 16)
fn main(
    @builtin(global_invocation_id) id: vec3u,
) {
    // Avoid accessing the buffer out of bounds
    if id.x >= 300u || id.y >= 200u {
        return;
    }

    output[id.x + id.y * 300u] = vec4f(
        f32(id.x) / 300.0,
        f32(id.y) / 200.0,
        0.0, 1.0
    );
}

