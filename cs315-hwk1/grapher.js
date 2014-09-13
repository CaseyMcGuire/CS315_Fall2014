/*
  Assignment #1: Grapher

  Casey McGuire
  CS315: Computer Graphics, Fall 2014
  9/12/2014
  University of Puget Sound
  
*/


var datatable = 'assets/pixar.txt'; //the file to load

var graphs;//holds formatted graph data
var singleGraphArea;//variable that holds the area for single graph


var canvas; //the canvas we'll be drawing on
var context; //the drawing context

//initializes the canvas
function init() {

    canvas = $('#canvas')[0];
    context = canvas.getContext("2d");

    var file = Utils.loadFileText(datatable);//load file contents to object
    
    //split the file by the newline character
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

    //create a graphs object that will hold the data for our graph
    graphs = {
	title :file[1],
	data : file.getData(),
	formats: file[0].split(",")
    }
}


//draws in 2D on the canvas
function draw() {
    
    context.strokeStyle = "#000000";
    console.log(graphs);//log our object to the console per the specs
    
    //Writes a title for our graphs
    context.font = "bold 20px verdana";
    context.fillText(graphs.title , canvas.width/3, canvas.height*.06, canvas.width/3);
context.font = "12px sans serif";

    //this the width of single graph (in this case, 1/3 of the canvas width)
    singleGraphArea = canvas.width/graphs.formats.length;
    
    //draw each of our graphs in 1/3 of the canvas
    drawLineGraph(0, singleGraphArea);
    drawBarGraph(singleGraphArea, 2*singleGraphArea);
    drawPieChart(2*singleGraphArea, 3*singleGraphArea);
}


