/*
 * models.js
 * Rich Simpson
 * August 4, 2015
 *
 * This code implements a mastery-based exercise on graph
 * theory for integration with Smart Sparrow.
 *
 * This is our data model - The M in MVC
 */


/*
 * I use this function to empty out all of the arrays that
 * I use in this program.
 */
function emptyOutArray(myArray) {
	myArray.length = 0;
}


// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/*
 * GraphNode represents the nodes within the state space graph.
 * A graph node has a unique ID. Depending on the search
 * algorithm being used, it may or may not have a heuristic
 * value indicating the node's distance from the goal node,
 * where a larger value indicates greater distance from the
 * goal. The node also has an array for keeping track of all
 * the times it appears in the search tree.
 */
function GraphNode(_nodeID) {
	// Node ID - unique for each node in graph
	this.nodeID = _nodeID || '';
} // GraphNode


/*
 * GraphEdge represents the edges/arcs between nodes in the
 * graph. A graph edge has a start node, an end node and a
 * cost, which may or may not be considered by the search
 * algorithm. For an undirected edge, you can either treat
 * a single edge as undirected or create two separate edges.
 */
function GraphEdge(_fromNodeID, _toNodeID, _cost) {
	// start node
	this.fromNodeID = _fromNodeID || '';
	// end node
	this.toNodeID = _toNodeID || '';
	// cost of edge (g value)
	this.cost = _cost || 0;
} // GraphEdge


/*
 * The GraphModel consists of an array of nodes and an array
 * of edges.
 */
function GraphModel(_attrs, _undirected) {
	// we want GraphModel to inherit from CapiModel so SmartSparrow
	// can access values within the model - here I call the CapiModel
	// constructor
	pipit.CapiAdapter.CapiModel.call(this, _attrs)
	// array of nodes - starts off empty
	this.nodes = [];
	// array of edges - starts off empty
	this.edges = [];
	// the graph is directed or undirected
	this.undirectedGraph = _undirected || true;

	// we need to keep track of the last <x> answers we've gotten
	// so we can test for mastery. we use an array as a queue that
	// stores as many answers as we're willing to consider
	console.log('denominator = ' + this.get('denominator'));
	this.answerHistory = [];
	for (var i = 0; i < this.get('denominator'); i++) {
		this.answerHistory.push(null);
	}

	// the things below are in the data model so I don't declare them here
	// this flag is set to true when the mastery condition is reached
	//this.mastery = false;
	// this is the numerator for the mastery condition - how many right
	//this.masteryNumerator = 4;
	// this is the denominator for the mastery condition - out of how many total?
	//this.masteryDenominator = 5;
} // GraphModel


/*
 * This defines CapiModel as the prototype for GraphModel, so we inherit
 * from CapiModel
 */
GraphModel.prototype = new pipit.CapiAdapter.CapiModel;


GraphModel.prototype.initializeGraph = function() {
	// This as a quick, cheap way to store IDs
	// for the nodes in the graph. I'm using an object as
	//  a dictionary with nodeID:neighbors pairs.
	var nodeList = {A:3, B:5, C:3, D:5,
	 				E:8, F:5, G:3, H:5,
	 				I:3};
	// Add some nodes to the state space graph
	// loop over all of the nodes in the node list
	for (var nodeID in nodeList) {
		// add the node to the graph
		this.addNodeToGraph(nodeID);
	}
	// This as a quick, cheap way to store initial values
	// for the edges in the graph. I'm using an object as a dictionary
	// of dictionaries with startNodeID:{edge} pairs, where each
	// {edge} consists of endNodeID:cost pairs
	var edgeList = {
		A:{B:-1, D:-1, E:-1},
		B:{A:-1, C:-1, D:-1, E:-1, F:-1},
		C:{B:-1, E:-1, F:-1},
		D:{A:-1, B:-1, E:-1, G:-1, H:-1},
		E:{A:-1, B:-1, C:-1, D:-1, F:-1, G:-1, H:-1, I:-1},
		F:{B:-1, C:-1, E:-1, H:-1, I:-1},
		G:{D:-1, E:-1, H:-1},
		H:{D:-1, E:-1, F:-1, G:-1, I:-1},
		I:{E:-1, F:-1, H:-1},
	};
	// loop over all the start nodes
	for (var startNodeID in edgeList) {
		// make an array containing all of the nodes the start node connects to
		var neighbors = [];
		for (var endNodeID in edgeList[startNodeID]) {
			neighbors.push(endNodeID);
		}
		// choose some number to remove
		var removeCount = getRandomInt(0, neighbors.length);
		// randomly choose that many nodes to remove
		for (var count = 0; count < removeCount; count++) {
			// pick a random index
			index = getRandomInt(0, neighbors.length);
			// pull that item out of the array
			neighbors.splice(index, 1);
		}
		// create an edge for all the nodes remaining in the neighbors array
		for (var i=0; i < neighbors.length; i++) {
			// pick a random cost for the edge
			var randCost = getRandomInt(0, 10);
			// add the edge and its cost to the graph model
			this.addEdgeToGraph(startNodeID, neighbors[i], randCost);
			// if this is an undirected graph, then add an edge in the other direction
			if (this.undirectedGraph) {
				// add the "opposite" edge and its cost to the graph model
				this.addEdgeToGraph(neighbors[i], startNodeID, randCost);
			}
		}
	}
}


