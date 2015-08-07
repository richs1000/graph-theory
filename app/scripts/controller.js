/*
 * main.js
 * Rich Simpson
 * August 4, 2015
 *
 * This code implements a mastery-based exercise on graph
 * theory for integration with Smart Sparrow.
 *
 * This is our controller - The C in MVC
 */


/*
 * Create the sim controller
 */
function GraphController() {
	// create a data model that exposes parameters to smart sparrow
	this.graphModel = new GraphModel(this, {
		mastery: false,
		numerator: 4,
		denominator: 5
	}, false);
	// expose model data to Smart Sparrow
	pipit.CapiAdapter.expose('mastery', this.graphModel);
	pipit.CapiAdapter.expose('numerator', this.graphModel);
	pipit.CapiAdapter.expose('denominator', this.graphModel);
	// initialize the data model
	this.graphModel.initializeGraphModel();
	// initialize the view
	this.graphView = new GraphView(this);
	this.updateDisplay();
}


GraphController.prototype.setModelValue = function(_name, _newValue) {
	this.graphModel.set(_name, _newValue);
}


GraphController.prototype.getModelValue = function(_name) {
	return this.graphModel.get(_name);
}


GraphController.prototype.updateDisplay = function() {
	// draw the results for the last five questions
	this.graphView.drawAnswerHistory(this.graphModel.answerHistory);
	// draw the graph on the screen
	this.graphView.drawGraph(this.graphModel.nodes, this.graphModel.edges, this.graphModel.undirectedGraph);
	// display the next question
	this.graphView.presentQuestion();
}


GraphController.prototype.nextQuestion = function() {
	// choose a question index at random
	this.graphModel.questionIndex = getRandomInt(0, this.graphModel.questions.length);
	// get the question template
	var questionTemplate = this.graphModel.questions[this.graphModel.questionIndex];
/*
	// do we need to replace any node placeholders?
	// What is the degree of node n? (How many edges does it connect to?)
	if this.graphModel.questionIndex == 2 {
		// choose a node with degree > 0 (so we know it was drawn)
		var randomNode = this.graphModel.randomNode();
		//
	// Is there an edge between <x> and <y>?
	} else if this.graphModel.questionIndex == 3 {

	}
*/
	// return the question string
	return questionTemplate;
}

// Create a new Controller for sim
// The controller interacts with the model and the view
var graphController = new GraphController();


$(document).ready(function() {
	// let smart sparrow know that the sim is ready to accept values
	pipit.Controller.notifyOnReady();
});
