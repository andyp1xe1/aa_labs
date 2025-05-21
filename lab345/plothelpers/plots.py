import time
import random
from matplotlib.figure import Figure
import matplotlib.pyplot as plt
from typing import Callable, Dict, List, Tuple, Optional

class GraphBenchmark:
    """A class to benchmark graph algorithms with a cleaner, more modular design."""
    
    def __init__(self):
        """Initialize the benchmark runner."""
        random.seed()  # Re-seed with system time for true randomness
        
    def measure_algorithm(self, algorithm: Callable, graph, start_vertex=None) -> float:
        """Measure the execution time of an algorithm on a single graph.
        
        Args:
            algorithm: Function that takes a graph and optional start vertex
            graph: The graph structure to run the algorithm on
            start_vertex: Optional starting vertex for the algorithm
            
        Returns:
            Execution time in seconds
        """
        # Dynamically determine whether to pass start_vertex based on algorithm signature
        start_time = time.perf_counter()
        if start_vertex is not None:
            algorithm(graph, start_vertex)
        else:
            algorithm(graph)
        end_time = time.perf_counter()
        
        return end_time - start_time
    
    def generate_graphs(self, generator: Callable, sizes: List[int],
                        repetitions: int = 3) -> Dict[int, List]:
        """Generate multiple graphs of different sizes using the provided generator.
        
        Args:
            generator: Function that takes a size parameter and returns a graph
            sizes: List of graph sizes to generate
            repetitions: Number of graphs to generate for each size
            
        Returns:
            Dictionary mapping sizes to lists of generated graphs
        """
        graphs = {}
        for size in sizes:
            graphs[size] = [generator(size)
                           for _ in range(repetitions)]
        return graphs
    
    def benchmark_algorithm(self,
                           algorithm: Callable,
                           graphs: Dict[int, List],
                           start_vertex=None) -> Tuple[List[int], List[float], List[float]]:
        """Benchmark an algorithm across multiple graph sizes.
        
        Args:
            algorithm: Function that takes a graph and optional start vertex
            graphs: Dictionary mapping sizes to lists of graphs
            start_vertex: Optional starting vertex for the algorithm
            
        Returns:
            Tuple of (sizes, average_times, std_deviations)
        """
        sizes = sorted(graphs.keys())
        avg_times = []
        std_devs = []
        
        for size in sizes:
            times = []
            for graph in graphs[size]:
                # Measure time for this specific graph
                duration = self.measure_algorithm(algorithm, graph, start_vertex)
                times.append(duration)
            
            # Calculate statistics
            avg_time = sum(times) / len(times)
            std_dev = (sum((t - avg_time) ** 2 for t in times) / len(times)) ** 0.5
            
            avg_times.append(avg_time)
            std_devs.append(std_dev)
            
        return sizes, avg_times, std_devs


