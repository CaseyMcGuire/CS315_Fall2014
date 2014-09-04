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
    

    for (var x = 0.5; x < 960; x += 10){
//	context.moveTo(x, 0);
//	context.lineTo(x, 600);
    }
    
    for (var y = 0.5; y < 600; y += 10) {
//	context.moveTo(0, y);
//	context.lineTo(960, y);
    }
    
    context.strokeStyle = "#000000";
    context.stroke();

    context.font = "bold 12px sans-serif";
    context.fillText("Hello World!" , 248, 43);

    var xArea = canvas.width/3;
    
    
    
    drawLineGraph(0, xArea);
    
    
    
}

function drawLineGraph(xFrom, xTo){

    //first draw the axes
    context.moveTo(xFrom + 10, 500);
    context.lineTo(xTo-10, 500 );
    context.moveTo(xFrom + 10, 500);
    context.lineTo(xFrom + 10, 100);

    context.stroke();
    
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
