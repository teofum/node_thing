fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let r = floor(input.r * steps) / (steps - 1.0);
    let g = floor(input.g * steps) / (steps - 1.0);
    let b = floor(input.b * steps) / (steps - 1.0);

    output[index] = vec3f(r, g, b);
    return;
}
