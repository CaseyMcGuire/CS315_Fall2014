//CORE VARIABLES
var canvas;
var gl;
var renderer;

//model transforms (model data found in cube.js)
var frameStack = [];

var blue = [0.0, 0.0, 1.0, 1.0];
var red = [1.0, 0.0, 0.0, 1.0];
var green = [0.0, 1.0, 0.0, 1.0];
var yellow = [1.0, 1.0, 0.0, 1.0];


/*
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
*/

var pose = {
    
    torso: quat.create(),
    head: quat.create(),
    leftUpperArm: quat.create(),
    leftLowerArm: quat.create(),
    rightUpperArm: quat.create(),
    rightLowerArm: quat.create(),
    leftUpperLeg: quat.create(), 
    leftLowerLeg: quat.create(),
    rightUpperLeg: quat.create(),
    rightLowerLeg: quat.create()
    
};

//some constants
var armSegmentLength = 2.3;
var legSegmentLength = 2.4;
var limbScalingVec = vec3.fromValues(0.3, 0.3, 0.3);
var singleUnit = 1;
var shiftDown = false;
var mouseDown = false;

var oldX;
var oldY;
var newX;
var newY;

var newVec;
var oldVec;

var oldBodyVec;
var newBodyVec;

//initialization function
function init() {
  //initialize canvas and webgl
  canvas = $('#glcanvas')[0];
  gl = WebGLUtils.setupWebGL( canvas );
  if (!gl) { alert("Unable to initialize WebGL. Your browser may not support it."); return; }

  //set up the OpenGL program as a "renderer" object  
    renderer = new CubeRenderer(gl);

  //  setupPoseMatrices(pose);
}

//this function sets up our pose
function setupPoseMatrices(poses){
    
    //set up our torso
   // mat4.rotate(poses["torso"], poses["torso"], Math.PI/4, [1,1,1]);
    var torso = vec3.fromValues(1, 1, 1);
    vec3.normalize(torso, torso);
    quat.setAxisAngle(poses["torso"], torso, Math.PI/4);

   // mat4.rotate(poses["head"], poses["head"], 0, [0, 0, 1]);
    quat.setAxisAngle(poses["head"], [0, 0, 1], 0);
   
  //  mat4.rotate(poses["rightUpperArm"], poses["rightUpperArm"], -Math.PI/2, [0, 0, 1]);
   // mat4.rotate(poses["rightUpperArm"], poses["rightUpperArm"], -Math.PI/2, [0, 1, 0]);
    quat.setAxisAngle(poses["rightUpperArm"], [0, 0, 1], -Math.PI/2);
    quat.setAxisAngle(poses["rightUpperArm"], [0, 1, 0], -Math.PI/2);

   // mat4.rotate(poses["rightLowerArm"], poses["rightLowerArm"], Math.PI/6, [0, -1, 0]);
    quat.setAxisAngle(poses["rightLowerArm"], [0, -1, 0], Math.PI/6);
    
    //mat4.rotate(poses["leftUpperArm"], poses["leftUpperArm"], -Math.PI/2, [0, 1, 0]);
    quat.setAxisAngle(poses["leftUpperArm"], [0, 1, 0], -Math.PI/2);

   // mat4.rotate(poses["leftLowerArm"], poses["leftLowerArm"], Math.PI/6, [0, 0, 1]);
    quat.setAxisAngle(poses["leftLowerArm"], [0, 0, 1], Math.PI/6);

   // mat4.rotate(poses["leftUpperLeg"], poses["leftUpperLeg"], -Math.PI/6, [1, 0, 0]);
    quat.setAxisAngle(poses["leftUpperLeg"], [1, 0, 0], -Math.PI/6);

  //  mat4.rotate(poses["leftLowerLeg"], poses["leftLowerLeg"], Math.PI/6, [1, 0, 0]);
    quat.setAxisAngle(poses["leftLowerLeg"], [1, 0, 0], Math.PI/6);

   // mat4.rotate(poses["rightUpperLeg"], poses["rightUpperLeg"], Math.PI/6, [1, 0, 0]);
    quat.setAxisAngle(poses["rightUpperLeg"], [1, 0, 0], Math.PI/6);

  //  mat4.rotate(poses["rightLowerLeg"], poses["rightLowerLeg"], Math.PI/6, [1, 0, 0]);
    quat.setAxisAngle(poses["rightLowerLeg"], [1, 0, 0], Math.PI/6);

   
}


