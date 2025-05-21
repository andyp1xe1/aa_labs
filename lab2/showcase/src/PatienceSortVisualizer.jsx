import React, { useState, useEffect } from 'react';

const PatienceSortVisualizer = () => {
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
    const piles = [];
    const originalArray = [...collection];
    
    // Initial state
    steps.push({
      type: 'initial',
      array: [...collection],
      piles: [],
      sorted: [],
      current: null,
      message: 'Initial array'
    });

    // Building piles
    for (let i = 0; i < collection.length; i++) {
      const item = collection[i];
      let placed = false;
      
      // Current state before placing
      steps.push({
        type: 'building',
        array: [...originalArray],
        piles: JSON.parse(JSON.stringify(piles)),
        sorted: [],
        current: item,
        activeIndex: i,
        message: `Looking where to place ${item}`
      });
      
      for (let j = 0; j < piles.length; j++) {
        if (item < piles[j][piles[j].length - 1]) {
          piles[j].push(item);
          placed = true;
          
          steps.push({
            type: 'building',
            array: [...originalArray],
            piles: JSON.parse(JSON.stringify(piles)),
            sorted: [],
            current: item,
            activeIndex: i,
            activePile: j,
            message: `Added ${item} to pile ${j + 1}`
          });
          break;
        }
      }
      
      if (!placed) {
        piles.push([item]);
        steps.push({
          type: 'building',
          array: [...originalArray],
          piles: JSON.parse(JSON.stringify(piles)),
          sorted: [],
          current: item,
          activeIndex: i,
          activePile: piles.length - 1,
          message: `Created new pile ${piles.length} with ${item}`
        });
      }
    }
    
    // Final piles state
    steps.push({
      type: 'building-complete',
      array: [...originalArray],
      piles: JSON.parse(JSON.stringify(piles)),
      sorted: [],
      current: null,
      message: 'All items placed in piles'
    });
    
    // Merging piles
    const sorted = [];
    const pilesCopy = JSON.parse(JSON.stringify(piles));
    
    while (pilesCopy.length > 0) {
      let smallestPileIndex = 0;
      for (let i = 1; i < pilesCopy.length; i++) {
        if (pilesCopy[i][pilesCopy[i].length - 1] < pilesCopy[smallestPileIndex][pilesCopy[smallestPileIndex].length - 1]) {
          smallestPileIndex = i;
        }
      }
      
      const smallest = pilesCopy[smallestPileIndex][pilesCopy[smallestPileIndex].length - 1];
      pilesCopy[smallestPileIndex].pop();
      sorted.push(smallest);
      
      steps.push({
        type: 'merging',
        array: [...originalArray],
        piles: JSON.parse(JSON.stringify(pilesCopy)),
        sorted: [...sorted],
        current: smallest,
        activePile: smallestPileIndex,
        message: `Taking ${smallest} from pile ${smallestPileIndex + 1}`
      });
      
      if (pilesCopy[smallestPileIndex].length === 0) {
        pilesCopy.splice(smallestPileIndex, 1);
        steps.push({
          type: 'merging',
          array: [...originalArray],
          piles: JSON.parse(JSON.stringify(pilesCopy)),
          sorted: [...sorted],
          current: null,
          message: `Removed empty pile ${smallestPileIndex + 1}`
        });
      }
    }
    
    // Final sorted state
    steps.push({
      type: 'complete',
      array: [...originalArray],
      piles: [],
      sorted: [...sorted],
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

  const renderCurrentStep = () => {
    const step = sortingSteps[currentStep];
    if (!step) return null;
    
    return (
      <div className="flex flex-col items-center w-full">
        {/* Original Array */}
        <div className="mb-8 w-full">
          <h3 className="text-lg font-semibold mb-2">Original Array:</h3>
          <div className="flex justify-center gap-2">
            {step.array.map((value, idx) => (
              <div 
                key={idx} 
                className={`w-10 h-10 flex items-center justify-center border-2 border-gray-400 rounded
                  ${step.type === 'building' && idx === step.activeIndex ? 'bg-yellow-200 border-yellow-500' : ''}
                `}
              >
                {value}
              </div>
            ))}
          </div>
        </div>

        {/* Current Element */}
        {step.current !== null && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Current Element:</h3>
            <div className="flex justify-center">
              <div className="w-10 h-10 flex items-center justify-center border-2 border-yellow-500 bg-yellow-200 rounded">
                {step.current}
              </div>
            </div>
          </div>
        )}
        
        {/* Piles */}
        <div className="mb-8 w-full">
          <h3 className="text-lg font-semibold mb-2">Piles:</h3>
          {step.piles.length === 0 ? (
            <div className="text-gray-500 text-center">No piles yet</div>
          ) : (
            <div className="flex justify-center gap-6">
              {step.piles.map((pile, pileIdx) => (
                <div 
                  key={pileIdx} 
                  className={`flex flex-col-reverse items-center p-2 border-2 rounded
                    ${step.activePile === pileIdx ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                  `}
                >
                  <div className="text-xs text-gray-500 mt-1">Pile {pileIdx + 1}</div>
                  {pile.map((value, valueIdx) => (
                    <div 
                      key={valueIdx} 
                      className={`w-10 h-10 flex items-center justify-center border-2 ${
                        valueIdx === pile.length - 1 ? 'border-blue-500 bg-blue-100' : 'border-gray-400'
                      } rounded mb-1`}
                    >
                      {value}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Sorted Output */}
        <div className="mb-8 w-full">
          <h3 className="text-lg font-semibold mb-2">Sorted Output:</h3>
          {step.sorted.length === 0 ? (
            <div className="text-gray-500 text-center">Not sorted yet</div>
          ) : (
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
      <h1 className="text-2xl font-bold mb-6">Patience Sort Visualization</h1>
      
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
        <h2 className="text-xl font-bold mb-2">Patience Sort Algorithm</h2>
        <p className="mb-4">
          Patience Sort is inspired by the card game "Patience". It works as follows:
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Take each card from the input array one by one.</li>
          <li>Place each card on the leftmost pile where it's less than the top card, or create a new pile.</li>
          <li>After all cards are placed, repeatedly take the smallest top card from all piles to build the sorted output.</li>
        </ol>
      </div>
    </div>
  );
};

export default PatienceSortVisualizer;


