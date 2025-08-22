'use client'

import { Sparkles, Zap, ArrowRight, Brain, Lightbulb, Rocket } from 'lucide-react'
import { useState, useEffect } from 'react'

interface EmptyStateProps {
  onOpenPrompt: () => void
}

const features = [
  { icon: Brain, text: "IA Avançada", desc: "Powered by Google Gemini" },
  { icon: Lightbulb, text: "Criação Inteligente", desc: "Diagramas automáticos" },
  { icon: Rocket, text: "Super Rápido", desc: "Resultados em segundos" }
]

const examples = [
  "Processo de login com validação",
  "Workflow de aprovação de documentos", 
  "Sistema de e-commerce completo",
  "Pipeline de deploy automatizado"
]

export default function EmptyState({ onOpenPrompt }: EmptyStateProps) {
  const [currentExample, setCurrentExample] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExample((prev) => (prev + 1) % examples.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
      </div>

      <div className="text-center max-w-2xl px-6 relative z-10">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 animate-bounce">
            <Sparkles size={36} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Diagramas IA
          </h1>
          

        </div>



        <div className="space-y-6">
          <button
            onClick={onOpenPrompt}
            className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Zap size={24} />
            <span>Criar</span>
            <ArrowRight size={20} />
          </button>


        </div>
      </div>
    </div>
  )
}