//render the scene
function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //clear screen
    
    //a color
    var blue = [0.0, 0.0, 1.0, 1.0];
    
   
    var modelMatrix = mat4.create();
    mat4.scale(modelMatrix, modelMatrix, vec3.fromValues(2,2,2));
    var torsoRotation = mat4.create();
    mat4.fromQuat(torsoRotation, pose["torso"]);
    mat4.multiply(modelMatrix, modelMatrix, torsoRotation);


    //draw our right arm
    frameStack.push(mat4.clone(modelMatrix));
    drawUpperRightArm(frameStack);


    //draw our left arm
    frameStack.push(mat4.clone(modelMatrix));
    drawUpperLeftArm(frameStack);

    //draw head
    frameStack.push(mat4.clone(modelMatrix));
    drawHead(frameStack);


    //draw left leg
    frameStack.push(mat4.clone(modelMatrix));
    drawUpperLeftLeg(frameStack);


    //draw right leg
    frameStack.push(mat4.clone(modelMatrix));
    drawUpperRightLeg(frameStack);

    
    //draw our torso
    renderer.drawCube(modelMatrix, blue);
}




function drawHead(stack){
    var curMatrix = stack.pop();
    
    //move our head in the correct place and shrink it
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(0, singleUnit, 0));
    mat4.scale(curMatrix, curMatrix, vec3.fromValues(0.5*singleUnit, 0.5*singleUnit, 0.5*singleUnit));

    //draw 
    headRotation = mat4.create();
    mat4.fromQuat(headRotation, pose["head"]);
    mat4.multiply(curMatrix, curMatrix, headRotation);

    renderer.drawCube(curMatrix, red);
}

function drawUpperRightArm(stack){

    var curMatrix = stack.pop();
    
    //apply global transformation to our arm
    mat4.scale(curMatrix, curMatrix, limbScalingVec);
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(2 * armSegmentLength, 2*singleUnit, 0));

    var upperRightArmRotation = mat4.create();
    mat4.fromQuat(upperRightArmRotation, pose["rightUpperArm"]);
    mat4.multiply(curMatrix, curMatrix, upperRightArmRotation);

    //push matrix on stack
    stack.push(mat4.clone(curMatrix));

    //apply local transformation to our upper arm segment
    mat4.scale(curMatrix, curMatrix, vec3.fromValues(armSegmentLength, singleUnit, singleUnit));
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(.5*singleUnit, 0, 0));

   //move down tree hierarchy before drawing upper right arm
    drawLowerRightArm(stack);

    renderer.drawCube(curMatrix, green);

}

function drawLowerRightArm(stack){
    var curMatrix = stack.pop();
    
    //apply local transformation to our lower arm
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(singleUnit + armSegmentLength, 0, 0));

    var lowerRightArmRotation = mat4.create();
    mat4.fromQuat(lowerRightArmRotation, pose["rightLowerArm"]);
    mat4.multiply(curMatrix, curMatrix, lowerRightArmRotation);


    mat4.scale(curMatrix, curMatrix, vec3.fromValues(armSegmentLength, singleUnit, singleUnit));
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(singleUnit, 0, 0));
   
    renderer.drawCube(curMatrix, green);
    
}

