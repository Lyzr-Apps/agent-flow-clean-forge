'use client'

import { useState } from 'react'
import { Agent } from '@/app/page'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FiPlus, FiTrash2, FiEdit2, FiFileText } from 'react-icons/fi'

interface AgentConfigPanelProps {
  agents: Agent[]
  setAgents: (agents: Agent[]) => void
}

export function AgentConfigPanel({ agents, setAgents }: AgentConfigPanelProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'major' as 'major' | 'sub',
    parentId: '',
    systemPrompt: ''
  })

  const majorAgents = agents.filter(a => a.type === 'major')

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert('Please enter an agent name')
      return
    }

    if (formData.type === 'sub' && !formData.parentId) {
      alert('Please select a parent agent')
      return
    }

    if (editingAgent) {
      // Update existing agent
      setAgents(
        agents.map(a =>
          a.id === editingAgent.id
            ? {
                ...a,
                name: formData.name,
                type: formData.type,
                parentId: formData.parentId || undefined,
                systemPrompt: formData.systemPrompt || undefined
              }
            : a
        )
      )
      setEditingAgent(null)
    } else {
      // Add new agent
      const newAgent: Agent = {
        id: `agent-${Date.now()}`,
        name: formData.name,
        type: formData.type,
        parentId: formData.type === 'sub' ? formData.parentId : undefined,
        systemPrompt: formData.systemPrompt || undefined
      }
      setAgents([...agents, newAgent])
    }

    // Reset form
    setFormData({ name: '', type: 'major', parentId: '', systemPrompt: '' })
    setShowForm(false)
  }

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent)
    setFormData({
      name: agent.name,
      type: agent.type,
      parentId: agent.parentId || '',
      systemPrompt: agent.systemPrompt || ''
    })
    setShowForm(true)
  }

  const handleDelete = (agentId: string) => {
    // Check if any agents have this as a parent
    const hasChildren = agents.some(a => a.parentId === agentId)
    if (hasChildren) {
      if (!confirm('This agent has sub-agents. Deleting it will also remove its sub-agents. Continue?')) {
        return
      }
      // Remove agent and all its children
      setAgents(agents.filter(a => a.id !== agentId && a.parentId !== agentId))
    } else {
      setAgents(agents.filter(a => a.id !== agentId))
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingAgent(null)
    setFormData({ name: '', type: 'major', parentId: '', systemPrompt: '' })
  }

  const renderAgentHierarchy = () => {
    return (
      <div className="space-y-3">
        {majorAgents.map(majorAgent => (
          <div key={majorAgent.id}>
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 flex-1">
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 px-3 py-1">
                  Major
                </Badge>
                <div className="flex-1">
                  <span className="font-semibold text-gray-800">{majorAgent.name}</span>
                  {majorAgent.systemPrompt && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <FiFileText className="w-3 h-3" />
                      <span className="truncate max-w-[200px]">{majorAgent.systemPrompt}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(majorAgent)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <FiEdit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(majorAgent.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <FiTrash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Sub-agents */}
            {agents
              .filter(a => a.parentId === majorAgent.id)
              .map(subAgent => (
                <div key={subAgent.id} className="ml-8 mt-2">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-6 h-0.5 bg-gradient-to-r from-blue-300 to-transparent" />
                      <Badge variant="outline" className="text-gray-600 border-gray-300 bg-white px-3 py-1">
                        Sub
                      </Badge>
                      <div className="flex-1">
                        <span className="font-medium text-gray-700 text-sm">{subAgent.name}</span>
                        {subAgent.systemPrompt && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <FiFileText className="w-3 h-3" />
                            <span className="truncate max-w-[180px]">{subAgent.systemPrompt}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(subAgent)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(subAgent.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ))}

        {/* Orphan sub-agents (no parent) */}
        {agents
          .filter(a => a.type === 'sub' && !a.parentId)
          .map(orphanAgent => (
            <div key={orphanAgent.id}>
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border-2 border-amber-300 shadow-sm">
                <div className="flex items-center gap-3 flex-1">
                  <Badge variant="outline" className="text-amber-700 border-amber-500 bg-amber-100 px-3 py-1">
                    Sub (No Parent)
                  </Badge>
                  <div className="flex-1">
                    <span className="font-medium text-gray-700 text-sm">{orphanAgent.name}</span>
                    {orphanAgent.systemPrompt && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-amber-700">
                        <FiFileText className="w-3 h-3" />
                        <span className="truncate max-w-[180px]">{orphanAgent.systemPrompt}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(orphanAgent)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(orphanAgent.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
      </div>
    )
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-2 border-blue-100 shadow-lg">
      <CardHeader className="border-b border-blue-100">
        <CardTitle className="text-gray-800 flex items-center justify-between">
          <span className="text-xl">Agent Configuration</span>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md"
              size="sm"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Add Agent
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {showForm && (
          <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl space-y-4 border-2 border-blue-200 shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="agent-name" className="text-gray-700 font-medium">
                Agent Name
              </Label>
              <Input
                id="agent-name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Orchestrator, Research Agent"
                maxLength={50}
                className="bg-white border-blue-200 text-gray-800 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Agent Type</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value: 'major' | 'sub') =>
                  setFormData({ ...formData, type: value, parentId: '' })
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-blue-200">
                  <RadioGroupItem value="major" id="major" />
                  <Label htmlFor="major" className="text-gray-700 cursor-pointer font-normal">
                    Major Agent
                  </Label>
                </div>
                <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-blue-200">
                  <RadioGroupItem value="sub" id="sub" />
                  <Label htmlFor="sub" className="text-gray-700 cursor-pointer font-normal">
                    Sub-Agent
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {formData.type === 'sub' && (
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Parent Agent</Label>
                <Select value={formData.parentId} onValueChange={value => setFormData({ ...formData, parentId: value })}>
                  <SelectTrigger className="bg-white border-blue-200 text-gray-800 focus:border-blue-400 focus:ring-blue-400">
                    <SelectValue placeholder="Select parent agent" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200">
                    {majorAgents.length === 0 ? (
                      <div className="p-2 text-sm text-gray-500">No major agents available</div>
                    ) : (
                      majorAgents.map(agent => (
                        <SelectItem key={agent.id} value={agent.id} className="text-gray-800">
                          {agent.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="system-prompt" className="text-gray-700 font-medium flex items-center gap-2">
                <FiFileText className="w-4 h-4" />
                System Prompt
                <span className="text-gray-400 text-xs font-normal">(optional)</span>
              </Label>
              <Textarea
                id="system-prompt"
                value={formData.systemPrompt}
                onChange={e => setFormData({ ...formData, systemPrompt: e.target.value })}
                placeholder="Enter the system prompt for this agent..."
                rows={4}
                className="bg-white border-blue-200 text-gray-800 focus:border-blue-400 focus:ring-blue-400 font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                The instructions that define how this agent behaves and responds
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white flex-1 shadow-md"
              >
                {editingAgent ? 'Update Agent' : 'Add Agent'}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {agents.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-dashed border-blue-200">
            <div className="text-4xl mb-3">🤖</div>
            <p className="font-medium">No agents added yet</p>
            <p className="text-sm mt-1">Click "Add Agent" to start building your system</p>
          </div>
        ) : (
          renderAgentHierarchy()
        )}
      </CardContent>
    </Card>
  )
}
