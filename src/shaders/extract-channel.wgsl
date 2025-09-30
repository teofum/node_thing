fn main(
    @builtin(global_invocation_id) id: vec3u,
) {
    red[index] = input.r;
    green[index] = input.g;
    blue[index] = input.b;
}
