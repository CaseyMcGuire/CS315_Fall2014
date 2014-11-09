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


var light = vec3.fromValues(0, 0, 10);//This is the sun's direction.

var lightLocation = vec3.fromValues(-8, 10, -.3);//this is the direction of the streetlamp


var isDaytime = true;

//variables to keep the passing of variables to the shader organized
var materials = {};//a material JSON object


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
    shaderProgram.colorHandle = gl.getUniformLocation(shaderProgram,"uColor");
    shaderProgram.normalMatrixHandle = gl.getUniformLocation(shaderProgram,"uNormalMatrix");
    shaderProgram.MVPmatrixHandle = gl.getUniformLocation(shaderProgram,"uModelViewProjectionMatrix");
    shaderProgram.PmatrixHandle = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
    shaderProgram.MVmatrixHandle = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
    shaderProgram.lightPosHandle = gl.getUniformLocation(shaderProgram, "uLightPos");
    shaderProgram.isDaytime = gl.getUniformLocation(shaderProgram, "uisDaytime");
    shaderProgram.pointLightingLocation = gl.getUniformLocation(shaderProgram, "uPointLightingLocation");
    shaderProgram.streetLampLocation = gl.getUniformLocation(shaderProgram, "uStreetLampLocation");
    
    //shader variables for ambiance
    shaderProgram.Ka = gl.getUniformLocation(shaderProgram, "Ka");
    shaderProgram.La = gl.getUniformLocation(shaderProgram, "La");
    shaderProgram.ambianceAdjuster = gl.getUniformLocation(shaderProgram, "uAmbianceAdjuster");

    //specular variables
    shaderProgram.Ks = gl.getUniformLocation(shaderProgram, "Ks");
    shaderProgram.Ls = gl.getUniformLocation(shaderProgram, "Ls");
    shaderProgram.shininess = gl.getUniformLocation(shaderProgram, "shininess")

    /*
      Initialize our materials JSON object
      It contains our ambiance according to whether its day or night.
      It also contains the specular elements of our objects.
     */

materials = {
    
    day: {
	ambiance : {
	    Ka : vec3.fromValues(0.1, 0.1, 0.1),
	    La : vec3.fromValues(1.0, 1.0, 1.0)
	}
    },
    night: {
	ambiance : {
	   // Ka : vec3.fromValues(0.5, 0.5, 0.5),
	    Ka : vec3.fromValues(0.1, 0.1, 0.1),
	    La : vec3.fromValues(0.1, 0.1, 0.1)
	}
    },
    house : {
	specularity : {
	    Ks : vec3.fromValues(0.8, 0.8, 0.8),
	    Ls : vec3.fromValues(0.8, 0.8, 0.8),
	    shininess : 1.0
	}
    },
    cube: {
	specularity : {
	    Ks : vec3.fromValues(1.0, 1.0, 1.0),
	    Ls : vec3.fromValues(1.0, 1.0, 1.0),
	    shininess : 1.0
	}
    },
    streetlamp : {
	specularity : {
	    Ks : vec3.fromValues(1.0, 1.0, 1.0),
	    Ls : vec3.fromValues(1.0, 1.0, 1.0),
	    shininess : 1.0
	}
	
    },
    ground : {
	specularity : {
	    Ks : vec3.fromValues(0.1, 0.1, 0.1),
	    Ks : vec3.fromValues(0.1, 0.1, 0.1),
	    shininess : 1.0
	}
    }
    
}

    
    
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

	'streetLamp': 'assets/streetlamp2.obj',
	//source: http://tf3dm.com/3d-model/medieval-house-4919.html
	'house': 'assets/house2.obj',
	'ground': 'assets/textured_ground.obj',
	'cube': 'assets/cube.obj'
    },
    function(downloadedMeshes) {
      meshes = downloadedMeshes;
      for(var key in meshes) { 
	  OBJ.initMeshBuffers(gl, meshes[key]); 
      } //helper method to create buffers
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

    gl.uniform3fv(shaderProgram.lightPosHandle, light);
    gl.uniform1i(shaderProgram.isDaytime, isDaytime);
    gl.uniform3fv(shaderProgram.pointLightingLocation, lightLocation);
    gl.uniform3fv(shaderProgram.streetLampLocation, lightLocation);

  //model transformations
  var model = mat4.create();
  mat4.scale(model, model, [0.6,0.6,0.6]); //scale down the teapot (it is large)

  //other params
    var color = [0.0, 0.0, 1.0, 1.0]; //blue
    var green = [0.0, 1.0, 0.0, 1.0];
    var red = [1.0, 0.0, 0.0, 1.0];
    var translator = vec3.fromValues(0,-4,0);
    var mesh = meshes['streetLamp'];


    //pass information into the shader
    mat4.translate(model, model, translator);
    drawMesh(mesh, model, green, materials["streetlamp"]["specularity"]["Ks"], materials["streetlamp"]["specularity"]["Ls"]); 


    //put our house in the right place
    var houseModel = mat4.create();
    mat4.translate(houseModel, houseModel, translator);
    mat4.translate(houseModel, houseModel, [-7, 1, 0]);
    mat4.scale(houseModel, houseModel, [0.003, 0.003, 0.003]);

    //draw our house
   drawMesh(meshes['house'], houseModel, green, materials["house"]["specularity"]["Ks"], materials["house"]["specularity"]["Ls"]);

    //get our ground in the right place and draw it
    var groundModel = mat4.create();
    mat4.translate(groundModel, groundModel, translator);
    mat4.rotateX(groundModel, groundModel, Math.PI/100);
    drawMesh(meshes['ground'], groundModel, green, materials["ground"]["specularity"]["Ks"], materials["house"]["specularity"]["Ls"]);


    //get our cube in the right place and draw it
    var cubeModel = mat4.create();
    mat4.translate(cubeModel, cubeModel, translator);
    mat4.translate(cubeModel, cubeModel, [5.0, 0.0, 4.0]);
    mat4.rotateX(cubeModel, cubeModel, Math.PI/16);
    drawMesh(meshes['cube'], cubeModel, color, materials["cube"]["specularity"]["Ks"], materials["cube"]["specularity"]["Ls"]);


    //set the ambiance according to whether it is day or not
    if(isDaytime){
	gl.uniform3fv(shaderProgram.Ka, materials["day"]["ambiance"]["Ka"]);
	gl.uniform3fv(shaderProgram.La, materials["day"]["ambiance"]["La"]);
    }else{
	gl.uniform3fv(shaderProgram.Ka, materials["night"]["ambiance"]["Ka"]);
	gl.uniform3fv(shaderProgram.La, materials["night"]["ambiance"]["La"]);
    }    
    
}


