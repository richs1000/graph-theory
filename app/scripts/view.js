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
	// set up graph view
	//this.setupGraphView();
	// Only set up the controls once
	this.setupControls();	
}

GraphView.prototype.reset = function() { 
	// set up graph view
	//this.setupGraphView();
}


GraphView.prototype.setupControls = function() {
	// add event handler for submit button
	$( "#btnSubmit" ).click(function() {
		console.log("submit button pressed");
		//graphController.reset();
		// empty the text field where the user enters an answer
		$( "#txtAnswer" ).val('');
		// reset the search algorithm label
		$( "#correctAnswer" ).html("The correct answer is...");
	});
}