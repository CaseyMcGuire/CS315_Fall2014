//CORE VARIABLES
var canvas;
var gl;
var renderer;

//program handle
var shaderProgram;

//for off-screen rendering
var framebuffer;

//transforms
var viewMatrix;
var projectionMatrix;

//models
var meshes = {};

//textures
var texture;
var renderTexture;

//lights
var light = vec3.fromValues(20,20,15);

//helper function for working with radians
function rad(degrees){
  return degrees*Math.PI/180;
}

function init()
{
  //initialize shaders
  shaderProgram = ShaderUtils.initShaders(gl, 'shaders/pass.vert', 'shaders/phong.frag'); //load shaders
  if (shaderProgram < 0) { alert('Unable to initialize shaders.'); return; }
  gl.useProgram(shaderProgram); //specify to use the shaders

  //grab handles for later (store in the program object to keep organized)
  shaderProgram.vertexPositionHandle = gl.getAttribLocation(shaderProgram, "aPosition");
  shaderProgram.vertexNormalHandle = gl.getAttribLocation(shaderProgram,"aNormal");
  shaderProgram.normalMatrixHandle = gl.getUniformLocation(shaderProgram,"uNormalMatrix");
  shaderProgram.MVmatrixHandle = gl.getUniformLocation(shaderProgram,"uModelViewMatrix");
  shaderProgram.PmatrixHandle = gl.getUniformLocation(shaderProgram,"uProjectionMatrix");
  shaderProgram.lightPosHandle = gl.getUniformLocation(shaderProgram,"uLightPos");

  shaderProgram.vertexTextureHandle = gl.getAttribLocation(shaderProgram,"aTexCoord");
  shaderProgram.textureHandle = gl.getUniformLocation(shaderProgram,"uTexture");
  shaderProgram.texturingHandle = gl.getUniformLocation(shaderProgram,"uTexturing");


  //basic params
  gl.clearColor(0.8,  0.8,  0.8,  1.0); //background color
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
    Math.PI/2, canvas.width/canvas.height, 0.1, 20
    );


  //initialize data models!
  OBJ.downloadMeshes(
    {
      'cube': 'assets/cube.obj',
      'teapot': 'assets/teapot_sphere.obj',
      'icosphere' : 'assets/icosphere.obj',
      'sphere' : 'assets/sphere.obj',
      'plane' : 'assets/plane.obj',
      'torus' : 'assets/torus.obj'
    },
    function(downloadedMeshes) {
      meshes = downloadedMeshes;
      for(var key in meshes) { OBJ.initMeshBuffers(gl, meshes[key]); } //helper method to create buffers
    }
  );

  initTextures();

  //pass in current light position
  var viewLightPos = vec3.transformMat4(vec3.create(),light,viewMatrix); //move to view coordinates
  gl.uniform3fv(shaderProgram.lightPosHandle, viewLightPos); //pass in to shaders

  gl.uniform1i(shaderProgram.texturingHandle, 2); //type of texturing

  initTextureFramebuffer();

}

function initTextures() {
  var img = new Image();
  img.onload = function() { initTextureBuffer(img); }; //what to do when load
  img.src = "assets/img/uvgrid.bmp"; //actually loads
  //img.src = "assets/img/orange_skin.jpg"; //actually loads
  //img.src = "assets/img/isis-nmap.png"; //actually loads
  //img.src = "assets/img/scales.bmp"; //actually loads

}

function initTextureBuffer(image) { //adapted from https://developer.mozilla.org
  texture = gl.createTexture(); //initializes global variable
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); //flip the coordinate system (optional)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //for npot
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.generateMipmap(gl.TEXTURE_2D);
}

function initTextureFramebuffer(){
  var width = 512; //size of our buffer
  var height = 512;
  framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

  //set up the texture
  renderTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, renderTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.generateMipmap(gl.TEXTURE_2D);


  var renderbuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height); //add depth buffer
 
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, renderTexture, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

  gl.bindTexture(gl.TEXTURE_2D, null); //go back to normal, for prep
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}



