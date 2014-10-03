//CORE VARIABLES
var canvas;
var gl;
var renderer;

//model transforms (model data found in cube.js)
var frameStack = [];
var color = [0.0, 0.0, 1.0, 1.0];
var pose = {
  torso: mat4.create(),
  head: mat4.create(),
  leftUpperArm: mat4.create(),
  leftLowerArm: mat4.create(),
  rightUpperArm: mat4.create(),
  rightLowerArm: mat4.create(),
  leftUpperLeg: mat4.create(),
  leftLowerLeg: mat4.create(),
  rightUpperLeg: mat4.create(),
  rightLowerLeg: mat4.create()
};

//initialization function
function init() {
  //initialize canvas and webgl
  canvas = $('#glcanvas')[0];
  gl = WebGLUtils.setupWebGL( canvas );
  if (!gl) { alert("Unable to initialize WebGL. Your browser may not support it."); return; }

  //set up the OpenGL program as a "renderer" object  
  renderer = new CubeRenderer(gl);

}


//render the scene
function render(){
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //clear screen

  //a color
  var blue = [0.0, 0.0, 1.0, 1.0];

    //draw our torso
    var modelMatrix = mat4.create();
    mat4.rotate(modelMatrix, modelMatrix, Math.PI/6, [1,1,1]);
    renderer.drawCube(modelMatrix, blue);

    frameStack.push(mat4.clone(modelMatrix));
    drawRightArm();

    frameStack.push(mat4.clone(modelMatrix));
    drawLeftArm();

    frameStack.push(mat4.clone(modelMatrix));
    drawHead();

    frameStack.push(mat4.clone(modelMatrix));
    drawLeftLeg();

    frameStack.push(mat4.clone(modelMatrix));
drawRightLeg();
   
   
    renderer.drawCube(modelMatrix, color);
}




function drawHead(){
    var curMatrix = frameStack.pop();
    
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(0, 1, 0));
    mat4.scale(curMatrix, curMatrix, vec3.fromValues(0.5, 0.5, 0.5));

    renderer.drawCube(curMatrix, color);
}

function drawRightArm(){

    var curMatrix = frameStack.pop();

    mat4.translate(curMatrix, curMatrix, vec3.fromValues(1.35,0,0));
    mat4.scale(curMatrix, curMatrix, vec3.fromValues(0.3, 1, .5));
    renderer.drawCube(curMatrix, color);

}

function drawLeftArm(){

    var curMatrix = frameStack.pop();

    mat4.translate(curMatrix, curMatrix, vec3.fromValues(-1.35, 0, 0));
    mat4.scale(curMatrix, curMatrix, vec3.fromValues(0.3, 1, .5));
    renderer.drawCube(curMatrix, color);

}

function drawLeftLeg(){

}

function drawRightLeg(){

}

//run script when ready
$(document).ready(function(){
  init();
  render(); //start drawing
});
