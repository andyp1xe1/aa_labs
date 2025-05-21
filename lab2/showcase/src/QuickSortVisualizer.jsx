import React, { useState, useEffect } from 'react';

const QuickSortVisualizer = () => {
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
    
    // Initial state
    steps.push({
      array: [...collection],
      subarrays: [{ start: 0, end: collection.length - 1, level: 0 }],
      pivot: null,
      left: null,
      right: null,
      message: 'Initial array'
    });

    // Run quicksort algorithm with step tracking
    const quickSort = (arr, start, end, level) => {
      if (start >= end) return;
      
      // Choose pivot (using last element for simplicity)
      const pivotIndex = end;
      const pivotValue = arr[pivotIndex];
      
      steps.push({
        array: [...arr],
        subarrays: getActiveSubarrays(arr, start, end, level),
        pivot: pivotIndex,
        left: null,
        right: null,
        message: `Selected pivot: ${pivotValue} at index ${pivotIndex}`
      });
      
      // Partition step
      let i = start - 1;
      
      for (let j = start; j < end; j++) {
        steps.push({
          array: [...arr],
          subarrays: getActiveSubarrays(arr, start, end, level),
          pivot: pivotIndex,
          left: i,
          right: j,
          message: `Comparing ${arr[j]} with pivot ${pivotValue}`
        });
        
        if (arr[j] <= pivotValue) {
          i++;
          
          // Swap elements if needed
          if (i !== j) {
            [arr[i], arr[j]] = [arr[j], arr[i]];
            
            steps.push({
              array: [...arr],
              subarrays: getActiveSubarrays(arr, start, end, level),
              pivot: pivotIndex,
              left: i,
              right: j,
              message: `Swapped ${arr[i]} and ${arr[j]}`
            });
          }
        }
      }
      
      // Place pivot in correct position
      const newPivotIndex = i + 1;
      if (newPivotIndex !== pivotIndex) {
        [arr[newPivotIndex], arr[pivotIndex]] = [arr[pivotIndex], arr[newPivotIndex]];
        
        steps.push({
          array: [...arr],
          subarrays: getActiveSubarrays(arr, start, end, level),
          pivot: newPivotIndex,
          left: null,
          right: null,
          message: `Placed pivot ${pivotValue} at its correct position ${newPivotIndex}`
        });
      }
      
      // Mark partition as complete
      steps.push({
        array: [...arr],
        subarrays: [
          { start, end: newPivotIndex - 1, level: level + 1 },
          { start: newPivotIndex, end: newPivotIndex, level: level + 1, isPivot: true },
          { start: newPivotIndex + 1, end, level: level + 1 }
        ].filter(sub => sub.start <= sub.end),
        pivot: null,
        left: null,
        right: null,
        message: `Partition complete. Recursive calls on left and right subarrays.`
      });
      
      // Recursively sort left and right parts
      quickSort(arr, start, newPivotIndex - 1, level + 1);
      quickSort(arr, newPivotIndex + 1, end, level + 1);
    };
    
    // Helper to get currently active subarrays for visualization
    const getActiveSubarrays = (arr, start, end, level) => {
      return [{ start, end, level }];
    };
    
    // Run the algorithm
    const arrCopy = [...originalArray];
    quickSort(arrCopy, 0, arrCopy.length - 1, 0);
    
    // Final sorted state
    steps.push({
      array: arrCopy,
      subarrays: [],
      pivot: null,
      left: null,
      right: null,
      message: 'Sorting complete!'
    });
    
    setSortingSteps(steps);
    setCurrentStep(0);
    setIsComplete(false);
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

  const renderCurrentStep = () => {
    const step = sortingSteps[currentStep];
    if (!step) return null;
    
    return (
      <div className="flex flex-col items-center w-full">
        {/* Visualization of the array */}
        <div className="mb-8 w-full">
          <h3 className="text-lg font-semibold mb-2">Array:</h3>
          <div className="flex justify-center gap-2 flex-wrap">
            {step.array.map((value, idx) => {
              let elementClasses = "w-10 h-10 flex items-center justify-center border-2 border-gray-400 rounded";
              
              // Active subarray highlighting
              step.subarrays.forEach(subarray => {
                if (idx >= subarray.start && idx <= subarray.end) {
                  elementClasses += " bg-blue-50";
                  
                  // Current level of recursion gets stronger highlighting
                  if (subarray.isPivot) {
                    elementClasses = "w-10 h-10 flex items-center justify-center border-2 border-purple-500 bg-purple-100 rounded";
                  }
                }
              });
              
              // Pivot highlighting
              if (idx === step.pivot) {
                elementClasses = "w-10 h-10 flex items-center justify-center border-2 border-red-500 bg-red-100 rounded";
              }
              
              // Left pointer
              if (idx === step.left) {
                elementClasses = "w-10 h-10 flex items-center justify-center border-2 border-green-500 bg-green-100 rounded";
              }
              
              // Right pointer
              if (idx === step.right) {
                elementClasses = "w-10 h-10 flex items-center justify-center border-2 border-yellow-500 bg-yellow-100 rounded";
              }
              
              return (
                <div key={idx} className={elementClasses}>
                  {value}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Step Description */}
        <div className="my-4 p-2 bg-gray-100 rounded w-full text-center">
          <p className="font-medium">{step.message}</p>
          <p className="text-sm text-gray-600">Step {currentStep} of {sortingSteps.length - 1}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Quick Sort Visualization</h1>
      
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
        <h2 className="text-xl font-bold mb-2">Quick Sort Algorithm</h2>
        <p className="mb-4">
          Quick Sort is a divide-and-conquer algorithm that works as follows:
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Choose a pivot element from the array.</li>
          <li>Partition the array: reorder it so elements smaller than the pivot come before it, and elements greater come after it.</li>
          <li>Recursively apply the algorithm to the sub-arrays on both sides of the pivot.</li>
        </ol>
        <p className="mt-4">
          <strong>Color Legend:</strong>
          <span className="inline-block mx-2 px-2 border-2 border-red-500 bg-red-100 rounded">Pivot</span>
          <span className="inline-block mx-2 px-2 border-2 border-green-500 bg-green-100 rounded">Left Pointer</span>
          <span className="inline-block mx-2 px-2 border-2 border-yellow-500 bg-yellow-100 rounded">Right Pointer</span>
          <span className="inline-block mx-2 px-2 border-2 border-purple-500 bg-purple-100 rounded">Fixed Pivot</span>
        </p>
      </div>
    </div>
  );
};

export default QuickSortVisualizer;
