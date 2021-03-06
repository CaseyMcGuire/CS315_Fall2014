/* Pass-through vertex shader */

attribute vec3 aPosition; //vertex position
attribute vec3 aNormal;		//normal at the vertex
uniform mat4 uModelViewMatrix; //modelView
uniform mat4 uProjectionMatrix; //combined transformation matrix
uniform mat3 uNormalMatrix; //normal transformation matrix
uniform mat4 uModelViewProjectionMatrix;

varying vec3 vNormal;	//output normal for fragment
varying vec3 vPosition; //output modelview position for fragment

uniform bool uisDaytime;
uniform bool uIsTextured;

uniform vec3 uPointLightingLocation;
varying vec3 vLightWeighting;

varying float directionalLightWeighting;

//new stuff
attribute vec2 aTexCoord;//texture coordinates at the vertex
varying vec2 vTexCoord;//output texture coordinates for fragment

void main() {

    
	vec3 vertexPos = vec3(uModelViewMatrix*vec4(aPosition,1.0));
	vec3 normal = normalize(uNormalMatrix*aNormal);

	
	vNormal = normal;
	vPosition = vertexPos;

	//if(uIsTextured){
		vTexCoord = aTexCoord;
//	}

//	I think this is for shadow.frag....
//	vLightProjPos = uLightMVPMatrix * vec4(aPosition, 1.0);

  	gl_Position = uModelViewProjectionMatrix * vec4(aPosition, 1.0);



	//if its daytime, there is no need for a light direction weighting
	//otherwise, 
  	if(uisDaytime){
		directionalLightWeighting = 1.0;
 	 }else{
		vec3 lightDirection = normalize(uPointLightingLocation - vertexPos);
		vec3 transformedNormal = uNormalMatrix * aNormal;
		directionalLightWeighting = max(dot(transformedNormal, lightDirection), 0.0);

  }

}
