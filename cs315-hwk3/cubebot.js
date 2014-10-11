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

//some constants
var armSegmentLength = 2.3;
var legSegmentLength = 2.4;
var limbScalingVec = vec3.fromValues(0.3, 0.3, 0.3);
var singleUnit = 1;

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

//this function sets up our pose
function setupPoseMatrices(poses){
    
    //set up our torso
    mat4.rotate(poses["torso"], poses["torso"], Math.PI/4, [1,1,1]);

    mat4.rotate(poses["head"], poses["head"], 0, [0, 0, 1]);
   
    mat4.rotate(poses["rightUpperArm"], poses["rightUpperArm"], -Math.PI/2, [0, 0, 1]);
    mat4.rotate(poses["rightUpperArm"], poses["rightUpperArm"], -Math.PI/2, [0, 1, 0]);

    mat4.rotate(poses["rightLowerArm"], poses["rightLowerArm"], Math.PI/6, [0, -1, 0]);
    
    mat4.rotate(poses["leftUpperArm"], poses["leftUpperArm"], -Math.PI/2, [0, 1, 0]);

    mat4.rotate(poses["leftLowerArm"], poses["leftLowerArm"], Math.PI/6, [0, 0, 1]);

    mat4.rotate(poses["leftUpperLeg"], poses["leftUpperLeg"], -Math.PI/6, [1, 0, 0]);

    mat4.rotate(poses["leftLowerLeg"], poses["leftLowerLeg"], Math.PI/6, [1, 0, 0]);

    mat4.rotate(poses["rightUpperLeg"], poses["rightUpperLeg"], Math.PI/6, [1, 0, 0]);

    mat4.rotate(poses["rightLowerLeg"], poses["rightLowerLeg"], Math.PI/6, [1, 0, 0]);

   
}


//render the scene
function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); //clear screen
    
    //a color
    var blue = [0.0, 0.0, 1.0, 1.0];
    
    //draw our torso
    var modelMatrix = mat4.create();
    mat4.scale(modelMatrix, modelMatrix, vec3.fromValues(1,2,1));

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
    
    
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(0, singleUnit, 0));
    mat4.scale(curMatrix, curMatrix, vec3.fromValues(0.5*singleUnit, 0.5*singleUnit, 0.5*singleUnit));

    mat4.multiply(curMatrix, curMatrix, pose["head"]);

    renderer.drawCube(curMatrix, color);
}

function drawUpperRightArm(stack){

    var curMatrix = stack.pop();
    
    mat4.scale(curMatrix, curMatrix, limbScalingVec);
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(2 * armSegmentLength, 2*singleUnit, 0));
    

    mat4.multiply(curMatrix, curMatrix, pose["rightUpperArm"]);
    stack.push(mat4.clone(curMatrix));


    mat4.scale(curMatrix, curMatrix, vec3.fromValues(armSegmentLength, singleUnit, singleUnit));
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(.5*singleUnit, 0, 0));

   
    drawLowerRightArm(stack);

    renderer.drawCube(curMatrix, color);

}

function drawLowerRightArm(stack){
    var curMatrix = stack.pop();
    
  
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(singleUnit + armSegmentLength, 0, 0));
  
    mat4.multiply(curMatrix, curMatrix, pose["rightLowerArm"]);
  

    mat4.scale(curMatrix, curMatrix, vec3.fromValues(armSegmentLength, singleUnit, singleUnit));
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(singleUnit, 0, 0));
   
    renderer.drawCube(curMatrix, color);
    
}

function drawUpperLeftArm(stack){

    var curMatrix = stack.pop();

    mat4.scale(curMatrix, curMatrix, limbScalingVec);
    mat4.translate(curMatrix, curMatrix, vec3.fromValues( -(2 * armSegmentLength), 2*singleUnit, 0));

  
    mat4.multiply(curMatrix, curMatrix, pose["leftUpperArm"]);

    stack.push(mat4.clone(curMatrix));

    mat4.scale(curMatrix, curMatrix, vec3.fromValues(armSegmentLength, singleUnit, singleUnit));
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(.5*singleUnit, 0, 0));

    drawLowerLeftArm(stack);

    renderer.drawCube(curMatrix, color);
  
   

}

function drawLowerLeftArm(stack){

    var curMatrix = stack.pop();
    
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(singleUnit + armSegmentLength, 0, 0));
    
  
    mat4.multiply(curMatrix, curMatrix, pose["leftLowerArm"]);

    mat4.scale(curMatrix, curMatrix, vec3.fromValues(armSegmentLength, singleUnit, singleUnit));
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(singleUnit, 0, 0));

    renderer.drawCube(curMatrix, color);
}

