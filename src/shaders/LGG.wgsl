fn liftGammaGain(color: vec3<f32>, lift: f32, gamma: f32, gain: f32) -> vec3<f32> {
    let lifted = color + lift;                   
    let gained = lifted * gain;                    
    let curved = pow(gained, vec3<f32>(1.0) / gamma);
    return clamp(curved, vec3<f32>(0.0), vec3<f32>(1.0));
}

fn main( @builtin(global_invocation_id) id: vec3u,) {
    output[index] = liftGammaGain(input,lift, gamma, gain);
}