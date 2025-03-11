def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] < pivot:
            i += 1
            swap(arr, i, j)
    swap(arr, i + 1, high)
    return i + 1


def swap(arr, i, j):
    arr[i], arr[j] = arr[j], arr[i]


def quick_sort_rec(arr, low, high):
    if low < high:
        p_idx = partition(arr, low, high)
        quick_sort_rec(arr, low, p_idx - 1)
        quick_sort_rec(arr, p_idx + 1, high)


def quick_sort(arr):
    quick_sort_rec(arr, 0, len(arr)-1)
