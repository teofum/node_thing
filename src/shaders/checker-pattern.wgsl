
const CHECKER_GRAYSCALE: array<f32, 4> = array<f32, 4>( 
    0.25, 0.75, 
    0.75, 0.25
);

fn main( @builtin(global_invocation_id) id: vec3u,) {
    output[index] = CHECKER_GRAYSCALE[(id.x % 2) + ((id.y % 2) * 2)];
}

