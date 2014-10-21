color += lighting * vec3(gl_FragCoord.x / u_resolution.x, 0.0, gl_FragCoord.y / u_resolution.y);
#if defined(EFFECT_COLOR_BLEED_ANIMATED)
    color.r += lighting.r * sin(u_time / 1.0);
#endif
