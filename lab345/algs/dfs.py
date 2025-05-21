def dfs(graph, start, visited=None, proc=None):
    """
    Depth-First Search algorithm implementation.

    Args:
        graph (dict): Adjacency list representation of the graph.
        start (str): Starting vertex.

    Returns:
        list: Order of vertices visited.
    """
    if visited is None:
        visited = set()
    if proc is None:
        proc = []

    visited.add(start)

    for neighbor, weight in graph[start].items():
        if neighbor not in visited:
            proc.append((start, neighbor, weight))
            dfs(graph, neighbor, visited, proc)
    return proc

