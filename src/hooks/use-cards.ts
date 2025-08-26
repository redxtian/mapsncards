import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cardOperations, CardItem } from '@/lib/firebase';
import { toast } from 'sonner';

// Query keys for React Query cache management
export const cardKeys = {
  all: ['cards'] as const,
  lists: () => [...cardKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...cardKeys.lists(), { filters }] as const,
  details: () => [...cardKeys.all, 'detail'] as const,
  detail: (id: string) => [...cardKeys.details(), id] as const,
  stats: () => [...cardKeys.all, 'stats'] as const,
};

// Get all cards
export function useCards() {
  return useQuery({
    queryKey: cardKeys.lists(),
    queryFn: () => cardOperations.getAll(),
    staleTime: 2 * 60 * 1000, // 2 minutes - shorter than maps since cards change more frequently
  });
}

// Get filtered cards
export function useFilteredCards(filters: {
  leverage?: CardItem['leverage'] | 'All';
  intent?: CardItem['intent'] | 'All';
  search?: string;
}) {
  return useQuery({
    queryKey: cardKeys.list(filters),
    queryFn: () => cardOperations.getFiltered(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get card statistics - derived from cards data
export function useCardStats() {
  const { data: cards = [], isLoading, error } = useCards();

  // Calculate statistics from cards data
  const stats = {
    totalCards: cards.length,
    leverageTypes: {
      'Informational': cards.filter(card => card.leverage === 'Informational').length,
      'Relational': cards.filter(card => card.leverage === 'Relational').length,
      'Resource': cards.filter(card => card.leverage === 'Resource').length,
      'Urgency': cards.filter(card => card.leverage === 'Urgency').length,
      'Narrative': cards.filter(card => card.leverage === 'Narrative').length,
      'Authority': cards.filter(card => card.leverage === 'Authority').length,
    },
    intentTypes: {
      'Extract': cards.filter(card => card.intent === 'Extract').length,
      'Increase': cards.filter(card => card.intent === 'Increase').length,
    },
    // Get most used leverage type
    mostUsedLeverage: (() => {
      const leverageCounts = Object.entries({
        'Informational': cards.filter(card => card.leverage === 'Informational').length,
        'Relational': cards.filter(card => card.leverage === 'Relational').length,
        'Resource': cards.filter(card => card.leverage === 'Resource').length,
        'Urgency': cards.filter(card => card.leverage === 'Urgency').length,
        'Narrative': cards.filter(card => card.leverage === 'Narrative').length,
        'Authority': cards.filter(card => card.leverage === 'Authority').length,
      });
      const maxEntry = leverageCounts.reduce((max, entry) => 
        entry[1] > max[1] ? entry : max
      );
      return { type: maxEntry[0], count: maxEntry[1] };
    })(),
    // Get recent cards (last 5, sorted by creation date)
    recentCards: cards
      .filter(card => card.created_at)
      .sort((a, b) => {
        const dateA = a.created_at instanceof Date ? a.created_at : new Date(0);
        const dateB = b.created_at instanceof Date ? b.created_at : new Date(0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5)
  };

  return {
    data: stats,
    isLoading,
    error,
  };
}

// Insert card mutation with cache invalidation
export function useInsertCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (card: Omit<CardItem, 'created_at' | 'updated_at'>) => 
      cardOperations.insert(card),
    onSuccess: (newCard) => {
      // Invalidate all card queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: cardKeys.all });
      
      toast.success(`Card "${newCard.name}" added successfully!`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to add card: ${error.message}`);
    },
  });
}

// Update card mutation
export function useUpdateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CardItem> }) =>
      cardOperations.update(id, updates),
    onSuccess: (updatedCard) => {
      // Update the specific card in cache
      queryClient.setQueryData(
        cardKeys.detail(updatedCard.id),
        updatedCard
      );

      // Invalidate lists to show updated data
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() });

      toast.success(`Card "${updatedCard.name}" updated successfully!`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update card: ${error.message}`);
    },
  });
}

// Delete card mutation
export function useDeleteCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cardOperations.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: cardKeys.detail(deletedId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() });

      toast.success('Card deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete card: ${error.message}`);
    },
  });
}

// Bulk insert cards mutation (for JSON input)
export function useBulkInsertCards() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cards: Omit<CardItem, 'created_at' | 'updated_at'>[]) => {
      const results = [];
      for (const card of cards) {
        try {
          const result = await cardOperations.insert(card);
          results.push({ success: true, card: result });
        } catch (error) {
          results.push({ success: false, error: error instanceof Error ? error.message : 'Unknown error', cardId: card.id });
        }
      }
      return results;
    },
    onSuccess: (results) => {
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      // Invalidate all card queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: cardKeys.all });
      
      if (successful.length > 0) {
        toast.success(`${successful.length} card${successful.length !== 1 ? 's' : ''} added successfully!`);
      }
      
      if (failed.length > 0) {
        toast.error(`${failed.length} card${failed.length !== 1 ? 's' : ''} failed to save`);
      }
    },
    onError: (error: Error) => {
      toast.error(`Bulk insert failed: ${error.message}`);
    },
  });
}