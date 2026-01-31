'use client'

import { useState } from 'react'
import { AgentConfigPanel } from '@/components/AgentConfigPanel'
import { BehaviorInputPanel } from '@/components/BehaviorInputPanel'
import { DiagnosticResultsPanel } from '@/components/DiagnosticResultsPanel'
import { callAIAgent } from '@/lib/aiAgent'

export interface Agent {
  id: string
  name: string
  type: 'major' | 'sub'
  parentId?: string
}

export interface DiagnosticResult {
  category: string
  status: 'Pass' | 'Warning' | 'Issue'
  summary: string
  detailed_explanation: string
  recommended_fix: string
  severity: 'Low' | 'Medium' | 'High'
}

export interface DiagnosticResponse {
  overall_health_score: number
  diagnostics: DiagnosticResult[]
  priority_actions: string[]
}

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [flowDescription, setFlowDescription] = useState('')
  const [expectedBehavior, setExpectedBehavior] = useState('')
  const [actualBehavior, setActualBehavior] = useState('')
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResponse | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    if (!expectedBehavior.trim() || !actualBehavior.trim()) {
      alert('Please fill in both Expected and Actual Behavior fields')
      return
    }

    if (agents.length === 0) {
      alert('Please add at least one agent to your system')
      return
    }

    setAnalyzing(true)
    setDiagnosticResults(null)

    // Build the agent hierarchy description
    const agentHierarchy = agents.map(agent => {
      const parentAgent = agents.find(a => a.id === agent.parentId)
      return {
        name: agent.name,
        type: agent.type,
        parent: parentAgent?.name || null
      }
    })

    // Create comprehensive message for the diagnostic agent
    const message = `
AGENT SYSTEM CONFIGURATION:
${JSON.stringify(agentHierarchy, null, 2)}

FLOW DESCRIPTION:
${flowDescription || 'Not provided - please infer from agent structure'}

EXPECTED BEHAVIOR:
${expectedBehavior}

ACTUAL BEHAVIOR:
${actualBehavior}

Please analyze this multi-agent system and provide comprehensive diagnostics across all 7 categories.
`

    try {
      const result = await callAIAgent(
        message,
        '697e1751066158e77fde5fcb', // System Diagnostic Agent ID
        {
          user_id: 'diagnostic-user',
          session_id: `session-${Date.now()}`
        }
      )

      if (result.success && result.response.result) {
        // Parse the result directly - it should already be in the correct format
        const diagnosticData = result.response.result as DiagnosticResponse
        setDiagnosticResults(diagnosticData)
      } else {
        alert('Failed to analyze system. Please try again.')
        console.error('Analysis error:', result.error)
      }
    } catch (error) {
      console.error('Error analyzing system:', error)
      alert('An error occurred during analysis. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white">
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#4361ee] mb-2">Agent System Debugger</h1>
          <p className="text-gray-400">
            Diagnostic tool for troubleshooting multi-agent systems
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Agent Configuration */}
          <div className="lg:col-span-1">
            <AgentConfigPanel agents={agents} setAgents={setAgents} />
          </div>

          {/* Center Panel - Behavior Input */}
          <div className="lg:col-span-1">
            <BehaviorInputPanel
              flowDescription={flowDescription}
              setFlowDescription={setFlowDescription}
              expectedBehavior={expectedBehavior}
              setExpectedBehavior={setExpectedBehavior}
              actualBehavior={actualBehavior}
              setActualBehavior={setActualBehavior}
              onAnalyze={handleAnalyze}
              analyzing={analyzing}
            />
          </div>

          {/* Right Panel - Diagnostic Results */}
          <div className="lg:col-span-1">
            <DiagnosticResultsPanel
              results={diagnosticResults}
              analyzing={analyzing}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