var theta = 40;

var animating = false;

function multiPassRender()
{
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //clear context

  if($.isEmptyObject(meshes)) //check to make sure everything is loaded
  {
    console.log("Meshes not yet loaded");
    requestAnimationFrame(multiPassRender); //request another frame while we wait
    return;
  }
  if(texture === undefined)
  {
    console.log("texture not yet loaded");
    requestAnimationFrame(multiPassRender); //request another frame while we wait
    return;    
  }

  //bind the framebuff
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

  //render my scene
	renderScene();


	//switch the texture
	gl.bindTexture(gl.TEXTURE_2D, renderTexture);
	gl.generateMipmap(gl.TEXTURE_2D);

  //bind the regular framebuffer
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  //render my cube
  //pass in the texture (if any)
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, renderTexture);
  gl.uniform1i(shaderProgram.textureHandle, 0);

	renderTexturedCube();


  var animating = true;
  theta = (theta+0.5) % 360;
  requestAnimationFrame(multiPassRender);

}


function renderScene(){
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //clear context

  //pass in the texture (if any)
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(shaderProgram.textureHandle, 0);

  //model transformations
  var model = mat4.create();
  mat4.rotate(model,model, rad(theta), [1,1,0]);
  var mesh;

  /** sphere **/
  // mat4.scale(model, model, [4,4,4]);
  // // mesh = meshes['sphere'];
  // //mesh = meshes['icosphere'];
  // mesh = meshes['torus'];
  // drawMesh(mesh, model); 

  /** plane **/
  // mat4.rotate(model,model,rad(-theta), [1,1,0]);
  // // mat4.translate(model,model,[0,6,-6]);
  // mat4.scale(model, model, [5,5,5]);
  // // mat4.scale(model,model,[2,12,2]);
  // // mat4.rotateX(model,model,rad(-80));
  // mesh = meshes['plane'];
  // drawMesh(mesh,model);

  /** teapot **/
  mat4.rotate(model,model, rad(-theta), [1,1,0]);
  mat4.rotate(model,model, rad(30), [1,0,0]);
  mat4.rotate(model,model, rad(theta), [0,1,0]);
  mat4.scale(model, model, [0.4,0.4,0.4]);
  mesh = meshes['teapot'];
  //gl.disable(gl.CULL_FACE);
  drawMesh(mesh, model); 
  //gl.enable(gl.CULL_FACE);

  /** cube **/
  // mat4.scale(model, model, [3,3,3]);
  // mesh = meshes['cube'];
  // drawMesh(mesh, model);

}

function renderTexturedCube()
{
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //clear context

  //model transformations
  var model = mat4.create();
  mat4.rotate(model,model, rad(40), [1,1,0]);
  mat4.scale(model, model, [3,3,3]);
  var mesh = meshes['cube'];

  drawMesh(mesh, model); //draw
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
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.textureBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexTextureHandle, TEXTURE_DATA_SIZE, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(shaderProgram.vertexTextureHandle);

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
    var angle = vec3.dot(dragged,end)/30;

    var rot = mat4.create();
    mat4.rotate(rot, rot, angle, axis);

    vec3.transformMat4(light,light,rot);
    //console.log(light);

    //pass in new light position
    var viewLightPos = vec3.transformMat4(vec3.create(),light,viewMatrix); //move to view coordinates
    gl.uniform3fv(shaderProgram.lightPosHandle, viewLightPos); //pass in to shaders


    if(animating)
      renderScene();

  });
  $(document).mouseup(function(e){ dragged = null; });


  multiPassRender(); //start drawing!

});

function trackBallCoords(x,y)
{
  var sx = ((x/canvas.width)-0.5)*Math.sqrt(2);
  var sy = -1*((y/canvas.height)-0.5)*Math.sqrt(2);
  var sz = Math.sqrt(1 - sx*sx - sy*sy);
  return vec3.fromValues(sx,sy,sz);
}

