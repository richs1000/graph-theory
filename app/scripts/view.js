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
