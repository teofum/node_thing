const luma = vec3f(0.2126, 0.7152, 0.0722);

fn rgb2hcl(rgb: vec3f) -> vec3f {
    let r = rgb.r; let g = rgb.g; let b = rgb.b;
    let cmin = min(r, min(g, b));
    let cmax = max(r, max(g, b));
    let c = cmax - cmin;

    var h = 0.0;
    if c == 0.0 {
        h = 0.0;
    } else if cmax == r {
        h = ((g - b) / c) % 6.0;
    } else if cmax == g {
        h = (b - r) / c + 2.0;
    } else {
        h = (r - g) / c + 4.0;
    }

    h *= 60.0;
    let l = dot(rgb, luma);

    return vec3f(h, c, l);
}

fn hcl2rgb(hcl: vec3f) -> vec3f {
    let h = hcl.x / 60.0;
    let c = hcl.y;
    let x = c * (1.0 - abs(h % 2.0- 1.0));

    var rgb = vec3f(0.0);
    if h < 1.0 {
        rgb = vec3f(c, x, 0.0);
    } else if h < 2.0 {
        rgb = vec3f(x, c, 0.0);
    } else if h < 3.0 {
        rgb = vec3f(0.0, c, x);
    } else if h < 4.0 {
        rgb = vec3f(0.0, x, c);
    } else if h < 5.0 {
        rgb = vec3f(x, 0.0, c);
    } else {
        rgb = vec3f(c, 0.0, x);
    }

    let m = hcl.z - dot(rgb, luma);
    rgb += m;

    return rgb;
}

fn main(
    @builtin(global_invocation_id) id: vec3u,
) {
    var hcl = rgb2hcl(input);
    hcl.x = (hcl.x + angle) % 360.0;
    hcl.z = hcl.z + luminance;
    input = hcl2rgb(hcl);

    let luma = dot(input, luma);
    input = mix(vec3f(luma), input, saturation);

    output[index] = input;
}
