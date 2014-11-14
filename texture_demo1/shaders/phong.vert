/* specular light */
/* hard-coded light and material */

attribute vec3 aPosition; //vertex position
attribute vec3 aNormal;		//normal at the vertex
uniform mat4 uModelViewMatrix; //modelView
uniform mat4 uProjectionMatrix; //combined transformation matrix
uniform mat3 uNormalMatrix; //normal transformation matrix

//material
const vec3 Ka = vec3(0.05, 0.05, 0.05);
const vec3 Kd = vec3(0.0, 1.0, 0.0);
const vec3 Ks = vec3(1.0, 1.0, 1.0);
const float shininess = 20.0;

//lights
const vec3 La = vec3(1,1,1);
const vec3 Ld = vec3(1,1,1);
const vec3 Ls = vec3(1,1,1);

uniform vec3 uLightPos; //light direction
const vec3 eyeDir = vec3(0,0,1); //eye direction

varying vec4 vColor; //output color for fragment

void main() {

	vec3 vertexPos = vec3(uModelViewMatrix*vec4(aPosition,1.0));
	vec3 normal = normalize(uNormalMatrix*aNormal);

	vec3 lightDir = normalize(uLightPos - vertexPos);
	//vec3 lightDir = normalize(vec3(5,5,-5) - vertexPos); //hard-code position
	vec3 reflection = normalize(reflect(-lightDir, normal));

	vec3 ambient = Ka*La;

	vec3 diffuse = Ld*Kd*max(dot(normal, lightDir), 0.0);

	float coefficient = max(dot(reflection, eyeDir), 0.0);
	coefficient = pow(coefficient,shininess);
	vec3 specular = Ks*Ls*coefficient;



	vColor = vec4(clamp(ambient+diffuse+specular, 0.0, 1.0), 1.0);


  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}