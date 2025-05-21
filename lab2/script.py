import random
import time
import matplotlib.pyplot as plt

from sort_algs.patience_sort import patience_sort
from sort_algs.merge_sort import merge_sort
from sort_algs.quick_sort import quick_sort
from sort_algs.heap_sort import heap_sort
from sort_algs.smart_sort import smart_sort

import sys
sys.setrecursionlimit(10**6)


def is_sorted(arr):
    for i in range(1, len(arr)):
        if arr[i] < arr[i-1]:
            print(f"element {arr[i]} at index {i} is smaller than {arr[i-1]} at index {i-1}")
            print(arr)
            return False
    return True


def visualize_sorting_performance(results, array_type_colors):
    """
    Create comprehensive performance visualization for sorting algorithms.
    Save overall figure and individual subplots as separate images.
    :param results: Performance measurement results from test_sorting_performance
    :param array_type_colors: Dictionary mapping array types to colors
    """
    # Set up the figure with subplots for each sorting algorithm
    sorting_algorithms = list(next(iter(next(iter(results.values())).values())).keys())
    fig, axes = plt.subplots(
        len(sorting_algorithms),
        1,
        figsize=(10, 4*len(sorting_algorithms)),
        squeeze=False)
    
    # Iterate through each sorting algorithm
    for algo_idx, algo_name in enumerate(sorting_algorithms):
        ax = axes[algo_idx][0]
        ax.set_title(f'Performance of {algo_name}')
        ax.set_xlabel('Array Size')
        ax.set_ylabel('Sorting Time (seconds)')
        ax.set_xscale('log')  # Use log scale for x-axis
        ax.set_yscale('log')  # Use log scale for y-axis
        ax.grid(True, which="both", ls="-", alpha=0.2)
        
        # Plot performance for each array type
        for array_type, color in array_type_colors.items():
            # Collect times for this algorithm and array type
            sizes = []
            times = []
            for size, size_results in results.items():
                try:
                    time_taken = size_results[array_type][algo_name]
                    if isinstance(time_taken, float):
                        sizes.append(size)
                        times.append(time_taken)
                except (KeyError, TypeError):
                    # Skip if no data for this combination
                    continue
            
            # Plot the performance line
            if sizes and times:
                ax.plot(sizes, times, marker='o', linestyle='-', color=color,
                        label=array_type.replace('_', ' ').title())
        
        ax.legend()
        
        # Save individual subplot to its own file
        individual_fig = plt.figure(figsize=(10, 6))
        individual_ax = individual_fig.add_subplot(111)
        
        # Apply the same settings to the individual plot
        individual_ax.set_title(f'Performance of {algo_name}')
        individual_ax.set_xlabel('Array Size')
        individual_ax.set_ylabel('Sorting Time (seconds)')
        individual_ax.set_xscale('log')
        individual_ax.set_yscale('log')
        individual_ax.grid(True, which="both", ls="-", alpha=0.2)
        
        # Re-plot the data for this algorithm
        for array_type, color in array_type_colors.items():
            sizes = []
            times = []
            for size, size_results in results.items():
                try:
                    time_taken = size_results[array_type][algo_name]
                    if isinstance(time_taken, float):
                        sizes.append(size)
                        times.append(time_taken)
                except (KeyError, TypeError):
                    continue
            
            if sizes and times:
                individual_ax.plot(sizes, times, marker='o', linestyle='-', color=color,
                               label=array_type.replace('_', ' ').title())
        
        individual_ax.legend()
        individual_fig.tight_layout()
        individual_fig.savefig(f"./sorting_performance_{algo_name.lower().replace(' ', '_')}.png")
        plt.close(individual_fig)  # Close individual figure to free memory
    
    # Save the combined figure
    plt.tight_layout()
    plt.savefig("./sorting_performance_all.png")
    plt.close(fig)  # Close the main figure


def generate_random_array(size):
    """Generate a random array of given size."""
    return [random.randint(1, 10000) for _ in range(size)]


def generate_nearly_sorted_array(size, percent_sorted=0.9):
    """Generate a nearly sorted array."""
    arr = list(range(1, size + 1))
    num_shuffled = int(size * (1 - percent_sorted))

    # Shuffle some elements
    for _ in range(num_shuffled):
        idx1, idx2 = random.sample(range(size), 2)
        arr[idx1], arr[idx2] = arr[idx2], arr[idx1]

    return arr


