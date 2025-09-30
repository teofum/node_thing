fn main(@builtin(global_invocation_id) id: vec3u) {
    let luma = vec3f(0.2126, 0.7152, 0.0722);
    let val = dot(input, luma);

    if val >= threshold {
        output[index] = vec3f(1.0);
    } else {
        output[index] = vec3f(1.0 + tanh((256.0 - phi * 255.0) * (val - threshold)));
    }
}
