precision mediump float; //don't need high precision

//material
const vec3 Ka = vec3(0.5, 0.5, 0.5);
const vec3 Kd = vec3(0.0, 1.0, 0.0);
const vec3 Ks = vec3(1.0, 1.0, 1.0);
const float shininess = 20.0;
// const vec3 Ka = vec3(0.33, 0.22, 0.03);
// const vec3 Kd = vec3(0.78, 0.57, 0.11);
// const vec3 Ks = vec3(0.99, 0.91, 0.81);
// const float shininess = 27.8;


//lights
const vec3 La = vec3(1,1,1);
const vec3 Ld = vec3(1,1,1);
const vec3 Ls = vec3(1,1,1);


uniform vec3 uLightPos; //light direction
const vec3 eyeDir = vec3(0,0,1); //eye direction

varying vec3 vNormal;	//output normal for fragment
varying vec3 vPosition; //output modelview position for fragment


void main() {

	vec3 lightDir = normalize(uLightPos - vPosition);
	//vec3 lightDir = normalize(vec3(5,5,-5) - vertexPos); //hard-code position
	vec3 reflection = normalize(reflect(-lightDir, vNormal));

	vec3 ambient = Ka*La;

	vec3 diffuse = Ld*Kd*max(dot(vNormal, lightDir), 0.0);

	float coefficient = max(dot(reflection, eyeDir), 0.0);
	coefficient = pow(coefficient,shininess);
	vec3 specular = Ks*Ls*coefficient;



	gl_FragColor = vec4(clamp(ambient+diffuse+specular, 0.0, 1.0), 1.0);
}
