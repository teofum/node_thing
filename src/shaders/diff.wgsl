fn main(
    @builtin(global_invocation_id) id: vec3u,
) {
    output[index] = abs(input_a - input_b);
}
