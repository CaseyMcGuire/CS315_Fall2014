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
    var u = (this.w * x/(canvas.width - 1)) - (this.w/2.0);
    var v = (-this.h * y/(canvas.height - 1)) + (this.h/2.0);
    //calculate direction
    var direction = vec3.fromValues(u, v, -1);
    var origin = vec3.fromValues(0, 0, 0);
    return new Ray(direction, origin);
    //return new ray with origin at (0,0,0) and direction
};



var Sphere = function(center, radius, material){
    this.center = center;
    this.radius = radius;
    this.material = material;
};
Sphere.prototype.intersects = function(ray){
    //first calculate the determinant to see how many real solutions there are
    var RayDebug = false;
    if(RayDebug){
	console.log("Ray's direction is "+ ray.direction);
	
    }
    var a = vec3.dot(ray.direction, ray.direction);//d dot d
    var b = vec3.dot(ray.direction, vec3.subtract([0,0,0], ray.origin, this.center));//2d dot (e - c)
    var c = vec3.dot(vec3.subtract([0,0,0], ray.origin, this.center),vec3.subtract([0,0,0], ray.origin, this.center));
 var discriminant = Math.pow(b, 2) - a * (c - Math.pow(this.radius, 2));
    
    if(RayDebug){
	console.log("a" + a);
	console.log("b" + b);
	console.log("c" + c);
	console.log("discrimant" + discriminant);
    }
 
    //if the discriminant is negative, the line and the object don't intersect
    if(discriminant < 0 || isNaN(discriminant)) return null;
    var t1 = (-b - Math.sqrt(discriminant))/a;
    var t2 = (-b + Math.sqrt(discriminant))/a;

    if(RayDebug){
	console.log("t1" + t1);
	console.log("t2" + t2);
	console.log("discriminant" + discriminant);
    }
    
    if(t1 < 0 && t2 < 0||isNaN(t1) && isNaN(t2))return null;
    else if(t1 < 0 && t2 >= 0|| isNaN(t1) && t2 >= 0) return new Intersection(t2);
    else if(t1 >= 0 && t2 < 0 || isNaN(t2) && t1 >= 0) return new Intersection(t1);
    else{
	if(t1 > t2) return new Intersection(t2);
	else return new Intersection(t1);
    }

    
    
};
//Sphere.prototype.<method> = function(params){};
var Triangle = function(p1, p2, p3){
    this.v1 = p1;
    this.v2 = p2;
    this.v3 = p3;
};
var Material = function(){};
var AmbientLight = function(){};
var PointLight = function(){};
var DirectionalLight = function(){};
var Ray = function(direction, origin){
    this.direction = direction;
    this.origin = origin;
};//might not need
var Intersection = function(t, intersectionPoint, normal){
    this.t = t;
    this.intersectionPoint = intersectionPoint;
    this.normal = normal;
};//might not need

//initializes the canvas and drawing buffers
function init() {
  canvas = $('#canvas')[0];
  context = canvas.getContext("2d");
  imageBuffer = context.createImageData(canvas.width, canvas.height); //buffer for pixels

  loadSceneFile("assets/SphereTest.json");
//loadSceneFile("assets/TriangleTest.json");


}


//loads and "parses" the scene file at the given path
function loadSceneFile(filepath) {
  scene = Utils.loadJSON(filepath); //load the scene

  //TODO - set up camera
    camera = new Camera(scene.camera.eye, scene.camera.up, scene.camera.at, scene.camera.fovy, scene.camera.aspect);

    if(DEBUG){
	console.log("scene object: " + scene);
	console.log(camera);

	var width = 512;
	var height = 512;

	var ray = camera.castRay(0,0);
	//=> o: 0,0,0; d: -0.41421356237309503,0.41421356237309503,-1 raytracer.js:115
	console.log(ray);

	ray = camera.castRay(width, height);
	//=> o: 0,0,0; d: 0.4158347504841443,-0.4158347504841443,-1 raytracer.js:117
	console.log(ray);
	
	ray = camera.castRay(0, height);
	//=> o: 0,0,0; d: -0.41421356237309503,-0.4158347504841443,-1 raytracer.js:119
	console.log(ray);
	
	ray = camera.castRay(width,0);
	console.log(ray);
	//=> o: 0,0,0; d: 0.4158347504841443,0.41421356237309503,-1 raytracer.js:121
	ray = camera.castRay(width/2,height/2);
	//=> o: 0,0,0; d: 0.0008105940555246383,-0.0008105940555246383,-1 
	console.log(ray);
    }

    //set up array to hold our surfaces
    surfaces = [];
    console.log(scene.surfaces);


    for(var i = 0; i < scene.surfaces.length; i++){
	surfaces.push(getSurfaceShape(scene.surfaces[i]));
    }
  //TODO - set up surfaces
    if(DEBUG) console.log(surfaces);

  render(); //render the scene

}

/*

  Returns an appropriate shape given the surface object

  TODO: will probably need to add more parameters.
*/
function getSurfaceShape(surface){
   
    if(surface.shape === "Sphere"){
	return new Sphere(surface.center, surface.radius, surface.material);
    }
    else{
	return new Triangle();
    }

}


//renders the scene
function render() {
  var start = Date.now(); //for logging

    if(DEBUG){
//	console.log(imageBuffer.data.length);
    }

    var curRay;
    var curIntersection;
    var curColor;
    for(var x = 0; x < canvas.width; x++){
	for(var y = 0; y < canvas.height; y++){
	    curRay = camera.castRay(x, y);

	    //note: going to have to determine closest intersection but thats later
	    for(var i = 0; i < surfaces.length; i++){
		curIntersection = surfaces[i].intersects(curRay);
	    }
	    if(curIntersection === null) setPixel(x, y, [0,0,0]);
	    else {
		setPixel(x, y, [1,1,1]);
	//	console.log("curintersection is not null");
	    }
	    //see if curRay intersects any objects
	    //if it intersects more than one get the closest
	    //otherwise, set it to white
	}
    }
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
