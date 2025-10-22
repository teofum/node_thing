fn main(
    @builtin(global_invocation_id) id: vec3u,
) {
    output[index] = f32(u.time) / 1000.0;
}
