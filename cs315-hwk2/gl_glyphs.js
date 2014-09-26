//CORE VARIABLES
var canvas;
var gl;

//program handle
var shaderProgram;

//a hash containing all the glyphs we'll be using
var glyphs = {};
var alphabet = ["a","b","c","d","e","f", "f","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
var translation = [0, 0];
//var matrix;// = mat4.create();
var input;

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
    shaderProgram.offset = gl.getUniformLocation(shaderProgram, "uOffset");
    shaderProgram.scale = gl.getUniformLocation(shaderProgram, "uScale");
    shaderProgram.matrix = gl.getUniformLocation(shaderProgram, "uMatrix");



    //parse our letters
    alphabet2 = ["A", "U"];
   for(var letter in alphabet){
//	console.log(alphabet2[letter]);
       
       glyphs[alphabet[letter]] = Utils.loadJSON("assets/" + alphabet[letter] + ".json");
       if(glyphs[alphabet[letter]] == undefined) continue;
       console.log(glyphs[alphabet[letter]]);

       var indUints = new Uint16Array(glyphs[alphabet[letter]].indices);
       glyphs[alphabet[letter]].indexBuffer = gl.createBuffer();
       gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glyphs[alphabet[letter]].indexBuffer);
       gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indUints, gl.STATIC_DRAW);
       glyphs[alphabet[letter]].numIndices = glyphs[alphabet[letter]].indices.length;
       
       var vertexFloats = new Float32Array(glyphs[alphabet[letter]].vertices);
       glyphs[alphabet[letter]].vertexBuffer = gl.createBuffer();    
       gl.bindBuffer(gl.ARRAY_BUFFER,glyphs[alphabet[letter]].vertexBuffer);
       gl.bufferData(gl.ARRAY_BUFFER, vertexFloats, gl.STATIC_DRAW);
       glyphs[alphabet[letter]].numVertices = glyphs[alphabet[letter]].vertices.length/2;
       
   }
}

/**
 * Renders the given glyph
 * @param  {[Object]} glyph The glyph to render
 * @param  {[Number]} offset The right-offset for positioning the glyph on the screen. Screen has a width of 2.
 * @param  {[Number]} scale  A factor to scale the glyph by (from screen-height)
 */
function drawGlyph(glyph, offset, scale) {

 //  console.log(glyph);
  
   var  matrix = mat4.create();
console.log(matrix);
    gl.bindBuffer(gl.ARRAY_BUFFER, glyph.vertexBuffer);   
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glyph.indexBuffer);

   
    gl.vertexAttribPointer(shaderProgram.vertexPositionHandle, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderProgram.vertexPositionHandle);
    
    gl.uniform2fv(shaderProgram.glyphSizeHandle, glyph.size);

 
    console.log(offset);
   // gl.uniform2fv(shaderProgram.offset, [-1 + offset,-1]);
    mat4.translate(matrix, matrix, [-1 + offset, -1, 0, 0]);
    gl.uniformMatrix4fv(shaderProgram.matrix, false, matrix);
    console.log(matrix);
    console.log("scale" + scale);

    gl.uniform2fv(shaderProgram.scale, [scale, scale]);
      
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
    drawString(input); //draw this string
}


//once everything is ready, run the script
$(document).ready(function(){

$('button').click(function() {
    input = $("input[id=textField]").val().toLowerCase().split('');
    render();
});

  init(); //initialize everything
 // render(); //start drawing
});

