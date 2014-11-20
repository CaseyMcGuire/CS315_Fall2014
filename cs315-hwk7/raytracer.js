//CORE VARIABLES
var canvas;
var context;
var imageBuffer;

var DEBUG = true; //whether to show debug messages
var EPSILON = 0.00001; //error margins

//scene to render
var scene;
var camera;
var surfaces;
//etc...

//define our objects (may not need some of these...)
/*
  Camera class tracks location and facing of the camera, and may be responsible
  for generating viewing rays. It can store variables to quickly generate new rays
  without having to recompute appropriate vectors.
*/
var Camera = function(eye, up, at, fovy, aspect){
    this.eye = eye;
    this.up = up;
    this.at = at;
    this.fovy = fovy;
    this.aspect = aspect;


    var h = 2*Math.tan(rad(fovy/2.0));
    this.h = h;
    var w = h*aspect;
    this.w = w;
};
Camera.prototype.castRay = function(x, y){
    var u = (w * x/(canvas.width - 1)) - (w/2.0);
    var v = (-h * y/(canvas.height - 1)) + (h/2.0);
   // var direction = u*up + v*
};

var Sphere = function(){};
//Sphere.prototype.<method> = function(params){};
var Triangle = function(){};
var Material = function(){};
var AmbientLight = function(){};
var PointLight = function(){};
var DirectionalLight = function(){};
var Ray = function(direction, origin){
    this.direction = direction;
    this.origin = origin;
};//might not need
var Intersection = function(){};//might not need

//initializes the canvas and drawing buffers
function init() {
  canvas = $('#canvas')[0];
  context = canvas.getContext("2d");
  imageBuffer = context.createImageData(canvas.width, canvas.height); //buffer for pixels

  loadSceneFile("assets/SphereTest.json");


}


//loads and "parses" the scene file at the given path
function loadSceneFile(filepath) {
  scene = Utils.loadJSON(filepath); //load the scene

  //TODO - set up camera
    camera = new Camera(scene.camera.eye, scene.camera.up, scene.camera.at, scene.camera.fovy, scene.camera.aspect);

    if(DEBUG){
	console.log("scene object: " + scene);
	console.log(camera);
    }
  //TODO - set up surfaces


  render(); //render the scene

}


//renders the scene
function render() {
  var start = Date.now(); //for logging


  //TODO - fire a ray though each pixel

  //TODO - calculate the intersection of that ray with the scene

  //TODO - set the pixel to be the color of that intersection (using setPixel() method)


  //render the pixels that have been set
  context.putImageData(imageBuffer,0,0);

  var end = Date.now(); //for logging
  $('#log').html("rendered in: "+(end-start)+"ms");
  console.log("rendered in: "+(end-start)+"ms");

}

//sets the pixel at the given x,y to the given color
/**
 * Sets the pixel at the given screen coordinates to the given color
 * @param {int} x     The x-coordinate of the pixel
 * @param {int} y     The y-coordinate of the pixel
 * @param {float[3]} color A length-3 array (or a vec3) representing the color. Color values should floating point values between 0 and 1
 */
function setPixel(x, y, color){
  var i = (y*imageBuffer.width + x)*4;
  imageBuffer.data[i] = (color[0]*255) | 0;
  imageBuffer.data[i+1] = (color[1]*255) | 0;
  imageBuffer.data[i+2] = (color[2]*255) | 0;
  imageBuffer.data[i+3] = 255; //(color[3]*255) | 0; //switch to include transparency
}

//converts degrees to radians
function rad(degrees){
  return degrees*Math.PI/180;
}

//on load, run the application
$(document).ready(function(){
  init();
  render();

  //load and render new scene
  $('#load_scene_button').click(function(){
    var filepath = 'assets/'+$('#scene_file_input').val()+'.json';
    loadSceneFile(filepath);
  });

  //debugging - cast a ray through the clicked pixel with DEBUG messaging on
  $('#canvas').click(function(e){
    var x = e.pageX - $('#canvas').offset().left;
    var y = e.pageY - $('#canvas').offset().top;
    DEBUG = true;
    camera.castRay(x,y); //cast a ray through the point
    DEBUG = false;
  });

});
