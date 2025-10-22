fn liftGammaGain(color: vec3<f32>, lift: f32, gamma: f32, gain: f32) -> vec3<f32> {
    let curved = pow(color, vec3f(1.0) / gamma);
    let gained = curved * gain;
    let lifted = gained + lift;                    
    return lifted;
}

fn main( @builtin(global_invocation_id) id: vec3u,) {
    output[index] = liftGammaGain(input,lift, gamma, gain);
}