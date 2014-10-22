//CORE VARIABLES
var canvas;
var gl;
var renderer;

//program handle
var shaderProgram;

//transforms
var viewMatrix;
var projectionMatrix;

//models
var meshes = {};


//helper function for working with radians
function rad(degrees){
  return degrees*Math.PI/180;
}

function init()
{
  //initialize shaders
  shaderProgram = ShaderUtils.initShaders(gl, 'shaders/gouraud_lit.vert', 'shaders/fragment.frag'); //load shaders
  if (shaderProgram < 0) { alert('Unable to initialize shaders.'); return; }
  gl.useProgram(shaderProgram); //specify to use the shaders

  //grab handles for later (store in the program object to keep organized)
  shaderProgram.vertexPositionHandle = gl.getAttribLocation(shaderProgram, "aPosition");
  shaderProgram.vertexNormalHandle = gl.getAttribLocation(shaderProgram,"aNormal");
  shaderProgram.colorHandle = gl.getUniformLocation(shaderProgram,"uColor");
  shaderProgram.normalMatrixHandle = gl.getUniformLocation(shaderProgram,"uNormalMatrix");
  shaderProgram.MVPmatrixHandle = gl.getUniformLocation(shaderProgram,"uModelViewProjectionMatrix");

  //basic params
  gl.clearColor(0.0,  0.0,  0.0,  1.0); //background color
  gl.enable(gl.DEPTH_TEST); //enable depth culling
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.CULL_FACE); //enable backface culling

  //viewing
  gl.viewport(0, 0, canvas.width, canvas.height); //viewport setup
  viewMatrix = mat4.lookAt(mat4.create(), //camera setup
    [0,0,10], //eye's location
    [0,0,0], //point we're looking at
    [0,1,0]  //up vector
    );
  projectionMatrix = mat4.perspective(mat4.create(), //projection setup
    //field of view, aspect ratio, near clipping, far clipping
    Math.PI/2, canvas.width/canvas.height, 0.1, 30
    );


  //initialize data models!
  OBJ.downloadMeshes(
    {
      'teapot': 'assets/teapot.obj'
    },
    function(downloadedMeshes) {
      meshes = downloadedMeshes;
      for(var key in meshes) { OBJ.initMeshBuffers(gl, meshes[key]); } //helper method to create buffers
    }
  );
}


function render(){
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //clear context

  if($.isEmptyObject(meshes)) //check to make sure everything is loaded
  {
    console.log("Meshes not yet loaded");
    requestAnimationFrame(render); //request another frame while we wait
    return;
  }

  //model transformations
  var model = mat4.create();
  mat4.scale(model, model, [0.4,0.4,0.4]); //scale down the teapot (it is large)

  //other params
  var color = [0.0, 0.0, 1.0, 1.0]; //blue

  var mesh = meshes['teapot'];

  //pass information into the shader
  drawMesh(mesh, model, color); 

}


//helper method for drawing a mesh
function drawMesh(mesh, modelMatrix, color)
{
  //vertex attributes
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.positionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionHandle, POSITION_DATA_SIZE, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(shaderProgram.vertexPositionHandle);
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexNormalHandle, NORMAL_DATA_SIZE, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(shaderProgram.vertexNormalHandle);

  //set color
  gl.uniform4fv(shaderProgram.colorHandle, color);

  //calculate and set normal matrix (just based on model)
  var normalMatrix = mat3.normalFromMat4(mat3.create(), modelMatrix);
  gl.uniformMatrix3fv(shaderProgram.normalMatrixHandle, false, normalMatrix);

  //modelview
  var MVPmatrix = mat4.mul(mat4.create(), viewMatrix, modelMatrix);

  //calculate and set MVP matrix
  mat4.mul(MVPmatrix, projectionMatrix, MVPmatrix);
  gl.uniformMatrix4fv(shaderProgram.MVPmatrixHandle, false, MVPmatrix);

  //draw the model!
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
  gl.drawElements(gl.TRIANGLES, mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

}



//Initialize when ready
$(document).ready(function(){
  //html level stuff
  canvas = $('#glcanvas')[0];
  gl = WebGLUtils.setupWebGL( canvas );
  if (!gl) { alert("Unable to initialize WebGL. Your browser may not support it."); return; }


  init(); //set up shaders and models


  //jQuery interaction binding would go here


  render(); //start drawing!

});
