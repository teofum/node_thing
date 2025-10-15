fn main(
    @builtin(global_invocation_id) id: vec3u,
) {
    let luma = vec3f(0.2126, 0.7152, 0.0722);
    let val = dot(input, luma);

    output[index] = mix(vec3f(val), input, saturation);
}
