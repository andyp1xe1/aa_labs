def kruskal(graph, start=None):
    # Define disjoint-set data structure for cycle detection
    class DisjointSet:
        def __init__(self, vertices):
            self.parent = {v: v for v in vertices}
            self.rank = {v: 0 for v in vertices}

        def find(self, vertex):
            if self.parent[vertex] != vertex:
                self.parent[vertex] = self.find(self.parent[vertex])
            return self.parent[vertex]

        def union(self, vertex1, vertex2):
            root1 = self.find(vertex1)
            root2 = self.find(vertex2)

            if root1 != root2:
                if self.rank[root1] < self.rank[root2]:
                    self.parent[root1] = root2
                elif self.rank[root1] > self.rank[root2]:
                    self.parent[root2] = root1
                else:
                    self.parent[root2] = root1
                    self.rank[root1] += 1
                return True
            return False

    # Extract all vertices
    vertices = list(graph.keys())

    if not vertices:
        return [], [], 0

    # Collect all edges
    edges = []
    for vertex in vertices:
        for neighbor, weight in graph[vertex].items():
            # Prevent duplicate edges by only adding if vertex < neighbor
            if vertex < neighbor:
                edges.append((weight, vertex, neighbor))

    # Sort edges by weight
    edges.sort()

    # Initialize DisjointSet
    ds = DisjointSet(vertices)

    # Track results
    tree_edges = []
    explored_edges = []

    # Process edges in ascending order of weight
    for weight, vertex1, vertex2 in edges:
        # Record this exploration
        explored_edges.append((vertex1, vertex2, weight))

        if ds.union(vertex1, vertex2):
            # Edge is part of MST
            tree_edges.append((vertex1, vertex2, weight))

    # Calculate total weight of MST
    mst_weight = sum(weight for _, _, weight in tree_edges)

    return tree_edges, explored_edges, mst_weight
