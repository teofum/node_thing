fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let E = gradient.x * gradient.x;
    let F = gradient.x * gradient.y;
    let G = gradient.y * gradient.y;

    let lambda = (E + G + sqrt((E - G) * (E - G) + 4.0 * F * F)) * 0.5;

    let tangent = vec3f(lambda - E, -F, 0.0);

    output[index] = normalize(tangent);
}