class GraphVisualizer:
    """A class to visualize graph algorithm benchmarks."""
    
    @staticmethod
    def plot_performance(algorithm_name: str, graph_type_name: str, 
                         sizes: List[int], times: List[float], 
                         std_devs: Optional[List[float]] = None,
                         log_scale: bool = False) -> Figure:
        """Plot the performance of a single algorithm.
        
        Args:
            algorithm_name: Name of the algorithm
            graph_type_name: Name of the graph type
            sizes: List of graph sizes
            times: List of execution times
            std_devs: Optional list of standard deviations
            log_scale: Whether to use logarithmic scale
            
        Returns:
            Matplotlib figure
        """
        plt.figure(figsize=(10, 6))
        
        if std_devs:
            plt.errorbar(sizes, times, yerr=std_devs, fmt='bo-', 
                         linewidth=2, markersize=8, capsize=5)
        else:
            plt.plot(sizes, times, 'bo-', linewidth=2, markersize=8)
            
        plt.xlabel('Graph Size (|V|)')
        plt.ylabel('Time (seconds)')
        plt.title(f'Performance of {algorithm_name} on {graph_type_name} Graphs')
        plt.grid(True)

        if log_scale:
            plt.xscale('log')
            plt.yscale('log')

        return plt.gcf()
    
    @staticmethod
    def plot_algorithm_comparison(algorithm_results: Dict[str, Tuple[List[int], List[float], List[float]]],
                                  graph_type_name: str,
                                  log_scale: bool = False) -> Figure:
        """Plot a comparison of multiple algorithms.
        
        Args:
            algorithm_results: Dict mapping algorithm names to (sizes, times, std_devs) tuples
            graph_type_name: Name of the graph type
            log_scale: Whether to use logarithmic scale
            
        Returns:
            Matplotlib figure
        """
        plt.figure(figsize=(12, 7))
        
        for algo_name, (sizes, times, std_devs) in algorithm_results.items():
            plt.errorbar(sizes, times, yerr=std_devs, fmt='o-', 
                       linewidth=2, markersize=6, capsize=5, label=algo_name)

        plt.xlabel('Graph Size (|V|)')
        plt.ylabel('Time (seconds)')
        plt.title(f'Algorithm Performance Comparison on {graph_type_name} Graphs')
        plt.grid(True)
        plt.legend()

        if log_scale:
            plt.xscale('log')
            plt.yscale('log')

        return plt.gcf()
    
    @staticmethod
    def plot_graph_type_comparison(algorithm_name: str,
                                  graph_type_results: Dict[str, Tuple[List[int], List[float], List[float]]],
                                  log_scale: bool = False) -> Figure:
        """Plot algorithm performance across different graph types.
        
        Args:
            algorithm_name: Name of the algorithm
            graph_type_results: Dict mapping graph type names to (sizes, times, std_devs) tuples
            log_scale: Whether to use logarithmic scale
            
        Returns:
            Matplotlib figure
        """
        plt.figure(figsize=(12, 7))
        
        for graph_name, (sizes, times, std_devs) in graph_type_results.items():
            plt.errorbar(sizes, times, yerr=std_devs, fmt='o-', 
                       linewidth=2, markersize=6, capsize=5, label=graph_name)

        plt.xlabel('Graph Size (|V|)')
        plt.ylabel('Time (seconds)')
        plt.title(f'Performance of {algorithm_name} Across Different Graph Types')
        plt.grid(True)
        plt.legend()

        if log_scale:
            plt.xscale('log')
            plt.yscale('log')

        return plt.gcf()


def plot_graph_example(graph, graph_name="Graph Example", layout="spring", node_size=600, font_size=10):
    """
    Plot a small graph using networkx and matplotlib for report examples.

    Args:
        graph (dict): Adjacency list representation of the graph.
        graph_name (str): Title for the plot.
        layout (str): Layout algorithm for node placement ('spring', 'circular', 'shell', 'kamada_kawai').
        node_size (int): Size of the nodes.
        font_size (int): Font size for node labels.

    Returns:
        Matplotlib figure.
    """
    import networkx as nx

    G = nx.DiGraph()
    for u, neighbors in graph.items():
        for v, w in neighbors.items():
            G.add_edge(u, v, weight=w)

    if layout == "spring":
        pos = nx.spring_layout(G, seed=42)
    elif layout == "circular":
        pos = nx.circular_layout(G)
    elif layout == "shell":
        pos = nx.shell_layout(G)
    elif layout == "kamada_kawai":
        pos = nx.kamada_kawai_layout(G)
    else:
        pos = nx.spring_layout(G, seed=42)

    plt.figure(figsize=(5, 4))
    nx.draw(G, pos, with_labels=True, node_size=node_size, font_size=font_size, arrows=True)
    edge_labels = nx.get_edge_attributes(G, 'weight')
    nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels, font_size=font_size)
    plt.title(graph_name)
    plt.axis('off')
    return plt.gcf()