function drawUpperLeftArm(stack){

    var curMatrix = stack.pop();

    //apply global transformation to left arm
    mat4.scale(curMatrix, curMatrix, limbScalingVec);
    mat4.translate(curMatrix, curMatrix, vec3.fromValues( -(1.9 * armSegmentLength), 2*singleUnit, 0));

    
    var upperLeftArmRotation = mat4.create();
    mat4.fromQuat(upperLeftArmRotation, pose["leftUpperArm"]);
    mat4.multiply(curMatrix, curMatrix, upperLeftArmRotation);
    
    
    //push copy on the stack
    stack.push(mat4.clone(curMatrix));

    //apply local transformation to upper left arm
    mat4.scale(curMatrix, curMatrix, vec3.fromValues(armSegmentLength, singleUnit, singleUnit));
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(-.5*singleUnit, 0, 0));

   
    drawLowerLeftArm(stack);
    

    renderer.drawCube(curMatrix, green);
}

function drawLowerLeftArm(stack){

    var curMatrix = stack.pop();
    
    //apply transformation to our matrix
   
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(-(2.1*singleUnit + armSegmentLength), 0, 0));

    var lowerLeftArmRotation = mat4.create();
    mat4.fromQuat(lowerLeftArmRotation, pose["leftLowerArm"]);
    mat4.multiply(curMatrix, curMatrix, lowerLeftArmRotation);


    mat4.scale(curMatrix, curMatrix, vec3.fromValues(armSegmentLength, singleUnit, singleUnit));
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(-.6*singleUnit, 0, 0));

    renderer.drawCube(curMatrix, green);
}

function drawUpperLeftLeg(stack){

    var curMatrix = stack.pop();

    //apply global transformation
    mat4.scale(curMatrix, curMatrix, limbScalingVec);
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(legSegmentLength, -(2*singleUnit + legSegmentLength), 0));


    var upperLeftLegRotation = mat4.create();
    mat4.fromQuat(upperLeftLegRotation, pose["leftUpperLeg"]);
    mat4.multiply(curMatrix, curMatrix, upperLeftLegRotation);

    
    //push copy of matrix on the stack
    stack.push(mat4.clone(curMatrix));
    
    //apply local transformations
    mat4.scale(curMatrix, curMatrix, vec3.fromValues(singleUnit, legSegmentLength, singleUnit));
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(0, -.5*singleUnit, 0), 0);
    //go down tree hierarchy
    drawLowerLeftLeg(stack);
    

    renderer.drawCube(curMatrix, yellow);
}

function drawLowerLeftLeg(stack){

    var curMatrix = stack.pop();
    
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(0, -(legSegmentLength), 0));

    var lowerLeftLegRotation = mat4.create();
    mat4.fromQuat(lowerLeftLegRotation, pose["leftLowerLeg"]);
    mat4.multiply(curMatrix, curMatrix, lowerLeftLegRotation);

    
    mat4.scale(curMatrix, curMatrix, vec3.fromValues(singleUnit, legSegmentLength, singleUnit));
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(0, -1.5*singleUnit, 0));

    renderer.drawCube(curMatrix, yellow);

}

function drawUpperRightLeg(stack){
    var curMatrix = stack.pop();

    //apply global transformations
    mat4.scale(curMatrix, curMatrix, limbScalingVec);
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(-legSegmentLength, -(3*singleUnit + legSegmentLength), 0));

    var upperRightLegRotation = mat4.create();
    mat4.fromQuat(upperRightLegRotation, pose["rightUpperLeg"]);
    mat4.multiply(curMatrix, curMatrix, upperRightLegRotation);
    
    //push copy onto the stack
    stack.push(mat4.clone(curMatrix));
    
    //apply local transformation
    mat4.scale(curMatrix, curMatrix, vec3.fromValues(singleUnit, legSegmentLength, singleUnit));
    drawLowerRightLeg(stack);

    renderer.drawCube(curMatrix, yellow);
}

function drawLowerRightLeg(stack){

    var curMatrix = stack.pop();

    mat4.translate(curMatrix, curMatrix, vec3.fromValues(0, -(legSegmentLength), 0));

    var lowerRightLegRotation = mat4.create();
    mat4.fromQuat(lowerRightLegRotation, pose["rightLowerLeg"]);
    mat4.multiply(curMatrix, curMatrix, lowerRightLegRotation);
    

    mat4.scale(curMatrix, curMatrix, vec3.fromValues(singleUnit, legSegmentLength, singleUnit));
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(0, -singleUnit, 0));

    renderer.drawCube(curMatrix, yellow);
}


