fn main(
    @builtin(global_invocation_id) id: vec3u,
) {
    output[index] = abs((1.0 + tau) * input_a - tau * input_b);
}
