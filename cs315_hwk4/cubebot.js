//CORE VARIABLES
var canvas;
var gl;
var renderer;

//model transforms (model data found in cube.js)
var frameStack = [];

//the robot's colors
var blue = [0.0, 0.0, 1.0, 1.0];
var red = [1.0, 0.0, 0.0, 1.0];
var green = [0.0, 1.0, 0.0, 1.0];
var yellow = [1.0, 1.0, 0.0, 1.0];

//this stores a hash of keyframes (or pose matrices)
var animations = {}

var start_time;//the time that the animation started
var counter; //for keeping track of which frames we're on

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

//vectors for camera rotation
var newVec;
var oldVec;

//vectors for bodypart rotation
var oldBodyVec;
var newBodyVec;

var sorted_keys;//the sorted keys of the animation object

//the two frames to interpolate between
var frameOneSeconds;
var frameTwoSeconds;

//determines whether the canvas is currently animating or not
var isAnimating = false;

//initialization function
function init() {
  //initialize canvas and webgl
  canvas = $('#glcanvas')[0];
  gl = WebGLUtils.setupWebGL( canvas );
  if (!gl) { alert("Unable to initialize WebGL. Your browser may not support it."); return; }

  //set up the OpenGL program as a "renderer" object  
    renderer = new CubeRenderer(gl);
    save_keyframe(0);//save our basic robot as our base frame
   
}

/*
  Stores the passed parameter into the animation Object.

  @param time: The time the pose should be complete at

*/
function save_keyframe(time){
    var newPose = {};
    for(part in pose){
	newPose[part] = quat.clone(pose[part]);
    }
    animations[time] = newPose;
  
}

/*
  Returns a pose of the object with arms by his sides
*/
function getBasicPose(){
    var basic = {};
    for(bodypart in pose){
	basic[bodypart] = quat.create();
    }
    return basic;
}

/*
  Sets the animation object to be the dance passed in as a parameter.
*/
function load_animation(anim){
 
    animations = anim;
}


function play_animation(){
     //if the animation has less than two arguments, there aren't enough frames
       if(Object.keys(animations).length < 2){
	return;
    }
   
    //if the robot is current animating, setup our variables
    if(!isAnimating){
	setupAnimation();
    }
  
    var currentTimeInSeconds = (Date.now() - start_time)/1000;

    //if the current time elapsed is greater than the amount time allotted, then return
  
    if(currentTimeInSeconds >= sorted_keys.slice(-1)){
	isAnimating = false;
	return;
    }
   
   
    //if the current time has passed the second frame, move to the next two frames
    if(currentTimeInSeconds >= frameTwoSeconds){
	frameOneSeconds = frameTwoSeconds;
	frameTwoSeconds = sorted_keys[counter];
	counter++;
    }

    requestAnimationFrame(play_animation);
    var current_t = getParametricValue(currentTimeInSeconds);
    animateBodyParts(current_t);
    
   
    render();
}

/*
  Animates each bodypart of the robot according to the current frames and the passed interpolation value
*/
function animateBodyParts(tValue){
    for(bodypart in pose){
	quat.slerp(pose[bodypart], animations[frameOneSeconds][bodypart], animations[frameTwoSeconds][bodypart], tValue);
    }
}

/*
  This function sets up variables needed to properly animate the robot
g*/
function setupAnimation(){
    animations[0] = getBasicPose();//pose the robot will start from
    sorted_keys = Object.keys(animations).sort(function(a,b){return a-b});
    start_time = Date.now();
    frameOneSeconds = sorted_keys[0];
    frameTwoSeconds = sorted_keys[1];
    isAnimating = true;
    counter = 2;
}

/*
  Returns the parametric value between frameOneSeconds and frameTwoSeconds
*/
function getParametricValue(currentTime){
    numerator = currentTime - frameOneSeconds;
    denominator = frameTwoSeconds - frameOneSeconds;
    return numerator/denominator;
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

    //rotate our upper right arm
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
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(2.1*singleUnit + armSegmentLength, 0, 0));

    var lowerRightArmRotation = mat4.create();
    mat4.fromQuat(lowerRightArmRotation, pose["rightLowerArm"]);
    mat4.multiply(curMatrix, curMatrix, lowerRightArmRotation);


    mat4.scale(curMatrix, curMatrix, vec3.fromValues(armSegmentLength, singleUnit, singleUnit));
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(.55*singleUnit, 0, 0));
   
    renderer.drawCube(curMatrix, green);
    
}

