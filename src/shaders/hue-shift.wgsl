const TAU: f32 = 6.283185307179586; // 2π

fn main(
    @builtin(global_invocation_id) id: vec3u,
) {
    angle = angle / 360 * TAU;
    let c = cos(angle);
    let s = sin(angle);
    const axis = vec3f(1.0 / sqrt(3.0));
    let temp = axis * (1.0 - c);
    let transform = mat4x4f(
        c + temp.x * axis.x,
        temp.y * axis.x - s * axis.z,
        temp.z * axis.x + s * axis.y,
        0.0,
        temp.x * axis.y + s * axis.z,
        c + temp.y * axis.y,
        temp.z * axis.y - s * axis.x,
        0.0,
        temp.x * axis.z - s * axis.y,
        temp.y * axis.z + s * axis.x,
        c + temp.z * axis.z,
        0.0,
        0.0,
        0.0,
        0.0,
        1.0,
    );

    output[index] = (vec4f(input, 1.0) * transform).rgb;
}
