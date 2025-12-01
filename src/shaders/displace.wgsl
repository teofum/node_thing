fn wrap_coord(coord: i32, max_value: i32) -> u32 {
    let m = max(max_value, 1);

    switch mode {
        case mode_repeat: {
            let c = ((coord % m) + m) % m;
            return u32(c);
        }
        case mode_mirror: {
            let period = m * 2;
            var t = ((coord % period) + period) % period;
            if t >= m {
                t = period - 1 - t;
            }
            return u32(t);
        }
        case mode_clamp: {
            let c = clamp(coord, 0, m - 1);
            return u32(c);
        }
        default: {
            let c = clamp(coord, 0, m - 1);
            return u32(c);
        }
    }
}

fn sample(coord: vec2f) -> vec3f {
    let int_coord = vec2i(coord);
    let frac_coord = fract(coord);

    let x0 = wrap_coord(int_coord.x, i32(u.width));
    let y0 = wrap_coord(int_coord.y, i32(u.height));
    let x1 = wrap_coord(int_coord.x + 1, i32(u.width));
    let y1 = wrap_coord(int_coord.y + 1, i32(u.height));

    let i00 = raw_input[x0 + y0 * u.width];
    let i01 = raw_input[x0 + y1 * u.width];
    let i10 = raw_input[x1 + y0 * u.width];
    let i11 = raw_input[x1 + y1 * u.width];

    return mix(
        mix(i00, i01, vec3f(frac_coord.y)),
        mix(i10, i11, vec3f(frac_coord.y)),
        vec3f(frac_coord.x),
    );
}

fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let coord = vec2f(f32(id.x) + x, f32(id.y) + y);
    output[index] = sample(coord);
}