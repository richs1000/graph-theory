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
 * I use the Question class to store the question string and
 * the acceptable answer(s)
 */
function Question(_question, _answers) {
	// the question is a string that can be displayed to the user
	this.question = _question;
	// answers are stored in an array, to accommodate questions with
	// multiple answers
	this.answers = _answers;
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
function GraphModel(_controller, _attrs) {
	// save a link to the controller
	this.controller = _controller;
	// we want GraphModel to inherit from CapiModel so SmartSparrow
	// can access values within the model - here I call the CapiModel
	// constructor
	pipit.CapiAdapter.CapiModel.call(this, _attrs)
	// we need to keep track of the last <x> answers we've gotten
	// so we can test for mastery. we use an array as a queue that
	// stores as many answers as we're willing to consider
	this.answerHistory = [];
	for (var i = 0; i < this.get('denominator'); i++) {
		this.answerHistory.push(null);
	}

	//
	// questions
	//

	// the things below are in the data model so I don't declare them here
	// this flag is set to true when the mastery condition is reached
	//this.mastery = false;
	// this is the numerator for the mastery condition - how many right
	//this.masteryNumerator = 4;
	// this is the denominator for the mastery condition - out of how many total?
	//this.masteryDenominator = 5;
	// // the graph is directed or undirected
	// this.undirected = _undirected;
} // GraphModel


/*
 * This defines CapiModel as the prototype for GraphModel, so we inherit
 * from CapiModel
 */
GraphModel.prototype = new pipit.CapiAdapter.CapiModel;


/*
* This function empties out any old nodes from a previous graph and
* creates brand new nodes.
 * This function also gets rid of any old edges and then stores three
 * equivalent representations of the connections between nodes. The
 * edges list is what I actually use internally. The adjacency list
 * and adjacency matrix are used to answer questions posed to the
 * user.
*/
GraphModel.prototype.initializeGraphModel = function() {
	// reset array of nodes
	this.nodes = [];
// reset array of edges - starts off empty
	this.edges = [];
	// adjacency list - used to answer questions
	// here I'm treating an object like a dictionary of lists, indexed by
	// the node index
	this.adjacencyList = {A:[], B:[], C:[], D:[], E:[], F:[], G:[], H:[], I:[]};
	// adjacency matrix - used to answer questions
	// rows are indexed by start of edge, columns are indexed by end of edge
	// items are indexed as adjacencyMatrix[from][to]
	this.adjacencyMatrix = [
		[0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0],
	];
	// This as a quick, cheap way to store each node's neighbors.
	// I'm using an object as a dictionary of lists, where each
	// list contains all the nodes that could connect to the index
	// node
	// if the graph is undirected, I only consider half the possible
	// edges
	if (this.get('undirected')) {
		var neighborDict = {
			A:['B', 'D', 'E'],
			B:['C', 'D', 'E', 'F'],
			C:['E', 'F'],
			D:['E', 'G', 'H'],
			E:['F', 'G', 'H', 'I'],
			F:['H', 'I'],
			G:['H'],
			H:['I'],
			I:[],
		};
	// otherwise, I have to consider all of them
	} else {
		var neighborDict = {
			A:['B', 'D', 'E'],
			B:['A', 'C', 'D', 'E', 'F'],
			C:['B', 'E', 'F'],
			D:['A', 'B', 'E', 'G', 'H'],
			E:['A', 'B', 'C', 'D', 'F', 'G', 'H', 'I'],
			F:['B', 'C', 'E', 'H', 'I'],
			G:['D', 'E', 'H'],
			H:['D', 'E', 'F', 'G', 'I'],
			I:['E', 'F', 'H'],
		};
	}
	// create nodes and edges
	for (var startNodeID in neighborDict) {
		// add the node to our list of nodes
		this.addNodeToGraph(startNodeID);
		// choose some number of neighbors to remove (at least one, maybe all)
		var removeCount = getRandomInt(1, neighborDict[startNodeID].length + 1);
		// randomly choose that many nodes to remove
		for (var count = 0; count < removeCount; count++) {
			// pick a random index
			index = getRandomInt(0, neighborDict[startNodeID].length);
			// pull that item out of the array
			neighborDict[startNodeID].splice(index, 1);
		}
		// create an edge for all the nodes remaining in the neighbors array
		for (var i=0; i < neighborDict[startNodeID].length; i++) {
			// pick a random cost for the edge
			var randCost = getRandomInt(0, 10);
			// add the edge and its cost to the graph model
			this.addEdgeToGraph(startNodeID, neighborDict[startNodeID][i], randCost);
			// if this is an undirected graph, then add an edge in the other direction
			if (this.get('undirected')) {
				// add the "opposite" edge and its cost to the graph model
				this.addEdgeToGraph(neighborDict[startNodeID][i], startNodeID, randCost);
			}
		}
	}
	console.log(this.adjacencyList)
}


/*
 * Create a new set of question templateString
 */
GraphModel.prototype.initializeQuestions = function() {
	// Each question template is an array holding either strings
  // or executable commands stored as strings.
  this.questions = [
 	 ["How many nodes does this graph have?"],
 	 ["What is the cardinality of this graph?"],
 	 ["What is the degree of node ",
 		this.randomNode().nodeID,
 		"?"],
 	 ["True or False: There an edge between node ",
 		this.randomNode().nodeID,
 		" and node ",
 		this.randomNode().nodeID]
  ];
  // the question index is used to rotate through the questions
  this.questionIndex = 0;
	// the answer(s) is/are stored in an array
	this.answers = [];
}


/*
 * Set the answer(s) to the question indicated by questionIndex.
 * Right now I'm using a really clunky approach. I'm sure there's
 * a better way.
 */
GraphModel.prototype.setAnswers = function() {
	// How many nodes does this graph have?
	if (this.questionIndex == 0) {
		this.answers.push(this.connectedNodeList().length);
	// What is the cardinality of this graph?
	} else if (this.questionIndex == 1) {
		this.answers.push(this.cardinality());
	// What is the degree of node _x_?
	} else if (this.questionIndex == 2) {
		// what's the ID of the node?
		var nodeID = this.questions[this.questionIndex][1];
		// use the ID to get a pointer to the node
		var node = this.nodes[this.findNode(nodeID)];
		// get the degree of the node
		this.answers.push(this.degree(node));
	// True or False: There is an edge between node _x_ and node_y_
	} else if (this.questionIndex == 3) {
		// what's the ID of node X?
		var nodeXID = this.questions[this.questionIndex][1];
		// what's the ID of node Y?
		var nodeYID = this.questions[this.questionIndex][3];
		// find out if there is an edge between the two nodes
		var answer = this.findEdge(nodeXID, nodeYID) >= 0;
		// save the answer
		this.answers.push(answer);
	}
}

/*
 * Choose a random node for use in a question
 */
GraphModel.prototype.randomNode = function() {
	// choose a random index
	var index = getRandomInt(0, this.nodes.length);
	// make sure the node has degree > 0
	while (this.degree(this.nodes[index]) <= 0) {
		// keep looking until you find a node that works
		index = (index + 1) % this.nodes.length;
	}
	// return the node
	return this.nodes[index];
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
	// does the edge already exist?
	if (this.findEdge(fromNodeID, toNodeID) >= 0) return;
	// Create a GraphEdge object
	var newGraphEdge = new GraphEdge(fromNodeID, toNodeID, cost);
	// Add GraphEdge object to array of edges
	this.edges.push(newGraphEdge);
	// add edge to the adjacency list
	this.adjacencyList[fromNodeID].push({toNodeID:cost});
	// add edge to the adjacency matrix
	this.adjacencyMatrix[fromNodeID.charCodeAt(0) - 'A'.charCodeAt()][toNodeID.charCodeAt(0) - 'A'.charCodeAt()] = cost;
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
 * This function is used to answer questions about a graph's cardinality
 * i.e., how many edges are in the graph
 */
GraphModel.prototype.cardinality = function() {
	if (this.get('undirected')) {
		return this.edges.length / 2;
	} else {
		return this.edges.length;
	}
}

/*
 * These functions count how many edges a given node has
 */
GraphModel.prototype.degree = function(node) {
	var counter = 0;
	// if this is an undirected graph, count each edge once
	if (this.get('undirected')) {
		//	loop through the node array
		for (var i in this.nodes){
			// is there an egde between the given node and the node in the array?
			if (this.findEdge(node.nodeID, this.nodes[i].nodeID) != -1) {
			 	// count it
				counter += 1;
			}
		}
		// divide by two, because we count each node twice
		return counter;
	// if this is a directed graph, add up the in and out degrees
	} else {
		return this.inDegree(node) + this.outDegree(node);
	}
}


GraphModel.prototype.inDegree = function(node){
	var counter = 0;
	//	loop through the node array
	for (var i in this.nodes){
		// is there an edge to the given node from the node in the array?
		if (this.findEdge(this.nodes[i].nodeID, node.nodeID) != -1) {
		 	// count it
			counter += 1;
		}
	}
	return counter;
}


GraphModel.prototype.outDegree = function(node){
	var counter = 0;
	//	loop through the node array
	for (var i in this.nodes){
		// is there an egde from the given node to the node in the array?
		if (this.findEdge(node.nodeID, this.nodes[i].nodeID) != -1) {
		 	// count it
			counter += 1;
		}
	}
	return counter;
}


/*
 * This function returns a list of all the nodes in the graph.
 */
GraphModel.prototype.nodeList = function() {
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


/*
 * This function returns a list of all nodes with degree >= 1
 */
GraphModel.prototype.connectedNodeList = function() {
	// create empty array to store list
	var nodeList = [];
	// loop through the nodes array
	for	(var index = 0; index < this.nodes.length; index++) {
		if (this.degree(this.nodes[index]) > 0)
			// add nodeID to list
			nodeList[nodeList.length] = this.nodes[index].nodeID;
	}
	// return list of nodes
	return nodeList;
}
