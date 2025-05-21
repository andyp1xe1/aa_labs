import heapq

def dijkstra(graph, start):
    distances = {node: float('inf') for node in graph}
    distances[start] = 0

    prev = {}  # to track how we got to each node
    explored_edges = []

    pq = [(0, start)]

    while pq:
        current_distance, current_node = heapq.heappop(pq)

        # skip outdated queue entries
        if current_distance > distances[current_node]:
            continue

        for neighbor, weight in graph[current_node].items():
            explored_edges.append((current_node, neighbor, weight))
            distance = current_distance + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                prev[neighbor] = (current_node, weight)
                heapq.heappush(pq, (distance, neighbor))

    # build the final shortest-path tree from prev
    tree_edges = [(src, dst, weight) for dst, (src, weight) in prev.items()]

    return tree_edges, explored_edges, distances
