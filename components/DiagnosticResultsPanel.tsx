'use client'

import { useState } from 'react'
import { DiagnosticResponse } from '@/app/page'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Spinner } from '@/components/ui/spinner'
import { FiChevronDown, FiChevronUp, FiCopy, FiCheckCircle, FiAlertTriangle, FiXCircle } from 'react-icons/fi'
import { copyToClipboard } from '@/lib/clipboard'

interface DiagnosticResultsPanelProps {
  results: DiagnosticResponse | null
  analyzing: boolean
}

export function DiagnosticResultsPanel({ results, analyzing }: DiagnosticResultsPanelProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set())
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const toggleSection = (category: string) => {
    const newOpen = new Set(openSections)
    if (newOpen.has(category)) {
      newOpen.delete(category)
    } else {
      newOpen.add(category)
    }
    setOpenSections(newOpen)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pass':
        return <FiCheckCircle className="w-5 h-5 text-green-400" />
      case 'Warning':
        return <FiAlertTriangle className="w-5 h-5 text-amber-400" />
      case 'Issue':
        return <FiXCircle className="w-5 h-5 text-red-400" />
      default:
        return null
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Pass':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'Warning':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/50'
      case 'Issue':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'Medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/50'
      case 'Low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-amber-400'
    return 'text-red-400'
  }

  const handleCopyRecommendation = async (recommendation: string, index: number) => {
    const success = await copyToClipboard(recommendation)
    if (success) {
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    }
  }

  const handleCopyAllRecommendations = async () => {
    if (!results) return

    const allRecommendations = results.diagnostics
      .map((d, i) => `${i + 1}. ${d.category}\n   ${d.recommended_fix}`)
      .join('\n\n')

    const fullReport = `DIAGNOSTIC REPORT
Health Score: ${results.overall_health_score}/100

RECOMMENDATIONS:
${allRecommendations}

PRIORITY ACTIONS:
${results.priority_actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}
`

    const success = await copyToClipboard(fullReport)
    if (success) {
      setCopiedIndex(-1)
      setTimeout(() => setCopiedIndex(null), 2000)
    }
  }

  if (analyzing) {
    return (
      <Card className="bg-[#252542] border-[#4361ee]/20">
        <CardHeader>
          <CardTitle className="text-white">Diagnostic Results</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Spinner className="w-12 h-12 text-[#4361ee] mb-4" />
          <p className="text-gray-400 text-center">Analyzing your agent system...</p>
          <p className="text-gray-500 text-sm text-center mt-2">
            Evaluating prompts, architecture, chain of thought, and more
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!results) {
    return (
      <Card className="bg-[#252542] border-[#4361ee]/20">
        <CardHeader>
          <CardTitle className="text-white">Diagnostic Results</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-400 text-center">No analysis yet</p>
          <p className="text-gray-500 text-sm text-center mt-2">
            Configure your agents and click "Analyze System" to get started
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#252542] border-[#4361ee]/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Diagnostic Results</CardTitle>
          <Button
            onClick={handleCopyAllRecommendations}
            size="sm"
            variant="outline"
            className="border-[#4361ee] text-[#4361ee] hover:bg-[#4361ee]/10"
          >
            {copiedIndex === -1 ? (
              <>
                <FiCheckCircle className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <FiCopy className="w-4 h-4 mr-2" />
                Copy Report
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Score */}
        <div className="flex items-center justify-center p-6 bg-[#1a1a2e] rounded-lg border border-[#4361ee]/30">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Overall Health Score</p>
            <div className={`text-6xl font-bold ${getHealthScoreColor(results.overall_health_score)}`}>
              {results.overall_health_score}
            </div>
            <p className="text-gray-500 text-xs mt-1">out of 100</p>
          </div>
        </div>

        {/* Priority Actions */}
        {results.priority_actions && results.priority_actions.length > 0 && (
          <div className="p-4 bg-[#1a1a2e] rounded-lg border border-amber-500/30">
            <h3 className="text-amber-400 font-semibold mb-3 flex items-center">
              <FiAlertTriangle className="w-4 h-4 mr-2" />
              Priority Actions
            </h3>
            <ul className="space-y-2">
              {results.priority_actions.map((action, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-amber-400 font-semibold mt-0.5">{index + 1}.</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Diagnostic Categories */}
        <div className="space-y-3">
          <h3 className="text-white font-semibold text-sm">Diagnostic Categories</h3>
          {results.diagnostics.map((diagnostic, index) => (
            <Collapsible
              key={index}
              open={openSections.has(diagnostic.category)}
              onOpenChange={() => toggleSection(diagnostic.category)}
            >
              <div className="bg-[#1a1a2e] rounded-lg border border-gray-700/30 overflow-hidden">
                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-[#252542]/50 transition-colors">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(diagnostic.status)}
                    <div className="text-left">
                      <h4 className="text-white font-semibold text-sm">{diagnostic.category}</h4>
                      <p className="text-gray-400 text-xs mt-1">{diagnostic.summary}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusBadgeClass(diagnostic.status)} variant="outline">
                      {diagnostic.status}
                    </Badge>
                    {openSections.has(diagnostic.category) ? (
                      <FiChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <FiChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="p-4 border-t border-gray-700/30 space-y-4">
                    {/* Severity */}
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Severity</p>
                      <Badge className={getSeverityBadgeClass(diagnostic.severity)} variant="outline">
                        {diagnostic.severity}
                      </Badge>
                    </div>

                    {/* Detailed Explanation */}
                    <div>
                      <p className="text-gray-500 text-xs mb-2">Detailed Explanation</p>
                      <p className="text-gray-300 text-sm leading-relaxed bg-[#252542] p-3 rounded border border-gray-700/20">
                        {diagnostic.detailed_explanation}
                      </p>
                    </div>

                    {/* Recommended Fix */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-500 text-xs">Recommended Fix</p>
                        <Button
                          onClick={() => handleCopyRecommendation(diagnostic.recommended_fix, index)}
                          size="sm"
                          variant="ghost"
                          className="text-[#4361ee] hover:text-[#3651de] h-6 px-2"
                        >
                          {copiedIndex === index ? (
                            <>
                              <FiCheckCircle className="w-3 h-3 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <FiCopy className="w-3 h-3 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="text-gray-300 text-sm leading-relaxed bg-[#252542] p-3 rounded border border-[#4361ee]/20 font-mono whitespace-pre-wrap">
                        {diagnostic.recommended_fix}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