def plot_performance(algorithm, algorithm_name, graph_generator, graph_type_name, 
                    sizes, repetitions=3, log_scale=False, **kwargs):
    """Compatibility wrapper for Org mode reports.
    
    This function maintains the same interface as the original library to ensure
    backward compatibility with existing Org mode documents.
    
    Args:
        algorithm: Algorithm function to benchmark
        algorithm_name: Name of the algorithm
        graph_generator: Function to generate graphs
        graph_type_name: Name of the graph type
        sizes: List of graph sizes to benchmark
        repetitions: Number of repetitions for each size
        log_scale: Whether to use logarithmic scale
        **kwargs: Additional arguments (ignored for compatibility)
        
    Returns:
        Matplotlib figure
    """
    # Create benchmark objects
    benchmark = GraphBenchmark()
    visualizer = GraphVisualizer()
    
    # Generate graphs
    graphs = benchmark.generate_graphs(graph_generator, sizes, repetitions)
    
    # Benchmark the algorithm
    sizes, times, std_devs = benchmark.benchmark_algorithm(
        algorithm, graphs, start_vertex='0')
    
    # Create the plot
    return visualizer.plot_performance(algorithm_name, graph_type_name, sizes, times, std_devs, log_scale)

def plot_algorithm_comparison(algorithm_funcs, algorithm_names, graph_generator, graph_type_name, 
                             sizes, repetitions=5, log_scale=False, **kwargs):
    """Compatibility wrapper for Org mode reports.
    
    This function maintains the same interface as the original library to ensure
    backward compatibility with existing Org mode documents.
    
    Args:
        algorithm_funcs: List of algorithm functions to benchmark
        algorithm_names: List of names corresponding to the algorithms
        graph_generator: Function to generate graphs
        graph_type_name: Name of the graph type
        sizes: List of graph sizes to benchmark
        repetitions: Number of graphs to generate for each size
        log_scale: Whether to use logarithmic scale
        **kwargs: Additional arguments (ignored for compatibility)
        
    Returns:
        Matplotlib figure
    """
    # Create benchmark objects
    benchmark = GraphBenchmark()
    visualizer = GraphVisualizer()
    
    # Generate graphs
    graphs = benchmark.generate_graphs(graph_generator, sizes, repetitions)
    
    # Benchmark each algorithm
    algorithm_results = {}
    for algorithm, name in zip(algorithm_funcs, algorithm_names):
        algorithm_results[name] = benchmark.benchmark_algorithm(
            algorithm, graphs, start_vertex='0')
    
    # Create the comparison plot
    return visualizer.plot_algorithm_comparison(algorithm_results, graph_type_name, log_scale)

def plot_graph_type_comparison(algorithm, algorithm_name, graph_generators, graph_type_names,
                              sizes, repetitions=3, log_scale=False, **kwargs):
    """Compatibility wrapper for Org mode reports.
    
    This function maintains the same interface as the original library to ensure
    backward compatibility with existing Org mode documents.
    
    Args:
        algorithm: Algorithm function to benchmark
        algorithm_name: Name of the algorithm
        graph_generators: List of graph generator functions
        graph_type_names: List of names corresponding to the graph types
        sizes: List of graph sizes to benchmark
        repetitions: Number of graphs to generate for each size
        log_scale: Whether to use logarithmic scale
        **kwargs: Additional arguments (ignored for compatibility)
        
    Returns:
        Matplotlib figure
    """
    # Create benchmark objects
    benchmark = GraphBenchmark()
    visualizer = GraphVisualizer()
    
    # Benchmark algorithm on each graph type
    graph_type_results = {}
    for generator, name in zip(graph_generators, graph_type_names):
        # Generate graphs for this type
        graphs = benchmark.generate_graphs(generator, sizes, repetitions)
        
        # Benchmark algorithm on these graphs
        graph_type_results[name] = benchmark.benchmark_algorithm(
            algorithm, graphs, start_vertex='0')
    
    # Create the comparison plot
    return visualizer.plot_graph_type_comparison(algorithm_name, graph_type_results, log_scale)
