fn heatVisionGradient(luma: f32) -> vec3<f32> {
    let clamped = clamp(luma, 0.0, 1.0);

    if (clamped < 0.25) {
        let t = clamped / 0.25;
        return mix(vec3<f32>(0.0, 0.0, 0.3), vec3<f32>(0.3, 0.0, 0.3), t); // Blue to Purple
    } else if (clamped < 0.5) {
        let t = (clamped - 0.25) / 0.25;
        return mix(vec3<f32>(0.3, 0.0, 0.3), vec3<f32>(0.6, 0.0, 0.0), t); // Purple to Red
    } else if (clamped < 0.75) {
        let t = (clamped - 0.5) / 0.25;
        return mix(vec3<f32>(0.6, 0.0, 0.0), vec3<f32>(1.0, 1.0, 0.0), t); // Red to Yellow
    } else {
        let t = (clamped - 0.75) / 0.25;
        return mix(vec3<f32>(1.0, 1.0, 0.0), vec3<f32>(1.0, 1.0, 1.0), t); // Yellow to White
    }
}

fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let luma_vector = vec3<f32>(0.299, 0.587, 0.114);
    let luma = dot(raw_input[index].rgb, luma_vector);

    output[index] = heatVisionGradient(luma);
}