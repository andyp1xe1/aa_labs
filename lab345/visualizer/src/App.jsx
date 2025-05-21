import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const algorithms = {
  bfs: async (graph, startNode) => {
    const visited = new Set();
    const queue = [startNode];
    visited.add(startNode);
    const proc = [];
    // For tree visualization
    const tree = {};
    Object.keys(graph).forEach(node => {
      tree[node] = null;
    });

    while (queue.length > 0) {
      const vertex = queue.shift();

      for (const [neighbor, weight] of Object.entries(graph[vertex] || {})) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
          proc.push([vertex, neighbor, weight]);
          // Track parent for tree visualization
          tree[neighbor] = vertex;
          await new Promise(resolve => setTimeout(resolve, 500)); // Animation delay
        }
      }
    }
    return { explored: proc, tree };
  },

  dfs: async (graph, startNode) => {
    const visited = new Set();
    const proc = [];
    // For tree visualization
    const tree = {};
    Object.keys(graph).forEach(node => {
      tree[node] = null;
    });

    const dfsHelper = async (currentNode, parent = null) => {
      visited.add(currentNode);
      if (parent !== null) {
        tree[currentNode] = parent;
      }

      for (const [neighbor, weight] of Object.entries(graph[currentNode] || {})) {
        if (!visited.has(neighbor)) {
          proc.push([currentNode, neighbor, weight]);
          await new Promise(resolve => setTimeout(resolve, 500)); // Animation delay
          await dfsHelper(neighbor, currentNode);
        }
      }
    };

    await dfsHelper(startNode);
    return { explored: proc, tree };
  },

  dijkstra: async (graph, startNode) => {
    const distances = {};
    const prev = {};
    const explored = [];
    const nodes = Object.keys(graph);

    // Initialize distances
    for (const node of nodes) {
      distances[node] = Infinity;
    }
    distances[startNode] = 0;

    const unvisited = new Set(nodes);

    while (unvisited.size > 0) {
      // Find the unvisited node with the smallest distance
      let current = null;
      let smallestDistance = Infinity;

      for (const node of unvisited) {
        if (distances[node] < smallestDistance) {
          smallestDistance = distances[node];
          current = node;
        }
      }

      // If smallest distance is infinity, then remaining nodes are unreachable
      if (smallestDistance === Infinity) break;

      unvisited.delete(current);

      // Check each neighbor of current node
      for (const [neighbor, weight] of Object.entries(graph[current] || {})) {
        explored.push([current, neighbor, weight]);
        await new Promise(resolve => setTimeout(resolve, 200));

        const distance = distances[current] + parseInt(weight);
        if (distance < distances[neighbor]) {
          distances[neighbor] = distance;
          prev[neighbor] = current;
        }
      }
    }

    // Construct shortest path tree edges
    const shortestPathTree = [];
    for (const node in prev) {
      if (prev[node]) {
        const weight = graph[prev[node]][node];
        shortestPathTree.push([prev[node], node, weight]);
      }
    }

    return { explored, distances, prev, shortestPathTree };
  },

  prims: async (graph, startNode) => {
    if (Object.keys(graph).length === 0) return { mst: [] };

    const visited = new Set();
    const mst = [];
    visited.add(startNode);

    // Create a priority queue (using sorted array for visualization)
    const edges = [];

    // Add all edges from startNode to the priority queue
    for (const [neighbor, weight] of Object.entries(graph[startNode] || {})) {
      edges.push([parseInt(weight), startNode, neighbor]);
    }

    edges.sort((a, b) => a[0] - b[0]);

    while (edges.length > 0 && visited.size < Object.keys(graph).length) {
      // Extract minimum edge
      const [weight, fromNode, toNode] = edges.shift();

      if (visited.has(toNode)) continue;

      visited.add(toNode);
      mst.push([fromNode, toNode, weight]);
      await new Promise(resolve => setTimeout(resolve, 500)); // Animation delay

      // Add all edges from toNode to the priority queue
      for (const [neighbor, edgeWeight] of Object.entries(graph[toNode] || {})) {
        if (!visited.has(neighbor)) {
          // Insert maintaining sorted order
          const weight = parseInt(edgeWeight);
          let inserted = false;
          for (let i = 0; i < edges.length; i++) {
            if (weight < edges[i][0]) {
              edges.splice(i, 0, [weight, toNode, neighbor]);
              inserted = true;
              break;
            }
          }
          if (!inserted) {
            edges.push([weight, toNode, neighbor]);
          }
        }
      }
    }

    return { explored: mst, mst };
  },

  kruskal: async (graph) => {
    // Union-Find data structure
    const findParent = (parents, node) => {
      if (parents[node] !== node) {
        parents[node] = findParent(parents, parents[node]);
      }
      return parents[node];
    };

    const union = (parents, ranks, x, y) => {
      const rootX = findParent(parents, x);
      const rootY = findParent(parents, y);

      if (rootX === rootY) return;

      if (ranks[rootX] < ranks[rootY]) {
        parents[rootX] = rootY;
      } else if (ranks[rootX] > ranks[rootY]) {
        parents[rootY] = rootX;
      } else {
        parents[rootY] = rootX;
        ranks[rootX] += 1;
      }
    };

    // Extract all edges from the graph
    const edges = [];
    Object.entries(graph).forEach(([source, neighbors]) => {
      Object.entries(neighbors).forEach(([target, weight]) => {
        edges.push([source, target, parseInt(weight)]);
      });
    });

    // Sort edges by weight
    edges.sort((a, b) => a[2] - b[2]);

    const nodes = Object.keys(graph);
    const parents = {};
    const ranks = {};
    const explored = [];

    // Initialize Union-Find
    for (const node of nodes) {
      parents[node] = node;
      ranks[node] = 0;
    }

    const mst = [];

    for (const [source, target, weight] of edges) {
      explored.push([source, target, weight]);
      await new Promise(resolve => setTimeout(resolve, 500)); // Animation delay

      const sourceRoot = findParent(parents, source);
      const targetRoot = findParent(parents, target);

      // Add the edge if it doesn't create a cycle
      if (sourceRoot !== targetRoot) {
        mst.push([source, target, weight]);
        union(parents, ranks, sourceRoot, targetRoot);
      }
    }

    return { explored, mst };
  },

  floydWarshall: async (graph) => {
    const nodes = Object.keys(graph);
    const n = nodes.length;

    // Initialize distance matrix
    const dist = Array(n).fill().map(() => Array(n).fill(Infinity));

    // Map node IDs to indices
    const nodeIndex = {};
    nodes.forEach((node, index) => {
      nodeIndex[node] = index;
    });

    // Initialize with direct edge weights
    for (let i = 0; i < n; i++) {
      dist[i][i] = 0;
    }

    Object.entries(graph).forEach(([source, neighbors]) => {
      const i = nodeIndex[source];
      Object.entries(neighbors).forEach(([target, weight]) => {
        const j = nodeIndex[target];
        dist[i][j] = parseInt(weight);
      });
    });

    const exploredEdges = [];
    const pathPairs = [];

    // Floyd-Warshall algorithm
    for (let k = 0; k < n; k++) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (dist[i][k] !== Infinity && dist[k][j] !== Infinity &&
            dist[i][k] + dist[k][j] < dist[i][j]) {
            dist[i][j] = dist[i][k] + dist[k][j];

            // For visualization
            if (i !== j && i !== k && j !== k) {
              exploredEdges.push([nodes[i], nodes[j], dist[i][j]]);
              // Record that a path was found between i and j
              pathPairs.push([nodes[i], nodes[j]]);
              await new Promise(resolve => setTimeout(resolve, 200)); // Animation delay
            }
          }
        }
      }
    }

    return { explored: exploredEdges, distances: dist, nodeIndex, nodes, pathPairs };
  }
};

