fn main(
    @builtin(global_invocation_id) id: vec3u,
) {
    factor = clamp(factor, 0.0, 1.0);

    let luma = vec3f(0.2126, 0.7152, 0.0722);
    switch mode {
        case 0: {
            output[index] = mix(input_a, input_b, factor);
        }
        case 1: {
            output[index] = mix(input_a, input_a * input_b, factor);
        }
        case 2: {
            output[index] = mix(input_a, min(input_a, input_b), factor);
        }
        case 3: {
            let luma_a = dot(input_a, luma);
            let luma_b = dot(input_b, luma);
            var darker = input_a;
            if luma_b < luma_a * factor { darker = input_b; }

            output[index] = darker;
        }
        case 4: {
            output[index] = input_a + input_b * factor;
        }
        case 5: {
            output[index] = mix(input_a, max(input_a, input_b), factor);
        }
        case 6: {
            let luma_a = dot(input_a, luma);
            let luma_b = dot(input_b, luma);
            var lighter = input_a;
            if luma_b * factor > luma_a { lighter = input_b; }

            output[index] = lighter;
        }
        case 7: {
            output[index] = mix(input_a, 1.0 - (1.0 - input_a) * (1.0 - input_b), factor);
        }
        case 8: {
            let luma_a = dot(input_a, luma);
            let multiply = mix(input_a, input_a * input_b, factor);
            let screen = mix(input_a, 1.0 - (1.0 - input_a) * (1.0 - input_b), factor);
            output[index] = mix(multiply, screen, luma_a);
        }
        case 9: {
            output[index] = mix(input_a, abs(input_a - input_b), factor);
        }
        case 10: {
            output[index] = mix(input_a, input_a - input_b, factor);
        }
        case 11: {
            let tau = 1.0 / max(0.01, factor);
            output[index] = abs(input_a * (1.0 + tau) - input_b * tau);
        }
        default: {}
    }
}