def generate_reverse_nearly_sorted_array(size, percent_sorted=0.9):
    """Generate a nearly sorted array in reverse."""
    arr = list(range(size, 0, -1))
    num_shuffled = int(size * (1 - percent_sorted))

    # Shuffle some elements
    for _ in range(num_shuffled):
        idx1, idx2 = random.sample(range(size), 2)
        arr[idx1], arr[idx2] = arr[idx2], arr[idx1]

    return arr


def generate_sorted_array(size):
    """Generate a sorted array."""
    return list(range(1, size + 1))


def generate_reverse_sorted_array(size):
    """Generate a reverse sorted array."""
    return list(range(size, 0, -1))


def generate_duplicates_array(size, unique_percent=0.1):
    """Generate an array with duplicate values."""

    # Ensure we don't try to create more unique values than the array size
    num_unique = max(1, min(int(size * unique_percent), size))

    # Adjust range to prevent sampling error
    max_range = max(size * 2, 10000)

    # Ensure we have enough unique values
    unique_values = random.sample(range(1, max_range), num_unique)

    arr = []
    for i in range(size):
        if i < num_unique:
            arr.append(unique_values[i % num_unique])
        else:
            arr.append(random.choice(unique_values))

    random.shuffle(arr)
    return arr


def measure_sorting_time(sort_func, arr):
    """Measure sorting time for a given sorting function."""
    start_time = time.time()
    sort_func(arr)
    end_time = time.time()
    return end_time - start_time


def test_sorting_performance(input_sizes,
                             input_generators,
                             sorting_algorithms):
    """
    Test sorting algorithms across different input sizes and types.

    :param input_sizes: List of array sizes to test
    :param input_generators: Dict of input generation functions
    :param sorting_algorithms: Dict of sorting functions
    """
    results = {}

    for size in input_sizes:
        results[size] = {}

        for gen_name, gen_func in input_generators.items():
            results[size][gen_name] = {}

            # Generate input array
            original_arr = gen_func(size)

            for algo_name, sort_func in sorting_algorithms.items():
                # Create a copy to avoid modifying the original array
                arr_copy = original_arr.copy()

                # Measure sorting time
                try:
                    sorting_time = measure_sorting_time(sort_func, arr_copy)

                    # Verify the array is actually sorted
                    assert is_sorted(arr_copy), f"{algo_name} incorretly \
sorted for {gen_name} array of size {size}"

                    results[size][gen_name][algo_name] = sorting_time
                except Exception as e:
                    results[size][gen_name][algo_name] = str(e)

    return results


def print_performance_results(results):
    """
    Print the performance results in a readable format.

    :param results: Performance measurement results
    """
    print("\nSorting Algorithm Performance Measurements:")
    print("-" * 50)

    for size, size_results in results.items():
        print(f"\nArray Size: {size}")
        print("-" * 20)

        for input_type, algo_results in size_results.items():
            print(f"\n{input_type.replace('_', ' ').title()} Array:")

            # Sort algorithms by performance
            sorted_algos = sorted(
                algo_results.items(), key=lambda x: x[1]
                if isinstance(x[1], float)
                else float('inf'))

            for algo, time_taken in sorted_algos:
                if isinstance(time_taken, float):
                    print(f"{algo:<15}: {time_taken:.6f} seconds")
                else:
                    print(f"{algo:<15}: Error - {time_taken}")


def main():
    # Define input sizes to test
    input_sizes = [10, 50, 100, 500, 1000, 2000, 3000, 4000, 5000, 7000, 10_000]

    # Define input generators
    input_generators = {
        'random': generate_random_array,
        'nearly_sorted': generate_nearly_sorted_array,
        'nearly_reverse_sorted': generate_reverse_nearly_sorted_array,
        'sorted': generate_sorted_array,
        'reverse_sorted': generate_reverse_sorted_array,
        'duplicates': generate_duplicates_array
    }

    # Define sorting algorithms
    sorting_algorithms = {
        'Quick Sort': quick_sort,
        'Merge Sort': merge_sort,
        'Heap Sort': heap_sort,
        'Patience Sort': patience_sort,
        'Smart Sort': smart_sort
    }

    # Run performance tests
    results = test_sorting_performance(
        input_sizes,
        input_generators,
        sorting_algorithms)

    # Color palette for different array types
    array_type_colors = {
        'random': 'red',
        'nearly_sorted': 'green',
        'nearly_reverse_sorted': 'yellow',
        'sorted': 'orange',
        'reverse_sorted': 'blue',
        'duplicates': 'purple'
    }

    visualize_sorting_performance(results, array_type_colors)

    print_performance_results(results)


# Run the main function when the script is executed
if __name__ == '__main__':
    main()
