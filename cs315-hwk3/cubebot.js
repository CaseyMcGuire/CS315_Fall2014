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

    setupPoseMatrices(pose);

}

function setupPoseMatrices(poses){
    
    //set up our torso
  //  mat4.rotate(poses["torso"], poses["torso"], Math.PI/6, [1,1,1]);
    
}


//render the scene
function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //clear screen
    
    //a color
    var blue = [0.0, 0.0, 1.0, 1.0];
    
    //draw our torso
    var modelMatrix = mat4.create();
    // mat4.scale(modelMatrix, modelMatrix, vec3.fromValues(3,3,3));


    mat4.rotate(modelMatrix, modelMatrix, Math.PI/6, [1,1,1]);
    mat4.multiply(modelMatrix, modelMatrix, pose["torso"]);
    
  //  renderer.drawCube(modelMatrix, blue);

    
    frameStack.push(mat4.clone(modelMatrix));
    drawUpperRightArm(frameStack);

    frameStack.push(mat4.clone(modelMatrix));
    drawUpperLeftArm(frameStack);

    frameStack.push(mat4.clone(modelMatrix));
    drawHead(frameStack);

    frameStack.push(mat4.clone(modelMatrix));
    drawUpperLeftLeg(frameStack);

    frameStack.push(mat4.clone(modelMatrix));
    drawUpperRightLeg(frameStack);
   
   
    renderer.drawCube(modelMatrix, color);
}




function drawHead(stack){
    var curMatrix = stack.pop();
    
    
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(0, 1, 0));
    mat4.scale(curMatrix, curMatrix, vec3.fromValues(0.5, 0.5, 0.5));

    renderer.drawCube(curMatrix, color);
}

function drawUpperRightArm(stack){

    var curMatrix = stack.pop();

  
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(1.35, 0, 0));
    mat4.scale(curMatrix, curMatrix, vec3.fromValues(0.3, 1, 0.5));

    
  // mat4.scale(curMatrix, curMatrix, [.3, 0.5, .5]);

    stack.push(mat4.clone(curMatrix));
    drawLowerRightArm(stack);

    renderer.drawCube(curMatrix, color);

}

function drawLowerRightArm(stack){
    var curMatrix = stack.pop();

   // mat4.translate(curMatrix, curMatrix, vec
}

function drawUpperLeftArm(stack){

    var curMatrix = stack.pop();

    mat4.rotate(curMatrix, curMatrix, -Math.PI/2, [0,0,0]);
    mat4.scale(curMatrix, curMatrix, vec3.fromValues(0.3, 1, .5));
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(-4, 0, 0));
  
    renderer.drawCube(curMatrix, color);

}

function drawLowerLeftArm(stack){

}

function drawUpperLeftLeg(stack){

    var curMatrix = stack.pop();

    mat4.translate(curMatrix, curMatrix, vec3.fromValues(-0.5, -2, 0));
    mat4.scale(curMatrix, curMatrix, vec3.fromValues(0.3, 1, 0.5));
    renderer.drawCube(curMatrix, color);

}

function drawLowerLeftLeg(stack){

}

function drawUpperRightLeg(stack){
    var curMatrix = stack.pop();

    mat4.translate(curMatrix, curMatrix, vec3.fromValues(0.5, -2, 0));
    mat4.scale(curMatrix, curMatrix, vec3.fromValues(0.3, 1, 0.5));

    renderer.drawCube(curMatrix, color);
}

function drawLowerRightLeg(stack){

}

//run script when ready
$(document).ready(function(){
  init();
  render(); //start drawing
});
