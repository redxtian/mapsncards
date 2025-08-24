'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Upload, AlertTriangle } from 'lucide-react'
import { cardOperations, CardItem } from '@/lib/supabase'

type ValidationResult = {
  isValid: boolean
  errors: string[]
  data?: CardItem
}

export default function JsonCardInput() {
  const [jsonInput, setJsonInput] = useState('')
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  const validateCardSchema = (jsonData: any): ValidationResult => {
    const errors: string[] = []
    
    try {
      // Required fields validation
      if (!jsonData.id || typeof jsonData.id !== 'string') {
        errors.push('id: required string field')
      }
      
      if (!jsonData.name || typeof jsonData.name !== 'string') {
        errors.push('name: required string field')
      }
      
      if (!jsonData.summary || typeof jsonData.summary !== 'string') {
        errors.push('summary: required string field')
      }
      
      // Enum validations
      if (!['L1'].includes(jsonData.tier)) {
        errors.push('tier: must be "L1"')
      }
      
      if (!['Informational', 'Relational', 'Resource', 'Urgency', 'Narrative', 'Authority'].includes(jsonData.leverage)) {
        errors.push('leverage: must be one of Informational, Relational, Resource, Urgency, Narrative, Authority')
      }
      
      if (!['Extract', 'Increase'].includes(jsonData.intent)) {
        errors.push('intent: must be either "Extract" or "Increase"')
      }
      
      // Modes validation
      if (!jsonData.modes || typeof jsonData.modes !== 'object') {
        errors.push('modes: required object with direct and inception arrays')
      } else {
        if (!Array.isArray(jsonData.modes.direct)) {
          errors.push('modes.direct: must be an array of strings')
        }
        if (!Array.isArray(jsonData.modes.inception)) {
          errors.push('modes.inception: must be an array of strings')
        }
      }
      
      // Steps validation - must be array of exactly 3 strings
      if (!Array.isArray(jsonData.steps) || jsonData.steps.length !== 3) {
        errors.push('steps: must be an array of exactly 3 strings')
      }
      
      if (!jsonData.recovery || typeof jsonData.recovery !== 'string') {
        errors.push('recovery: required string field')
      }
      
      if (!Array.isArray(jsonData.telemetry_keys)) {
        errors.push('telemetry_keys: must be an array of strings')
      }
      
      // Optional validations
      if (jsonData.status && !['draft', 'beta', 'stable', 'deprecated'].includes(jsonData.status)) {
        errors.push('status: must be one of draft, beta, stable, deprecated')
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        data: errors.length === 0 ? jsonData as CardItem : undefined
      }
      
    } catch (error) {
      return {
        isValid: false,
        errors: ['Invalid JSON structure']
      }
    }
  }

  const handleValidate = () => {
    if (!jsonInput.trim()) {
      setValidation({
        isValid: false,
        errors: ['Please enter JSON data']
      })
      return
    }
    
    try {
      const parsed = JSON.parse(jsonInput)
      const result = validateCardSchema(parsed)
      setValidation(result)
    } catch (error) {
      setValidation({
        isValid: false,
        errors: ['Invalid JSON format']
      })
    }
  }

  const handleSave = async () => {
    if (!validation?.isValid || !validation.data) {
      return
    }
    
    setLoading(true)
    setSaveStatus('saving')
    
    try {
      await cardOperations.insert(validation.data)
      setSaveStatus('success')
      setJsonInput('')
      setValidation(null)
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Save error:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = () => {
    switch (saveStatus) {
      case 'saving': return 'text-blue-600'
      case 'success': return 'text-green-600' 
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusText = () => {
    switch (saveStatus) {
      case 'saving': return 'Saving to database...'
      case 'success': return 'Card saved successfully!'
      case 'error': return 'Error saving card'
      default: return ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">JSON Card Input</h1>
        <p className="text-gray-600">Paste your card JSON data below to validate and save to the database</p>
      </div>
      
      {/* JSON Input Area */}
      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card JSON Data
            </label>
            <Textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste your card JSON here..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>
          
          <div className="flex gap-3">
            <Button onClick={handleValidate} variant="outline">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Validate Schema
            </Button>
            
            {validation?.isValid && (
              <Button 
                onClick={handleSave} 
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save to Database'}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Validation Results */}
      {validation && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            {validation.isValid ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Schema Valid</span>
                <Badge className="bg-green-100 text-green-800">Ready to Save</Badge>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Schema Invalid</span>
                <Badge className="bg-red-100 text-red-800">{validation.errors.length} Errors</Badge>
              </>
            )}
          </div>
          
          {!validation.isValid && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Errors found:</p>
              <ul className="space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {validation.isValid && validation.data && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Preview:</p>
              <div className="bg-gray-50 rounded p-3 text-sm">
                <p><strong>ID:</strong> {validation.data.id}</p>
                <p><strong>Name:</strong> {validation.data.name}</p>
                <p><strong>Leverage:</strong> {validation.data.leverage}</p>
                <p><strong>Intent:</strong> {validation.data.intent}</p>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Save Status */}
      {saveStatus !== 'idle' && (
        <div className={`text-center p-3 rounded-lg bg-gray-50 ${getStatusColor()}`}>
          {getStatusText()}
        </div>
      )}

      {/* Schema Example */}
      <Card className="p-4 bg-gray-50">
        <details>
          <summary className="font-medium text-gray-700 cursor-pointer">Show JSON Schema Example</summary>
          <pre className="mt-3 text-xs bg-white p-3 rounded border overflow-x-auto">
{`{
  "id": "example_card_l1",
  "name": "Example Card",
  "summary": "Brief description of what this card does",
  "tier": "L1",
  "leverage": "Informational",
  "intent": "Extract",
  "modes": {
    "direct": ["Direct approach line 1", "Direct approach line 2"],
    "inception": ["Inception approach line 1", "Inception approach line 2"]
  },
  "steps": [
    "First step to take",
    "Second step to take", 
    "Third step to take"
  ],
  "recovery": "What to do if the approach doesn't work",
  "map_adaptations": [
    {"map": "Adversarial", "tip": "Specific tip for adversarial situations"}
  ],
  "telemetry_keys": ["key1", "key2"],
  "version": "2.0.0",
  "status": "beta",
  "author": "your-name"
}`}
          </pre>
        </details>
      </Card>
    </div>
  )
}