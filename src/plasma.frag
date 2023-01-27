precision mediump float;

uniform highp float uTime;
uniform vec2 uRes;
uniform float uAspectRatio;

uniform float uScale;
uniform vec3 uR;
uniform float uFlip;

varying vec2 vUv;

uniform sampler2D uColorTable;
uniform float uPaletteIndex;

void main(void) {
    float scale = uScale;
    float time = uTime * 100.0;
    float flip = uFlip;
    float r1 = uR.x;
    float r2 = uR.y;
    float r3 = uR.z;
    float x = ((flip > 0.0) ? (1.0 - vUv.x) : vUv.x) * uRes.x * uAspectRatio;
    float y = vUv.y * uRes.y;
    float h = uRes.y;
    float w = uRes.x;
    // float col = 
    //   sin(distance( vec2(x * r1 + time, y * r2), vec2(w / r3 , h) ) * scale) +
    //   sin(distance( vec2(x, y * r2), vec2(1.0 / h * r3, w * r1) ) * scale) +
    //   sin(distance( vec2(r3 * x + time, r1 * y + time), vec2(w * r2 + h * r1, h * r2) ) * scale) +
    //   sin(distance( vec2(1.0 / x * r3 , y * r2), vec2(h, w) ) * scale);    
    
    // vec3 color = vec3( 0.5 + 0.5 * sin(col), cos(col), cos(col) - sin(col)) + 0.1;
    // color += mod(vUv.x, 2.0) < 1.0 ? 0.0 : 0.4; 
    float grey = (sin(x / scale / 32.0 + time / 240.0) + 1.0) / 2.0 + (sin(y / scale / 64.0 + sin(time / 120.0) * h / 16.0) + 1.0) / 2.0 + (sin((x - y) * 4.0) + 1.0) / 2.0;
    // float r = sin(x / 128.0 + time / 5.0) + cos(y / 8.0);
    // float g = cos((x + y) / 32.0 - time / 10.0);
    // float b = sin(distance(vec2(w * scale / 64.0, h * scale / 128.0), vec2(x / 32.0 + time, y / 16.0)));
    float index = fract(grey + uTime);
    vec4 indexedColor = texture2D(uColorTable, vec2(index, 0.0));
    gl_FragColor = indexedColor;     
}