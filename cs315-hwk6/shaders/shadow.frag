precision highp float; //don't need high precision

varying vec4 vLightProjPos; //the position of the fragment in "light projected space"

//takes the given 32-bit float and returns a vec4 (of four 8-bit floats) representing that value
//from http://www.nutty.ca/webgl/shadows/
vec4 pack(float depth) {
	const vec4 bitShifts = vec4(256 * 256 * 256, 256 * 256, 256, 1.0);
	const vec4 bitMask = vec4(0, 1.0 / 256.0, 1.0 / 256.0,	1.0 / 256.0);
	
	vec4 compact = fract(depth * bitShifts); //bitshift
	
	compact -= compact.xxyz * bitMask;
	return compact;
}

//>>> NOTE: you will need to move this method into your main light shader (e.g., phong.frag) <<<<
//unpack a 32bit float stored in a vec4
//from http://www.nutty.ca/webgl/shadows/
float unpack (vec4 colour)
{
	const vec4 bitShifts = vec4(1.0 / (256.0 * 256.0 * 256.0), 1.0 / (256.0 * 256.0), 1.0 / 256.0, 1.0);
	return dot(colour, bitShifts);
}


//main driver
void main() {

	vec3 fragPos = vLightProjPos.xyz / vLightProjPos.w; //convert from homogenous coordinates

	//normalize values to be from 0 to 1, not from -1 to 1
	float depth = 0.5*(fragPos.z + 1.0); //the "depth" of the fragment from the light

	gl_FragColor = pack(depth); //pack the depth into a vec4 and set that as the fragment color
}