//return an object that contains values that will help scale a graph properly
function getGraphDimensions(begin, end){
    
    //this puts some buffer space between the graphs for labels and such
    var sideBuffer = (end - begin) *.07;
    begin += sideBuffer;
    end -= sideBuffer;
    
    //calculate buffers for the top and bottom as well
    // so the graph is roughly in the middle
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

//draws the line graph between the begin and end parameters
//begin is the x-value denoting the beginning of the graph
//end is the x-value denoting the end of the graph
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
   
    //length of a single line segment
    var lineWidth = (end - begin)/graphs.data.length;
   
    //find the largest and smallest values for linear interpolation
    var smallest = findSmallestValue();
    var largest = findLargestValue();
    var height = topOfGraph - bottomOfGraph;//height of the graph

    //first draw the axes and labels
    drawAxes(begin, end, topOfGraph, bottomOfGraph);
    drawLabels(begin,lineWidth);
    

    //now draw the graph
    var x;
    var y;
    for(var i = 1; i <= graphs.data.length ; i++){
	x = (i-1)*lineWidth + begin + lineWidth*.5;
	//y value is calculated from linear interpolation in specs (from Joel Ross)
	y = -((graphs.data[i-1].value - smallest)/(largest - smallest))*height + topOfGraph;
	if(i == 1) context.moveTo(x, y);
	context.lineTo(x, y);
	context.arc(x, y, 1, 0, 2*Math.PI, false);//put a little circle at each point
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

//draws little divots along x-axis to denote new data points
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

//This function draws divots on the Y-axis to indicate the scale and
//adds appropriate labels
function drawScaledYAxis(begin, end, topOfGraph, bottomOfGraph){
    context.beginPath();
   
    var yAxisLength = getLength(bottomOfGraph, topOfGraph);

    var increment = yAxisLength/graphs.data.length;
    var smallest = findSmallestValue();
    var labelIncrementer = getLength(smallest, findLargestValue())/graphs.data.length;
    var divotLength = getLength(begin, end)*.02;
    var textXLocation = getLength(begin, end)*.06;


    //this loop basically goes up the y-axis, drawing divots and labeling 
    //them appropriately. The smallest value should be at the bottom of the
    //y-axis and the largest value should be at the top
    //Note: multiplication by the decimal numbers is just a bit of tinkering 
    //to stop graph elements from overlapping
    for(var i = 0; i <= graphs.data.length; i++){
	context.moveTo(begin,topOfGraph - i * increment);
	context.lineTo(begin - divotLength, topOfGraph-i*increment);
	context.fillText(Math.round(smallest + labelIncrementer*i), (begin - textXLocation)*.99, (topOfGraph-i*increment)*1.01, textXLocation*.7);
    }

    context.stroke();
    context.closePath();
}

//draws appropriate labels beneath graphs
function drawLabels(begin, spacing, topOfGraph){
    context.save();
    
    //translate the graph and rotate the graph 90 degrees
    //so that labels can be written sideways
    context.translate(begin, canvas.height);
    context.rotate(-Math.PI/2);
   
    var x = spacing * .5;
    var y = spacing * .6;
       
    for(var i = 0; i< graphs.data.length; i++){	
	context.fillText(graphs.data[i].label , x, y, 80);
	y += spacing;
    }
    context.restore();
}

//returns the length between the begin point and the end point
function getLength(begin, end){
    return end - begin;
}

//draws the bar graph between the begin and end parameters
//begin: beginning of graph on x-axis
//end: end of graph on x-axis
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

//the x- and y- value for each bar
    var x;
    var y;

    //draw the bar graph
    context.save();
    for(var i = 0; i< graphs.data.length; i++){
	//y-value is calculated using linear interpolation as suggested
	//by Prof. Ross.
	//the .995 is so the smallest bar still shows up a bit
	y = (-((graphs.data[i].value - smallest)/(largest - smallest))*height + topOfGraph)*.995;
	x = i * barWidth + begin;
	var barHeight = topOfGraph - y;

	//add a gradient effect so that bars are white on bottom and then
	//gradually get color
	var grad = context.createLinearGradient(x,y,x+barWidth, y + barHeight);
	grad.addColorStop(.1, colors[i].getHSLString());
	grad.addColorStop(1, "white");
	context.fillStyle = grad;

	//draw a single bar
	context.fillRect(x,y , barWidth, barHeight);
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
	drawSingleSlice(centerX,centerY, prevAngle, curAngle, getLength(begin,end)/3, colors[i]);
	prevAngle = curAngle;
    }

    context.closePath();
    drawPieChartLabels(begin, end,(centerY + getLength(begin,end)/3)*1.05);

}

//draws a single 'slice' of the pie chart according to the given parameters
function drawSingleSlice(centerX, centerY,prevAngle, curAngle, radius, color){
    context.beginPath();

    context.moveTo(centerX, centerY);
    context.arc(centerX, centerY, radius, prevAngle, curAngle, false);
    context.lineTo(centerX, centerY);

    //add a gradient effect so that slice is white in the center and gradually adds color
    var grad = context.createRadialGradient(centerX,centerY,radius/10,centerX,centerY,radius);
    grad.addColorStop(0, "white");
    grad.addColorStop(1,color.getHSLString());
    context.fillStyle = grad;


    context.stroke();
    context.closePath();
    context.fill();
}

//draws the labels ofthe pie chart
function drawPieChartLabels(begin, end, bottomOfChart){
    
    var labelsPerRow = Math.round(graphs.data.length/3);
    var colors = generateColors(graphs.data.length);
    var labelLength = getLength(begin,end)/5;
   
    var x = begin;//the x-value of the label
    var y = bottomOfChart;//the y-value of the label
    var index = 0;//the index of the current data point

//This loop will print 3 rows of labels, with the number of labels
//per row dependent on the number of data points
    for(var i = 0; i < 3; i++){
	x = begin;
	for(var j = 0; j < labelsPerRow; j++){
	    //if we run out of labels to show, just return
	    if(index == graphs.data.length){
		return;
	    }

	    drawPieLabel(x , y, graphs.data[index].label, labelLength, colors[index].getHSLString());
	    index++;
	    x += labelLength;
	  
	}
	y += labelLength;
    }
}

//this draws a single label for the part chart according to the passed parameters
function drawPieLabel(x,y, label, length, color){
   
    context.beginPath();
    context.fillStyle = color;
    context.fillRect(x,y,length/2,length/2);
    context.fillStyle = "black";
    context.fillText(label,x,y, length*.9);
    context.closePath();
}

//returns an array containing a palette of colors, one for each data point
function generateColors(numColors){
    colors = new Array();
    
    var hue;
    var saturation;
    var brightness;
    var fraction = 360/graphs.data.length;
    
    //add a palette of colors to the array that covers the whole spectrum
    for(var i = 0; i < numColors; i++){
	
	hue = fraction*i;
	saturation = 85;
	brightness = 50;
	colors[colors.length] = {
	    hue: hue,
	    saturation: saturation,
	    brightness: brightness
	}
	//add a method to convert colors to an HSL string
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
