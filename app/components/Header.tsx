'use client'

import { useState } from 'react'
import { Sparkles, Download, Brain } from 'lucide-react'
import ExportMenu from './ExportMenu'

interface HeaderProps {
  onTogglePrompt: () => void
  showPromptPanel: boolean
  onExport: (format: 'png' | 'svg' | 'json') => void
}

export default function Header({ onTogglePrompt, showPromptPanel, onExport }: HeaderProps) {
  const [showExportMenu, setShowExportMenu] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between text-gray-900">
      <div className="flex items-center space-x-2">
        <button
          onClick={onTogglePrompt}
          className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
            showPromptPanel ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : 'hover:bg-gray-100'
          }`}
        >
          <Brain size={20} />
          {showPromptPanel && <span className="text-sm font-medium">IA Ativa</span>}
        </button>
      </div>
      
      <div className="relative">
        <button 
          onClick={() => setShowExportMenu(!showExportMenu)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Download size={16} />
        </button>
        
        {showExportMenu && (
          <ExportMenu 
            onExport={onExport}
            onClose={() => setShowExportMenu(false)}
          />
        )}
      </div>
    </header>
  )
}