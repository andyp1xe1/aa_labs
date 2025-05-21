def prims(graph, start=None):
    import heapq

    # Extract all vertices
    vertices = list(graph.keys())

    if not vertices:
        return [], [], 0

    # Use provided start vertex or default to first vertex
    if start is None or start not in vertices:
        start = vertices[0]

    # Initialize tracking structures
    visited = {start}
    tree_edges = []
    explored_edges = []

    # Priority queue to store edges (weight, from_vertex, to_vertex)
    edge_queue = []
    for neighbor, weight in graph[start].items():
        heapq.heappush(edge_queue, (weight, start, neighbor))

    while edge_queue and len(visited) < len(vertices):
        weight, from_vertex, to_vertex = heapq.heappop(edge_queue)

        # Record this exploration
        explored_edges.append((from_vertex, to_vertex, weight))

        if to_vertex in visited:
            continue

        # Add edge to minimum spanning tree
        tree_edges.append((from_vertex, to_vertex, weight))
        visited.add(to_vertex)

        # Add all edges from the new vertex to priority queue
        for neighbor, edge_weight in graph[to_vertex].items():
            if neighbor not in visited:
                heapq.heappush(edge_queue, (edge_weight, to_vertex, neighbor))

    # Calculate total weight of MST
    mst_weight = sum(weight for _, _, weight in tree_edges)

    return tree_edges, explored_edges, mst_weight
