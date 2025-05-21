import random
import math

def generate_complete_graph(size, seed=None):
    """
    Generate a complete graph where every vertex is connected to every other vertex.

    Args:
        size (int): Number of vertices in the graph.
        seed (int, optional): Random seed for reproducible generation.

    Returns:
        dict: Adjacency list representation of the graph.
    """
    if seed is not None:
        random.seed(seed)
    graph = {str(i): {} for i in range(size)}

    for i in range(size):
        for j in range(size):
            if i != j:  # No self-loops
                graph[str(i)][str(j)] = random.randint(1, 10)

    return graph

def generate_dense_graph(size, seed=None):
    """
    Generate a dense graph with approximately 0.8 * (|V|*(|V|-1)/2) edges.
    Ensures the graph is connected.

    Args:
        size (int): Number of vertices in the graph.
        seed (int, optional): Random seed for reproducible generation.

    Returns:
        dict: Adjacency list representation of the graph.
    """
    # Create a local random generator to avoid affecting global state
    rng = random.Random(seed)
    graph = {str(i): {} for i in range(size)}

    # First ensure the graph is connected with a spanning tree
    for i in range(1, size):
        j = rng.randint(0, i - 1)  # Connect to a random previous vertex
        weight = rng.randint(1, 10)
        graph[str(j)][str(i)] = weight

    # Calculate number of edges in a complete graph
    max_edges = size * (size - 1) // 2
    # Target number of edges (80% of max)
    target_edges = int(0.8 * max_edges)

    # Subtract the edges we've already added
    remaining_edges = target_edges - (size - 1)
    edge_count = 0

    # Add remaining random edges
    while edge_count < remaining_edges:
        i = rng.randint(0, size - 1)
        j = rng.randint(0, size - 1)

        if i != j and str(j) not in graph[str(i)]:
            weight = rng.randint(1, 10)
            graph[str(i)][str(j)] = weight
            edge_count += 1

    return graph

def generate_sparse_graph(size, seed=None):
    """
    Generate a sparse graph with approximately 2|V| edges.

    Args:
        size (int): Number of vertices in the graph.
        seed (int, optional): Random seed for reproducible generation.

    Returns:
        dict: Adjacency list representation of the graph.
    """
    if seed is not None:
        random.seed(seed)
    graph = {str(i): {} for i in range(size)}

    # Target number of edges: 2|V|
    target_edges = 2 * size

    # First ensure the graph is connected
    for i in range(1, size):
        # Connect to a random previous vertex to ensure connectivity
        j = random.randint(0, i - 1)
        weight = random.randint(1, 10)
        graph[str(j)][str(i)] = weight

    # Add remaining random edges
    remaining_edges = target_edges - (size - 1)
    edge_count = 0

    while edge_count < remaining_edges:
        i = random.randint(0, size - 1)
        j = random.randint(0, size - 1)

        if i != j and str(j) not in graph[str(i)]:
            weight = random.randint(1, 10)
            graph[str(i)][str(j)] = weight
            edge_count += 1

    return graph

def generate_tree_graph(size, seed=None):
    """
    Generate a tree graph (connected acyclic graph) with |V|-1 edges.
    Implemented as a binary tree where each non-leaf node has at most two children.

    Args:
        size (int): Number of vertices in the graph.
        seed (int, optional): Random seed for reproducible generation.

    Returns:
        dict: Adjacency list representation of the graph.
    """
    if seed is not None:
        random.seed(seed)
    graph = {str(i): {} for i in range(size)}

    for i in range(1, size):
        # For a binary tree, parent is (i-1)//2
        parent = (i - 1) // 2
        weight = random.randint(1, 10)

        # Randomly decide direction of edge (parent->child or child->parent)
        if random.choice([True, False]):
            graph[str(parent)][str(i)] = weight
        else:
            graph[str(i)][str(parent)] = weight

    return graph

def generate_connected_graph(size, seed=None):
    """
    Generate a connected graph with edge count between |V|-1 and |V|(|V|-1)/2.

    Args:
        size (int): Number of vertices in the graph.
        seed (int, optional): Random seed for reproducible generation.

    Returns:
        dict: Adjacency list representation of the graph.
    """
    if seed is not None:
        random.seed(seed)
    graph = {str(i): {} for i in range(size)}

    # First create a spanning tree to ensure connectivity
    for i in range(1, size):
        j = random.randint(0, i - 1)  # Connect to any previous vertex
        weight = random.randint(1, 10)
        graph[str(j)][str(i)] = weight

    # Add some random additional edges
    extra_edges = random.randint(0, size)  # Add up to |V| extra edges

    for _ in range(extra_edges):
        i = random.randint(0, size - 1)
        j = random.randint(0, size - 1)

        if i != j and str(j) not in graph[str(i)]:
            weight = random.randint(1, 10)
            graph[str(i)][str(j)] = weight

    return graph

def generate_disconnected_graph(size, seed=None):
    """
    Generate a disconnected graph with approximately sqrt(|V|) separate components.

    Args:
        size (int): Number of vertices in the graph.
        seed (int, optional): Random seed for reproducible generation.

    Returns:
        dict: Adjacency list representation of the graph.
    """
    if seed is not None:
        random.seed(seed)
    graph = {str(i): {} for i in range(size)}

    # Number of components
    num_components = min(size, max(2, int(math.sqrt(size))))

    # Assign vertices to components
    components = [[] for _ in range(num_components)]
    for i in range(size):
        component_idx = i % num_components
        components[component_idx].append(str(i))

    # Add edges within components
    for component in components:
        if len(component) <= 1:
            continue

        # Create a connected subgraph within each component
        for i in range(1, len(component)):
            j = random.randint(0, i - 1)
            weight = random.randint(1, 10)
            graph[component[j]][component[i]] = weight

        # Add some additional random edges within the component
        extra_edges = random.randint(0, len(component))
        for _ in range(extra_edges):
            i = random.randint(0, len(component) - 1)
            j = random.randint(0, len(component) - 1)

            if i != j and component[j] not in graph[component[i]]:
                weight = random.randint(1, 10)
                graph[component[i]][component[j]] = weight

    return graph

