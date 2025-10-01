
fn tonemap_reinhard(x: vec3<f32>) -> vec3<f32> {
  return x / (1.0 + x);
}

fn tonemap_reinhard_white(x: vec3<f32>, white: f32) -> vec3<f32> {
  let w2 = white * white;
  return (x * (1.0 + x / w2)) / (1.0 + x);
}

fn linear_to_srgb(v: vec3<f32>) -> vec3<f32> {
  let lo = v * 12.92;
  let hi = 1.055 * pow(v, vec3(1.0/2.4)) - 0.055;
  return mix(lo, hi, step(vec3(0.0031308), v));
}

fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    //let mapped = tonemap_reinhard(input);
    let mapped = tonemap_reinhard_white(input, white);  
    output[index] = linear_to_srgb(mapped);
}
