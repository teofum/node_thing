
fn tonemap_uncharted2(x: vec3<f32>) -> vec3<f32> {
  // Parameters from John Hable’s “Uncharted 2” curve
  let A = 0.15;
  let B = 0.50;
  let C = 0.10;
  let D = 0.20;
  let E = 0.02;
  let F = 0.30;

  // Apply curve
  let num  = (x*(A*x + C*B) + D*E);
  let den  = (x*(A*x + B)   + D*F);
  var y = num / den - E / F;

  // White scale: normalize so chosen white maps to 1.0
  let W = vec3(11.2);  // typical white point used with this curve
  let white_num = (W*(A*W + C*B) + D*E);
  let white_den = (W*(A*W + B)   + D*F);
  let white = white_num / white_den - E / F;

  y /= white;
  return clamp(y, vec3(0.0), vec3(1.0));
}

fn linear_to_srgb(v: vec3<f32>) -> vec3<f32> {
  let lo = v * 12.92;
  let hi = 1.055 * pow(v, vec3(1.0/2.4)) - 0.055;
  return mix(lo, hi, step(vec3(0.0031308), v));
}

fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let mapped = tonemap_uncharted2(input);
    output[index] = linear_to_srgb(mapped);
}
