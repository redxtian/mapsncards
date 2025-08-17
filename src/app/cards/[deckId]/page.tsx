'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CardDeckViewer } from '@/components/cards/CardDeckViewer';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from '@/components/common';
import { toast } from 'sonner';
import { CardDeckPayload } from '@/types';

export default function CardDeckDetailPage() {
  const params = useParams();
  const deckId = params?.deckId as string;
  const [deck, setDeck] = useState<CardDeckPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDeck = useCallback(async () => {
    if (!deckId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/cards/${deckId}`);
      if (!res.ok) throw new Error(`Failed to load deck: ${res.status}`);
      const data = await res.json();
      if (data.success && data.deck) {
        // backend may return full row or local payload
        const d = data.deck.cards ? data.deck : { cards: [], scenario_input: '', ...data.deck };
        setDeck(d as CardDeckPayload);
      } else {
        toast.error(data.message || 'Deck not found');
        setDeck(null);
      }
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : 'Failed to load deck');
      setDeck(null);
    } finally {
      setIsLoading(false);
    }
  }, [deckId]);

  useEffect(() => { fetchDeck(); }, [deckId, fetchDeck]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button asChild variant="ghost">
            <Link href="/cards"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Link>
          </Button>
          <Button variant="outline" disabled>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button asChild variant="ghost">
            <Link href="/cards"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Link>
          </Button>
          <Button variant="outline" onClick={fetchDeck}>
            <RefreshCw className="w-4 h-4 mr-2" /> Retry
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600">Deck not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Button asChild variant="ghost">
          <Link href="/cards"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Link>
        </Button>
        <Button variant="outline" onClick={fetchDeck}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>
      <CardDeckViewer deck={deck} />
    </div>
  );
}

