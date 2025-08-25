'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Upload, AlertTriangle } from 'lucide-react'
import { cardOperations, CardItem } from '@/lib/firebase'

type SingleCardValidation = {
  isValid: boolean
  errors: string[]
  data?: CardItem
  cardId?: string
}

type BulkValidationResult = {
  isValid: boolean
  isBulk: boolean
  cards: SingleCardValidation[]
  totalCards: number
  validCards: number
}

export default function JsonCardInput() {
  const [jsonInput, setJsonInput] = useState('')
  const [validation, setValidation] = useState<BulkValidationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [saveProgress, setSaveProgress] = useState<{saved: number, total: number}>({saved: 0, total: 0})

  const validateSingleCard = (jsonData: any, cardIndex?: number): SingleCardValidation => {
    const errors: string[] = []
    const prefix = cardIndex !== undefined ? `Card ${cardIndex + 1}: ` : ''
    
    try {
      // Required fields validation
      if (!jsonData.id || typeof jsonData.id !== 'string') {
        errors.push(prefix + 'id: required string field')
      }
      
      if (!jsonData.name || typeof jsonData.name !== 'string') {
        errors.push(prefix + 'name: required string field')
      }
      
      if (!jsonData.summary || typeof jsonData.summary !== 'string') {
        errors.push(prefix + 'summary: required string field')
      }
      
      // Enum validations
      if (!['L1'].includes(jsonData.tier)) {
        errors.push(prefix + 'tier: must be "L1"')
      }
      
      if (!['Informational', 'Relational', 'Resource', 'Urgency', 'Narrative', 'Authority'].includes(jsonData.leverage)) {
        errors.push(prefix + 'leverage: must be one of Informational, Relational, Resource, Urgency, Narrative, Authority')
      }
      
      if (!['Extract', 'Increase'].includes(jsonData.intent)) {
        errors.push(prefix + 'intent: must be either "Extract" or "Increase"')
      }
      
      // Modes validation
      if (!jsonData.modes || typeof jsonData.modes !== 'object') {
        errors.push(prefix + 'modes: required object with direct and inception arrays')
      } else {
        if (!Array.isArray(jsonData.modes.direct)) {
          errors.push(prefix + 'modes.direct: must be an array of strings')
        }
        if (!Array.isArray(jsonData.modes.inception)) {
          errors.push(prefix + 'modes.inception: must be an array of strings')
        }
      }
      
      // Steps validation - must be array of exactly 3 strings
      if (!Array.isArray(jsonData.steps) || jsonData.steps.length !== 3) {
        errors.push(prefix + 'steps: must be an array of exactly 3 strings')
      }
      
      if (!jsonData.recovery || typeof jsonData.recovery !== 'string') {
        errors.push(prefix + 'recovery: required string field')
      }
      
      if (!Array.isArray(jsonData.telemetry_keys)) {
        errors.push(prefix + 'telemetry_keys: must be an array of strings')
      }
      
      // Optional validations
      if (jsonData.status && !['draft', 'beta', 'stable', 'deprecated'].includes(jsonData.status)) {
        errors.push(prefix + 'status: must be one of draft, beta, stable, deprecated')
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        data: errors.length === 0 ? jsonData as CardItem : undefined,
        cardId: jsonData.id
      }
      
    } catch (_error) {
      return {
        isValid: false,
        errors: [prefix + 'Invalid card structure'],
        cardId: jsonData?.id || 'unknown'
      }
    }
  }

  const validateBulkJson = (jsonData: any): BulkValidationResult => {
    // Check if it's an array (bulk) or single object
    if (Array.isArray(jsonData)) {
      // Bulk validation
      const cardValidations = jsonData.map((card, index) => validateSingleCard(card, index))
      const validCards = cardValidations.filter(v => v.isValid).length
      
      return {
        isValid: validCards > 0, // At least one valid card makes the bulk valid
        isBulk: true,
        cards: cardValidations,
        totalCards: jsonData.length,
        validCards
      }
    } else {
      // Single card validation
      const singleValidation = validateSingleCard(jsonData)
      
      return {
        isValid: singleValidation.isValid,
        isBulk: false,
        cards: [singleValidation],
        totalCards: 1,
        validCards: singleValidation.isValid ? 1 : 0
      }
    }
  }

  const handleValidate = () => {
    if (!jsonInput.trim()) {
      setValidation({
        isValid: false,
        isBulk: false,
        cards: [],
        totalCards: 0,
        validCards: 0
      })
      return
    }
    
    try {
      const parsed = JSON.parse(jsonInput)
      const result = validateBulkJson(parsed)
      setValidation(result)
    } catch (_error) {
      setValidation({
        isValid: false,
        isBulk: false,
        cards: [{
          isValid: false,
          errors: ['Invalid JSON format'],
          cardId: 'unknown'
        }],
        totalCards: 0,
        validCards: 0
      })
    }
  }

  const handleSave = async () => {
    if (!validation?.isValid || validation.validCards === 0) {
      return
    }
    
    setLoading(true)
    setSaveStatus('saving')
    
    const validCards = validation.cards.filter(card => card.isValid && card.data)
    setSaveProgress({ saved: 0, total: validCards.length })
    
    let savedCount = 0
    const errors: string[] = []
    
    try {
      for (const cardValidation of validCards) {
        if (cardValidation.data) {
          try {
            await cardOperations.insert(cardValidation.data)
            savedCount++
            setSaveProgress({ saved: savedCount, total: validCards.length })
          } catch (error) {
            errors.push(`Failed to save card "${cardValidation.cardId}": ${error}`)
          }
        }
      }
      
      if (savedCount === validCards.length) {
        setSaveStatus('success')
        setJsonInput('')
        setValidation(null)
        setSaveProgress({ saved: 0, total: 0 })
      } else {
        setSaveStatus('error')
        console.error('Bulk save errors:', errors)
      }
      
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      console.error('Bulk save error:', error)
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
      case 'saving': 
        if (saveProgress.total > 1) {
          return `Saving cards to database... (${saveProgress.saved}/${saveProgress.total})`
        }
        return 'Saving to database...'
      case 'success': 
        if (validation?.isBulk) {
          return `${validation.validCards} card${validation.validCards !== 1 ? 's' : ''} saved successfully!`
        }
        return 'Card saved successfully!'
      case 'error': 
        if (validation?.isBulk) {
          return `Error saving some cards (${saveProgress.saved}/${saveProgress.total} saved)`
        }
        return 'Error saving card'
      default: return ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">JSON Card Input</h1>
        <p className="text-gray-600">Paste your card JSON data below to validate and save to the database</p>
        <p className="text-sm text-gray-500 mt-2">
          💡 <strong>Tip:</strong> You can paste a single card object or an array of multiple cards: <code>[{"{card1}"}, {"{card2}"}]</code>
        </p>
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
            
            {validation?.isValid && validation.validCards > 0 && (
              <Button 
                onClick={handleSave} 
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : `Save ${validation.validCards} Card${validation.validCards !== 1 ? 's' : ''}`}
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
                <span className="font-medium text-green-800">
                  {validation.isBulk ? 'Bulk Validation Complete' : 'Schema Valid'}
                </span>
                <Badge className="bg-green-100 text-green-800">
                  {validation.validCards} Valid Card{validation.validCards !== 1 ? 's' : ''}
                </Badge>
                {validation.isBulk && validation.validCards !== validation.totalCards && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {validation.totalCards - validation.validCards} Invalid
                  </Badge>
                )}
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Validation Failed</span>
                <Badge className="bg-red-100 text-red-800">
                  {validation.totalCards > 0 ? `${validation.totalCards - validation.validCards} Error${validation.totalCards - validation.validCards !== 1 ? 's' : ''}` : 'Invalid JSON'}
                </Badge>
              </>
            )}
          </div>
          
          {validation.isBulk && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                📦 <strong>Bulk Upload:</strong> Found {validation.totalCards} card{validation.totalCards !== 1 ? 's' : ''} in array
              </p>
            </div>
          )}
          
          {/* Show errors for invalid cards */}
          {validation.cards.some(card => !card.isValid) && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Validation Issues:</p>
              {validation.cards.map((card, index) => {
                if (card.isValid) return null
                return (
                  <div key={index} className="border-l-4 border-red-400 pl-4 py-2 bg-red-50 rounded-r">
                    <p className="text-sm font-medium text-red-800">
                      {validation.isBulk ? `Card ${index + 1}` : 'Card'} 
                      {card.cardId !== 'unknown' && ` (${card.cardId})`}:
                    </p>
                    <ul className="mt-1 space-y-1">
                      {card.errors.map((error, errorIndex) => (
                        <li key={errorIndex} className="text-sm text-red-600 flex items-start gap-2">
                          <span className="text-red-400">•</span>
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          )}
          
          {/* Show preview for valid cards */}
          {validation.validCards > 0 && (
            <div className="space-y-3 mt-4">
              <p className="text-sm font-medium text-gray-700">
                Preview ({validation.validCards} valid card{validation.validCards !== 1 ? 's' : ''}):
              </p>
              {validation.cards
                .filter(card => card.isValid && card.data)
                .slice(0, 3) // Show max 3 previews
                .map((card, index) => (
                  <div key={index} className="bg-green-50 rounded p-3 text-sm border-l-4 border-green-400">
                    <p><strong>ID:</strong> {card.data!.id}</p>
                    <p><strong>Name:</strong> {card.data!.name}</p>
                    <p><strong>Leverage:</strong> {card.data!.leverage}</p>
                    <p><strong>Intent:</strong> {card.data!.intent}</p>
                  </div>
                ))}
              {validation.validCards > 3 && (
                <p className="text-sm text-gray-500 italic">
                  ... and {validation.validCards - 3} more card{validation.validCards - 3 !== 1 ? 's' : ''}
                </p>
              )}
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