fn main(
    @builtin(global_invocation_id) id: vec3u,
) {
    output[index] = input_a * (1.0 - factor) + input_b * factor;
}
