import React, { useState, useEffect } from 'react';

const MergeSortVisualizer = () => {
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
      type: 'initial',
      array: [...collection],
      tree: [{ array: [...collection], depth: 0, index: 0 }],
      current: null,
      message: 'Initial array'
    });

    // Run merge sort and capture steps
    const mergeSortWithSteps = (arr, depth = 0, index = 0) => {
      // Base case: arrays of length 0 or 1 are already sorted
      if (arr.length <= 1) {
        return arr;
      }
      
      // Split the array
      const middle = Math.floor(arr.length / 2);
      const left = arr.slice(0, middle);
      const right = arr.slice(middle);
      
      // Add split step
      const currentTree = steps[steps.length - 1].tree.filter(node => node.depth <= depth);
      const leftNode = { array: left, depth: depth + 1, index: index * 2 };
      const rightNode = { array: right, depth: depth + 1, index: index * 2 + 1 };
      
      steps.push({
        type: 'split',
        array: [...originalArray],
        tree: [...currentTree, leftNode, rightNode],
        current: null,
        splitNode: { array: arr, depth, index },
        leftNode,
        rightNode,
        message: `Splitting [${arr.join(', ')}] into [${left.join(', ')}] and [${right.join(', ')}]`
      });
      
      // Recursive calls
      const sortedLeft = mergeSortWithSteps(left, depth + 1, index * 2);
      const sortedRight = mergeSortWithSteps(right, depth + 1, index * 2 + 1);
      
      // Merge the sorted subarrays
      const merged = merge(sortedLeft, sortedRight, depth, index);
      
      return merged;
    };
    
    const merge = (left, right, depth, index) => {
      const result = [];
      let leftIndex = 0;
      let rightIndex = 0;
      const mergeSteps = [];
      
      // Add merge initial step
      const currentTree = steps[steps.length - 1].tree.filter(node => 
        !(node.depth === depth + 1 && (node.index === index * 2 || node.index === index * 2 + 1))
      );
      
      steps.push({
        type: 'merge-start',
        array: [...originalArray],
        tree: [...currentTree],
        current: null,
        leftArray: [...left],
        rightArray: [...right],
        resultArray: [],
        leftIndex,
        rightIndex,
        parentDepth: depth,
        parentIndex: index,
        message: `Starting to merge [${left.join(', ')}] and [${right.join(', ')}]`
      });
      
      // Compare elements from both arrays and merge them
      while (leftIndex < left.length && rightIndex < right.length) {
        const currentStep = {
          type: 'merge-compare',
          array: [...originalArray],
          tree: [...currentTree],
          leftArray: [...left],
          rightArray: [...right],
          resultArray: [...result],
          leftIndex,
          rightIndex,
          comparing: true,
          parentDepth: depth,
          parentIndex: index,
          message: `Comparing ${left[leftIndex]} and ${right[rightIndex]}`
        };
        
        if (left[leftIndex] <= right[rightIndex]) {
          result.push(left[leftIndex]);
          currentStep.selected = 'left';
          currentStep.message = `${left[leftIndex]} ≤ ${right[rightIndex]}, taking ${left[leftIndex]} from left`;
          leftIndex++;
        } else {
          result.push(right[rightIndex]);
          currentStep.selected = 'right';
          currentStep.message = `${left[leftIndex]} > ${right[rightIndex]}, taking ${right[rightIndex]} from right`;
          rightIndex++;
        }
        
        steps.push(currentStep);
        
        // Update the result array in a separate step
        steps.push({
          type: 'merge-update',
          array: [...originalArray],
          tree: [...currentTree],
          leftArray: [...left],
          rightArray: [...right],
          resultArray: [...result],
          leftIndex,
          rightIndex,
          parentDepth: depth,
          parentIndex: index,
          message: `Current merged result: [${result.join(', ')}]`
        });
      }
      
      // Add remaining elements from left array
      while (leftIndex < left.length) {
        result.push(left[leftIndex]);
        steps.push({
          type: 'merge-remaining',
          array: [...originalArray],
          tree: [...currentTree],
          leftArray: [...left],
          rightArray: [...right],
          resultArray: [...result],
          leftIndex,
          rightIndex,
          selected: 'left',
          parentDepth: depth,
          parentIndex: index,
          message: `Taking remaining ${left[leftIndex]} from left`
        });
        leftIndex++;
      }
      
      // Add remaining elements from right array
      while (rightIndex < right.length) {
        result.push(right[rightIndex]);
        steps.push({
          type: 'merge-remaining',
          array: [...originalArray],
          tree: [...currentTree],
          leftArray: [...left],
          rightArray: [...right],
          resultArray: [...result],
          leftIndex,
          rightIndex,
          selected: 'right',
          parentDepth: depth,
          parentIndex: index,
          message: `Taking remaining ${right[rightIndex]} from right`
        });
        rightIndex++;
      }
      
      // Add merge complete step
      const mergedNode = { array: [...result], depth, index };
      steps.push({
        type: 'merge-complete',
        array: [...originalArray],
        tree: [...currentTree, mergedNode],
        current: null,
        mergedArray: [...result],
        leftArray: [...left],      // Add these properties to the merge-complete step
        rightArray: [...right],    // Add these properties to the merge-complete step
        resultArray: [...result],  // Add these properties to the merge-complete step
        parentDepth: depth,
        parentIndex: index,
        message: `Merged into [${result.join(', ')}]`
      });
      
      return result;
    };
    
    // Run merge sort algorithm
    const sorted = mergeSortWithSteps([...collection]);
    
    // Final sorted state
    steps.push({
      type: 'complete',
      array: [...originalArray],
      tree: [{ array: sorted, depth: 0, index: 0 }],
      current: null,
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

  const renderArrayBox = (array, highlighted = false, color = 'blue') => {
    const borderColor = highlighted ? `border-${color}-500` : 'border-gray-300';
    const bgColor = highlighted ? `bg-${color}-50` : 'bg-white';
    
    return (
      <div className={`flex flex-wrap justify-center p-2 border-2 rounded ${borderColor} ${bgColor}`}>
        {array.map((value, idx) => (
          <div 
            key={idx} 
            className="w-8 h-8 flex items-center justify-center border border-gray-400 rounded m-1"
          >
            {value}
          </div>
        ))}
      </div>
    );
  };

  const renderMergeStep = (step) => {
    if (!step.leftArray || !step.rightArray || !step.resultArray) {
      return null; // Skip rendering if merge-related arrays are not defined
    }
    
    return (
      <div className="flex flex-col items-center w-full">
        <h3 className="text-lg font-semibold mb-2">Merging:</h3>
        <div className="flex justify-center gap-4 mb-4">
          <div className="flex flex-col items-center">
            <div className="text-sm text-gray-600 mb-1">Left Array</div>
            <div className="flex">
              {step.leftArray.map((value, idx) => (
                <div 
                  key={idx} 
                  className={`w-8 h-8 flex items-center justify-center border rounded m-1 ${
                    idx === step.leftIndex && step.comparing
                      ? 'border-blue-500 bg-blue-100'
                      : idx < step.leftIndex
                      ? 'border-gray-300 bg-gray-100 text-gray-400'
                      : 'border-gray-400'
                  }`}
                >
                  {value}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="text-sm text-gray-600 mb-1">Right Array</div>
            <div className="flex">
              {step.rightArray.map((value, idx) => (
                <div 
                  key={idx} 
                  className={`w-8 h-8 flex items-center justify-center border rounded m-1 ${
                    idx === step.rightIndex && step.comparing
                      ? 'border-blue-500 bg-blue-100'
                      : idx < step.rightIndex
                      ? 'border-gray-300 bg-gray-100 text-gray-400'
                      : 'border-gray-400'
                  }`}
                >
                  {value}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center mb-4">
          <div className="text-sm text-gray-600 mb-1">Merged Result</div>
          <div className="flex">
            {step.resultArray.map((value, idx) => (
              <div 
                key={idx} 
                className="w-8 h-8 flex items-center justify-center border-2 border-green-500 bg-green-100 rounded m-1"
              >
                {value}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTreeLevel = (step, level) => {
    const nodesAtLevel = step.tree.filter(node => node.depth === level);
    if (nodesAtLevel.length === 0) return null;
    
    return (
      <div className="flex justify-center gap-4 mb-4">
        {nodesAtLevel.sort((a, b) => a.index - b.index).map((node) => {
          const isHighlighted = 
            (step.type === 'split' && (
              (node.depth === step.splitNode.depth && node.index === step.splitNode.index) ||
              (node.depth === step.leftNode.depth && node.index === step.leftNode.index) ||
              (node.depth === step.rightNode.depth && node.index === step.rightNode.index)
            )) || 
            (step.type.startsWith('merge') && node.depth === step.parentDepth && node.index === step.parentIndex);
            
          const isNewlyMerged = step.type === 'merge-complete' && 
                                node.depth === step.parentDepth && 
                                node.index === step.parentIndex;
          
          return (
            <div 
              key={`${node.depth}-${node.index}`} 
              className="flex-shrink-0"
            >
              {renderArrayBox(
                node.array, 
                isHighlighted || isNewlyMerged, 
                isNewlyMerged ? 'green' : 'blue'
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderCurrentStep = () => {
    const step = sortingSteps[currentStep];
    if (!step) return null;
    
    // Find the maximum depth in the current tree
    const maxDepth = step.tree.reduce((max, node) => Math.max(max, node.depth), 0);
    
    return (
      <div className="flex flex-col items-center w-full">
        {/* Original Array */}
        <div className="mb-6 w-full">
          <h3 className="text-lg font-semibold mb-2">Original Array:</h3>
          <div className="flex justify-center">
            {renderArrayBox(step.array)}
          </div>
        </div>
        
        {/* Tree Visualization */}
        <div className="mb-6 w-full">
          <h3 className="text-lg font-semibold mb-2">Merge Sort Tree:</h3>
          {Array.from({ length: maxDepth + 1 }).map((_, level) => (
            <div key={level}>
              {renderTreeLevel(step, level)}
            </div>
          ))}
        </div>
        
        {/* Merge Process Visualization - Only render if it's a merge step */}
        {step.type.startsWith('merge') && renderMergeStep(step)}
        
        {/* Step Message */}
        <div className="my-4 p-2 bg-gray-100 rounded w-full text-center">
          <p className="font-medium">{step.message}</p>
          <p className="text-sm text-gray-600">Step {currentStep + 1} of {sortingSteps.length}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Merge Sort Visualization</h1>
      
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
        <h2 className="text-xl font-bold mb-2">Merge Sort Algorithm</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li><strong>Divide:</strong> Split the array in half recursively until subarrays contain only 1 element</li>
          <li><strong>Conquer:</strong> Individual elements are already sorted</li>
          <li><strong>Combine:</strong> Merge adjacent subarrays by comparing elements and creating sorted results</li>
        </ol>
        <p className="mt-2 text-sm text-gray-600">Time complexity: O(n log n), Space complexity: O(n)</p>
      </div>
    </div>
  );
};

export default MergeSortVisualizer;
