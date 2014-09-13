/*
  Assignment #1: Grapher

  Casey McGuire
  CS315: Computer Graphics, Fall 2014
  9/12/2014
  University of Puget Sound
  
*/


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
    
    //create a method to help parse file
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
}


//draws in 2D on the canvas
function draw() {
    
    context.strokeStyle = "#000000";
console.log(graphs);
    
    //Writes a title for our graphs
    context.font = "bold 12px sans-serif";
    context.fillText(graphs.title , canvas.width/3, 43);

    singleGraphArea = canvas.width/graphs.formats.length;
    
    //draw each of our graphs in 1/3 of the canvas
    drawLineGraph(0, singleGraphArea);
    drawBarGraph(singleGraphArea, 2*singleGraphArea);
    drawPieChart(2*singleGraphArea, 3*singleGraphArea);
}

//This draws lines between the graphs
function drawSeparator(xTo){
    
    for(var x = xTo; x<xTo*graphs.formats.length; x+= xTo){
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
    }
}

//return an object that contains values that will help scale a graph properly
function getGraphDimensions(begin, end){
    var sideBuffer = (end - begin) *.07;
    
    //put some space between each graph (for labels and such)
    begin += sideBuffer;
    end -= sideBuffer;
    
    //calculate buffers so the graph is roughly in the middle
    //of its allocated portion of the canvas
    var bottomBuffer = canvas.height*.85;
    var topBuffer = canvas.height/6;
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
    context.beginPath();

    //get the dimensions for our graph
    var dimensions = getGraphDimensions(begin, end);
    
    begin = dimensions.begin;
    end = dimensions.end;
    var sideBuffer = dimensions.sideBuffer;
    var bottomBuffer = dimensions.bottomBuffer;
    var topBuffer = dimensions.topBuffer;
    var topOfGraph = dimensions.topOfGraph;
    var bottomOfGraph = dimensions.bottomOfGraph;    

    
    //get some other values that will help draw the graph
    var lineWidth = (end - begin)/graphs.data.length;
    var increment = getLength(begin, end)/graphs.data.length;

    //find the largest and smallest values for linear interpolation
    var smallest = findSmallestValue();
    var largest = findLargestValue();
    var height = topOfGraph - bottomOfGraph;

    //first draw the axes
    drawAxes(begin, end, topOfGraph, bottomOfGraph);
    drawLabels(begin,lineWidth);
    

    //now draw the graph
    var x;
    var y;
    for(var i = 1; i <= graphs.data.length ; i++){
	x = (i-1)*lineWidth + begin + lineWidth*.5;
	y = -((graphs.data[i-1].value - smallest)/(largest - smallest))*height + topOfGraph;
	if(i == 1) context.moveTo(x, y);
	context.lineTo(x, y);
	context.arc(x, y, 1, 0, 2*Math.PI, false);//put circles at each point
    }
    context.stroke();
    context.closePath();
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
    
    context.beginPath();

    //draw x axis
    context.moveTo(begin, topOfGraph);
    context.lineTo(end, topOfGraph);
    
    //draw y axis
    context.moveTo(begin, bottomOfGraph);
    context.lineTo(begin, topOfGraph);

    context.closePath();
    context.stroke();
    
    //create divots along x and y axis
    drawScaledXAxis(begin, end, topOfGraph);
    drawScaledYAxis(begin,end,topOfGraph, bottomOfGraph);
   
}

function drawScaledXAxis(begin, end, topOfGraph){
    context.beginPath();
    context.moveTo(begin,topOfGraph);
    var increment = getLength(begin,end)/graphs.data.length;
    for(var i = 0; i<graphs.data.length; i++){
        context.moveTo(i*increment + begin, topOfGraph);
        context.lineTo(i*increment + begin, topOfGraph+4);
    }
    context.stroke();
    context.closePath();

}

//This function draws divots on the Y-axis to indicate the scale
function drawScaledYAxis(begin, end, topOfGraph, bottomOfGraph){
    context.beginPath();
   
    var yAxisLength = getLength(bottomOfGraph, topOfGraph);
    console.log("y axis" + yAxisLength);
    var increment = yAxisLength/graphs.data.length;
    var smallest = findSmallestValue();
    var labelIncrementer = getLength(begin, end)/graphs.data.length;

    for(var i = 0; i < graphs.data.length; i++){
	context.moveTo(begin,topOfGraph-i*increment);
	context.lineTo(begin-4,topOfGraph-i*increment);
	context.fillText(Math.round(smallest+ labelIncrementer*i), begin - 15, topOfGraph-i*increment, 15);
    }

    context.stroke();
    context.closePath();
}

