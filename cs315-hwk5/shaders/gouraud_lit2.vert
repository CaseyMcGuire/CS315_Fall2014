attribute vec3 aPosition; //vertex position
attribute vec3 aNormal;	  //normal at the vertex

uniform mat4 uModelViewProjectionMatrix;
uniform mat3 uNormalMatrix;

varying vec4 vColor; //output color for fragment
uniform vec4 uColor;

varying vec3 vNormal;
varying vec3 vPosition;

void main(){

     vec3 vertexPos = vec3(uModelViewMatrix*vec4(aPosition, 1.0));
     vec3 normal = normalize(uNormalMatrix*aNormal);

     vNormal = normal;
     vPosition = vertexPos;

     gl_Position = uModelViewProjectionMatrix * vec4(aPosition, 1.0);


}