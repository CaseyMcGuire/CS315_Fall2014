var datatable = 'assets/pixar.txt'; //the file to load
//var file;//for the file to be loaded
var graphs;//holds formatted graph data
var singleGraphArea;//variable that holds the area for single graph


var canvas; //the canvas we'll be drawing on
var context; //the drawing context

//initializes the canvas
function init() {
    canvas = $('#canvas')[0];
    context = canvas.getContext("2d");
    var file = Utils.loadFileText(datatable);//load file contents to object
    file =  file.split(new RegExp("\\n"));
    console.log(file);//print to developer console
    console.log(typeof file);

    //create a method to help 
    file.getData = function(){
	   var a = new Array();
	   for(var x = 2; x < file.length; x++){
	      if(file[x] == "") break;
	        var curLine = file[x].split(",");
	        a[a.length] = {
		    label : curLine[0],
		    value : parseInt(curLine[1])
	     }
	   }
	return a;
    }
    
    graphs = {
	
	   title :file[1],
	   data : file.getData(),
	   formats: file[0].split(",")
    }

console.log(graphs);

    
}


//draws in 2D on the canvas
function draw() {
    
    context.strokeStyle = "#000000";
    context.stroke();

    context.font = "bold 12px sans-serif";
    context.fillText(graphs.title , canvas.width/3, 43);

    singleGraphArea = canvas.width/3;
    
    //draw some separators..I might not keep this
    drawSeparator(singleGraphArea);
    
    console.log("single graph area" + singleGraphArea);
    console.log("graph width" + canvas.width);
    console.log("graph height" + canvas.height);
    //draw our graphs
    drawLineGraph(0, singleGraphArea);
    drawBarGraph(singleGraphArea, 2*singleGraphArea);
   // drawPieChart(2*xArea, 3*xArea);
    
    //make them show up on the screen
    context.stroke();
    
}

//This draws lines between the graphs
function drawSeparator(xTo){

    for(var x = xTo; x<xTo*graphs.formats.length; x+= xTo){
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
        console.log(x);
    }
}

//return an object that contains values that will help scale a graph properly
function getGraphDimensions(begin, end){
    var sideBuffer = (end - begin) *.05;

    begin += sideBuffer;
    end -= sideBuffer;

    var bottomBuffer = canvas.height*.85;
    var topBuffer = canvas.height/6;

    console.log("bottom buffer " + bottomBuffer);
    console.log("top buffer " + topBuffer);

    var topOfGraph = canvas.height - topBuffer;
    var bottomOfGraph = canvas.height - bottomBuffer;

    return{
	begin: begin,
	end: end,
	sideBuffer: sideBuffer,
	bottomBuffer: bottomBuffer,
	topBuffer: topBuffer,
	topOfGraph: topOfGraph,
	bottomOfGraph: bottomOfGraph
    }
}

function drawLineGraph(begin, end){

    //create a buffer of white space between the 
    //graph and the edges of the allocated graph
    //space
     var dimensions = getGraphDimensions(begin, end);
    
    begin = dimensions.begin;
    end = dimensions.end;
    var sideBuffer = dimensions.sideBuffer;
    var bottomBuffer = dimensions.bottomBuffer;
    var topBuffer = dimensions.topBuffer;
    var topOfGraph = dimensions.topOfGraph;
    var bottomOfGraph = dimensions.bottomOfGraph;    

    //first draw the axes
    drawAxes(begin, end, topOfGraph, bottomOfGraph);

    var increment = getLength(begin, end)/graphs.data.length;

    console.log(begin);
    console.log(end);

    //now draw the graph
    var lineWidth = (end - begin)/graphs.data.length 
    
    //find the largest and smallest values for linear interpolation
    var smallest = findSmallestValue();
    var largest = findLargestValue();

    console.log("largest " + largest + " smallest " + smallest);
   
   var height = topOfGraph - bottomOfGraph;

   //draw the graph

    var x;
    var y = graphs.data[0].value;
    for(var i = 1; i <= graphs.data.length ; i++){
	x = (i-1)*lineWidth + lineWidth;
	y = -((graphs.data[i-1].value - smallest)/(largest - smallest))*height + topOfGraph;
	if(i == 1) context.moveTo(x, y);
	context.lineTo(x, y);
	context.arc(x, y, 1, 0, 2*Math.PI, false);
	
    }
    drawLabels(begin,lineWidth);
    
}

//find the smallest value in the graphs.data array
//used to help scale the graph
function findSmallestValue(){
    var smallest = graphs.data[0].value;
    for(var i = 1; i < graphs.data.length; i++){
        if(smallest > graphs.data[i].value){
            smallest = graphs.data[i].value;
        }
    }
    return smallest;
}

//find the largest value in the graphs.data array
//used to help scale the graph
function findLargestValue(){
    var largest = graphs.data[0].value;
    for(var i = 1; i < graphs.data.length; i++){
        if(largest < graphs.data[i].value){
            largest = graphs.data[i].value;
        }
    }
    return largest;
}

//draws axes in for a single graph
function drawAxes(begin, end, topOfGraph, bottomOfGraph){
    //draw x axis
    context.moveTo(begin, topOfGraph);
    context.lineTo(end, topOfGraph);
    
    //draw y axis
    context.moveTo(begin, bottomOfGraph);
    context.lineTo(begin, topOfGraph);
    
    //create divots along x axis
    context.moveTo(begin, topOfGraph);
    var increment = getLength(begin,end)/graphs.data.length;
    for(var i = 1; i<=graphs.data.length; i++){
        context.moveTo(i*increment, topOfGraph);
        context.lineTo(i*increment, topOfGraph+4);
    }
}

//draws appropriate labels beneath graphs
function drawLabels(begin, spacing, topOfGraph){
    context.save();
    console.log("begin" + begin);
    context.translate(begin, canvas.height);
    context.rotate(-Math.PI/2);
       
    var x = spacing;
    for(var i = 0; i< graphs.data.length; i++){
	context.fillText(graphs.data[i].label , 20, spacing-10, 80);
	spacing += x;
    }
    context.restore();
}

//returns the length between the begin point and the end point
function getLength(begin, end){
    return end - begin;
}

function drawBarGraph(begin, end){

     var dimensions = getGraphDimensions(begin, end);    
    begin = dimensions.begin;
    end = dimensions.end;
    var sideBuffer = dimensions.sideBuffer;
    var bottomBuffer = dimensions.bottomBuffer;
    var topBuffer = dimensions.topBuffer;
    var topOfGraph = dimensions.topOfGraph;
    var bottomOfGraph = dimensions.bottomOfGraph; 
    
    drawAxes(begin, end, topOfGraph, bottomOfGraph);


    var barWidth = getLength(begin,end)/graphs.data.length;
    
    for(var i = 0; i< graphs.data.length; i++){
	   var barHeight = graphs.data[i].value;
	   context.fillRect(i*barWidth + begin,500 - barHeight, barWidth, barHeight);
    }
    console.log("bar width" + barWidth);
    drawLabels(begin, barWidth);
}

function drawPieChart(xFrom, xTo){
    

}




//once html has loaded, set up and draw on the canvas
$(document).ready(function(){
  init();
  draw();
});
