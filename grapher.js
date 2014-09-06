var datatable = 'assets/pixar.txt'; //the file to load
var file;
var graphs;



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

  //  context.fillRect(50, 25, 150, 100);
    

    //for (var x = 0.5; x < 960; x += 10){
	//    context.moveTo(x, 0);
     //   context.lineTo(x, 600);
    //}
    
    //for (var y = 0.5; y < 600; y += 10) {
    	//context.moveTo(0, y);
    	//context.lineTo(960, y);
    //}
    
    context.strokeStyle = "#000000";
    context.stroke();

    context.font = "bold 12px sans-serif";
    context.fillText(graphs.title , canvas.width/3, 43);

    var xArea = canvas.width/3;
    
    //draw some separators..I might not keep this
    drawSeparator(xArea);
    
    //draw our graphs
    drawLineGraph(0, xArea);
    drawBarGraph(xArea, 2*xArea);
    drawPieChart(2*xArea, 3*xArea);
    
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

function drawLineGraph(xFrom, xTo){

    xFrom += 10;
    xTo -= 10;
    topOfGraph = canvas.height - 100;
    bottomOfGraph = canvas.height - 400;    

    //first draw the axes
    context.moveTo(xFrom, topOfGraph);
    context.lineTo(xTo, topOfGraph);
    context.moveTo(xFrom, 500);
    context.lineTo(xFrom, 100);

    var increment = getLength(xFrom, xTo)/graphs.data.length;

    drawLine(xTo, xFrom, increment);

}

function getLength(xFrom, xTo){
    return xTo - xFrom;
}

function drawLine(xTo, xFrom, increment){

    console.log(xTo);
    console.log(xFrom);

    var increment = 0;

    for(var x = xFrom; x < xTo; x+= increment){
        console.log(x);
        context.moveTo(x, graphs.data[increment]);
        context.lineTo(x+increment, graphs.data[increment]);
    }
}


//returns the smallest element in the
function getMin(){

}

function drawBarGraph(xFrom, xTo){

}

function drawPieChart(xFrom, xTo){
    

}




//once html has loaded, set up and draw on the canvas
$(document).ready(function(){
  init();
  draw();
});
