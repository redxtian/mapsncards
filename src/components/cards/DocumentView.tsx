'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  FileText, 
  Search, 
  Download,
  BookOpen
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CardItem } from '@/lib/firebase'

interface DocumentViewProps {
  cards: CardItem[]
  isLoading?: boolean
}

interface MarkdownSection {
  id: string
  title: string
  content: string
}

export function DocumentView({ cards, isLoading }: DocumentViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [leverageFilter, setLeverageFilter] = useState<string>('all')
  const [intentFilter, setIntentFilter] = useState<string>('all')
  const [tierFilter, setTierFilter] = useState<string>('all')

  // Filter cards based on search and filters
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      const matchesSearch = !searchTerm || 
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.recovery.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.modes.direct.some(mode => mode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        card.modes.inception.some(mode => mode.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesLeverage = leverageFilter === 'all' || card.leverage === leverageFilter
      const matchesIntent = intentFilter === 'all' || card.intent === intentFilter
      const matchesTier = tierFilter === 'all' || card.tier === tierFilter
      
      return matchesSearch && matchesLeverage && matchesIntent && matchesTier
    })
  }, [cards, searchTerm, leverageFilter, intentFilter, tierFilter])

  // Convert cards to markdown content
  const markdownSections = useMemo(() => {
    const sections: MarkdownSection[] = []

    // Table of Contents
    sections.push({
      id: 'toc',
      title: 'Table of Contents',
      content: `# Negotiation Cards Documentation

## Table of Contents

${filteredCards.map((card, index) => 
  `${index + 1}. [${card.name}](#${card.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]/g, '')})`
).join('\n')}

---
`
    })

    // Individual cards
    filteredCards.forEach((card, _index) => {
      const cardMarkdown = `
# ${card.name}

**Leverage Type:** ${card.leverage} | **Intent:** ${card.intent} | **Tier:** ${card.tier} | **Status:** ${card.status}

## Summary
${card.summary}

## Deployment Modes

### Direct Mode
${card.modes.direct.map(mode => `- ${mode}`).join('\n')}

### Inception Mode  
${card.modes.inception.map(mode => `- ${mode}`).join('\n')}

## Implementation Steps

1. **${card.steps[0]}**
2. **${card.steps[1]}**
3. **${card.steps[2]}**

## Recovery Strategy
${card.recovery}

${card.map_adaptations && card.map_adaptations.length > 0 ? `
## Map Adaptations
${card.map_adaptations.map(adaptation => 
  `**${adaptation.map} Context:** ${adaptation.tip}`
).join('\n\n')}
` : ''}

${card.telemetry_keys && card.telemetry_keys.length > 0 ? `
## Telemetry Keys
${card.telemetry_keys.map(key => `- \`${key}\``).join('\n')}
` : ''}

## Metadata
- **Version:** ${card.version}
- **Author:** ${card.author || 'Unknown'}
- **Created:** ${card.created_at ? new Date(card.created_at).toLocaleDateString() : 'Unknown'}
- **Updated:** ${card.updated_at ? new Date(card.updated_at).toLocaleDateString() : 'Unknown'}

---
`

      sections.push({
        id: card.id,
        title: card.name,
        content: cardMarkdown
      })
    })

    return sections
  }, [filteredCards])

  const exportMarkdown = () => {
    const fullMarkdown = markdownSections.map(section => section.content).join('\n')
    const blob = new Blob([fullMarkdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `negotiation-cards-${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">Loading document view...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with Controls */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="w-8 h-8 mr-3 text-blue-600" />
            Document View
          </h1>
          <p className="text-gray-600 mt-2">
            Browse your negotiation cards in a structured document format
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportMarkdown}>
            <Download className="w-4 h-4 mr-2" />
            Export Markdown
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search cards by name, content, or deployment..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={leverageFilter} onValueChange={setLeverageFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Leverage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leverage</SelectItem>
                  <SelectItem value="Informational">Informational</SelectItem>
                  <SelectItem value="Relational">Relational</SelectItem>
                  <SelectItem value="Resource">Resource</SelectItem>
                  <SelectItem value="Urgency">Urgency</SelectItem>
                  <SelectItem value="Narrative">Narrative</SelectItem>
                  <SelectItem value="Authority">Authority</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={intentFilter} onValueChange={setIntentFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Intent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Intent</SelectItem>
                  <SelectItem value="Extract">Extract</SelectItem>
                  <SelectItem value="Increase">Increase</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="L1">L1</SelectItem>
                  <SelectItem value="L2">L2</SelectItem>
                  <SelectItem value="L3">L3</SelectItem>
                  <SelectItem value="L4">L4</SelectItem>
                  <SelectItem value="L5">L5</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || leverageFilter !== 'all' || intentFilter !== 'all' || tierFilter !== 'all') && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-gray-500">Filters:</span>
              {searchTerm && (
                <Badge variant="outline" className="cursor-pointer" onClick={() => setSearchTerm('')}>
                  Search: "{searchTerm}" ×
                </Badge>
              )}
              {leverageFilter !== 'all' && (
                <Badge variant="outline" className="cursor-pointer" onClick={() => setLeverageFilter('all')}>
                  Leverage: {leverageFilter} ×
                </Badge>
              )}
              {intentFilter !== 'all' && (
                <Badge variant="outline" className="cursor-pointer" onClick={() => setIntentFilter('all')}>
                  Intent: {intentFilter} ×
                </Badge>
              )}
              {tierFilter !== 'all' && (
                <Badge variant="outline" className="cursor-pointer" onClick={() => setTierFilter('all')}>
                  Tier: {tierFilter} ×
                </Badge>
              )}
              <span className="text-sm text-gray-500">
                ({filteredCards.length} of {cards.length} cards)
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {filteredCards.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {cards.length === 0 ? 'No cards available' : 'No cards match your filters'}
            </h3>
            <p className="text-gray-600 mb-4">
              {cards.length === 0 
                ? 'Add some negotiation cards to view them in document format.'
                : 'Try adjusting your search terms or filters.'
              }
            </p>
            {cards.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setLeverageFilter('all')
                  setIntentFilter('all')  
                  setTierFilter('all')
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Table of Contents Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-1">
                    {markdownSections.slice(1).map((section) => (
                      <Button
                        key={section.id}
                        variant="ghost" 
                        className="w-full justify-start text-left text-sm py-2 px-3 h-auto"
                        onClick={() => {
                          const element = document.getElementById(section.id)
                          element?.scrollIntoView({ behavior: 'smooth' })
                        }}
                      >
                        {section.title}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Document Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-8">
                <div className="prose prose-lg max-w-none">
                  {markdownSections.map((section) => (
                    <div key={section.id} id={section.id} className="mb-8">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-3xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-100">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-xl font-medium text-gray-700 mt-6 mb-3">
                              {children}
                            </h3>
                          ),
                          p: ({ children }) => (
                            <p className="text-gray-600 mb-4 leading-relaxed">
                              {children}
                            </p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-600">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-600">
                              {children}
                            </ol>
                          ),
                          code: ({ children }) => (
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                              {children}
                            </code>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-gray-900">
                              {children}
                            </strong>
                          ),
                          hr: () => (
                            <hr className="my-8 border-t-2 border-gray-200" />
                          )
                        }}
                      >
                        {section.content}
                      </ReactMarkdown>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}