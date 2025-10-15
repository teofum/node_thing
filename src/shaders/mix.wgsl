fn main(
    @builtin(global_invocation_id) id: vec3u,
) {
    factor = clamp(factor, 0.0, 1.0);

    let luma = vec3f(0.2126, 0.7152, 0.0722);
    switch mode {
        case mode_normal: {
            output[index] = mix(input_a, input_b, factor);
        }
        case mode_multiply: {
            output[index] = mix(input_a, input_a * input_b, factor);
        }
        case mode_color_burn: {
            output[index] = mix(input_a, 1.0 - (1.0 - input_a) / input_b, factor);
        }
        case mode_linear_burn: {
            output[index] = mix(input_a, input_a + input_b - 1, factor);
        }
        case mode_darken: {
            output[index] = mix(input_a, min(input_a, input_b), factor);
        }
        case mode_darker_color: {
            let luma_a = dot(input_a, luma);
            let luma_b = dot(input_b, luma);
            var darker = input_a;
            if luma_b < luma_a * factor { darker = input_b; }

            output[index] = darker;
        }
        case mode_add: {
            output[index] = input_a + input_b * factor;
        }
        case mode_screen: {
            output[index] = mix(input_a, 1.0 - (1.0 - input_a) * (1.0 - input_b), factor);
        }
        case mode_color_dodge: {
            output[index] = mix(input_a, input_a / (1.0 - input_b), factor);
        }
        case mode_lighten: {
            output[index] = mix(input_a, max(input_a, input_b), factor);
        }
        case mode_lighter_color: {
            let luma_a = dot(input_a, luma);
            let luma_b = dot(input_b, luma);
            var lighter = input_a;
            if luma_b * factor > luma_a { lighter = input_b; }

            output[index] = lighter;
        }
        case mode_tint: {
            let luma_a = dot(input_a, luma);
            let multiply = mix(input_a, input_a * input_b, factor);
            let screen = mix(input_a, 1.0 - (1.0 - input_a) * (1.0 - input_b), factor);
            output[index] = mix(multiply, screen, luma_a);
        }
        case mode_overlay: {
            let luma_a = dot(input_a, luma);
            if luma_a > 0.5 {
                output[index] = mix(input_a, 1.0 - (1.0 - 2.0 * saturate(input_a - 0.5)) * (1.0 - input_b), factor);
            } else {
                output[index] = mix(input_a, 2.0 * input_a * input_b, factor);
            }
        }
        case mode_difference: {
            output[index] = mix(input_a, abs(input_a - input_b), factor);
        }
        case mode_exclusion: {
            output[index] = mix(input_a, 0.5 - 2.0 * (input_a - 0.5) * (input_b - 0.5), factor);
        }
        case mode_subtract: {
            output[index] = mix(input_a, input_a - input_b, factor);
        }
        case mode_contrast: {
            let tau = 1.0 / max(0.01, factor);
            output[index] = abs(input_a * (1.0 + tau) - input_b * tau);
        }
        default: {}
    }
}