//draws appropriate labels beneath graphs
function drawLabels(begin, spacing, topOfGraph){
    context.save();
    context.translate(begin, canvas.height);
    context.rotate(-Math.PI/2);
    
    var x = spacing;
    for(var i = 0; i< graphs.data.length; i++){	
	context.fillText(graphs.data[i].label , 20, spacing-3, 80);
	spacing += x;
    }
    context.restore();
}



//returns the length between the begin point and the end point
function getLength(begin, end){
    return end - begin;
}

function drawBarGraph(begin, end){
    
    //get some dimensions that will help properly draw scaled graph
    var dimensions = getGraphDimensions(begin, end);    
    begin = dimensions.begin;
    end = dimensions.end;
    var sideBuffer = dimensions.sideBuffer;
    var bottomBuffer = dimensions.bottomBuffer;
    var topBuffer = dimensions.topBuffer;
    var topOfGraph = dimensions.topOfGraph;
    var bottomOfGraph = dimensions.bottomOfGraph; 

    //calculate the width of single bar in the graph
    //such that the bars cover the entire x-axis
    var barWidth = getLength(begin,end)/graphs.data.length;
    

    //The largest and smallest are for linear interpolation of the bars
    var smallest = findSmallestValue();
    var largest = findLargestValue();
    var height = topOfGraph - bottomOfGraph;
    
    //draw our axes and labels
    drawAxes(begin, end, topOfGraph, bottomOfGraph);
    drawLabels(begin, barWidth);

    //get a palette of colors, one for each bar
    var colors = generateColors(graphs.data.length);

    //draw the bar graph
    context.save();
    for(var i = 0; i< graphs.data.length; i++){
	var y = (-((graphs.data[i].value - smallest)/(largest - smallest))*height + topOfGraph)*.995;
	var barHeight = topOfGraph - y;
	context.fillStyle = colors[i].getHSLString();
	context.fillRect(i*barWidth + begin,y , barWidth, barHeight);
    }
    context.restore();
}

//draws the pie chart between the begin and end parameters on the x-axis
function drawPieChart(begin, end){
    
   
    
    //calculate the x and y values at the center of the circle
    var centerX = begin + (end - begin)/2;
    var centerY = canvas.height/2;

    context.beginPath();
    context.moveTo(centerX,centerY);
  
    
    var wholeCircle = 2*Math.PI;
    var total = getTotal();
    var curAngle = 0;
    var prevAngle = 0;

    
    var fractionOfTotal;
    var colors = generateColors(graphs.data.length);
    for(var i = 0; i < graphs.data.length ; i++){
	fractionOfTotal = graphs.data[i].value/total;
	curAngle += wholeCircle*fractionOfTotal;
	drawSingleSlice(centerX,centerY, prevAngle, curAngle, 100, colors[i]);
	prevAngle = curAngle;
    }

    context.closePath();

}

function drawSingleSlice(centerX, centerY,prevAngle, curAngle, radius, color){
    context.beginPath();

    context.moveTo(centerX, centerY);
    context.arc(centerX, centerY, radius, prevAngle, curAngle, false);
    context.lineTo(centerX, centerY);
    context.fillStyle = color.getHSLString();
    context.stroke();

    context.closePath();
    context.fill();
}

//returns an array containing a palette of colors
function generateColors(numColors){
    colors = new Array();
    
    var hue;
    var saturation;
    var brightness;
    var fraction = 360/graphs.data.length;
    
    for(var i = 0; i < numColors; i++){
	
	hue = fraction*i;
	saturation = 85;
	brightness = 50;
	colors[colors.length] = {
	    hue: hue,
	    saturation: saturation,
	    brightness: brightness
	}
	colors[colors.length-1].getHSLString = function(){
	    return "hsl(" + this.hue + "," + this.saturation + "%," + this.brightness + "%)"; 
	}
    }

    return colors;

}

//the total of the value entries
function getTotal(){
    var total = 0;
    for(var i = 0; i < graphs.data.length; i++){
	total += graphs.data[i].value;
    }
    return total;
}

//once html has loaded, set up and draw on the canvas
$(document).ready(function(){
  init();
  draw();
});
