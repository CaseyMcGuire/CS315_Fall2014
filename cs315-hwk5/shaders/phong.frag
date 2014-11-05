precision mediump float; //don't need high precision

//material
//const vec3 Ka= vec3(0.5, 0.5, 0.5);
uniform vec3 Ka;
const vec3 Kd = vec3(0.0, 1.0, 0.0);
//const vec3 Ks = vec3(1.0, 1.0, 1.0);
uniform vec3 Ks;

const float shininess = 1.0;
// const vec3 Ka = vec3(0.33, 0.22, 0.03);
// const vec3 Kd = vec3(0.78, 0.57, 0.11);
// const vec3 Ks = vec3(0.99, 0.91, 0.81);
// const float shininess = 27.8;


//lights
//const vec3 La = vec3(1,1,1);
uniform vec3 La;
const vec3 Ld = vec3(1,1,1);
//uniform vec3 Ld;
//const vec3 Ls = vec3(1,1,1);
uniform vec3 Ls;

uniform bool uisDaytime;

uniform vec3 uLightPos; //light direction
uniform vec3 uStreetLampLocation;	//the location of the streetlamp's light at night
const vec3 eyeDir = vec3(0,0,1); //eye direction

varying vec3 vNormal;	//output normal for fragment
varying vec3 vPosition; //output modelview position for fragment
varying vec3 vLightWeighting;
varying float directionalLightWeighting;


void main() {

     	vec3 ulightWeighting;
	vec3 lightDir;
	vec3 reflection;
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
	float coefficient;

	if(!uisDaytime){

		lightDir = normalize(uStreetLampLocation - vPosition);

		reflection = normalize(reflect(-lightDir, vNormal));

		//lower ambience at night (change with passed in variable)
		ambient = Ka*La*.01;

		//lower diffusion at night
		diffuse = Ld*Kd*max(dot(vNormal, lightDir), 0.0)*.8;

		coefficient = max(dot(reflection, eyeDir), 0.0);
	
		coefficient = pow(coefficient, shininess);

		specular = Ks*Ls*coefficient*0.1;

		ulightWeighting = clamp(ambient + diffuse + specular, 0.0, 1.0);
		gl_FragColor =   vec4(directionalLightWeighting*.25*ulightWeighting, 1.0);
			
	
	}else{
	
		lightDir = normalize(uLightPos - vPosition);
		reflection = normalize(reflect(-lightDir, vNormal));

		ambient = Ka*La;

		//directionalLightWeighting
		diffuse = Ld*Kd*max(dot(vNormal, lightDir), 0.0);

		coefficient = max(dot(reflection, eyeDir), 0.0);
		coefficient = pow(coefficient,shininess);
		specular = Ks*Ls*coefficient;

		ulightWeighting = clamp(ambient + diffuse + specular, 0.0, 1.0);

		gl_FragColor =   vec4(ulightWeighting, 1.0);

	}




	//gl_FragColor = vec4(clamp(ambient+diffuse+specular, 0.0, 1.0), 1.0);
	//gl_FragColor =   vec4(directionalLightWeighting*.25*ulightWeighting, 1.0);
}
