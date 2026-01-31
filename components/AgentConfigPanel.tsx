'use client'

import { useState } from 'react'
import { Agent } from '@/app/page'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi'

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
    parentId: ''
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
            ? { ...a, name: formData.name, type: formData.type, parentId: formData.parentId || undefined }
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
        parentId: formData.type === 'sub' ? formData.parentId : undefined
      }
      setAgents([...agents, newAgent])
    }

    // Reset form
    setFormData({ name: '', type: 'major', parentId: '' })
    setShowForm(false)
  }

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent)
    setFormData({
      name: agent.name,
      type: agent.type,
      parentId: agent.parentId || ''
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
    setFormData({ name: '', type: 'major', parentId: '' })
  }

  const renderAgentHierarchy = () => {
    return (
      <div className="space-y-2">
        {majorAgents.map(majorAgent => (
          <div key={majorAgent.id}>
            <div className="flex items-center justify-between p-3 bg-[#252542] rounded-lg border border-[#4361ee]/20">
              <div className="flex items-center gap-3">
                <Badge className="bg-[#4361ee] text-white">Major</Badge>
                <span className="font-mono">{majorAgent.name}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(majorAgent)}
                  className="text-gray-400 hover:text-white"
                >
                  <FiEdit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(majorAgent.id)}
                  className="text-red-400 hover:text-red-300"
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
                  <div className="flex items-center justify-between p-3 bg-[#2a2a3e] rounded-lg border border-gray-600/20">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-0.5 bg-gray-600" />
                      <Badge variant="outline" className="text-gray-400 border-gray-600">
                        Sub
                      </Badge>
                      <span className="font-mono text-sm">{subAgent.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(subAgent)}
                        className="text-gray-400 hover:text-white"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(subAgent.id)}
                        className="text-red-400 hover:text-red-300"
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
              <div className="flex items-center justify-between p-3 bg-[#2a2a3e] rounded-lg border border-amber-600/40">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-amber-400 border-amber-600">
                    Sub (No Parent)
                  </Badge>
                  <span className="font-mono text-sm">{orphanAgent.name}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(orphanAgent)}
                    className="text-gray-400 hover:text-white"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(orphanAgent.id)}
                    className="text-red-400 hover:text-red-300"
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
    <Card className="bg-[#252542] border-[#4361ee]/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          Agent Configuration
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-[#4361ee] hover:bg-[#3651de] text-white"
              size="sm"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Add Agent
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="p-4 bg-[#1a1a2e] rounded-lg space-y-4 border border-[#4361ee]/30">
            <div className="space-y-2">
              <Label htmlFor="agent-name" className="text-white">
                Agent Name
              </Label>
              <Input
                id="agent-name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Orchestrator, Research Agent"
                maxLength={50}
                className="bg-[#252542] border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Agent Type</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value: 'major' | 'sub') =>
                  setFormData({ ...formData, type: value, parentId: '' })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="major" id="major" />
                  <Label htmlFor="major" className="text-white cursor-pointer">
                    Major Agent
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sub" id="sub" />
                  <Label htmlFor="sub" className="text-white cursor-pointer">
                    Sub-Agent
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {formData.type === 'sub' && (
              <div className="space-y-2">
                <Label className="text-white">Parent Agent</Label>
                <Select value={formData.parentId} onValueChange={value => setFormData({ ...formData, parentId: value })}>
                  <SelectTrigger className="bg-[#252542] border-gray-600 text-white">
                    <SelectValue placeholder="Select parent agent" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#252542] border-gray-600">
                    {majorAgents.length === 0 ? (
                      <div className="p-2 text-sm text-gray-400">No major agents available</div>
                    ) : (
                      majorAgents.map(agent => (
                        <SelectItem key={agent.id} value={agent.id} className="text-white">
                          {agent.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="bg-[#4361ee] hover:bg-[#3651de] text-white flex-1">
                {editingAgent ? 'Update Agent' : 'Add Agent'}
              </Button>
              <Button onClick={handleCancel} variant="outline" className="border-gray-600 text-white">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {agents.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No agents added yet. Click "Add Agent" to start.
          </div>
        ) : (
          renderAgentHierarchy()
        )}
      </CardContent>
    </Card>
  )
}