function generateGraph(type, size, directed = false) {
  const graph = {};

  for (let i = 0; i < size; i++) {
    graph[i.toString()] = {};
  }

  const addEdge = (from, to, weight) => {
    graph[from][to] = weight;
    if (!directed) {
      graph[to][from] = weight;
    }
  };

  switch (type) {
    case 'complete':
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (i !== j) {
            const weight = Math.floor(Math.random() * 10) + 1;
            addEdge(i.toString(), j.toString(), weight);
          }
        }
      }
      break;

    case 'dense':
      // About 80% of max edges
      const maxEdges = directed ? size * (size - 1) : size * (size - 1) / 2;
      const edgesToAdd = Math.floor(maxEdges * 0.8);

      // First ensure the graph is connected
      for (let i = 1; i < size; i++) {
        const j = i - 1;
        const weight = Math.floor(Math.random() * 10) + 1;
        addEdge(j.toString(), i.toString(), weight);
      }

      // Add remaining edges randomly
      let addedEdges = size - 1; // already added n-1 edges
      while (addedEdges < edgesToAdd) {
        const i = Math.floor(Math.random() * size);
        const j = Math.floor(Math.random() * size);
        if (i !== j && !graph[i.toString()][j.toString()]) {
          const weight = Math.floor(Math.random() * 10) + 1;
          addEdge(i.toString(), j.toString(), weight);
          addedEdges++;
        }
      }
      break;

    case 'sparse':
      // First ensure the graph is connected
      for (let i = 1; i < size; i++) {
        const j = Math.floor(Math.random() * i);
        const weight = Math.floor(Math.random() * 10) + 1;
        addEdge(j.toString(), i.toString(), weight);
      }

      // Add a few extra edges
      const extraEdges = Math.floor(size * 0.3);
      for (let e = 0; e < extraEdges; e++) {
        const i = Math.floor(Math.random() * size);
        const j = Math.floor(Math.random() * size);
        if (i !== j && !graph[i.toString()][j.toString()]) {
          const weight = Math.floor(Math.random() * 10) + 1;
          addEdge(i.toString(), j.toString(), weight);
        }
      }
      break;

    case 'tree':
      for (let i = 1; i < size; i++) {
        const parent = Math.floor((i - 1) / 2);
        const weight = Math.floor(Math.random() * 10) + 1;
        addEdge(parent.toString(), i.toString(), weight);
      }
      break;

    case 'cyclic':
      // Create a cycle
      for (let i = 0; i < size; i++) {
        const next = (i + 1) % size;
        const weight = Math.floor(Math.random() * 10) + 1;
        addEdge(i.toString(), next.toString(), weight);
      }

      // Add a few extra edges
      const extraCyclicEdges = Math.floor(size * 0.3);
      for (let e = 0; e < extraCyclicEdges; e++) {
        const i = Math.floor(Math.random() * size);
        const j = Math.floor(Math.random() * size);
        if (i !== j && !graph[i.toString()][j.toString()]) {
          const weight = Math.floor(Math.random() * 10) + 1;
          addEdge(i.toString(), j.toString(), weight);
        }
      }
      break;

    case 'acyclic':
      // For a directed acyclic graph, ensure edges only go from lower to higher indices
      for (let i = 0; i < size; i++) {
        const edgesCount = Math.floor(Math.random() * 3) + 1; // 1-3 edges per node
        for (let e = 0; e < edgesCount; e++) {
          const j = i + Math.floor(Math.random() * (size - i - 1)) + 1;
          if (j < size) {
            const weight = Math.floor(Math.random() * 10) + 1;
            graph[i.toString()][j.toString()] = weight;
            // Note: For acyclic graphs, we don't add the reverse edge
          }
        }
      }
      break;

    case 'grid':
      const gridSize = Math.ceil(Math.sqrt(size));

      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const nodeId = (i * gridSize + j);
          if (nodeId < size) {
            // Connect to right neighbor
            if (j < gridSize - 1 && nodeId + 1 < size) {
              const weight = Math.floor(Math.random() * 10) + 1;
              addEdge(nodeId.toString(), (nodeId + 1).toString(), weight);
            }
            // Connect to bottom neighbor
            if (i < gridSize - 1 && nodeId + gridSize < size) {
              const weight = Math.floor(Math.random() * 10) + 1;
              addEdge(nodeId.toString(), (nodeId + gridSize).toString(), weight);
            }
          }
        }
      }
      break;

    default:
      // Default to a connected graph
      for (let i = 1; i < size; i++) {
        const j = Math.floor(Math.random() * i);
        const weight = Math.floor(Math.random() * 10) + 1;
        addEdge(j.toString(), i.toString(), weight);
      }

      // Add some random additional edges
      const extraConnectedEdges = Math.floor(Math.random() * size);
      for (let e = 0; e < extraConnectedEdges; e++) {
        const i = Math.floor(Math.random() * size);
        const j = Math.floor(Math.random() * size);
        if (i !== j && !graph[i.toString()][j.toString()]) {
          const weight = Math.floor(Math.random() * 10) + 1;
          addEdge(i.toString(), j.toString(), weight);
        }
      }
  }

  return graph;
}

