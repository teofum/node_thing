@group(0) @binding(0)
var<storage, read> input: array<vec3f>;

@group(0) @binding(1)
var<storage, read_write> output: array<vec3f>;

struct Uniforms {
    width: u32,
    height: u32,
};
@group(1) @binding(0)
var<uniform> u: Uniforms;

const PI2: f32 = 6.283185307179586; // 2π

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3u) {
    if id.x >= u.width || id.y >= u.height {
        return;
    }
    let index = id.x + id.y * u.width;

    var angleR: f32 = PI2 * 0.875;
    var angleG: f32 = PI2 * 0.125;
    var angleB: f32 = PI2 * 0.5;

    var magniR: f32 = 2.0;
    var magniG: f32 = 2.0;
    var magniB: f32 = 2.0;

    var xR: u32 = u32(clamp( floor(f32(id.x) + sin(angleR)*magniR), 0, f32(u.width - 1) ));
    var yR: u32 = u32(clamp( floor(f32(id.y) + cos(angleR)*magniR), 0, f32(u.height - 1) ));
    let indexR: u32 =  xR + (yR * u.width);

    var xG: u32 = u32(clamp( floor(f32(id.x) + sin(angleG)*magniG), 0, f32(u.width - 1) ));
    var yG: u32 = u32(clamp( floor(f32(id.y) + cos(angleG)*magniG), 0, f32(u.height - 1) ));
    let indexG: u32 =  xG + (yG * u.width);

    var xB: u32 = u32(clamp( floor(f32(id.x) + sin(angleB)*magniB), 0, f32(u.width - 1) ));
    var yB: u32 = u32(clamp( floor(f32(id.y) + cos(angleB)*magniB), 0, f32(u.height - 1) ));
    let indexB: u32 =  xB + (yB * u.width);

    output[index] = vec3<f32>(input[indexR].r,input[indexG].g,input[indexB].b);
}

