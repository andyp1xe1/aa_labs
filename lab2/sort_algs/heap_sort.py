def heapify(arr, n, i):
    largest = i
    l_idx = 2 * i + 1
    r_idx = 2 * i + 2
    if l_idx < n and arr[l_idx] > arr[largest]:
        largest = l_idx
    if r_idx < n and arr[r_idx] > arr[largest]:
        largest = r_idx
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]  # Swap
        heapify(arr, n, largest)


def heap_sort(arr):
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)
    return
