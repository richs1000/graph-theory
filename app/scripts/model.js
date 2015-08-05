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
function GraphModel(_attrs, _directed) {
	// we want GraphModel to inherit from CapiModel so SmartSparrow
	// can access values within the model - here I call the CapiModel
	// constructor
	pipit.CapiAdapter.CapiModel.call(this, _attrs)
	// array of nodes - starts off empty
	this.nodes = [];
	// array of edges - starts off empty
	this.edges = [];
	// the graph is undirected
	this.directedGraph = _directed || false;
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


/*
GraphModel.prototype.initializeGraph = function() {
	// This as a quick, cheap way to store initial values
	// for the nodes in the graph. I'm using an object as
	//  a dictionary with nodeID:heuristic pairs.
	var nodeList = {A:7, B:6, C:5, D:4,
					E:6, F:5, G:4, H:3,
					I:5};

	// Add some nodes to the state space graph
	// loop over all of the nodes in the node list
	for (var nodeID in nodeList) {
		// add the node and its heuristic value to the graph
		this.addNodeToGraph(nodeID, nodeList[nodeID]);
	}
	// This as a quick, cheap way to store initial values
	// for the edges in the graph. I'm using an object as a dictionary
	// of dictionaries with startNodeID:{edge} pairs, where each
	// {edge} consists of endNodeID:cost pairs
	var edgeList = {
		A:{B:-1, E:-1, F:-1},
		B:{A:-1, C:-1, E:-1, F:-1, G:-1},
		C:{B:-1, D:-1, F:-1, G:-1, H:-1},
		D:{C:-1, G:-1, H:-1},
		E:{A:-1, B:-1, F:-1, I:-1},
		F:{A:-1, B:-1, C:-1, E:-1, G:-1, I:-1},
		G:{B:-1, C:-1, D:-1, F:-1, H:-1},
		H:{C:-1, D:-1, G:-1},
		I:{E:-1, F:-1},
	};
	// loop over all of the start nodes
	for (var startNodeID in edgeList) {
		// loop over all of the nodes the start node connects to
		for (var endNodeID in edgeList[startNodeID]) {
			// we only want to add some of the possible edges
			// pick a random number
			var randNum = Math.floor(Math.random() * 100) + 1;
			// we want about 33% of edges
			if (randNum <= 33) {
				// pick a random cost for the edge
				var randCost = Math.floor(Math.random() * 10) + 1;
				// add the edge and its cost to the graph model
				this.addEdgeToGraph(startNodeID, endNodeID, randCost);
				// if this is an undirected graph, then add an edge in the other direction
				if (true) {
					// add the "opposite" edge and its cost to the graph model
					this.addEdgeToGraph(endNodeID, startNodeID, randCost);
				}
			}
		}
	}
	// delete all nodes that does not have any edges attached at it
	this.deleteNodesWithNoEdges();
}
*/


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
/*
GraphModel.prototype.addNodeToGraph = function(nodeID, heuristic) {
	// is the heuristic less than zero?
	if (heuristic < 0) return;
	// does the node already exist?
	if (this.graph.findNode(nodeID) >= 0) return;
	// Create a GraphNode object
	var newGraphNode = new GraphNode();
	// Initialize object values
	newGraphNode.nodeID = nodeID;
	newGraphNode.heuristic = heuristic;
	// Add GraphNode object to array of nodes
	this.nodes[this.nodes.length] = newGraphNode;
}
*/

/*
 * This function is used to add an edge to the edges array
 */
/*
GraphModel.prototype.addEdgeToGraph = function(fromNodeID, toNodeID, cost) {
	// are the from and to nodes the same?
	if (fromNodeID == toNodeID) return;
	// Is cost > 0?
	if (cost < 0) return;
	// does the from node already exist?
	if (this.graph.findNode(fromNodeID) < 0) return;
	// does the to node already exist?
	if (this.graph.findNode(toNodeID) < 0) return;
	// does the edge already exist?
	if (this.graph.findEdge(fromNodeID, toNodeID) >= 0) return;

	// Create a GraphEdge object
	var newGraphEdge = new GraphEdge();
	// initialize values
	newGraphEdge.fromNodeID = fromNodeID;
	newGraphEdge.toNodeID = toNodeID;
	newGraphEdge.cost = cost;
	// Add GraphEdge object to array of edges
	this.graph.edges[this.graph.edges.length] = newGraphEdge;
}
*/

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
