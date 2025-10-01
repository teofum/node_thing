
fn tonemap_reinhard(x: vec3<f32>) -> vec3<f32> {
  return x / (1.0 + x);
}

fn tonemap_reinhard_white(x: vec3<f32>, white: f32) -> vec3<f32> {
  let w2 = white * white;
  return (x * (1.0 + x / w2)) / (1.0 + x);
}

fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    //let mapped = tonemap_reinhard(input);
    output[index] = tonemap_reinhard_white(input, white);  
}