//get the angle between two vectors
function getAngle(first, second){
    firstLength = vec3.length(first);
    secondLength = vec3.length(second);
    dotProd = vec3.dot(first, second);
    return Math.acos(dotProd/(firstLength * secondLength));
}


//Returns a normalized vector from the center of the virtual ball
//http://en.wikibooks.org/wiki/OpenGL_Programming/Modern_OpenGL_Tutorial_Arcball
function setupUnitVector(x, y){

    var vec = vec3.fromValues(1.0*x/canvas.width*2 - 1.0, 1.0*y/canvas.height*2 - 1.0, 0);

    vec[1] = -vec[1];
    
    var opSquared = vec[0]*vec[0] + vec[1]*vec[1];

    if(opSquared <= 1*1){
	vec[2] = Math.sqrt(1*1 - opSquared);
    }
    else{
	 vec3.normalize(vec, vec);
    }

    return vec;
    
}

function setupRotationVector(x, y, origin){
    x = x/canvas.width;
    x = x - 0.5;
    x = x * 2;
    x = x * Math.sqrt(2)/2;

    y = y/canvas.height;
    y =  y - 0.5;
    y = y * 2;
    y = y * Math.sqrt(2)/2;

    
}

function moveCamera(e){
    //if the mouse isn't pressed down and the shift key isn't pressed down
    //then don't rotate the camera
    if(!mouseDown || !shiftDown) return;
    
    //if the first time camera adjustment, initialize the old vector
    if(oldVec == undefined) {
	oldVec = setupUnitVector(e.pageX, e.pageY);	  
    }
    
    vec3.normalize(oldVec, oldVec);
    
    //the new vector
    newX = e.pageX;
    newY = e.pageY;	    
    newVec = setupUnitVector(newX,newY);
    vec3.normalize(newVec, newVec);
    
    normal = vec3.create();//place holder for our normal vector
    vec3.cross(normal, newVec, oldVec);

    //adjust the view matrix
    mat4.rotate(renderer.viewMatrix, renderer.viewMatrix, getAngle(oldVec, newVec), normal);
    
    oldVec = newVec;
    render();
}

/*
  Moves a single body part.

  @param: {String} bodyPart
  @param: {Event} e


*/
function moveBodyPart(bodyPart, e){
    if(bodyPart == undefined || !mouseDown || shiftDown) return;
    console.log(bodyPart);
    console.log(pose[bodyPart]);
    if(oldBodyVec == undefined){
	oldBodyVec = setupUnitVector(e.pageX, e.pageY);
    }
      
    vec3.normalize(oldBodyVec, oldBodyVec);

    newBodyVec = setupUnitVector(e.pageX, e.pageY);
    vec3.normalize(newBodyVec, newBodyVec);

    normal = vec3.create();
    vec3.cross(normal, newBodyVec, oldBodyVec);
    vec3.normalize(normal, normal);
 
    temp = quat.create();
    temp =  quat.setAxisAngle(temp, normal, getAngle(oldBodyVec, newBodyVec)/100);
    quat.multiply(pose[bodyPart], pose[bodyPart], temp);
   
    render();
    
}

//run script when ready
$(document).ready(function(){
    init();
    render(); //start drawing
    
    //determines whether the shift key is pressed down
    $(document).on('keyup keydown', function(e){
	shiftDown = e.shiftKey
	if(!shiftDown){
	    oldVec = undefined;
	}
    });
    
    //determine whether the right mouse is pressed down
    $(document)
	.mouseup(function(){
	    oldVec = undefined;
//	    oldBodyVec  = undefined;
	    mouseDown = false;
	})
	.mousedown(function() {
	    mouseDown = true;
	});
    
    //this uses arcball rotation to adjust the camera
    $("#glcanvas")
	.mousemove(function(e){
	    moveCamera(e);
	    var bodyPart = $("#pickers input[type='radio']:checked").val();
	    console.log(pose[bodyPart]);
	    moveBodyPart(bodyPart, e);
	});
    
   
    
});
