precision mediump float;

uniform highp float uTime;
uniform vec2 uRes;
uniform float uAspectRatio;

uniform float uScale;
uniform vec3 uR;
uniform float uFlip;

varying vec2 vUv;

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

    float r = sin(x / 8.0 + time);
    float g = cos(x + y / 8.0 - time);
    float b = sin(time + distance(vec2(w/2.0,h/2.0), vec2(x,y)));
    gl_FragColor = vec4(r, g, b, 1.0);
}