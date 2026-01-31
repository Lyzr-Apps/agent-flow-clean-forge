'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { FiSearch, FiAlertCircle } from 'react-icons/fi'

interface BehaviorInputPanelProps {
  flowDescription: string
  setFlowDescription: (value: string) => void
  expectedBehavior: string
  setExpectedBehavior: (value: string) => void
  actualBehavior: string
  setActualBehavior: (value: string) => void
  onAnalyze: () => void
  analyzing: boolean
}

export function BehaviorInputPanel({
  flowDescription,
  setFlowDescription,
  expectedBehavior,
  setExpectedBehavior,
  actualBehavior,
  setActualBehavior,
  onAnalyze,
  analyzing
}: BehaviorInputPanelProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-2 border-indigo-100 shadow-lg">
      <CardHeader className="border-b border-indigo-100">
        <CardTitle className="text-gray-800 text-xl">Behavior Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        {/* Flow Description */}
        <div className="space-y-2">
          <Label htmlFor="flow-description" className="text-gray-700 font-medium">
            Flow Description
            <span className="text-gray-400 text-xs ml-2 font-normal">(optional)</span>
          </Label>
          <Textarea
            id="flow-description"
            value={flowDescription}
            onChange={e => setFlowDescription(e.target.value)}
            placeholder="Describe your agent flow (optional - I'll infer from your agents)"
            rows={3}
            className="bg-white border-indigo-200 text-gray-800 placeholder:text-gray-400 font-mono text-sm focus:border-indigo-400 focus:ring-indigo-400"
          />
          <p className="text-xs text-gray-500 flex items-start gap-1">
            <FiAlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>Describe how your agents work together. If left minimal, the system will infer the flow from your agent configuration.</span>
          </p>
        </div>

        {/* Expected Behavior */}
        <div className="space-y-2">
          <Label htmlFor="expected-behavior" className="text-gray-700 font-medium">
            Expected Behavior
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Textarea
            id="expected-behavior"
            value={expectedBehavior}
            onChange={e => setExpectedBehavior(e.target.value)}
            placeholder="What response do you expect?"
            rows={5}
            className="bg-white border-indigo-200 text-gray-800 placeholder:text-gray-400 font-mono text-sm focus:border-indigo-400 focus:ring-indigo-400"
          />
          <p className="text-xs text-gray-500 flex items-start gap-1">
            <FiAlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>Describe what you expect your agent system to do or return. Be specific about the desired output, behavior, or actions.</span>
          </p>
        </div>

        {/* Actual Behavior */}
        <div className="space-y-2">
          <Label htmlFor="actual-behavior" className="text-gray-700 font-medium">
            Actual Behavior
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Textarea
            id="actual-behavior"
            value={actualBehavior}
            onChange={e => setActualBehavior(e.target.value)}
            placeholder="What response are you getting?"
            rows={5}
            className="bg-white border-indigo-200 text-gray-800 placeholder:text-gray-400 font-mono text-sm focus:border-indigo-400 focus:ring-indigo-400"
          />
          <p className="text-xs text-gray-500 flex items-start gap-1">
            <FiAlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>Describe what your agent system is actually doing or returning. Include any error messages, unexpected outputs, or behaviors.</span>
          </p>
        </div>

        {/* Analyze Button */}
        <div className="pt-2">
          <Button
            onClick={onAnalyze}
            disabled={analyzing || !expectedBehavior.trim() || !actualBehavior.trim()}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-6 text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {analyzing ? (
              <>
                <Spinner className="w-5 h-5 mr-2" />
                Analyzing System...
              </>
            ) : (
              <>
                <FiSearch className="w-5 h-5 mr-2" />
                Analyze System
              </>
            )}
          </Button>

          {!expectedBehavior.trim() || !actualBehavior.trim() ? (
            <p className="text-xs text-amber-600 text-center mt-3 flex items-center justify-center gap-1 bg-amber-50 py-2 px-3 rounded-lg border border-amber-200">
              <FiAlertCircle className="w-3 h-3 flex-shrink-0" />
              <span>Both Expected and Actual Behavior fields are required to run analysis</span>
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
