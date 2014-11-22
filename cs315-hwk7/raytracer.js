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
var materials;
var lights;
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

    var t;    

    if(t1 < 0 && t2 < 0||isNaN(t1) && isNaN(t2))return null;
    else if(t1 < 0 && t2 >= 0|| isNaN(t1) && t2 >= 0) t = t2;
    else if(t1 >= 0 && t2 < 0 || isNaN(t2) && t1 >= 0) t = t1;
    else{
	if(t1 > t2) t = t2;
	else t = t1;
    }

    

    var point = vec3.scaleAndAdd([0,0,0], ray.origin, ray.direction, t);
    var normal = vec3.subtract([0, 0, 0], point, this.center);
    var unitNormal = vec3.scale([0,0,0], normal, 1/this.radius);
    
    return new Intersection(t, point, unitNormal);
};
//Sphere.prototype.<method> = function(params){};
var Triangle = function(p1, p2, p3){
    this.v1 = p1;
    this.v2 = p2;
    this.v3 = p3;
};
Triangle.prototype.intersects = function(ray){

    //this implements the Moller-Trumbore intersection algorithm
    //http://en.wikipedia.org/wiki/M%C3%B6ller%E2%80%93Trumbore_intersection_algorithm
    var edge1 = vec3.fromValues(0, 0, 0);
    var edge2 = vec3.fromValues(0, 0, 0);
    var P = vec3.fromValues(0, 0, 0);
    var Q = vec3.fromValues(0, 0, 0); 
    var T = vec3.fromValues(0, 0, 0);
    var determinant, inverseDeterminant, u, v;
    var t;

    //find vectors for two edges sharing v1
    vec3.subtract(edge1, this.v2, this.v1);
    vec3.subtract(edge2, this.v3, this.v1);

    //begin calculating determinant
    vec3.cross(P, ray.direction, edge2);

    //if determinant is near zero, ray lies in plane of triangle
    determinant = vec3.dot(edge1, P);
    
    //NOT CULLING
    if(determinant > -EPSILON && determinant < EPSILON) return null;
    inverseDeterminant = 1/determinant;

    //calculate distance from v1 to ray origin
    vec3.subtract(T, ray.origin, this.v1);

    //calculate u parameter and test bound
    u = vec3.dot(T, P) * inverseDeterminant;

    //return null if the intersection lies outside of the triangle
    if(u < 0 || u > 1) return null;

    //prepare to test v parameter
    vec3.cross(Q, T, edge1);
    //calculate V parameter and test bound
    v = vec3.dot(ray.direction, Q) * inverseDeterminant;
    //The intersection lies outside of the triangle
    if(v < 0 || u + v > 1) return null;

    t = vec3.dot(edge2, Q) * inverseDeterminant;
    
    //if we have an intersection
    if(t > EPSILON){
	return new Intersection(t);
    }

    //no hit :(
    return null;

};
var Material = function(ka, kd, ks, shininess, kr){
    this.ka = ka;
    this.kd = kd;
    this.ks = ks;
    this.shininess = shininess;
    this.kr = kr;
};
//ambient light only has color
var AmbientLight = function(color){
    this.color = color;
};
var PointLight = function(position, color){
    this.position = position;
    this.color = color;
};
var DirectionalLight = function(direction, color){
    this.direction = direction;
    this.color = color;
};
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

 // loadSceneFile("assets/SphereTest.json");
//loadSceneFile("assets/TriangleTest.json");
  //  loadSceneFile("assets/SphereShadingTest2.json");
    loadSceneFile("assets/SphereShadingTest1.json");
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

    //set up our materials
    materials = [];
    for(var i = 0; i < scene.materials.length; i++){
	materials.push(new Material(
	    scene.materials[i].ka,
	    scene.materials[i].kd,
	    scene.materials[i].ks,
	    scene.materials[i].shininess,
	    scene.materials[i].kr));
    }

    //set up our lights
    lights = {};
    for(var i = 0; i < scene.lights.length; i++){
	lights[scene.lights[i].source] = getLightType(scene.lights[i]);
    }

  render(); //render the scene
    console.log(lights);
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
	return new Triangle(surface.p1, surface.p2, surface.p3);
    }
}

