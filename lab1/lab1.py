import time
import matplotlib.pyplot as plt

def plotFibPerformance(fibFunc, numList):
    times = []
    for n in numList:
        start = time.perf_counter()
        fibFunc(n)
        times.append(time.perf_counter() - start)
    
    plt.figure(figsize=(10, 6))
    plt.plot(numList, times, 'bo-')
    plt.xlabel('n-th Fibonacci Number')
    plt.ylabel('Time (seconds)')
    plt.title(f'Performance of {fibFunc.__name__}')
    plt.grid(True)
    
    #return times
    return plt.gcf()

input1 = [5, 7, 10, 12, 15, 17, 20, 22, 25, 27, 30, 32, 35,]
input2 = [501, 631, 794, 1000, 1259, 1585, 1995, 2512, 3162, 3981, 5012, 6310, 7943,]

def recursiveFib(n):
    if n <= 1:  # Base cases
        return n
    return recursiveFib(n-1) + recursiveFib(n-2)

plotFibPerformance(recursiveFib, input1)

def memoFib(n, memo=None):
    if memo is None: memo = {}
    if n <= 1: return n
    if n not in memo:
        memo[n] = memoFib(n-1, memo) + memoFib(n-2, memo)
    return memo[n]

plotFibPerformance(memoFib, input1)

MOD = 10**9 + 7

def multiply(A, B):
    # Matrix to store the result
    C = [[0, 0], [0, 0]]

    # Matrix Multiply
    C[0][0] = (A[0][0] * B[0][0] + A[0][1] * B[1][0]) % MOD
    C[0][1] = (A[0][0] * B[0][1] + A[0][1] * B[1][1]) % MOD
    C[1][0] = (A[1][0] * B[0][0] + A[1][1] * B[1][0]) % MOD
    C[1][1] = (A[1][0] * B[0][1] + A[1][1] * B[1][1]) % MOD

    # Copy the result back to the first matrix
    A[0][0] = C[0][0]
    A[0][1] = C[0][1]
    A[1][0] = C[1][0]
    A[1][1] = C[1][1]

def power(M, expo):
    # Initialize result with identity matrix
    ans = [[1, 0], [0, 1]]

    # Fast Exponentiation
    while expo:
        if expo & 1:
            multiply(ans, M)
        multiply(M, M)
        expo >>= 1

    return ans

def matrixExpoFib(n):
    # Base case
    if n == 0 or n == 1:
        return 1

    M = [[1, 1], [1, 0]]
    # F(0) = 0, F(1) = 1
    F = [[1, 0], [0, 0]]

    # Multiply matrix M (n - 1) times
    res = power(M, n - 1)

    # Multiply Resultant with Matrix F
    multiply(res, F)

    return res[0][0] % MOD

plotFibPerformance(matrixExpoFib, input2)

def fastDoublingFib(n):
    return _fib(n)[0]

# Auxiliary method for Fast Doubling
def _fib(n):
    if n == 0:
        return 0, 1
    else:
        a, b = _fib(n // 2)
        c = a * (b * 2 - a)
        d = a * a + b * b
        if n % 2 == 0:
            return c, d
        else:
            return d, c + d

plotFibPerformance(fastDoublingFib, input2)

def dpFib(n):
    if n <= 1: return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b  # Store only previous two values
    return b

plotFibPerformance(dpFib, input2)

import math
from decimal import Decimal, Context, ROUND_HALF_EVEN


input3 = [5, 7, 10, 12, 15, 17, 20, 22, 25, 27, 30, 32, 35, 47, 50, 55, 65, 70, 80, 100, 150, 166, 200]

def binetFib(n):
    ctx = Context(prec=60, rounding=ROUND_HALF_EVEN)
    phi = Decimal((1 + Decimal(5**(1/2))))
    psi = Decimal((1 - Decimal(5**(1/2))))
    return int((ctx.power(phi, Decimal(n)) - ctx.power(psi, Decimal(n))) / (2 ** n * Decimal(5 * (1/2))))

numBinet = binetFib(75)
numDoubl = fastDoublingFib(75)
err = abs(numBinet - numDoubl)
f"binet:\t\t{numBinet}\nvs fast doubling:\t{numDoubl}\nThe error:\t{err}"

plotFibPerformance(binetFib, input3)
