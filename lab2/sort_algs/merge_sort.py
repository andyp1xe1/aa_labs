def merge(arr, left, mid, right):
    n1 = mid - left + 1
    n2 = right - mid
    # Create temp arrays
    L = [0] * n1
    R = [0] * n2
    # Copy data to temp arrays L[] and R[]
    for i in range(n1):
        L[i] = arr[left + i]
    for j in range(n2):
        R[j] = arr[mid + 1 + j]
    i = 0  # Initial index of first subarray
    j = 0  # Initial index of second subarray
    k = left  # Initial index of merged subarray
    # Merge the temp arrays back
    # into arr[left..right]
    while i < n1 and j < n2:
        if L[i] <= R[j]:
            arr[k] = L[i]
            i += 1
        else:
            arr[k] = R[j]
            j += 1
        k += 1
    # Copy the remaining elements of L[],
    # if there are any
    while i < n1:
        arr[k] = L[i]
        i += 1
        k += 1
    # Copy the remaining elements of R[],
    # if there are any
    while j < n2:
        arr[k] = R[j]
        j += 1
        k += 1
    return


def merge_sort_rec(arr, left, right):
    if left < right:
        mid = (left + right) // 2
        merge_sort_rec(arr, left, mid)
        merge_sort_rec(arr, mid + 1, right)
        merge(arr, left, mid, right)
    return


def merge_sort(arr):
    merge_sort_rec(arr, 0, len(arr)-1)