def generate_cyclic_graph(size, seed=None):
    """
    Generate a cyclic graph containing at least one cycle.

    Args:
        size (int): Number of vertices in the graph.
        seed (int, optional): Random seed for reproducible generation.

    Returns:
        dict: Adjacency list representation of the graph.
    """
    if seed is not None:
        random.seed(seed)
    if size < 3:
        return generate_connected_graph(size)  # Can't have cycles with less than 3 vertices

    graph = {str(i): {} for i in range(size)}

    # Create a base cycle
    for i in range(size):
        next_vertex = (i + 1) % size
        weight = random.randint(1, 10)
        graph[str(i)][str(next_vertex)] = weight

    # Add some random additional edges
    extra_edges = random.randint(0, size)

    for _ in range(extra_edges):
        i = random.randint(0, size - 1)
        j = random.randint(0, size - 1)

        if i != j and str(j) not in graph[str(i)]:
            weight = random.randint(1, 10)
            graph[str(i)][str(j)] = weight

    return graph

def generate_acyclic_graph(size, seed=None, min_edges_per_vertex=1, max_edges_per_vertex=2):
    """
    Generate a directed acyclic graph (DAG) that is connected.

    Args:
        size (int): Number of vertices in the graph.
        seed (int, optional): Random seed for reproducible generation.
        min_edges_per_vertex (int, optional): Minimum outgoing edges per non-terminal vertex.
        max_edges_per_vertex (int, optional): Maximum outgoing edges per vertex.

    Returns:
        dict: Adjacency list representation of the graph.
    """
    # Create a local random generator to avoid affecting global state
    rng = random.Random(seed)

    graph = {str(i): {} for i in range(size)}

    # First pass: ensure connectivity by creating a path through all vertices
    # This guarantees every vertex (except the last) has at least one outgoing edge
    for i in range(size - 1):
        weight = rng.randint(1, 10)
        graph[str(i)][str(i + 1)] = weight

    # Second pass: add additional random edges while maintaining acyclicity
    for i in range(size - 1):  # Last vertex can't have outgoing edges
        # Determine how many additional edges to add
        existing_edges = len(graph[str(i)])
        additional_needed = rng.randint(
            max(0, min_edges_per_vertex - existing_edges),
            max(0, max_edges_per_vertex - existing_edges)
        )

        if additional_needed == 0:
            continue

        # Only consider vertices with higher indices that aren't already connected
        potential_targets = [j for j in range(i + 2, size) if str(j) not in graph[str(i)]]
        if not potential_targets:
            continue

        targets = rng.sample(potential_targets, min(additional_needed, len(potential_targets)))

        for target in targets:
            weight = rng.randint(1, 10)
            graph[str(i)][str(target)] = weight

    return graph

def generate_grid_graph(size, seed=None):
    """
    Generate a 2D grid graph. Ensures all vertices are connected.

    Args:
        size (int): Total number of vertices in the graph.
        seed (int, optional): Random seed for reproducible generation.

    Returns:
        dict: Adjacency list representation of the graph.
    """
    # Create a local random generator to avoid affecting global state
    rng = random.Random(seed)
    graph = {str(i): {} for i in range(size)}

    # Calculate grid dimensions
    grid_size = int(math.sqrt(size))

    # Create a grid with up to 4 connections per vertex
    for i in range(grid_size):
        for j in range(grid_size):
            vertex = i * grid_size + j

            if vertex >= size:
                continue

            # Connect to right neighbor
            if j < grid_size - 1:
                right = i * grid_size + (j + 1)
                if right < size:
                    weight = rng.randint(1, 10)
                    graph[str(vertex)][str(right)] = weight

                    # Make bidirectional for better connectivity
                    weight2 = rng.randint(1, 10)
                    graph[str(right)][str(vertex)] = weight2

            # Connect to bottom neighbor
            if i < grid_size - 1:
                bottom = (i + 1) * grid_size + j
                if bottom < size:
                    weight = rng.randint(1, 10)
                    graph[str(vertex)][str(bottom)] = weight

                    # Make bidirectional for better connectivity
                    weight2 = rng.randint(1, 10)
                    graph[str(bottom)][str(vertex)] = weight2

    # Ensure any isolated vertices are connected to the main grid
    for i in range(grid_size * grid_size, size):
        if not graph[str(i)] and not any(str(i) in graph[str(j)] for j in range(size)):
            # Connect to a random vertex in the grid
            connect_to = rng.randint(0, grid_size * grid_size - 1)
            weight = rng.randint(1, 10)
            graph[str(connect_to)][str(i)] = weight

            # Make bidirectional
            weight2 = rng.randint(1, 10)
            graph[str(i)][str(connect_to)] = weight2

    return graph

def print_graph_info(graph):
    """
    Print information about the graph.

    Args:
        graph (dict): Adjacency list representation of the graph.
    """
    num_vertices = len(graph)

    # Count edges
    edge_count = 0
    for vertex, neighbors in graph.items():
        edge_count += len(neighbors)

    print(f"Graph has {num_vertices} vertices and {edge_count} edges")
    print("Vertices:", list(graph.keys()))

    # Print each vertex and its neighbors
    for vertex, neighbors in graph.items():
        if neighbors:
            print(f"Vertex {vertex} connects to: {neighbors}")
        else:
            print(f"Vertex {vertex} has no outgoing edges")
