fn main(
    @builtin(global_invocation_id) id: vec3u,
) {
    factor = clamp(factor, 0.0, 1.0);

    switch mode {
        case 0: {
            output[index] = input_a * (1.0 - factor) + input_b * factor;
        }
        case 1: {
            output[index] = input_a * (1.0 - factor) + (input_a * input_b) * factor;
        }
        case 2: {
            output[index] = input_a + input_b * factor;
        }
        default: {}
    }
}
