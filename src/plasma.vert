varying vec2 vUv;
uniform highp float uTime;

void main() {
    float theta = sin( uTime + position.y * 2.0 ) / 10.0;
    float c = cos( theta );
    float s = sin( theta );
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * theta, 1.0);
}