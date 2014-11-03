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

//lights
var light = vec3.fromValues(20,20,15);

//helper function for working with radians
function rad(degrees){
  return degrees*Math.PI/180;
}

function init()
{
  //initialize shaders
  shaderProgram = ShaderUtils.initShaders(gl, 'shaders/phong.vert', 'shaders/pass.frag'); //load shaders
  if (shaderProgram < 0) { alert('Unable to initialize shaders.'); return; }
  gl.useProgram(shaderProgram); //specify to use the shaders

  //grab handles for later (store in the program object to keep organized)
  shaderProgram.vertexPositionHandle = gl.getAttribLocation(shaderProgram, "aPosition");
  shaderProgram.vertexNormalHandle = gl.getAttribLocation(shaderProgram,"aNormal");
  shaderProgram.normalMatrixHandle = gl.getUniformLocation(shaderProgram,"uNormalMatrix");
  shaderProgram.MVmatrixHandle = gl.getUniformLocation(shaderProgram,"uModelViewMatrix");
  shaderProgram.PmatrixHandle = gl.getUniformLocation(shaderProgram,"uProjectionMatrix");
  shaderProgram.lightPosHandle = gl.getUniformLocation(shaderProgram,"uLightPos");

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
      'teapot': 'assets/teapot.obj',
      // 'legoman' : 'assets/legoman.obj',
      // 'thing' : 'assets/thing.obj'
      'icosphere' : 'assets/icosphere.obj',
      'sphere' : 'assets/sphere.obj'
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

  gl.uniform3fv(shaderProgram.lightPosHandle, light); //light position


  //model transformations
  var model = mat4.create();

  mat4.scale(model, model, [3.5,3.5,3.5]);
  var mesh = meshes['sphere'];
  // var mesh = meshes['icosphere'];
  drawMesh(mesh, model); 


  // mat4.identity(model);
  // mat4.scale(model, model, [0.4,0.4,0.4]);
  // mesh = meshes['teapot'];
  // drawMesh(mesh, model); 

}

//helper method for drawing a mesh
function drawMesh(mesh, modelMatrix)
{
  //vertex attributes
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.positionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionHandle, POSITION_DATA_SIZE, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(shaderProgram.vertexPositionHandle);
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normalBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexNormalHandle, NORMAL_DATA_SIZE, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(shaderProgram.vertexNormalHandle);

  //calculate and set normal matrix (just based on model)
  var normalMatrix = mat3.normalFromMat4(mat3.create(), modelMatrix);
  gl.uniformMatrix3fv(shaderProgram.normalMatrixHandle, false, normalMatrix);

  //modelview -- calculate and pass
  var MVPmatrix = mat4.mul(mat4.create(), viewMatrix, modelMatrix);
  gl.uniformMatrix4fv(shaderProgram.MVmatrixHandle, false, MVPmatrix);

  //pass projection matrix
  gl.uniformMatrix4fv(shaderProgram.PmatrixHandle, false, projectionMatrix);

  //draw the model!
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
  gl.drawElements(gl.TRIANGLES, mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

}


var dragged = null;

//Initialize when ready
$(document).ready(function(){
  //html level stuff
  canvas = $('#glcanvas')[0];
  gl = WebGLUtils.setupWebGL( canvas );
  if (!gl) { alert("Unable to initialize WebGL. Your browser may not support it."); return; }


  init(); //set up shaders and models


  //jquery interaction to move the light
  $("#glcanvas").mousedown(function(e){
    var x = e.pageX - $('#glcanvas').offset().left;
    var y = e.pageY - $('#glcanvas').offset().top;
    dragged = trackBallCoords(x,y);
  });
  $("#glcanvas").mousemove(function(e){ 
    if(dragged === null)
      return;

    var x = e.pageX - $('#glcanvas').offset().left;
    var y = e.pageY - $('#glcanvas').offset().top;
    var end = trackBallCoords(x,y);

    var axis = vec3.cross(vec3.create(),dragged,end);
    var angle = vec3.dot(dragged,end)/50;

    var rot = mat4.create();
    mat4.rotate(rot, rot, angle, axis);

    vec3.transformMat4(light,light,rot);
    console.log(light);

    render();

  });
  $(document).mouseup(function(e){ dragged = null; });


  render(); //start drawing!

});

function trackBallCoords(x,y)
{
  var sx = ((x/canvas.width)-0.5)*Math.sqrt(2);
  var sy = -1*((y/canvas.height)-0.5)*Math.sqrt(2);
  var sz = Math.sqrt(1 - sx*sx - sy*sy);
  return vec3.fromValues(sx,sy,sz);
}

