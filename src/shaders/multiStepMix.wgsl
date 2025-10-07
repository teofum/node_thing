fn gradient(
 luma: f32,
 color1: vec3f, color2: vec3f, color3: vec3f, color4: vec3f, color5: vec3f
 ) -> vec3<f32> 
{
    let clamped = clamp(luma, 0.0, 1.0);

    if (clamped < 0.25) {
        let t = clamped / 0.25;
        return mix(color1, color2, t);
    } else if (clamped < 0.5) {
        let t = (clamped - 0.25) / 0.25;
        return mix(color2, color3, t); 
    } else if (clamped < 0.75) {
        let t = (clamped - 0.5) / 0.25;
        return mix(color3, color4, t); 
    } else {
        let t = (clamped - 0.75) / 0.25;
        return mix(color4, color5, t);
    }
}

fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let luma_vector = vec3<f32>(0.299, 0.587, 0.114);
    let luma = dot(input.rgb, luma_vector);

    output[index] = gradient(luma,color1, color2, color3, color4, color5);
}