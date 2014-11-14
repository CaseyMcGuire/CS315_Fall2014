precision mediump float; //don't need high precision

varying vec4 vColor;

void main() {
    gl_FragColor = vColor; //pass-through fragment color
}