function getLightType(light){
    if(light.source === "Ambient"){
	return new AmbientLight(light.color);
    }
    else if(light.source === "Point"){
	return new PointLight(light.position, light.color);
    }
    else{
	return new DirectionalLight(light.direction, light.color);
    }
}

function clamp(num, min, max){
    if(num < min){
	x = min;
    }
    else if(x > max){
	x = max;
    }
    return x;
}

function getColor(intersection, surface){
    var light;
    var lightPos;
  //  console.log(lights);
    if(lights.Point !== undefined){
	light = lights.Point;
	lightPos = light.position;
    }
    else if(lights.Directional !== undefined){
	light = lights.Directional;
	lightPos = light.direction;
    }
    else{
	return [0, 0, 0];
    }
  
    var lightDirection = vec3.subtract([0, 0, 0], lightPos, intersection.intersectionPoint);
   // console.log(lightDirection);
    vec3.normalize(lightDirection, lightDirection);

    var negativeLightDirection = vec3.subtract([0,0,0], [0,0,0], lightDirection);
 
    var reflection = vec3.normalize([0,0,0], getReflection(negativeLightDirection, intersection.normal));


    
  
   // console.log(reflection);

    var ka = vec3.clone(materials[surface.material].ka);
    vec3.multiply(ka, ka, lights.Ambient.color);
    //console.log(light);
   // console.log(ka);
    
    var kd = vec3.clone(materials[surface.material].kd);
    vec3.multiply(kd, kd, light.color);
//console.log(kd);
    var diffuse = Math.max(0, vec3.dot(intersection.normal, lightDirection));

    //console.log(diffuse);
    vec3.scale(kd, kd, diffuse);

    var ks = vec3.clone(materials[surface.material].ks);
    var v = vec3.subtract([0,0,0], camera.eye, intersection.intersectionPoint);
   
    
   // console.log(v);
    var h = vec3.add([0,0,0], v, lightDirection);
   // console.log(h);
    vec3.normalize(h, h);

    var coefficient = Math.max(0, vec3.dot(intersection.normal, h));
   // console.log(coefficient);
    coefficient = Math.pow(coefficient, materials[surface.material].shininess);
    var specular = vec3.scale([0,0,0], ks, coefficient);

    var color = vec3.add([0,0,0], ka, kd);
    vec3.add(color, color, specular);

 //   console.log(color);
    return color;
}

/*
  Returns a reflection vector given the light direction and 
  surface normal
 */
function getReflection(lightDirection, normal){
    var dotProduct = vec3.dot(lightDirection, normal);
    dotProduct = dotProduct * 2;
    var scaledNormal = vec3.scale([0,0,0], normal, dotProduct);
    return vec3.subtract([0,0,0], lightDirection, scaledNormal);
}



//renders the scene
function render() {
  var start = Date.now(); //for logging

    if(DEBUG){
//	console.log(imageBuffer.data.length);
    }

    var curRay;
    var curIntersection;
    var frontIntersection;
    var curColor;
    var frontSurface;
    
    for(var x = 0; x < canvas.width; x++){
	for(var y = 0; y < canvas.height; y++){
	    curRay = camera.castRay(x, y);
	   frontIntersection = null;
	    //note: going to have to determine closest intersection but thats later
	    
	    for(var i = 0; i < surfaces.length; i++){
		curIntersection = surfaces[i].intersects(curRay);
		
		if(frontIntersection === null || 
		   curIntersection !== null && frontIntersection !== null && curIntersection.t < frontIntersection.t){
		    frontIntersection = curIntersection;
		    frontSurface = surfaces[i];
		}

		
	    }
	    if(frontIntersection === null) setPixel(x, y, [0,0,0]);
	    else {
		setPixel(x, y, getColor(frontIntersection, frontSurface));
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
