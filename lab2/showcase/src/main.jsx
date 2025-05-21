import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PatienceSortVisualizer from './PatienceSortVisualizer.jsx'
import QuickSortVisualizer from './QuickSortVisualizer.jsx'
import MergeSortVisualizer from './MergeSortVisualizer.jsx'
import HeapSortVisualizer from './HeapSortVisualizer.jsx'

const App = () => {
  const [activeTab, setActiveTab] = useState('patience')
  
  const tabs = [
    { id: 'patience', name: 'Patience Sort', component: PatienceSortVisualizer },
    { id: 'quick', name: 'Quick Sort', component: QuickSortVisualizer },
    { id: 'merge', name: 'Merge Sort', component: MergeSortVisualizer },
    { id: 'heap', name: 'Heap Sort', component: HeapSortVisualizer }
  ]

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Sorting Algorithm Visualizers</h1>
      
      {/* Tabs Navigation */}
      <div className="flex border-b mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`px-4 py-2 font-medium mr-2 focus:outline-none ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.name}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="mt-4">
        {tabs.map(tab => (
          activeTab === tab.id && <tab.component key={tab.id} />
        ))}
      </div>
    </div>
  )
}

// Wrap in StrictMode and render
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