const GraphVisualizer = () => {
  const [graph, setGraph] = useState({});
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bfs');
  const [startNode, setStartNode] = useState('0');
  const [graphType, setGraphType] = useState('connected');
  const [graphSize, setGraphSize] = useState(8);
  const [isDirected, setIsDirected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [exploredEdges, setExploredEdges] = useState([]);
  const [currentExploredIndex, setCurrentExploredIndex] = useState(-1);
  const [processingSpeed, setProcessingSpeed] = useState(500);
  const [algorithmResult, setAlgorithmResult] = useState(null);

  const svgRef = useRef(null);
  const simulationRef = useRef(null);

  useEffect(() => {
    handleGenerateGraph();
  }, []);

  useEffect(() => {
    if (Object.keys(graph).length) {
      createForceGraph();
    }
  }, [graph, isDirected]);

  useEffect(() => {
    if (exploredEdges.length > 0 && currentExploredIndex >= 0) {
      highlightExploredEdge(currentExploredIndex);
    }
  }, [currentExploredIndex, algorithmResult]);

  const handleGenerateGraph = () => {
    const newGraph = generateGraph(graphType, graphSize, isDirected);
    setGraph(newGraph);
    setExploredEdges([]);
    setCurrentExploredIndex(-1);
    setAlgorithmResult(null);
    setStartNode('0');
  };

  const handleAlgorithmChange = (e) => {
    setSelectedAlgorithm(e.target.value);
    setAlgorithmResult(null);
  };

  const handleStartNodeChange = (e) => {
    setStartNode(e.target.value);
  };

  const handleGraphTypeChange = (e) => {
    setGraphType(e.target.value);
  };

  const handleDirectedChange = (e) => {
    setIsDirected(e.target.checked);
  };

  const handleGraphSizeChange = (e) => {
    setGraphSize(parseInt(e.target.value));
  };

  const handleSpeedChange = (e) => {
    setProcessingSpeed(parseInt(e.target.value));
  };

  const runAlgorithm = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setExploredEdges([]);
    setCurrentExploredIndex(-1);
    setAlgorithmResult(null);

    try {
      const algorithm = algorithms[selectedAlgorithm];
      if (!algorithm) {
        console.error(`Algorithm ${selectedAlgorithm} not implemented`);
        return;
      }

      let result;
      
      if (selectedAlgorithm === 'kruskal') {
        result = await algorithm(graph);
        setExploredEdges(result.explored);
        setAlgorithmResult(result);

        // Animate the exploration
        for (let i = 0; i < result.explored.length; i++) {
          setCurrentExploredIndex(i);
          await new Promise(resolve => setTimeout(resolve, processingSpeed));
        }
      } else if (selectedAlgorithm === 'floydWarshall') {
        result = await algorithm(graph);
        setExploredEdges(result.explored);
        setAlgorithmResult(result);

        // Animate the exploration
        for (let i = 0; i < result.explored.length; i++) {
          setCurrentExploredIndex(i);
          await new Promise(resolve => setTimeout(resolve, processingSpeed));
        }
      } else {
        result = await algorithm(graph, startNode);
        setExploredEdges(result.explored);
        setAlgorithmResult(result);

        // Animate the exploration
        for (let i = 0; i < result.explored.length; i++) {
          setCurrentExploredIndex(i);
          await new Promise(resolve => setTimeout(resolve, processingSpeed));
        }
      }
      
      // Once animation completes, highlight final result
      displayFinalResult(result);
      
    } catch (error) {
      console.error('Error running algorithm:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const displayFinalResult = (result) => {
    const svg = d3.select(svgRef.current);
    
    // Reset all edges
    svg.selectAll("line")
      .attr("stroke", "#999")
      .attr("stroke-width", 1.5);
      
    // Display algorithm-specific results
    if (selectedAlgorithm === 'bfs' || selectedAlgorithm === 'dfs') {
      // Highlight traversal tree
      if (result && result.tree) {
        const treeEdges = [];
        for (const [node, parent] of Object.entries(result.tree)) {
          if (parent !== null) {
            treeEdges.push([parent, node]);
          }
        }
        
        svg.selectAll("line")
          .filter(d => {
            return treeEdges.some(edge => 
              d.source.id === edge[0] && d.target.id === edge[1]
            );
          })
          .attr("stroke", "#4CAF50")
          .attr("stroke-width", 3);
      }
    } 
    else if (selectedAlgorithm === 'dijkstra') {
      // Highlight shortest path tree
      if (result && result.shortestPathTree) {
        svg.selectAll("line")
          .filter(d => {
            return result.shortestPathTree.some(edge => 
              d.source.id === edge[0] && d.target.id === edge[1]
            );
          })
          .attr("stroke", "#2196F3")
          .attr("stroke-width", 3);
      }
    } 
    else if (selectedAlgorithm === 'prims' || selectedAlgorithm === 'kruskal') {
      // Highlight minimum spanning tree
      if (result && result.mst) {
        svg.selectAll("line")
          .filter(d => {
            return result.mst.some(edge => 
              (d.source.id === edge[0] && d.target.id === edge[1]) ||
              (!isDirected && d.source.id === edge[1] && d.target.id === edge[0])
            );
          })
          .attr("stroke", "#9C27B0")
          .attr("stroke-width", 3);
      }
    }
    else if (selectedAlgorithm === 'floydWarshall') {
      // Highlight all discovered shortest paths
      if (result && result.pathPairs) {
        svg.selectAll("line")
          .filter(d => {
            return result.pathPairs.some(pair => 
              d.source.id === pair[0] && d.target.id === pair[1]
            );
          })
          .attr("stroke", "#FF9800")
          .attr("stroke-width", 2);
      }
    }
  };

  const createForceGraph = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 400;

    const nodes = Object.keys(graph).map(node => ({ id: node }));
    const links = [];

    // Extract edges
    Object.entries(graph).forEach(([source, targets]) => {
      Object.entries(targets).forEach(([target, weight]) => {
        links.push({ source, target, weight });
      });
    });

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(40));

    simulationRef.current = simulation;

    // Create a group for the links
    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-width", 1.5);

    // Add arrowhead marker definition if directed
    if (isDirected) {
      svg.append("defs").selectAll("marker")
        .data(["end"])
        .enter().append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 25)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#999");

      link.attr("marker-end", "url(#arrowhead)");
    }

    // Create a group for link labels (weights)
    const linkLabels = svg.append("g")
      .attr("class", "link-labels")
      .selectAll("text")
      .data(links)
      .enter()
      .append("text")
      .text(d => d.weight)
      .attr("fill", "#555")
      .attr("font-size", "10px");

    // Create a group for the nodes
    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", 20)
      .attr("fill", "#69b3a2")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    // Create a group for the node labels
    const nodeLabels = svg.append("g")
      .attr("class", "node-labels")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .text(d => d.id)
      .attr("fill", "#fff")
      .attr("font-size", "12px")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central");

    // Define tick behavior
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      // Position link labels at the middle of the link
      linkLabels
        .attr("x", d => (d.source.x + d.target.x) / 2)
        .attr("y", d => (d.source.y + d.target.y) / 2);

      node
        .attr("cx", d => d.x = Math.max(20, Math.min(width - 20, d.x)))
        .attr("cy", d => d.y = Math.max(20, Math.min(height - 20, d.y)));

      nodeLabels
        .attr("x", d => d.x)
        .attr("y", d => d.y);
    });

    // Add drag behavior
    node.call(d3.drag()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }));
  };

  const highlightExploredEdge = (index) => {
    if (!exploredEdges || index < 0 || index >= exploredEdges.length) return;

    const edge = exploredEdges[index];
    if (!edge) return;

    // Reset all edges to default style
    d3.select(svgRef.current).selectAll("line")
      .attr("stroke", "#999")
      .attr("stroke-width", 1.5);

    // If we have a final result, display it
    if (algorithmResult) {
      displayFinalResult(algorithmResult);
    }

    // Highlight the current edge
    const source = edge[0];
    const target = edge[1];

    d3.select(svgRef.current).selectAll("line")
      .filter(d => (d.source.id === source && d.target.id === target) || 
                  (!isDirected && d.source.id === target && d.target.id === source))
      .attr("stroke", "#ff5733")
      .attr("stroke-width", 3);
  };

  // Render algorithm-specific results
  const renderAlgorithmResults = () => {
    if (!algorithmResult) return null;

    switch (selectedAlgorithm) {
      case 'dijkstra':
        return (
          <div className="mt-2">
            <h3 className="text-md font-semibold">Shortest Path Distances:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
              {Object.entries(algorithmResult.distances).map(([node, distance]) => (
                <div key={node} className="text-sm border p-1 rounded">
                  Node {node}: {distance === Infinity ? '∞' : distance}
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'floydWarshall':
        return (
          <div className="mt-2">
            <h3 className="text-md font-semibold">All-Pairs Shortest Paths:</h3>
            <div className="text-xs overflow-auto max-h-32">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-1">From\To</th>
                    {algorithmResult.nodes.map(node => (
                      <th key={node} className="border p-1">Node {node}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {algorithmResult.distances.map((row, i) => (
                    <tr key={i}>
                      <td className="border p-1 font-semibold">Node {algorithmResult.nodes[i]}</td>
                      {row.map((dist, j) => (
                        <td key={j} className="border p-1">
                          {dist === Infinity ? '∞' : dist}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case 'prims':
      case 'kruskal':
        if (algorithmResult.mst) {
          const totalWeight = algorithmResult.mst.reduce((sum, edge) => sum + parseInt(edge[2]), 0);
          return (
            <div className="mt-2">
              <h3 className="text-md font-semibold">Minimum Spanning Tree:</h3>
              <div className="text-sm">
                <div>Total Weight: {totalWeight}</div>
                <div>Edges: {algorithmResult.mst.map(e => `(${e[0]}-${e[1]})`).join(', ')}</div>
              </div>
            </div>
          );
        }
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 p-4 rounded-lg shadow mb-4">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Graph Algorithm Visualizer</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Graph Type</label>
            <select
              value={graphType}
              onChange={handleGraphTypeChange}
              className="w-full p-2 border rounded"
              disabled={isRunning}
            >
              <option value="connected">Connected</option>
              <option value="complete">Complete</option>
              <option value="dense">Dense</option>
              <option value="sparse">Sparse</option>
              <option value="tree">Tree</option>
              <option value="cyclic">Cyclic</option>
              <option value="acyclic">Acyclic (Directed)</option>
              <option value="grid">Grid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Graph Size</label>
            <input
              type="number"
              min="3"
              max="20"
              value={graphSize}
              onChange={handleGraphSizeChange}
              className="w-full p-2 border rounded"
              disabled={isRunning}
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">Animation Speed (ms)</label>
            <input
              type="range"
              min="100"
              max="1000"
              step="100"
              value={processingSpeed}
              onChange={handleSpeedChange}
              className="w-full"
              disabled={isRunning}
            />
            <div className="text-xs text-gray-500 text-right">{processingSpeed}ms</div>
            
            <div className="mt-2 flex items-center">
              <input
                type="checkbox"
                id="directed"
                checked={isDirected}
                onChange={handleDirectedChange}
                className="mr-2"
                disabled={isRunning || graphType === 'acyclic'}
              />
              <label htmlFor="directed" className="text-sm font-medium text-gray-700">
                Directed Graph
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Algorithm</label>
            <select
              value={selectedAlgorithm}
              onChange={handleAlgorithmChange}
              className="w-full p-2 border rounded"
              disabled={isRunning}
            >
              <option value="bfs">Breadth-First Search</option>
              <option value="dfs">Depth-First Search</option>
              <option value="dijkstra">Dijkstra's Algorithm</option>
              <option value="prims">Prim's Algorithm (MST)</option>
              <option value="kruskal">Kruskal's Algorithm (MST)</option>
              <option value="floydWarshall">Floyd-Warshall (All-Pairs)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Node</label>
            <select
              value={startNode}
              onChange={handleStartNodeChange}
              className="w-full p-2 border rounded"
              disabled={isRunning || selectedAlgorithm === 'kruskal' || selectedAlgorithm === 'floydWarshall'}
            >
              {Object.keys(graph).map(node => (
                <option key={node} value={node}>Node {node}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerateGraph}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
              disabled={isRunning}
            >
              Generate Graph
            </button>
            <button
              onClick={runAlgorithm}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              disabled={isRunning}
            >
              {isRunning ? 'Running...' : 'Run Algorithm'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-grow bg-white p-4 rounded-lg shadow">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 600 400"
          className="border rounded"
        />
      </div>

      <div className="mt-4 bg-gray-100 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Algorithm Progress</h2>
        <div className="overflow-auto max-h-32">
          {exploredEdges.map((edge, index) => (
            <div
              key={index}
              className={`text-sm p-1 ${currentExploredIndex === index ? 'bg-yellow-200' : ''}`}
            >
              Step {index + 1}: Exploring edge {edge[0]} → {edge[1]} (weight: {edge[2]})
            </div>
          ))}
          {exploredEdges.length === 0 && (
            <div className="text-sm italic text-gray-500">Run an algorithm to see progress...</div>
          )}
        </div>
        
        {renderAlgorithmResults()}
        
        <div className="mt-2 text-xs text-gray-600">
          <p className="font-semibold">Legend:</p>
          <div className="flex flex-wrap gap-3 mt-1">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-[#ff5733] mr-1"></div>
              <span>Current Edge</span>
            </div>
            {selectedAlgorithm === 'bfs' || selectedAlgorithm === 'dfs' ? (
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#4CAF50] mr-1"></div>
                <span>Traversal Tree</span>
              </div>
            ) : selectedAlgorithm === 'dijkstra' ? (
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#2196F3] mr-1"></div>
                <span>Shortest Path Tree</span>
              </div>
            ) : (selectedAlgorithm === 'prims' || selectedAlgorithm === 'kruskal') ? (
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#9C27B0] mr-1"></div>
                <span>Minimum Spanning Tree</span>
              </div>
            ) : selectedAlgorithm === 'floydWarshall' ? (
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#FF9800] mr-1"></div>
                <span>Discovered Shortest Paths</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphVisualizer;
