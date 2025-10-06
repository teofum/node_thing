fn heatVisionGradient(luma: f32) -> vec3<f32> {
    let clamped = clamp(luma, 0.0, 1.0);

    if (clamped < 0.15) {
        let t = clamped / 0.15;
        return mix(vec3<f32>(0.0, 0.0, 0.2), vec3<f32>(0.2, 0.0, 0.4), t); // Blue to Purple
    } else if (clamped < 0.35) {
        let t = (clamped - 0.15) / (0.35 - 0.15);
        return mix(vec3<f32>(0.2, 0.0, 0.4), vec3<f32>(0.6, 0.0, 0.0), t); // Purple to Red
    } else if (clamped < 0.55) {
        let t = (clamped - 0.35) / (0.55 - 0.35);
        return mix(vec3<f32>(0.6, 0.0, 0.0), vec3<f32>(1.0, 0.5, 0.0), t); // Red to Orange
    } else if (clamped < 0.75) {
        let t = (clamped - 0.55) / (0.75 - 0.55);
        return mix(vec3<f32>(1.0, 0.5, 0.0), vec3<f32>(1.0, 1.0, 0.0), t); // Orange to Yellow
    } else {
        let t = (clamped - 0.75) / (1.0 - 0.75);
        return mix(vec3<f32>(1.0, 1.0, 0.0), vec3<f32>(1.0, 1.0, 1.0), t); // Yellow to White
    }
}


fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let luma_vector = vec3<f32>(0.299, 0.587, 0.114);
    let luma = dot(input.rgb, luma_vector);

    output[index] = heatVisionGradient(luma);
}