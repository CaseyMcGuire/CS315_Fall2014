precision mediump float; //don't need high precision

//material
// const vec3 Ka = vec3(0.1, 0.1, 0.1);
// const vec3 Kd = vec3(0.0, 1.0, 0.0);
// const vec3 Ks = vec3(1.0, 1.0, 1.0);
// const float shininess = 20.0;

// //lights
// const vec3 La = vec3(1,1,1);
// const vec3 Ld = vec3(1,1,1);
// const vec3 Ls = vec3(1,1,1);

uniform vec3 uLightPos; //light direction
// const vec3 eyeDir = vec3(0,0,1); //eye direction

varying vec3 vNormal;	//input normal for fragment
varying vec3 vPosition; //input modelview position for fragment
varying vec2 vTexCoord;	//input texture coordinate for the fragment

uniform sampler2D uTexture; //the texture buffer (data)

void main() {

	//can also add in further lighting here, to "blend"

	gl_FragColor = texture2D(uTexture, vTexCoord);

}
