import { NextRequest, NextResponse } from 'next/server'
import { Agent, DiagnosticResponse } from '@/app/page'

export async function POST(request: NextRequest) {
  try {
    const { agents, diagnosticResults } = await request.json()

    if (!agents || !diagnosticResults) {
      return NextResponse.json(
        { error: 'Missing agents or diagnostic results' },
        { status: 400 }
      )
    }

    const promptFixes: Record<string, string> = {}

    // Generate prompt fixes for each agent based on diagnostic results
    agents.forEach((agent: Agent) => {
      const fixes: string[] = []

      diagnosticResults.diagnostics.forEach((diagnostic: any) => {
        if (diagnostic.status === 'Issue' || diagnostic.status === 'Warning') {
          // Extract actionable fixes from the diagnostic
          const fix = generatePromptSnippet(diagnostic, agent)
          if (fix) {
            fixes.push(fix)
          }
        }
      })

      if (fixes.length > 0) {
        promptFixes[agent.id] = generateAgentPromptFix(agent, fixes, diagnosticResults)
      }
    })

    return NextResponse.json({ promptFixes })
  } catch (error) {
    console.error('Error generating prompt fixes:', error)
    return NextResponse.json(
      { error: 'Failed to generate prompt fixes' },
      { status: 500 }
    )
  }
}

function generatePromptSnippet(diagnostic: any, agent: Agent): string | null {
  const category = diagnostic.category.toLowerCase()
  const recommended = diagnostic.recommended_fix

  // Map diagnostics to actionable prompt snippets
  if (category.includes('prompt') || category.includes('instruction')) {
    return `- Be clear and specific in your responses\n- Follow a structured approach: analyze, plan, then execute\n- Provide detailed explanations for your decisions`
  }

  if (category.includes('chain of thought') || category.includes('reasoning')) {
    return `- Show your reasoning step-by-step\n- Break down complex tasks into smaller steps\n- Explain your thought process before providing solutions`
  }

  if (category.includes('error') || category.includes('handling')) {
    return `- Validate inputs before processing\n- Provide clear error messages when issues occur\n- Handle edge cases gracefully`
  }

  if (category.includes('context') || category.includes('memory')) {
    return `- Maintain conversation context throughout interactions\n- Reference previous information when relevant\n- Build upon earlier decisions coherently`
  }

  if (category.includes('output') || category.includes('format')) {
    return `- Structure your responses in a clear, consistent format\n- Use appropriate formatting (lists, sections, code blocks)\n- Ensure outputs are parseable and well-organized`
  }

  if (category.includes('tool') || category.includes('function')) {
    return `- Use available tools appropriately for each task\n- Verify tool outputs before proceeding\n- Choose the most efficient tool for each operation`
  }

  if (category.includes('architecture') || category.includes('flow')) {
    return `- Coordinate with other agents when needed\n- Follow the established workflow pattern\n- Communicate status and results clearly to downstream agents`
  }

  return null
}

function generateAgentPromptFix(agent: Agent, fixes: string[], diagnosticResults: any): string {
  const uniqueFixes = Array.from(new Set(fixes))
  const currentPrompt = agent.systemPrompt || ''

  const agentRole = agent.type === 'major' ? 'primary orchestrator' : 'specialized sub-agent'

  const enhancedPrompt = `You are ${agent.name}, a ${agentRole} in a multi-agent system.

ROLE & RESPONSIBILITIES:
${agent.type === 'major'
  ? '- Coordinate sub-agents and manage the overall workflow\n- Make high-level decisions and delegate tasks appropriately\n- Ensure consistent communication between all system components'
  : '- Perform specialized tasks as directed by your parent agent\n- Report results clearly and concisely\n- Maintain focus on your specific domain of expertise'
}

OPERATIONAL GUIDELINES:
${uniqueFixes.join('\n')}

QUALITY STANDARDS:
- Accuracy: Ensure all outputs are correct and verified
- Clarity: Communicate in clear, unambiguous language
- Efficiency: Complete tasks using optimal approaches
- Reliability: Handle errors gracefully and maintain system stability

${currentPrompt ? `\nCURRENT CONTEXT:\n${currentPrompt}` : ''}

Remember: Your role is critical to the system's success. Follow these guidelines consistently.`

  return enhancedPrompt
}
