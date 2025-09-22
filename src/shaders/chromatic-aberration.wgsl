@group(0) @binding(0)
var<storage, read> input: array<vec3f>;

@group(0) @binding(1)
var<storage, read> in_angleR: array<f32>;
@group(0) @binding(2)
var<storage, read> in_angleG: array<f32>;
@group(0) @binding(3)
var<storage, read> in_angleB: array<f32>;

@group(0) @binding(4)
var<storage, read> in_magniR: array<f32>;
@group(0) @binding(5)
var<storage, read> in_magniG: array<f32>;
@group(0) @binding(6)
var<storage, read> in_magniB: array<f32>;

@group(0) @binding(7)
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

    var angleR: f32;
    if arrayLength(&in_angleR) <= 4u {
        angleR = PI2 * in_angleR[0];
    } else {
        angleR = PI2 * in_angleR[index];
    }
    var angleG: f32;
    if arrayLength(&in_angleG) <= 4u {
        angleG = PI2 * in_angleG[0];
    } else {
        angleG = PI2 * in_angleG[index];
    }
    var angleB: f32;
    if arrayLength(&in_angleB) <= 4u {
        angleB = PI2 * in_angleB[0];
    } else {
        angleB = PI2 * in_angleB[index];
    }

    var magniR: f32;
    if arrayLength(&in_magniR) <= 4u {
        magniR = 10 * in_magniR[0];
    } else {
        magniR = 10 * in_magniR[index];
    }
    var magniG: f32;
    if arrayLength(&in_magniG) <= 4u {
        magniG = 10 * in_magniG[0];
    } else {
        magniG = 10 * in_magniG[index];
    }
    var magniB: f32;
    if arrayLength(&in_magniB) <= 4u {
        magniB = 10 * in_magniB[0];
    } else {
        magniB = 10 * in_magniB[index];
    }


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

