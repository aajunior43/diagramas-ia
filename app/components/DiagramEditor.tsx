'use client'

import { useCallback, useRef, useState, forwardRef, useImperativeHandle, useEffect } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  ReactFlowProvider,
  ReactFlowInstance,
} from 'reactflow'
import 'reactflow/dist/style.css'

import CustomNode from './CustomNode'
import EmptyState from './EmptyState'
import DiagramStats from './DiagramStats'
import ConfigStatus from './ConfigStatus'
import { useDiagramValidation } from '../hooks/useAutoCorrection'
import { DiagramConfig } from './AdvancedSettings'

const nodeTypes = {
  custom: CustomNode,
}

const initialNodes: Node[] = []
const initialEdges: Edge[] = []



interface DiagramEditorProps {
  onOpenPrompt?: () => void
  onRequestCorrection?: (errorDetails: string) => void
  showStats?: boolean
  currentConfig?: DiagramConfig
}

const DiagramEditor = forwardRef<any, DiagramEditorProps>(({ onOpenPrompt, onRequestCorrection, showStats = true, currentConfig }, ref) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  
  const { validateDiagram } = useDiagramValidation()

  useImperativeHandle(ref, () => ({
    getNodesAndEdges: () => ({ nodes, edges }),
    loadDiagram: (diagram: { nodes: Node[]; edges: Edge[] }) => {
      setNodes(diagram.nodes)
      setEdges(diagram.edges)
      // Ajustar visualização após carregar
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ padding: 0.2 })
        }
      }, 100)
    },
    validateCurrentDiagram: () => {
      const validation = validateDiagram(nodes, edges)
      if (!validation.isValid) {
        setValidationErrors(validation.errors)
        return validation
      }
      return validation
    }
  }))

  // Validação automática quando o diagrama muda
  useEffect(() => {
    if (nodes.length > 0) {
      const validation = validateDiagram(nodes, edges)
      if (!validation.isValid) {
        console.warn('Erros detectados no diagrama:', validation.errors)
        setValidationErrors(validation.errors)
        
        // Auto-correção automática após 2 segundos se houver erros críticos
        const criticalErrors = validation.errors.filter(error => 
          error.includes('duplicado') || 
          error.includes('inexistente') ||
          error.includes('pelo menos um nó')
        )
        
        if (criticalErrors.length > 0 && onRequestCorrection) {
          setTimeout(() => {
            console.log('🔄 Solicitando correção automática devido a erros críticos')
            onRequestCorrection(criticalErrors.join('; '))
          }, 2000)
        }
      } else {
        setValidationErrors([])
      }
    }
  }, [nodes, edges, validateDiagram, onRequestCorrection])



  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  // Remover funcionalidades de drag and drop para simplificar

  // Mostrar EmptyState se não há nós
  if (nodes.length === 0) {
    return (
      <div className="w-full h-full">
        <EmptyState onOpenPrompt={onOpenPrompt || (() => {})} />
      </div>
    )
  }

  return (
    <div className="w-full h-full relative" ref={reactFlowWrapper}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
        >
          <Controls />
          <MiniMap />
          <Background />
        </ReactFlow>
        
        <DiagramStats 
          nodes={nodes} 
          edges={edges} 
          isVisible={showStats}
        />
        
        {currentConfig && (
          <ConfigStatus 
            config={currentConfig}
            isVisible={nodes.length > 0}
          />
        )}




      </ReactFlowProvider>
    </div>
  )
})

DiagramEditor.displayName = 'DiagramEditor'

export default DiagramEditor