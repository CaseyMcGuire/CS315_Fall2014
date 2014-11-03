precision mediump float;

const vec3 Ka = vec3(0.1, 0.1, 0.1);
const vec3 Kd = vec3(0.0, 0.0, 1.0);
const vec3 Ks = vec3(1.0, 1.0, 1.0);
const float shininess = 20.0;

const vec3 La = vec3(1, 1, 1);
const vec3 Ld = vec3(1, 1, 1);
const vec3 Ls = vec3(1, 1, 1);

uniform vec3 uLightPos;
const vec3 vPosition;

void main(){

     vec3 lightDir = normalize(uLightPos - vPosition);
     vec3 reflection = normalize(reflect(-lightDir, vNormal));

     vec3 ambient = Ka*La;

     vec3 diffuse = Ld*Kd*max(dot(vNormal, lightDir), 0.0);

     float coefficient = max(dot(reflection, eyeDir), 0.0);
     coefficient = pow(coefficient, shininess);

     gl_FragColor = vec4(clamp(ambient+diffuse+specular, 0.0, 1.0), 1.0);

}