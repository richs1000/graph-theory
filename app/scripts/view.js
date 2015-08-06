/*
 * main.js
 * Rich Simpson
 * August 5, 2015
 *
 * This code implements a mastery-based exercise on graph
 * theory for integration with Smart Sparrow.
 *
 * This is our view - The V in MVC
 */


/*
 * This object handles drawing the interface on the screen. Mostly
 * this involves drawing the actual graph and clearing out the
 * text field for the user's answer
 */
function GraphView() {
	// Only set up the controls once
	this.setupControls();
	// set up graph view
	this.setupGraphView();
}


GraphView.prototype.setupControls = function() {
	// $( ".answerHistory" ).append( "<div class='rightAnswer'></div>" )
	// $( ".answerHistory" ).append( "<div class='noAnswer'></div>" )
	// $( ".answerHistory" ).append( "<div class='wrongAnswer'></div>" )


	// add event handler for submit button
	$( "#btnSubmit" ).click(function() {
		console.log("submit button pressed");
		console.log("mastery = " + graphController.getModelValue('mastery'));
		console.log("numerator = " + graphController.getModelValue('numerator'))
		console.log("denominator = " + graphController.getModelValue('denominator'))
		// empty the text field where the user enters an answer
		$( "#txtAnswer" ).val('');
		// display a message: correct or not?
		$( "#correctAnswer" ).html("The correct answer is...");
		graphController.setModelValue('mastery', true);
	});
}


/*
 * draw squares for each answer we'll consider - for example,
 * if we want 3 out of 5 correct to establish mastery then
 * we want to draw 5 squares. Then fill in each square based
 * on whether the answer was correct or incorrect.
 */
GraphView.prototype.drawAnswerHistory = function(answerHistory) {
	console.log('drawing answer history');
	// clear the answer history display
	$( ".answerHistory" ).empty();
	// loop through all the items in the queue
	for (i = 0; i < answerHistory.length; i++) {
		// if we haven't provided an answer yet
		if (answerHistory[i] == null) {
			$( ".answerHistory" ).append( "<div class='noAnswer'></div>" );
		// if the answer was right
		} else if (answerHistory[i] == true) {
			$( ".answerHistory" ).append( "<div class='rightAnswer'></div>" );
		// if the answer was wrong
		} else {
			$( ".answerHistory" ).append( "<div class='wrongAnswer'></div>" );
		}
	}
}


/*
 * Create the graph view. The graph is drawn on a canvas.
 * Each node is represented as a circle. The graph is
 * precomputed
 */
GraphView.prototype.setupGraphView = function() {
	// handle for graph canvas
	this.graphCanvas = document.getElementById('graphCanvas');
	// handle for graph canvas context
	this.graphContext = this.graphCanvas.getContext('2d');
	// erase the canvas
	this.graphContext.clearRect(0, 0, this.graphCanvas.width, this.graphCanvas.height);
	// set canvas to 1/3 width of window
	this.graphContext.canvas.width  = (window.innerWidth / 3) - 10;
	// set radius for each node
	this.graphNodeRadius = 20;
	// create an object filled with node objects. each
	// object stores:
	// - the x and y position of the node within the canvas,
	// - the id of the node
	this.graphNodes = {
		A:{x:50, y:50, id:'A'},
		B:{x:125, y:50, id:'B'},
		C:{x:200, y:50, id:'C'},
		D:{x:50, y:125, id:'D'},
		E:{x:125, y:125, id:'E'},
		F:{x:200, y:125, id:'F'},
		G:{x:50, y:200, id:'G'},
		H:{x:125, y:200, id:'H'},
		I:{x:200, y:200, id:'I'},
	};
}


GraphView.prototype.drawGraph = function(nodes, edges, undirected) {
	// erase the canvas
	this.graphContext.clearRect(0, 0, this.graphCanvas.width, this.graphCanvas.height);
	this.graphContext.canvas.width  = (window.innerWidth / 3) - 10;
	// draw all the nodes
	this.drawNodes(nodes);
	// draw the edges between the nodes
	//this.drawEdges(nodeList, undirected);
}


/*
 * Draw all the nodes in the graph. nodes is an array of GraphNode
 * objects
 */

GraphView.prototype.drawNodes = function(nodes) {
	// make sure we have a canvas and a context
	if (this.graphCanvas.getContext) {
		// loop through the list of nodes
		for (i = 0; i < nodes.length; i++) {
			this.drawNode(nodes[i].nodeID);
		} // loop over all nodes in object
	} // if we have a context
}


/*
 * Draw an individual node. node is a GraphNode object
 */
GraphView.prototype.drawNode = function(nodeID) {
	// start the drawing path
	this.graphContext.beginPath();
 	// draw nodes in black
 	this.graphContext.strokeStyle = "black";
	// move the pen to the starting point of the node
	// if I don't do this I get lines between each circle I draw
	// I have to offset the x value because x is in the center of the circle
	this.graphContext.moveTo(this.graphNodes[nodeID].x + this.graphNodeRadius,
							this.graphNodes[nodeID].y);
	// draw the node
	this.graphContext.arc(	this.graphNodes[nodeID].x,	// x
							this.graphNodes[nodeID].y, 	// y
							this.graphNodeRadius, 		// radius
							0, 							// start angle
							Math.PI * 2, 				// end angle
							true);						// clockwise
 	// draw the node on the canvas
	this.graphContext.stroke();
	// set the font for the node ID
	this.graphContext.textAlign = "center";
	this.graphContext.textBaseline = "bottom";
	this.graphContext.fillStyle = "black";
	this.graphContext.font = "12pt Helvetica";
	// draw the node ID
	this.graphContext.fillText(nodeID, this.graphNodes[nodeID].x, this.graphNodes[nodeID].y);
}
