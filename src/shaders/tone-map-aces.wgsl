
fn tonemap_aces(x: vec3<f32>) -> vec3<f32> {
  // Constants from Krzysztof Narkowicz’s ACES approximation
  let a = 2.51; let b = 0.03;
  let c = 2.43; let d = 0.59;
  let e = 0.14;
  return clamp((x*(a*x + b)) / (x*(c*x + d) + e), vec3(0.0), vec3(1.0));
}

fn linear_to_srgb(v: vec3<f32>) -> vec3<f32> {
  let lo = v * 12.92;
  let hi = 1.055 * pow(v, vec3(1.0/2.4)) - 0.055;
  return mix(lo, hi, step(vec3(0.0031308), v));
}

fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let mapped = tonemap_aces(input);
    output[index] = linear_to_srgb(mapped);
}
