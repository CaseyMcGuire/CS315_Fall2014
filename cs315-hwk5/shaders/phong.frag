precision mediump float; //don't need high precision

//material
uniform vec3 Ka;
const vec3 Kd = vec3(0.0, 1.0, 0.0);
uniform vec3 Ks;



//lights
uniform vec3 La;
const vec3 Ld = vec3(1,1,1);
uniform vec3 Ls;

const float shininess = 10.0;
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

		//at night, light comes from streetlamp
		lightDir = normalize(uStreetLampLocation - vPosition);

		reflection = normalize(reflect(-lightDir, vNormal));

		//set our ambience and diffusion
		ambient = Ka*La;
		diffuse = Ld*Kd*max(dot(vNormal, lightDir), 0.0);

		coefficient = max(dot(reflection, eyeDir), 0.0);
		coefficient = pow(coefficient, shininess);

		specular = Ks*Ls*coefficient*0.1;

		ulightWeighting = clamp(ambient + diffuse + specular, 0.0, 1.0);

		//use attentuation
		gl_FragColor =   vec4(directionalLightWeighting*.25*ulightWeighting, 1.0);
			
	
	}else{
	
		//light comes from the sun
		lightDir = normalize(uLightPos - vPosition);
		reflection = normalize(reflect(-lightDir, vNormal));

		//set ambiance and diffusion
		ambient = Ka*La;
		diffuse = Ld*Kd*max(dot(vNormal, lightDir), 0.0);

		coefficient = max(dot(reflection, eyeDir), 0.0);
		coefficient = pow(coefficient,shininess);
		specular = Ks*Ls*coefficient;

		ulightWeighting = clamp(ambient + diffuse + specular, 0.0, 1.0);

		//set lighting based on angle from sun
		gl_FragColor =   vec4(ulightWeighting, 1.0);

	}


}
