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
	// initialize the view
	this.graphView = new GraphView(this);
	this.setupDisplay();
}


GraphController.prototype.setModelValue = function(_name, _newValue) {
	this.graphModel.set(_name, _newValue);
	// pipit.CapiAdapter.expose(_name, this.graphModel);
	// pipit.Controller.notifyOnReady();
	// console.log('mastery = ' + this.graphModel.get('mastery'))
}


GraphController.prototype.getModelValue = function(_name) {
	return this.graphModel.get(_name);
}


GraphController.prototype.triggerCheck = function() {
	pipit.Controller.triggerCheck();
}

GraphController.prototype.setupDisplay = function() {
	// create a brand new graph - randomly choose nodes and edges
	this.graphModel.createNewGraph();
	// choose a new set of random questions
	this.graphModel.createNewQuestions();
	// choose a question randomly
	this.chooseQuestion();
	// store the answer(s) to the question we chose in the last step
	this.graphModel.setAnswers();
	// draw the results for the last five questions
	this.graphView.drawAnswerHistory(this.graphModel.answerHistory);
	// draw the graph on the screen
	this.graphView.drawGraph(this.graphModel.nodes, this.graphModel.edges, this.graphModel.get('undirected'));
	// display the next question
	this.graphView.presentQuestion();
}


GraphController.prototype.chooseQuestion = function() {
	// choose a question index at random
	this.graphModel.questionIndex = getRandomInt(0, this.graphModel.questions.length);
	// get the corresponding question template
	var questionTemplate = this.graphModel.questions[this.graphModel.questionIndex];
	// start with an empty question string
	this.graphModel.question = "";
	// loop through every line of the template
	for (index = 0; index < questionTemplate.length; index++) {
		// get the next line of the template
		var templateString = questionTemplate[index];
		// add it to the question string
		this.graphModel.question = this.graphModel.question + templateString;
	}
}


// Create a new Controller for sim
// The controller interacts with the model and the view
var graphController = new GraphController();


$(document).ready(function() {
	// let smart sparrow know that the sim is ready to accept values
	pipit.Controller.notifyOnReady();
});