function drawUpperLeftLeg(stack){

    var curMatrix = stack.pop();
    mat4.scale(curMatrix, curMatrix, limbScalingVec);
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(legSegmentLength, -(3*singleUnit + legSegmentLength), 0));

    //ROTATION HERE
    mat4.multiply(curMatrix, curMatrix, pose["leftUpperLeg"]);

    stack.push(mat4.clone(curMatrix));
    
    mat4.scale(curMatrix, curMatrix, vec3.fromValues(singleUnit, legSegmentLength, singleUnit));
  
    drawLowerLeftLeg(stack);

    renderer.drawCube(curMatrix, color);
}

function drawLowerLeftLeg(stack){

    var curMatrix = stack.pop();

    
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(0, -(legSegmentLength), 0));

    //ROTATE
    mat4.multiply(curMatrix, curMatrix, pose["leftLowerLeg"]);

    mat4.scale(curMatrix, curMatrix, vec3.fromValues(1, legSegmentLength, singleUnit));
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(0, -singleUnit, 0));

    renderer.drawCube(curMatrix, color);

}

function drawUpperRightLeg(stack){
    var curMatrix = stack.pop();

    mat4.scale(curMatrix, curMatrix, limbScalingVec);
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(-legSegmentLength, -(3*singleUnit + legSegmentLength), 0));

    //ROTATION HERE
    mat4.multiply(curMatrix, curMatrix, pose["rightUpperLeg"]);
    
    stack.push(mat4.clone(curMatrix));

    mat4.scale(curMatrix, curMatrix, vec3.fromValues(singleUnit, legSegmentLength, singleUnit));
    drawLowerRightLeg(stack);

    renderer.drawCube(curMatrix, color);
}

function drawLowerRightLeg(stack){

    var curMatrix = stack.pop();

    mat4.translate(curMatrix, curMatrix, vec3.fromValues(0, -(legSegmentLength), 0));

    //draw lower 
    mat4.multiply(curMatrix, curMatrix, pose["rightLowerLeg"]);
    
    mat4.scale(curMatrix, curMatrix, vec3.fromValues(singleUnit, legSegmentLength, singleUnit));
    mat4.translate(curMatrix, curMatrix, vec3.fromValues(0, -singleUnit, 0));

    renderer.drawCube(curMatrix, color);

}


//get the angle between two vectors
function getAngle(first, second){
    firstLength = vec3.length(first);
    secondLength = vec3.length(second);
    dotProd = vec3.dot(first, second);
    return Math.acos(dotProd/(firstLength * secondLength));
}

function setupUnitVector1(x, y){

    var vec;
    var radius = Math.min(canvas.height, canvas.width);

    x = (x - canvas.width/2)/radius;
    y = (y - canvas.height/2)/radius;
    var z;
    var r = Math.pow(x, 2) + Math.pow(x, 2);
    
    if(r > 1.0){
	console.log("r is bigger than one " + r);
	var s = 1.0/Math.sqrt(r);
	x = s * x;
	y = s * y;
	var z = 0;
    }
    else{
	var z = Math.sqrt(1.0 - r);
    }

    vec = vec3.fromValues(x, y, z);
    vec3.normalize(vec, vec);
    return vec;
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

//run script when ready
$(document).ready(function(){
  init();
  render(); //start drawing

    $(document).keydown(function(key) {
	if(key.keyCode == 16){
	    var clicking = false;
	    console.log("working so far");
	  
	    $("#glcanvas")
		.mousedown(function(e){
		    clicking = true;
		    var oldX = e.pageX;
		    var oldY = e.pageY;

		    oldVec = setupUnitVector(e.pageX, e.pageY);
	
		    vec3.normalize(oldVec, oldVec);
		    console.log("mousedown");
		    $("#glcanvas")
			.mousemove(function(event){
			    if(clicking == false) return;

			    var newX = event.pageX;
			    var newY = event.pageY;

			    newVec = setupUnitVector(newX,newY);
			    vec3.normalize(newVec, newVec);
			    normal = vec3.create();//place holder for our normal vector
			    vec3.cross(normal, newVec, oldVec);
			    mat4.rotate(renderer.viewMatrix, renderer.viewMatrix, getAngle(oldVec, newVec), normal);
			    oldVec = newVec;
			    render();
			  
			});
		})
		.mouseup(function(){
		    clicking = false;
		});
		
	    render();
	}
    });
});
