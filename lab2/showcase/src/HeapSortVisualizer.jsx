import React, { useState, useEffect } from 'react';

const HeapSortVisualizer = () => {
  const [input, setInput] = useState([8, 3, 1, 6, 4, 7, 2, 5]);
  const [customInput, setCustomInput] = useState('');
  const [sortingSteps, setSortingSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [speed, setSpeed] = useState(1000);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    generateSteps(input);
  }, [input]);

  useEffect(() => {
    let timer;
    if (isPlaying && currentStep < sortingSteps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, speed);
    } else if (currentStep >= sortingSteps.length - 1) {
      setIsPlaying(false);
      setIsComplete(true);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, sortingSteps, speed]);

  const generateSteps = (collection) => {
    const steps = [];
    const originalArray = [...collection];
    const workingArray = [...collection];
    
    // Initial state
    steps.push({
      type: 'initial',
      array: [...workingArray],
      heap: [],
      sorted: [],
      current: null,
      heapify: false,
      message: 'Initial array'
    });

    // Build max heap
    steps.push({
      type: 'build-heap-start',
      array: [...workingArray],
      heap: [...workingArray],
      sorted: [],
      current: null,
      heapify: false,
      message: 'Start building max heap'
    });

    // Heapify process (building max heap)
    const heapSize = workingArray.length;
    
    // Start from the last non-leaf node and heapify each
    for (let i = Math.floor(heapSize / 2) - 1; i >= 0; i--) {
      heapify(workingArray, heapSize, i, steps);
    }
    
    steps.push({
      type: 'build-heap-complete',
      array: [...originalArray],
      heap: [...workingArray],
      sorted: [],
      current: null,
      heapify: false,
      message: 'Max heap built completely'
    });

    // Extract elements from heap one by one
    const sorted = [];
    
    for (let i = workingArray.length - 1; i > 0; i--) {
      // Move current root to end
      steps.push({
        type: 'extract-max',
        array: [...originalArray],
        heap: [...workingArray],
        sorted: [...sorted],
        current: workingArray[0],
        swap: [0, i],
        activeIndices: [0, i],
        message: `Swap max element ${workingArray[0]} with last element ${workingArray[i]}`
      });
      
      [workingArray[0], workingArray[i]] = [workingArray[i], workingArray[0]];
      sorted.unshift(workingArray[i]);
      
      steps.push({
        type: 'extract-complete',
        array: [...originalArray],
        heap: [...workingArray.slice(0, i)],
        sorted: [...sorted],
        current: workingArray[i],
        heapify: false,
        message: `Placed ${workingArray[i]} in sorted position`
      });

      // Heapify root element to get highest element at root again
      heapify(workingArray, i, 0, steps);
    }
    
    // Add the last element to sorted
    sorted.unshift(workingArray[0]);
    
    steps.push({
      type: 'complete',
      array: [...originalArray],
      heap: [],
      sorted: [...sorted],
      current: null,
      heapify: false,
      message: 'Sorting complete!'
    });
    
    setSortingSteps(steps);
    setCurrentStep(0);
    setIsComplete(false);
  };

  // Heapify function
  const heapify = (arr, heapSize, rootIndex, steps) => {
    let largest = rootIndex;
    const left = 2 * rootIndex + 1;
    const right = 2 * rootIndex + 2;
    
    steps.push({
      type: 'heapify-start',
      array: [...arr],
      heap: [...arr.slice(0, heapSize)],
      sorted: steps.length > 0 && steps[steps.length - 1].sorted ? [...steps[steps.length - 1].sorted] : [],
      current: arr[rootIndex],
      heapify: true,
      activeIndices: [rootIndex],
      comparingIndices: [left < heapSize ? left : null, right < heapSize ? right : null].filter(Boolean),
      message: `Heapifying subtree rooted at index ${rootIndex} (value ${arr[rootIndex]})`
    });

    // If left child is larger than root
    if (left < heapSize && arr[left] > arr[largest]) {
      largest = left;
      steps.push({
        type: 'heapify-compare',
        array: [...arr],
        heap: [...arr.slice(0, heapSize)],
        sorted: steps.length > 0 && steps[steps.length - 1].sorted ? [...steps[steps.length - 1].sorted] : [],
        current: arr[rootIndex],
        heapify: true,
        activeIndices: [rootIndex, left],
        message: `Left child ${arr[left]} is larger than root ${arr[rootIndex]}`
      });
    }

    // If right child is larger than largest so far
    if (right < heapSize && arr[right] > arr[largest]) {
      largest = right;
      steps.push({
        type: 'heapify-compare',
        array: [...arr],
        heap: [...arr.slice(0, heapSize)],
        sorted: steps.length > 0 && steps[steps.length - 1].sorted ? [...steps[steps.length - 1].sorted] : [],
        current: arr[rootIndex],
        heapify: true,
        activeIndices: [rootIndex, right],
        message: `Right child ${arr[right]} is larger than current largest ${arr[largest === left ? left : rootIndex]}`
      });
    }

    // If largest is not root
    if (largest !== rootIndex) {
      steps.push({
        type: 'heapify-swap',
        array: [...arr],
        heap: [...arr.slice(0, heapSize)],
        sorted: steps.length > 0 && steps[steps.length - 1].sorted ? [...steps[steps.length - 1].sorted] : [],
        current: arr[rootIndex],
        heapify: true,
        swap: [rootIndex, largest],
        activeIndices: [rootIndex, largest],
        message: `Swap ${arr[rootIndex]} with ${arr[largest]}`
      });
      
      [arr[rootIndex], arr[largest]] = [arr[largest], arr[rootIndex]];
      
      steps.push({
        type: 'heapify-continue',
        array: [...arr],
        heap: [...arr.slice(0, heapSize)],
        sorted: steps.length > 0 && steps[steps.length - 1].sorted ? [...steps[steps.length - 1].sorted] : [],
        current: arr[largest],
        heapify: true,
        activeIndices: [largest],
        message: `Continue heapifying the affected subtree rooted at ${largest}`
      });
      
      // Recursively heapify the affected sub-tree
      heapify(arr, heapSize, largest, steps);
    } else {
      steps.push({
        type: 'heapify-complete',
        array: [...arr],
        heap: [...arr.slice(0, heapSize)],
        sorted: steps.length > 0 && steps[steps.length - 1].sorted ? [...steps[steps.length - 1].sorted] : [],
        current: null,
        heapify: false,
        message: `Heapify at index ${rootIndex} complete`
      });
    }
  };

  const handleCustomInputSubmit = (e) => {
    e.preventDefault();
    const parsed = customInput.split(',').map(item => {
      const num = parseInt(item.trim());
      return isNaN(num) ? 0 : num;
    }).filter(num => num !== 0);
    
    if (parsed.length > 0) {
      setInput(parsed);
      setCurrentStep(0);
      setIsComplete(false);
      setIsPlaying(false);
    }
  };

  // Helper function to visualize array as tree
  const renderHeapTree = (heap) => {
    if (!heap || heap.length === 0) return null;
    
    // Calculate the height of the heap tree (log base 2)
    const height = Math.floor(Math.log2(heap.length)) + 1;
    const treeRows = [];
    
    let nodeIndex = 0;
    for (let level = 0; level < height; level++) {
      const nodesInLevel = Math.min(Math.pow(2, level), heap.length - Math.pow(2, level) + 1);
      const rowNodes = [];
      
      for (let i = 0; i < nodesInLevel && nodeIndex < heap.length; i++) {
        const step = sortingSteps[currentStep];
        const isActive = step.activeIndices && step.activeIndices.includes(nodeIndex);
        const isComparing = step.comparingIndices && step.comparingIndices.includes(nodeIndex);
        const isSwapping = step.swap && step.swap.includes(nodeIndex);
        
        rowNodes.push(
          <div 
            key={nodeIndex} 
            className={`mx-1 w-10 h-10 flex items-center justify-center rounded-full border-2 
              ${isActive ? 'bg-yellow-200 border-yellow-500' : 
                isComparing ? 'bg-blue-200 border-blue-500' : 
                  isSwapping ? 'bg-red-200 border-red-500' : 'border-gray-400'}`}
          >
            {heap[nodeIndex]}
          </div>
        );
        nodeIndex++;
      }
      
      treeRows.push(
        <div key={level} className="flex justify-center my-4" style={{ marginLeft: Math.pow(2, height - level - 1) * 5 + 'px', marginRight: Math.pow(2, height - level - 1) * 5 + 'px' }}>
          {rowNodes}
        </div>
      );
    }
    
    return <div className="heap-tree relative">{treeRows}</div>;
  };

  const renderCurrentStep = () => {
    const step = sortingSteps[currentStep];
    if (!step) return null;
    
    return (
      <div className="flex flex-col items-center w-full">
        {/* Original Array */}
        <div className="mb-4 w-full">
          <h3 className="text-lg font-semibold mb-2">Original Array:</h3>
          <div className="flex justify-center gap-2">
            {step.array.map((value, idx) => (
              <div 
                key={idx} 
                className="w-10 h-10 flex items-center justify-center border-2 border-gray-400 rounded"
              >
                {value}
              </div>
            ))}
          </div>
        </div>

        {/* Heap Visualization */}
        <div className="mb-4 w-full">
          <h3 className="text-lg font-semibold mb-2">Heap Structure:</h3>
          {step.heap && step.heap.length > 0 ? (
            <div className="overflow-x-auto py-4">
              {renderHeapTree(step.heap)}
            </div>
          ) : (
            <div className="text-gray-500 text-center">No heap yet</div>
          )}
        </div>
        
        {/* Heap Array Representation */}
        <div className="mb-4 w-full">
          <h3 className="text-lg font-semibold mb-2">Heap Array:</h3>
          <div className="flex justify-center gap-2 flex-wrap">
            {step.heap && step.heap.map((value, idx) => {
              const isActive = step.activeIndices && step.activeIndices.includes(idx);
              const isComparing = step.comparingIndices && step.comparingIndices.includes(idx);
              const isSwapping = step.swap && step.swap.includes(idx);
              
              return (
                <div 
                  key={idx} 
                  className={`w-10 h-10 flex items-center justify-center border-2 rounded
                    ${isActive ? 'bg-yellow-200 border-yellow-500' : 
                      isComparing ? 'bg-blue-200 border-blue-500' : 
                        isSwapping ? 'bg-red-200 border-red-500' : 'border-gray-400'}`}
                >
                  {value}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Sorted Output */}
        <div className="mb-4 w-full">
          <h3 className="text-lg font-semibold mb-2">Sorted Output:</h3>
          {step.sorted && step.sorted.length > 0 ? (
            <div className="flex justify-center gap-2">
              {step.sorted.map((value, idx) => (
                <div 
                  key={idx} 
                  className="w-10 h-10 flex items-center justify-center border-2 border-green-500 bg-green-100 rounded"
                >
                  {value}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center">Not sorted yet</div>
          )}
        </div>
        
        {/* Step Message */}
        <div className="my-4 p-2 bg-gray-100 rounded w-full text-center">
          <p className="font-medium">{step.message}</p>
          <p className="text-sm text-gray-600">Step {currentStep} of {sortingSteps.length - 1}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Heap Sort Visualization</h1>
      
      {/* Controls */}
      <div className="flex flex-col sm:flex-row w-full gap-4 mb-6">
        <form onSubmit={handleCustomInputSubmit} className="flex gap-2 flex-1">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Enter numbers (e.g. 8,3,1,6,4,7)"
            className="flex-1 p-2 border border-gray-300 rounded"
          />
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Set
          </button>
        </form>
        
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() => {
              if (isComplete) {
                setCurrentStep(0);
                setIsComplete(false);
              }
              setIsPlaying(!isPlaying);
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {isPlaying ? 'Pause' : isComplete ? 'Restart' : 'Play'}
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(sortingSteps.length - 1, currentStep + 1))}
            disabled={currentStep === sortingSteps.length - 1}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      
      <div className="w-full mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Animation Speed: {speed}ms
        </label>
        <input
          type="range"
          min="200"
          max="2000"
          step="100"
          value={speed}
          onChange={(e) => setSpeed(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
      
      {/* Visualization */}
      <div className="w-full border-2 border-gray-300 rounded-lg p-4 bg-white">
        {renderCurrentStep()}
      </div>
      
      {/* Algorithm Description */}
      <div className="mt-8 w-full">
        <h2 className="text-xl font-bold mb-2">Heap Sort Algorithm</h2>
        <p className="mb-4">
          Heap Sort is a comparison-based sorting algorithm that uses a binary heap data structure:
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Build a max heap from the input data.</li>
          <li>Extract the largest element (at the root) and place it at the end of the sorted array.</li>
          <li>Rebuild the heap with one less element.</li>
          <li>Repeat until the heap is empty.</li>
        </ol>
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Legend:</h3>
          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-yellow-200 border border-yellow-500 rounded-full mr-2"></div>
              <span>Active Node</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 bg-blue-200 border border-blue-500 rounded-full mr-2"></div>
              <span>Comparing</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 bg-red-200 border border-red-500 rounded-full mr-2"></div>
              <span>Swapping</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 bg-green-100 border border-green-500 rounded-full mr-2"></div>
              <span>Sorted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeapSortVisualizer;
