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
		mastery: 'false',
		numerator: 4,
		denominator: 5,
		undirected: 'true',
	});
	// expose model data to Smart Sparrow
	pipit.CapiAdapter.expose('mastery', this.graphModel);
	pipit.CapiAdapter.expose('numerator', this.graphModel);
	pipit.CapiAdapter.expose('denominator', this.graphModel);
	// initialize the data model
	this.graphModel.initializeGraphModel();
	this.graphModel.initializeQuestions();
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
	this.graphView.drawGraph(this.graphModel.nodes, this.graphModel.edges, this.graphModel.get('undirected'));
	// display the next question
	this.graphView.presentQuestion();
}


GraphController.prototype.nextQuestion = function() {
	// choose a question index at random
	this.graphModel.questionIndex = getRandomInt(0, this.graphModel.questions.length);
	// get the corresponding question template
	var questionTemplate = this.graphModel.questions[this.graphModel.questionIndex];
	// start with an empty question string
	var questionString = "";
	// loop through every line of the template
	for (index = 0; index < questionTemplate.length; index++) {
		// get the next line of the template
		var templateString = questionTemplate[index];
		// add it to the question string
		questionString = questionString + templateString;
	}
	// store the answer(s)
	this.graphModel.setAnswers();
	console.log(this.graphModel.answers)
	// return the question string
	return questionString;
}


// Create a new Controller for sim
// The controller interacts with the model and the view
var graphController = new GraphController();


$(document).ready(function() {
	// let smart sparrow know that the sim is ready to accept values
	pipit.Controller.notifyOnReady();
});
