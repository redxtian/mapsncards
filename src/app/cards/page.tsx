'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/common';
import { Trash2, RefreshCw, Search, Eye, Library, Grid } from 'lucide-react';
import { toast } from 'sonner';
import { AnyCard, CardDeckPayload } from '@/types';

export default function CardsPage() {
  const [decks, setDecks] = useState<CardDeckPayload[]>([]);
  const [filtered, setFiltered] = useState<CardDeckPayload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [q, setQ] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchDecks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cards');
      if (!res.ok) throw new Error(`Failed to load decks: ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.decks)) {
        setDecks(data.decks);
        setFiltered(data.decks);
      } else {
        setDecks([]);
        setFiltered([]);
      }
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : 'Failed to load decks');
      setDecks([]);
      setFiltered([]);
    } finally {
      setIsLoading(false);

    }
  };
  

  useEffect(() => { fetchDecks(); }, []);

  useEffect(() => {
    if (!q) { setFiltered(decks); return; }
    const term = q.toLowerCase();
    setFiltered(decks.filter(d => {
      const scenario = (d.scenario_input || '').toLowerCase();
      const names = (d.cards || []).map((c: AnyCard) => c.name.toLowerCase()).join(' ');
      return scenario.includes(term) || names.includes(term);
    }));
  }, [q, decks]);

  const handleDelete = async (deckId: string) => {
    if (!confirm('Delete this deck? This cannot be undone.')) return;
    setDeleting(deckId);
    try {
      const res = await fetch(`/api/cards/${deckId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      const result = await res.json();
      if (result.success) {
        toast.success('Deck deleted');
        setDecks(prev => prev.filter(d => 'deck_id' in d && d.deck_id !== deckId));
        setFiltered(prev => prev.filter(d => 'deck_id' in d && d.deck_id !== deckId));
      } else {
        toast.error(result.message || 'Delete failed');
      }
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Card Decks</h2>
            <p className="text-gray-500">Fetching your generated cards...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Card Decks</h1>
          <p className="text-gray-600 mt-1">View and manage generated cards</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/cards/generate">
              <Library className="w-4 h-4 mr-2" /> Browse by Scenario
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/cards/library">
              <Grid className="w-4 h-4 mr-2" /> All Cards
            </Link>
          </Button>
          <Button variant="outline" onClick={fetchDecks}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Search className="h-4 w-4 text-gray-400" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by scenario or card name" />
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <div className="text-center text-gray-600 py-16">No decks found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((deck, idx) => {
            const deckId = ('deck_id' in deck ? deck.deck_id : `local_${idx}`) as string;
            const total = deck.cards?.length || 0;
            const types = new Set((deck.cards || []).map((c: AnyCard) => c.type));
            return (
              <Card key={deckId} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Deck ID</div>
                    <div className="font-mono text-sm">{deckId}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge variant="outline">{total} cards</Badge>
                    <div className="hidden md:flex gap-1">
                      {[...types].slice(0,4).map(t => (
                        <Badge key={t} variant="secondary">{t}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                {deck.scenario_input && (
                  <p className="text-sm text-gray-700 mt-2 line-clamp-2">{deck.scenario_input}</p>
                )}
                <div className="mt-4 flex gap-2">
                  <Button asChild size="sm">
                    <Link href={`/cards/${deckId}`}>
                      <Eye className="w-4 h-4 mr-2" /> View
                    </Link>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    disabled={deleting === deckId}
                    onClick={() => handleDelete(deckId)}
                  >
                    {deleting === deckId ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

