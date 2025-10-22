const TAU: f32 = 6.283185307179586; // 2π

fn main(
    @builtin(global_invocation_id) id: vec3u,
) {
    output[index] = sin((t + phase) * TAU);
}
