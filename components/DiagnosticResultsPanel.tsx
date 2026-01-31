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
        return <FiCheckCircle className="w-5 h-5 text-green-600" />
      case 'Warning':
        return <FiAlertTriangle className="w-5 h-5 text-amber-600" />
      case 'Issue':
        return <FiXCircle className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Pass':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'Warning':
        return 'bg-amber-100 text-amber-700 border-amber-300'
      case 'Issue':
        return 'bg-red-100 text-red-700 border-red-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'bg-red-100 text-red-700 border-red-300'
      case 'Medium':
        return 'bg-amber-100 text-amber-700 border-amber-300'
      case 'Low':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  const getHealthScoreBg = (score: number) => {
    if (score >= 80) return 'from-green-50 to-emerald-50 border-green-200'
    if (score >= 60) return 'from-amber-50 to-orange-50 border-amber-200'
    return 'from-red-50 to-rose-50 border-red-200'
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
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-100 shadow-lg">
        <CardHeader className="border-b border-purple-100">
          <CardTitle className="text-gray-800 text-xl">Diagnostic Results</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Spinner className="w-16 h-16 text-indigo-600 mb-4" />
          <p className="text-gray-700 text-center font-medium">Analyzing your agent system...</p>
          <p className="text-gray-500 text-sm text-center mt-2">
            Evaluating prompts, architecture, chain of thought, and more
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!results) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-100 shadow-lg">
        <CardHeader className="border-b border-purple-100">
          <CardTitle className="text-gray-800 text-xl">Diagnostic Results</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-600 text-center font-medium">No analysis yet</p>
          <p className="text-gray-500 text-sm text-center mt-2 max-w-xs">
            Configure your agents and click "Analyze System" to get started
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-100 shadow-lg">
      <CardHeader className="border-b border-purple-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-800 text-xl">Diagnostic Results</CardTitle>
          <Button
            onClick={handleCopyAllRecommendations}
            size="sm"
            variant="outline"
            className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
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
      <CardContent className="space-y-5 pt-6">
        {/* Health Score */}
        <div className={`flex items-center justify-center p-8 bg-gradient-to-br ${getHealthScoreBg(results.overall_health_score)} rounded-2xl border-2 shadow-sm`}>
          <div className="text-center">
            <p className="text-gray-600 text-sm font-medium mb-3">Overall Health Score</p>
            <div className={`text-7xl font-bold ${getHealthScoreColor(results.overall_health_score)} mb-2`}>
              {results.overall_health_score}
            </div>
            <p className="text-gray-500 text-sm">out of 100</p>
          </div>
        </div>

        {/* Priority Actions */}
        {results.priority_actions && results.priority_actions.length > 0 && (
          <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 shadow-sm">
            <h3 className="text-amber-800 font-semibold mb-3 flex items-center text-base">
              <FiAlertTriangle className="w-5 h-5 mr-2" />
              Priority Actions
            </h3>
            <ul className="space-y-2">
              {results.priority_actions.map((action, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="flex-shrink-0 w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center font-semibold text-xs">
                    {index + 1}
                  </span>
                  <span className="flex-1 pt-0.5">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Diagnostic Categories */}
        <div className="space-y-3">
          <h3 className="text-gray-800 font-semibold text-base">Diagnostic Categories</h3>
          {results.diagnostics.map((diagnostic, index) => (
            <Collapsible
              key={index}
              open={openSections.has(diagnostic.category)}
              onOpenChange={() => toggleSection(diagnostic.category)}
            >
              <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(diagnostic.status)}
                    <div className="text-left flex-1">
                      <h4 className="text-gray-800 font-semibold text-sm">{diagnostic.category}</h4>
                      <p className="text-gray-600 text-xs mt-1">{diagnostic.summary}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusBadgeClass(diagnostic.status)} variant="outline">
                      {diagnostic.status}
                    </Badge>
                    {openSections.has(diagnostic.category) ? (
                      <FiChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <FiChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="p-5 border-t border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50 space-y-4">
                    {/* Severity */}
                    <div>
                      <p className="text-gray-600 text-xs font-medium mb-2">Severity</p>
                      <Badge className={getSeverityBadgeClass(diagnostic.severity)} variant="outline">
                        {diagnostic.severity}
                      </Badge>
                    </div>

                    {/* Detailed Explanation */}
                    <div>
                      <p className="text-gray-600 text-xs font-medium mb-2">Detailed Explanation</p>
                      <div className="text-gray-700 text-sm leading-relaxed bg-white p-4 rounded-lg border border-gray-200">
                        {diagnostic.detailed_explanation}
                      </div>
                    </div>

                    {/* Recommended Fix */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-gray-600 text-xs font-medium">Recommended Fix</p>
                        <Button
                          onClick={() => handleCopyRecommendation(diagnostic.recommended_fix, index)}
                          size="sm"
                          variant="ghost"
                          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 h-7 px-3"
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
                      <div className="text-gray-700 text-sm leading-relaxed bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg border-2 border-indigo-200 font-mono whitespace-pre-wrap">
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
