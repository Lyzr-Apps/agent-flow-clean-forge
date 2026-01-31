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
  systemPrompt?: string
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

export interface PromptFixes {
  [agentId: string]: string
}

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [flowDescription, setFlowDescription] = useState('')
  const [expectedBehavior, setExpectedBehavior] = useState('')
  const [actualBehavior, setActualBehavior] = useState('')
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResponse | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [promptFixes, setPromptFixes] = useState<PromptFixes | null>(null)
  const [generatingFixes, setGeneratingFixes] = useState(false)

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
    setPromptFixes(null)

    // Build the agent hierarchy description
    const agentHierarchy = agents.map(agent => {
      const parentAgent = agents.find(a => a.id === agent.parentId)
      return {
        name: agent.name,
        type: agent.type,
        parent: parentAgent?.name || null,
        systemPrompt: agent.systemPrompt || 'Not provided'
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
        // Parse the result and handle different response structures
        let diagnosticData: DiagnosticResponse
        const resultData = result.response.result

        // Handle case where the agent returns the data nested or directly
        if (resultData.overall_health_score !== undefined && resultData.diagnostics) {
          // Direct format
          diagnosticData = resultData as DiagnosticResponse
        } else if (resultData.data) {
          // Nested in 'data' field
          diagnosticData = resultData.data as DiagnosticResponse
        } else if (resultData.result) {
          // Nested in 'result' field
          diagnosticData = resultData.result as DiagnosticResponse
        } else {
          throw new Error('Unexpected response format from diagnostic agent')
        }

        // Ensure diagnostics is an array
        if (!Array.isArray(diagnosticData.diagnostics)) {
          console.error('Invalid diagnostics format:', diagnosticData.diagnostics)
          throw new Error('Diagnostics data is not in the expected array format')
        }

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

  const handleGeneratePromptFixes = async () => {
    if (!diagnosticResults) return

    setGeneratingFixes(true)

    try {
      const response = await fetch('/api/generate-prompt-fixes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agents,
          diagnosticResults
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPromptFixes(data.promptFixes)
      } else {
        alert('Failed to generate prompt fixes. Please try again.')
      }
    } catch (error) {
      console.error('Error generating prompt fixes:', error)
      alert('An error occurred while generating fixes. Please try again.')
    } finally {
      setGeneratingFixes(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Agent System Debugger
          </h1>
          <p className="text-gray-600 text-lg">
            Diagnostic tool for troubleshooting multi-agent systems
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Agent Configuration */}
            <AgentConfigPanel agents={agents} setAgents={setAgents} promptFixes={promptFixes} />

            {/* Behavior Input */}
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

          {/* Right Column - Diagnostic Results */}
          <div>
            <DiagnosticResultsPanel
              results={diagnosticResults}
              analyzing={analyzing}
              onGenerateFixes={handleGeneratePromptFixes}
              generatingFixes={generatingFixes}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
