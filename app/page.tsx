'use client'

import { useState, useRef } from 'react'
import DiagramEditor from './components/DiagramEditor'
import Header from './components/Header'
import PromptPanel from './components/PromptPanel'
import { useExport } from './hooks/useExport'
import { useToast } from './components/Toast'
import { useAutoCorrection } from './hooks/useAutoCorrection'
import { DiagramConfig } from './components/AdvancedSettings'

export default function Home() {
  const [showPromptPanel, setShowPromptPanel] = useState(true)
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [currentConfig, setCurrentConfig] = useState<DiagramConfig | undefined>()
  const diagramRef = useRef<any>(null)
  const { exportAsImage, exportAsJSON, exportAsSVG } = useExport()
  const { showToast, ToastContainer } = useToast()
  const { correctDiagram, isGenerating, lastResult } = useAutoCorrection()

  const handleExport = async (type: 'png' | 'svg' | 'json') => {
    if (!diagramRef.current) {
      showToast('Nada para exportar', 'warning')
      return
    }

    const { nodes, edges } = diagramRef.current.getNodesAndEdges()

    try {
      switch (type) {
        case 'png':
          await exportAsImage(nodes, edges)
          showToast('PNG exportado!', 'success')
          break
        case 'svg':
          await exportAsSVG(nodes, edges)
          showToast('SVG exportado!', 'success')
          break
        case 'json':
          await exportAsJSON(nodes, edges)
          showToast('JSON exportado!', 'success')
          break
      }
    } catch (error) {
      showToast('Erro ao exportar', 'error')
    }
  }

  const handleDiagramGenerated = (diagram: { nodes: any[]; edges: any[] }, prompt?: string, config?: DiagramConfig) => {
    if (diagramRef.current && diagramRef.current.loadDiagram) {
      diagramRef.current.loadDiagram(diagram)
      
      // Salvar o prompt atual e configurações para possíveis correções
      if (prompt) {
        setCurrentPrompt(prompt)
      }
      if (config) {
        setCurrentConfig(config)
      }

      // Mostrar informações sobre correções automáticas e configurações
      let message = `${diagram.nodes.length} elementos`
      
      if (config) {
        if (config.autoMode) {
          message += ' (IA automática)'
        } else {
          message += ` (${config.format}, ${config.complexity})`
        }
      }

      if (lastResult?.autoFixed) {
        if (lastResult.fallbackUsed) {
          showToast(`Diagrama de fallback criado - ${message}. A IA teve dificuldades com o prompt original.`, 'warning')
        } else {
          showToast(`Diagrama criado e corrigido automaticamente - ${message}!`, 'success')
        }
      } else {
        showToast(message, 'success')
      }
    }
    setShowPromptPanel(false) // Fechar painel após gerar diagrama
  }

  const handleRequestCorrection = async (errorDetails: string) => {
    if (!diagramRef.current || !currentPrompt) {
      showToast('Não é possível corrigir: diagrama ou prompt não encontrado', 'error')
      return
    }

    const { nodes, edges } = diagramRef.current.getNodesAndEdges()
    
    showToast('🔄 Corrigindo diagrama automaticamente...', 'info')
    
    try {
      const correctedDiagram = await correctDiagram(currentPrompt, { nodes, edges }, errorDetails)
      
      if (correctedDiagram) {
        diagramRef.current.loadDiagram(correctedDiagram)
        
        if (lastResult?.fallbackUsed) {
          showToast('✅ Diagrama corrigido usando fallback devido a erros complexos', 'warning')
        } else {
          showToast('✅ Diagrama corrigido automaticamente pela IA!', 'success')
        }
      } else {
        showToast('❌ Não foi possível corrigir o diagrama automaticamente', 'error')
      }
    } catch (error) {
      console.error('Erro na correção:', error)
      showToast('❌ Erro durante a correção automática', 'error')
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header 
        onTogglePrompt={() => setShowPromptPanel(!showPromptPanel)}
        onExport={handleExport}
        showPromptPanel={showPromptPanel}
      />
      <div className="flex flex-1 overflow-hidden">
        {showPromptPanel && (
          <PromptPanel 
            onDiagramGenerated={handleDiagramGenerated}
            onClose={() => setShowPromptPanel(false)}
          />
        )}
        <main className="flex-1 relative">
          <DiagramEditor 
            ref={diagramRef} 
            onOpenPrompt={() => setShowPromptPanel(true)}
            onRequestCorrection={handleRequestCorrection}
            currentConfig={currentConfig}
          />
          
          {/* Indicador de correção em andamento */}
          {isGenerating && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-20 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Corrigindo diagrama...</span>
            </div>
          )}
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}