/*
 * Return the graph to its starting state: no nodes and no edges
 */
GraphModel.prototype.reset = function() {
	// array of nodes - starts off empty
	emptyOutArray(this.nodes);
	// array of edges - starts off empty
	emptyOutArray(this.edges);
}


/*
 * This function returns the index of a tree node based on its ID
 */
GraphModel.prototype.findNode = function(nodeID) {
	// loop through nodes in tree
	for	(var index = 0; index < this.nodes.length; index++) {
		// check whether the current nodeID is the target nodeID
	    if (this.nodes[index].nodeID == nodeID)
	    	// return the index of the target nodeID within the
	    	// node array
	    	return index;
	}
	// return -1 to indicate that the nodeID wasn't found
	return -1;
}


/*
 * This function returns the index of an edge based on its
 * fromNodeID and toNodeID
 */
GraphModel.prototype.findEdge = function(fromNodeID, toNodeID) {
	// loop through edges in tree
	for	(var index = 0; index < this.edges.length; index++) {
		// check whether the current nodeID is the target nodeID
	    if (this.edges[index].fromNodeID == fromNodeID &&
	    	this.edges[index].toNodeID == toNodeID)
	    	// return the index of the target nodeID within the
	    	// node array
	    	return index;
	}
	// return -1 to indicate that the nodeID wasn't found
	return -1;
}


/*
 * This function returns the cost of an edge based on its
 * fromNodeID and toNodeID
 */
GraphModel.prototype.findEdgeCost = function(fromNodeID, toNodeID) {
	// loop through edges in tree
	for	(var index = 0; index < this.edges.length; index++) {
		// check whether the current nodeID is the target nodeID
	    if (this.edges[index].fromNodeID == fromNodeID &&
	    	this.edges[index].toNodeID == toNodeID)
	    	// return the index of the target nodeID within the
	    	// node array
	    	return this.edges[index].cost;
	}
	// return -1 to indicate that the nodeID wasn't found
	return -1;
}


/*
 * This function is used to add a node to the nodes array
 */
GraphModel.prototype.addNodeToGraph = function(nodeID) {
	// does the node already exist?
	if (this.findNode(nodeID) >= 0) return;
	// Create a GraphNode object
	var newGraphNode = new GraphNode(nodeID);
	// Add GraphNode object to end of array of nodes
	this.nodes.push(newGraphNode);
}


/*
 * This function is used to add an edge to the edges array
 */
GraphModel.prototype.addEdgeToGraph = function(fromNodeID, toNodeID, cost) {
	// are the from and to nodes the same?
	if (fromNodeID == toNodeID) return;
	// Is cost > 0?
	if (cost < 0) return;
	// does the from node already exist?
	if (this.findNode(fromNodeID) < 0) return;
	// does the to node already exist?
	if (this.findNode(toNodeID) < 0) return;
	// does the edge already exist?
	if (this.findEdge(fromNodeID, toNodeID) >= 0) return;
	// Create a GraphEdge object
	var newGraphEdge = new GraphEdge(fromNodeID, toNodeID, cost);
	// Add GraphEdge object to array of edges
	this.edges.push(newGraphEdge);
}


/*
 * This function dumps the contents of the node array in no particular
 * order.
 */
GraphModel.prototype.dumpGraph = function() {
	// loop through the nodes array
	for	(var index = 0; index < this.nodes.length; index++) {
		// print out ID of each node
		console.log("Index: " + index + " ID: " + this.nodes[index].nodeID);
	}
	// loop through the edges array
	for	(var index = 0; index < this.edges.length; index++) {
		// print out details about each edge
		console.log("Index: " + index + " fromID: " + this.edges[index].fromNodeID
						+ " toID: " + this.edges[index].toNodeID);

	}
}

/*
 * This function deletes all nodes with no edges in it
 */
/*
GraphModel.prototype.deleteNodesWithNoEdges = function(){
	//	loop through the node array
	for (var i in this.graph.nodes){
		// check the degree of the node
		if (this.degreeCounter(this.graph.nodes[i].nodeID) == 0) {
			// delete the node if the node has no edges
			this.graph.nodes.splice(i,1);
		}
	}
}


/*
 * This function counts how many edges a given node has
 */
/*
GraphModel.prototype.degreeCounter = function(node){
	var counter = 0;
	//	loop through the node array
	for (var i in this.graph.nodes){
		// is there an egde between the given node and the node in the array?
		if (this.graph.findEdge(node,this.graph.nodes[i].nodeID) != -1 ||
		 this.graph.findEdge(this.graph.nodes[i].nodeID,node) != -1){
		 	// count it
			counter += 1;
		}
	}
	return counter;
}
*/

/*
 * This function returns a list of all the nodes in the graph.
 */
GraphModel.prototype.nodeList = function() {
// 	console.log("-----Node List-----");
	// create empty array to store list
	var nodeList = [];
	// loop through the nodes array
	for	(var index = 0; index < this.nodes.length; index++) {
		// add nodeID to path
		nodeList[nodeList.length] = this.nodes[index].nodeID;
	}
	// return list of nodes
	return nodeList;
}
