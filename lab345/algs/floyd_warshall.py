def floyd_warshall(graph, start=None):
    """
    Finds shortest paths between all pairs of vertices using Floyd-Warshall algorithm.

    Args:
        graph: A graph represented as an adjacency list (dictionary of dictionaries)
        start: Ignored, included for API consistency with Dijkstra

    Returns:
        tuple containing:
            - tree_edges: List of edges in the shortest-path tree
            - explored_edges: List of edge explorations during algorithm execution
            - distances: Dictionary of shortest path distances between all vertices
    """
    # Extract all vertices
    vertices = list(graph.keys())

    # Initialize distances dictionary
    distances = {u: {v: float('inf') for v in vertices} for u in vertices}

    # Initialize predecessor dictionary for path reconstruction
    prev = {}

    # Set distance to self as 0, and direct edges from the graph
    for u in vertices:
        distances[u][u] = 0
        for v, weight in graph[u].items():
            distances[u][v] = weight
            if v not in prev:
                prev[v] = {}
            prev[v][u] = (u, weight)  # Store tuple (predecessor, weight) like in Dijkstra

    # Track all explored edges
    explored_edges = []

    # Floyd-Warshall dynamic programming algorithm
    for k in vertices:
        for i in vertices:
            for j in vertices:
                # Record this exploration
                explored_edges.append((i, k, j, distances[i][j]))

                # If path through k is shorter than current path from i to j
                if distances[i][k] != float('inf') and distances[k][j] != float('inf'):
                    candidate_dist = distances[i][k] + distances[k][j]
                    if candidate_dist < distances[i][j]:
                        distances[i][j] = candidate_dist
                        if j not in prev:
                            prev[j] = {}
                        prev[j][i] = prev[j][k]  # Update predecessor

    # Build the final shortest-path tree from prev (similar to Dijkstra)
    tree_edges = []
    for j in vertices:
        if j in prev:
            for i in prev[j]:
                if isinstance(prev[j][i], tuple):
                    src, weight = prev[j][i]
                    tree_edges.append((src, j, weight))

    return tree_edges, explored_edges, distances
