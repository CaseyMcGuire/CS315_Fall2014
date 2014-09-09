var datatable = 'assets/pixar.txt'; //the file to load
var file;//for the file to be loaded
var graphs;//holds formatted graph data
var singleGraphArea;


var canvas; //the canvas we'll be drawing on
var context; //the drawing context

//initializes the canvas
function init() {
    canvas = $('#canvas')[0];
    context = canvas.getContext("2d");
    file = Utils.loadFileText(datatable);//load file contents to object
    file =  file.split(new RegExp("\\n"));
    console.log(file);//print to developer console
    console.log(typeof file);

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

function drawLineGraph(begin, end){

    //create a buffer of white space between the 
    //graph and the edges of the allocated graph
    //space
    begin += 10;
    end -= 10;
    topOfGraph = canvas.height - 100;
    bottomOfGraph = canvas.height - 400;    

    //first draw the axes
    context.moveTo(begin, topOfGraph);
    context.lineTo(end, topOfGraph);
    context.moveTo(begin, 500);
    context.lineTo(begin, 100);

    var increment = getLength(begin, end)/graphs.data.length;

    console.log(begin);
    console.log(end);

    //now draw the graph
    var lineWidth = singleGraphArea/graphs.data.length 
    
    var x;
    var y = graphs.data[0].value;
    context.moveTo(begin, 500 - y);
    for(var i = 0; i < graphs.data.length - 1 ; i++){
	x = i*lineWidth + lineWidth;
	y = graphs.data[i+1].value;
	context.lineTo(x, y);
    }

   // drawLine(begin,end, increment);

}

function getLength(xFrom, xTo){
    return xTo - xFrom;
}

function drawLine(begin, end, increment){
    
    console.log(begin);
    console.log(end);
    var lineWidth = singleGraphArea/graphs.data.length 
    
    var x;
    var y = graphs.data[0].value;
    context.moveTo(begin, 500 - y);
    for(var i = 0; i < graphs.data.length - 1 ; i++){
	x = i*lineWidth + lineWidth;
	y = graphs.data[i+1].value;
	context.lineTo(x, y);
    }
}


//returns the smallest element in the
function getMin(){

}

function drawBarGraph(begin, end){
    var barWidth = singleGraphArea/graphs.data.length;
    
    for(var i = 0; i< graphs.data.length; i++){
	var barHeight = graphs.data[i].value;
	context.fillRect(i*barWidth + begin,500- barHeight, barWidth, barHeight);
    }
}

function drawPieChart(xFrom, xTo){
    

}




//once html has loaded, set up and draw on the canvas
$(document).ready(function(){
  init();
  draw();
});
