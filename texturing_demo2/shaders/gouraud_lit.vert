/* flat-shading a single-color model, hard-coded directional light */

attribute vec3 aPosition; //vertex position
attribute vec3 aNormal;		//normal at the vertex
attribute vec4 aColor; //per-vertex color (may not be used)
uniform vec4 uColor; //color for the model

uniform mat4 uModelViewProjectionMatrix; //combined transformation matrix
uniform mat3 uNormalMatrix; //normal transformation matrix

varying vec4 vColor; //output color for fragment

vec4 FRONT_LIGHT_DIR = normalize(vec4(0.0,0.0,-1.0,0.0)); 	//direction of light (down z axis)
vec4 BACK_LIGHT_DIR = normalize(vec4(1.0,0.0,1.0,0.0)); 	//direction of light (up x/z axis)

void main() {

  vec4 normal = vec4(normalize(uNormalMatrix * aNormal),0.0); //normal vector (unit length)
  float front = max(dot(normal, (-1.0) * FRONT_LIGHT_DIR), 0.1); //amount of light based on angle between light and normal
  float back = max(dot(normal, (-1.0) * BACK_LIGHT_DIR), 0.1); //amount of light based on angle between light and normal
  float diffuse = min(front+.7*back, 1.0);
  vColor = vec4(diffuse*(uColor.rgb), uColor.a); //"scale" color by amount of light, set to output

  //gl_Position = uViewMatrix*uModelViewMatrix * vec4(aPosition, 1.0);
  gl_Position = uModelViewProjectionMatrix * vec4(aPosition, 1.0);
}
