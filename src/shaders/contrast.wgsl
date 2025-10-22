fn main(
    @builtin(global_invocation_id) id: vec3u,
) {
    if mode == mode_gamma && contrast > 1.0 {
        input = saturate(input);
        let low = 0.5 * pow(2.0 * input, vec3f(contrast));
        let high = 1.0 - 0.5 * pow(2.0 - 2.0 * input, vec3f(contrast));
        let t = step(vec3f(0.5), input);
        output[index] = mix(low, high, t);
    } else {
        output[index] = mix(vec3f(0.5), input, contrast);
    }
}
