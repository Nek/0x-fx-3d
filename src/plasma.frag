precision mediump float;

uniform highp float uTime;
uniform highp float uDeltaTime;
uniform vec2 uRes;
uniform float uAspectRatio;

uniform float uScale;
uniform vec3 uR;
uniform float uFlip;

varying vec2 vUv;

uniform sampler2D uColorTable;

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
    float grey = 
      sin(distance( vec2(x * r1 + time, y * r2), vec2(w / r3 , h) ) * scale) +
      sin(distance( vec2(x, y * r2), vec2(1.0 / h * r3, w * r1) ) * scale) +
      sin(distance( vec2(r3 * x + time, r1 * y + time), vec2(w * r2 + h * r1, h * r2) ) * scale) +
      sin(distance( vec2(1.0 / x * r3 , y * r2), vec2(h, w) ) * scale);
    
    // vec3 color = vec3( 0.5 + 0.5 * sin(col), cos(col), cos(col) - sin(col)) + 0.1;
    // color += mod(vUv.x, 2.0) < 1.0 ? 0.0 : 0.4; 
    // uTime = uTime
    float index = grey / 4.0 + (sin(uTime / 2.0) + 1.0) / 2.0;
    // index = index == 1.0 ? 1.0/256.0 : index;
    vec4 indexedColor = texture2D(uColorTable, vec2(index, 0.0));
    gl_FragColor = indexedColor;     
}