function drawUpperLeftArm(stack){

    var curMatrix = stack.pop();

  
    //apply global transformation to left arm
    mat4.scale(curMatrix, curMatrix, limbScalingVec);
    mat4.translate(curMatrix, curMatrix, vec3.fromValues( -(1.9 * armSegmentLength), 2*singleUnit, 0));

 
    //rotate our upperleftArm
    var upperLeftArmRotation = mat4.create();
    mat4.fromQuat(upperLeftArmRotation, pose["leftUpperArm"]);
    mat4.multiply(curMatrix, curMatrix, upperLeftArmRotation);

     
    //push copy on the stack
    stack.push(mat4.clone(curMatrix));

    //apply local transformation to upper left arm
    mat4.scale(curMatrix, curMatrix, vec3.fromValues(armSegmentLength, singleUnit, singleUnit));
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(-.5*singleUnit, 0, 0));

   //continue down transformation hierarchy
    drawLowerLeftArm(stack);
    
   
    renderer.drawCube(curMatrix, green);
}

function drawLowerLeftArm(stack){

    var curMatrix = stack.pop();
    
    //apply transformation to our matrix
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(-(2.1*singleUnit + armSegmentLength), 0, 0));
 
    //rotate our lowerLeftArm
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
    
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(0, -(1.8*legSegmentLength), 0));

    var lowerLeftLegRotation = mat4.create();
    mat4.fromQuat(lowerLeftLegRotation, pose["leftLowerLeg"]);
    mat4.multiply(curMatrix, curMatrix, lowerLeftLegRotation);

    
    mat4.scale(curMatrix, curMatrix, vec3.fromValues(singleUnit, legSegmentLength, singleUnit));
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(0, -.7*singleUnit, 0));

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

    mat4.translate(curMatrix, curMatrix, vec3.fromValues(0, -(1.4*legSegmentLength), 0));

    var lowerRightLegRotation = mat4.create();
    mat4.fromQuat(lowerRightLegRotation, pose["rightLowerLeg"]);
    mat4.multiply(curMatrix, curMatrix, lowerRightLegRotation);
    

    mat4.scale(curMatrix, curMatrix, vec3.fromValues(singleUnit, legSegmentLength, singleUnit));
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(0, -.6*singleUnit, 0));

    renderer.drawCube(curMatrix, yellow);
}


//get the angle between two vectors
function getAngle(first, second){
    firstLength = vec3.length(first);
    secondLength = vec3.length(second);
    dotProd = vec3.dot(first, second);
    return Math.acos(round(dotProd/(firstLength * secondLength)));
}

//This function deals with a floating point bug I was getting in the getAngle() method
function round(num){
    if(num > 1.0){
	return 1.0;
    }
    else if(num < -1.0){
	return -1.0;
    }
    else {
	return num;
    }
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

/*
  Moves the camera using arcball rotation.
*/
function moveCamera(e){
    //if the mouse isn't pressed down and the shift key isn't pressed down
    //then don't rotate the camera. Also don't rotate if the robot
    //is currently being animated
    if(!mouseDown || !shiftDown || isAnimating) return;
    
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
    if(bodyPart == undefined || !mouseDown || shiftDown || isAnimating) return;


    var x = e.pageX;
    var y = e.pageY;
    if(oldBodyVec == undefined){
	oldBodyVec = setupUnitVector(x, y);
    }
      
    vec3.normalize(oldBodyVec, oldBodyVec);

  
    newBodyVec = setupUnitVector(x, y);
    vec3.normalize(newBodyVec, newBodyVec);

    normal = vec3.create();
    vec3.cross(normal, newBodyVec, oldBodyVec);
    vec3.normalize(normal, normal);


    temp = quat.create();
    temp =  quat.setAxisAngle(temp, normal, getAngle(oldBodyVec, newBodyVec));

    quat.multiply(pose[bodyPart], pose[bodyPart], temp);

    oldBodyVec = newBodyVec;
   
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
	    oldBodyVec  = undefined;
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
	    moveBodyPart(bodyPart, e);
	});
    
   
    
});
