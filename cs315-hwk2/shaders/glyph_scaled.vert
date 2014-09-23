attribute vec2 aPosition; //vertex position
uniform vec2 uGlyphSize; //glyph dimensions

uniform vec2 vScale;
uniform vec2 u_translation;

varying vec4 vColor; //output color for fragment

void main() {
	vColor = vec4( 0.0, 0.0, 0.0, 1.0 ); //specify vertex color (rgba), currently black


	vec2 scale = vec2(1.0/uGlyphSize.y, 2.0/uGlyphSize.y); //scale glyph to fit the screen


	vec2 location = aPosition * scale;
	location.x = location.x * 0.5;
	location.y = location.y * 0.5;

	gl_PointSize = 10.0;
  gl_Position = vec4(location, 0.0, 1.0);

}
