from .quick_sort import quick_sort
from .merge_sort import merge_sort
from .heap_sort import heap_sort


def is_sorted(arr):
    for i in range(1, len(arr)):
        if arr[i] < arr[i-1]:
            return False
    return True


def has_high_duplicates(arr):
    # Count number of duplicates to determine if array has many duplicates
    sample_size = min(len(arr), 1000)  # Sample to avoid O(n²) complexity
    duplicates_count = 0
    sample = arr[:sample_size]
    seen = set()

    for item in sample:
        if item in seen:
            duplicates_count += 1
        else:
            seen.add(item)

    duplicates_ratio = duplicates_count / sample_size if sample_size > 0 else 0
    return duplicates_ratio > 0.3


def is_nearly_sorted(arr):
    out_of_place = 0
    # Sample check
    for i in range(min(len(arr), 1000)):
        if i > 0 and i < len(arr) - 1:
            if (arr[i] < arr[i-1] and arr[i] < arr[i+1]) or (arr[i] > arr[i-1] and arr[i] > arr[i+1]):
                out_of_place += 1

    return out_of_place < min(len(arr), 1000) * 0.1


def is_nearly_sorted_v2(arr, min_run_ratio=0.7):
    n = len(arr)

    # Find the length of ascending runs
    runs = []
    i = 0
    while i < n:
        run_start = i
        i += 1
        while i < n and arr[i] >= arr[i-1]:
            i += 1
        runs.append(i - run_start)

    # Calculate the average run length as percentage of total length
    avg_run_length = sum(runs) / len(runs)
    return avg_run_length / n >= min_run_ratio


def smart_sort(arr):
    size = len(arr)

    # Handle empty or single element arrays
    if size <= 1:
        return arr

    # Check if array is already sorted
    if is_sorted(arr):
        return arr

    # Check if array is reverse sorted
    if is_sorted(arr[::-1]):
        # Reverse the array in-place
        left, right = 0, len(arr) - 1
        while left < right:
            arr[left], arr[right] = arr[right], arr[left]
            left += 1
            right -= 1
        return arr

    # For very small arrays (size < 50)
    if size < 50:
        quick_sort(arr)
        return

    nearly_sorted = is_nearly_sorted_v2(arr)

    if nearly_sorted:
        # For arrays size 50-500
        if size <= 500:
            heap_sort(arr)
            return

        # For larger arrays (size >= 500)
        else:
            merge_sort(arr)
            return

    quick_sort(arr)
    return
