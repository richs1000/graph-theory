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
 * Create the data model
 */
/*
var dataModel = new GraphModel({
    mastery: false,
    numerator: 4,
    denominator: 5
});

// expose model data to Smart Sparrow
pipit.CapiAdapter.expose('mastery', dataModel);
pipit.CapiAdapter.expose('numerator', dataModel);
pipit.CapiAdapter.expose('denominator', dataModel);
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

	// initialize the graph
	this.graphModel.initializeGraph();
	this.graphModel.dumpGraph();

	this.graphView = new GraphView();
}


GraphController.prototype.drawGraph = function() {
	// get the list of nodes from the model
	nodeList = this.graphModel.nodeList();
	// tell the view to draw the nodes
	this.graphView.drawNodes(nodeList);
}


// Create a new Controller for sim
var graphController = new GraphController();


$(document).ready(function() {
	// let smart sparrow know that the sim is ready to accept values
	pipit.Controller.notifyOnReady();
});
