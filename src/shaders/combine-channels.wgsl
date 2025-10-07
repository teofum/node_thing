fn main(
    @builtin(global_invocation_id) id: vec3u,
) {
    output[index] = vec3f(red, green, blue);
}
