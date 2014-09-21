//CORE VARIABLES
var canvas;
var gl;

//program handle
var shaderProgram;

//a hash containing all the glyphs we'll be using
var glyphs = {};


function init(){
  //initialize canvas and webgl
  canvas = $('#glcanvas')[0]; //first element from jquery selector
  gl = WebGLUtils.setupWebGL( canvas );
  if (!gl) { alert("Unable to initialize WebGL. Your browser may not support it."); return; }

  //basic window parameters
  gl.clearColor(1.0,  1.0,  1.0,  1.0); //white background
  gl.viewport(0, 0, canvas.width, canvas.height); //viewport setup

  //initialize shaders
  shaderProgram = ShaderUtils.initShaders(gl, 'shaders/glyph_scaled.vert', 'shaders/glyph.frag'); //load shaders
  if (shaderProgram < 0) { alert('Unable to initialize shaders.'); return; }
  gl.useProgram(shaderProgram); //specify to use the shaders

  //grab handles for later (store in the program object to keep organized)
    shaderProgram.vertexPositionHandle = gl.getAttribLocation(shaderProgram, "aPosition");
    shaderProgram.glyphSizeHandle = gl.getUniformLocation(shaderProgram,"uGlyphSize");

//probably put a for loop here later

    var cur = 'A';
   
    glyphs[cur] = Utils.loadJSON("assets/A.json");
    console.log(glyphs[cur]);

   // glyphs.singleGlyph[cur].vertices = new Float32Array(glyphs.singleGlyph[cur].vertices)
   // glyphs.singleGlyph[cur].indices = new Uint16Array(glyphs.singleGlyph[cur].indices);

    var vertexFloats = new Float32Array(glyphs[cur].vertices);
    glyphs[cur].vertexBuffer = gl.createBuffer();    
    gl.bindBuffer(gl.ARRAY_BUFFER,glyphs[cur].vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexFloats, gl.STATIC_DRAW);
    glyphs[cur].numVertices = glyphs[cur].vertices.length/2;

    var indUints = new Uint16Array(glyphs[cur].indices);
    glyphs[cur].indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glyphs[cur].indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indUints, gl.STATIC_DRAW);
    glyphs[cur].numIndices = glyphs[cur].indices.length;
    
}

/**
 * Renders the given glyph
 * @param  {[Object]} glyph The glyph to render
 * @param  {[Number]} offset The right-offset for positioning the glyph on the screen. Screen has a width of 2.
 * @param  {[Number]} scale  A factor to scale the glyph by (from screen-height)
 */
function drawGlyph(glyph, offset, scale) {

  
    gl.bindBuffer(gl.ARRAY_BUFFER, glyph.vertexBuffer);
 
    
    gl.vertexAttribPointer(shaderProgram.vertexPositionHandle, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderProgram.vertexPositionHandle);
   
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glyph.indexBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionHandle, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderProgram.vertexPositionHandle);
  
    gl.uniform2fv(shaderProgram.glyphSizeHandle, glyph.size);
    gl.drawElements(gl.TRIANGLES, glyph.numIndices, gl.UNSIGNED_SHORT,0);

}

/**
 * Draws the glyphs that make up the given string. Includes calculations of appropriate scale factors and offsets
 * @param  {[String]} chars A string of characters to render
 */
function drawString(chars) {
  //calculate total "size" of string to determine offsets/scale
  var SPACING = 0.1;

  var totalSize = 0;
  var i;
  for(i=0; i<chars.length; i++) {
    totalSize += glyphs[chars[i]].size[0]/glyphs[chars[i]].size[1];
  }
  totalSize += SPACING*(chars.length+1);

  //calculate scaling factor
  scale = Math.min(2/totalSize,1.0); //max size is 100% of display

  var offset = Math.max(SPACING*scale, 1-(totalSize/2 - SPACING)); //min initial offset enough to center
  for(i=0; i<chars.length; i++) {
    var glyph = glyphs[chars[i]];
    drawGlyph(glyph, offset, scale);
    offset += (glyph.size[0]/glyph.size[1])*scale;
    offset += SPACING*scale;
  }
}


/**
 * Renders the scene
 */
function render(){
    gl.clear(gl.COLOR_BUFFER_BIT); //clear previous rendering
    drawString('A'); //draw this string
}


//once everything is ready, run the script
$(document).ready(function(){
  init(); //initialize everything
  render(); //start drawing
});
