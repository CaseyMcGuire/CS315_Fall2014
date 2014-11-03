/* Pass-through vertex shader */

attribute vec3 aPosition; //vertex position
attribute vec3 aNormal;		//normal at the vertex
uniform mat4 uModelViewMatrix; //modelView
uniform mat4 uProjectionMatrix; //combined transformation matrix
uniform mat3 uNormalMatrix; //normal transformation matrix
uniform mat4 uModelViewProjectionMatrix;

varying vec3 vNormal;	//output normal for fragment
varying vec3 vPosition; //output modelview position for fragment

void main() {

	vec3 vertexPos = vec3(uModelViewMatrix*vec4(aPosition,1.0));
	vec3 normal = normalize(uNormalMatrix*aNormal);

	
	vNormal = normal;
	vPosition = vertexPos;


  gl_Position = uModelViewProjectionMatrix * vec4(aPosition, 1.0);
}
