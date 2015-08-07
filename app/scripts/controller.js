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
	this.graphModel = new GraphModel({
		mastery: false,
		numerator: 4,
		denominator: 5
	});
	// expose model data to Smart Sparrow
	pipit.CapiAdapter.expose('mastery', this.graphModel);
	pipit.CapiAdapter.expose('numerator', this.graphModel);
	pipit.CapiAdapter.expose('denominator', this.graphModel);
	// initialize the data model
	this.graphModel.initializeGraphModel();
	this.graphModel.dumpGraph();
	// initialize the view
	this.graphView = new GraphView();
	this.updateDisplay();
}


GraphController.prototype.setModelValue = function(_name, _newValue) {
	this.graphModel.set(_name, _newValue);
}


GraphController.prototype.getModelValue = function(_name) {
	return this.graphModel.get(_name);
}


GraphController.prototype.updateDisplay = function() {
	this.graphView.drawAnswerHistory(this.graphModel.answerHistory);
	this.graphView.drawGraph(this, this.graphModel.nodes, this.graphModel.edges, this.graphModel.undirectedGraph);
}


// Create a new Controller for sim
// The controller interacts with the model and the view
var graphController = new GraphController();


$(document).ready(function() {
	// let smart sparrow know that the sim is ready to accept values
	pipit.Controller.notifyOnReady();
});
