'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { FiSearch } from 'react-icons/fi'

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
    <Card className="bg-[#252542] border-[#4361ee]/20">
      <CardHeader>
        <CardTitle className="text-white">Behavior Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Flow Description */}
        <div className="space-y-2">
          <Label htmlFor="flow-description" className="text-white">
            Flow Description
            <span className="text-gray-400 text-sm ml-2">(optional)</span>
          </Label>
          <Textarea
            id="flow-description"
            value={flowDescription}
            onChange={e => setFlowDescription(e.target.value)}
            placeholder="Describe your agent flow (optional - I'll infer from your agents)"
            rows={3}
            className="bg-[#1a1a2e] border-gray-600 text-white placeholder:text-gray-500 font-mono text-sm"
          />
          <p className="text-xs text-gray-400">
            Describe how your agents work together. If left minimal, the system will infer the flow from your agent
            configuration.
          </p>
        </div>

        {/* Expected Behavior */}
        <div className="space-y-2">
          <Label htmlFor="expected-behavior" className="text-white">
            Expected Behavior
            <span className="text-red-400 ml-1">*</span>
          </Label>
          <Textarea
            id="expected-behavior"
            value={expectedBehavior}
            onChange={e => setExpectedBehavior(e.target.value)}
            placeholder="What response do you expect?"
            rows={5}
            className="bg-[#1a1a2e] border-gray-600 text-white placeholder:text-gray-500 font-mono text-sm"
          />
          <p className="text-xs text-gray-400">
            Describe what you expect your agent system to do or return. Be specific about the desired output, behavior,
            or actions.
          </p>
        </div>

        {/* Actual Behavior */}
        <div className="space-y-2">
          <Label htmlFor="actual-behavior" className="text-white">
            Actual Behavior
            <span className="text-red-400 ml-1">*</span>
          </Label>
          <Textarea
            id="actual-behavior"
            value={actualBehavior}
            onChange={e => setActualBehavior(e.target.value)}
            placeholder="What response are you getting?"
            rows={5}
            className="bg-[#1a1a2e] border-gray-600 text-white placeholder:text-gray-500 font-mono text-sm"
          />
          <p className="text-xs text-gray-400">
            Describe what your agent system is actually doing or returning. Include any error messages, unexpected
            outputs, or behaviors.
          </p>
        </div>

        {/* Analyze Button */}
        <Button
          onClick={onAnalyze}
          disabled={analyzing || !expectedBehavior.trim() || !actualBehavior.trim()}
          className="w-full bg-[#4361ee] hover:bg-[#3651de] text-white font-semibold py-6 text-lg"
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
          <p className="text-xs text-amber-400 text-center">
            Both Expected and Actual Behavior fields are required to run analysis
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