//helper method for drawing a mesh
function drawMesh(mesh, modelMatrix, color, Ks, Ls)
{
    //set our specular elements according to the passed parameters.
    gl.uniform3fv(shaderProgram.Ks, Ks);
    gl.uniform3fv(shaderProgram.Ls, Ls);
   
    
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

    //bind MV matrix to uModelViewMatrix in shader
    gl.uniformMatrix4fv(shaderProgram.MVmatrixHandle, false, MVPmatrix);

  //calculate and set MVP matrix
  mat4.mul(MVPmatrix, projectionMatrix, MVPmatrix);
  gl.uniformMatrix4fv(shaderProgram.MVPmatrixHandle, false, MVPmatrix);

  //draw the model!
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
  gl.drawElements(gl.TRIANGLES, mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

}

function tick(){
    requestAnimationFrame(tick);
    render();
    animate();

}

var lastTime = new Date().getTime();
var elapsedSeconds = new Date().getTime();
var degreesPerMillisecond = 360/(120*500);
var totalTime;
var totalDegrees = 0;

function animate(){
    var timeNow = new Date().getTime();
    var elapsed = lastTime - timeNow;
    

    var rotate = mat4.create();

    totalDegrees += Math.abs(degreesPerMillisecond*elapsed);
    //at about 205 degrees, the sun goes down so switch to nighttime
    if(totalDegrees > 205) isDaytime = false;
    //at about 200 degrees, the sun is coming up so switch back to daytime
    if(totalDegrees > 300) isDaytime = true;
    if(totalDegrees > 360) totalDegrees = 0;
   
    //create a matrix representing a rotation around the x axis and use it to 
    //transform the light vector
    mat4.rotateX(rotate, rotate,rad(degreesPerMillisecond*elapsed));
    vec3.transformMat4(light, light, rotate);
  
    lastTime = timeNow;
		
}

//Initialize when ready
$(document).ready(function(){
    //html level stuff
    canvas = $('#glcanvas')[0];
    gl = WebGLUtils.setupWebGL( canvas );
    if (!gl) { alert("Unable to initialize WebGL. Your browser may not support it."); return; }
    
  
    init(); //set up shaders and models
    tick();
    
    render(); //start drawing!
    
});


