import collections

def bfs(graph, root):
    """
    Breadth-First Search algorithm implementation.

    Args:
        graph (dict): Adjacency list representation of the graph.
        start (str): Starting vertex.

    Returns:
        list: Order of vertices visited.
    """
    visited = set()
    queue = collections.deque([root])
    visited.add(root)
    proc = []

    while queue:
        vertex = queue.popleft()

        for neighbor, weight in graph[vertex].items():
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
                proc.append((vertex, neighbor, weight))
    return proc
