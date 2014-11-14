/* ambient light */
/* hard-coded light and material */

attribute vec3 aPosition; //vertex position
attribute vec3 aNormal;		//normal at the vertex
uniform mat4 uModelViewMatrix; //modelView
uniform mat4 uProjectionMatrix; //combined transformation matrix
uniform mat3 uNormalMatrix; //normal transformation matrix

//material
const vec3 Ka = vec3(0.2,0.2,0.2);

//lights
const vec3 La = vec3(1,1,1);

uniform vec3 uLightPos; //light direction

varying vec4 vColor; //output color for fragment

void main() {

	vec3 ambient = Ka*La;

	vColor = vec4(ambient, 1.0);

  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}
