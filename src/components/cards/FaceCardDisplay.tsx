'use client'

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, RefreshCw, Search, Plus, Upload, Trash2, X, Star, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { cardOperations, CardItem } from "@/lib/firebase";

// ————————————————————————————————————————————————
// Small UI helpers (Tailwind only)
// ————————————————————————————————————————————————

type FilterPreset = {
  name: string;
  icon: React.ReactNode;
  filters: {
    leverage?: CardItem["leverage"] | "All";
    intent?: CardItem["intent"] | "All";
    tier?: CardItem["tier"] | "All";
  };
};

const FILTER_PRESETS: FilterPreset[] = [
  {
    name: "Popular Leverage",
    icon: <Star className="h-3 w-3" />,
    filters: { leverage: "Informational" }
  },
  {
    name: "Recent Cards",
    icon: <Clock className="h-3 w-3" />,
    filters: {} // Will be handled by sorting
  },
  {
    name: "High Impact",
    icon: <TrendingUp className="h-3 w-3" />,
    filters: { tier: "L1" }
  }
];

const Badge = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>{children}</span>
);

const Button = ({
  children,
  className = "",
  onClick,
  variant = "default",
  ariaLabel,
  disabled,
  asChild = false,
  href
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: (e?: React.MouseEvent) => void;
  variant?: "default" | "ghost" | "outline";
  ariaLabel?: string;
  disabled?: boolean;
  asChild?: boolean;
  href?: string;
}) => {
  const base = "inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50";
  const variants: Record<string, string> = {
    default: "bg-black text-white hover:bg-zinc-800 focus:ring-black",
    ghost: "bg-transparent hover:bg-zinc-100 text-zinc-800 focus:ring-zinc-300",
    outline: "border border-zinc-300 hover:bg-zinc-50 text-zinc-800 focus:ring-zinc-300"
  };
  
  if (asChild && href) {
    return (
      <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
        {children}
      </Link>
    );
  }
  
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
};

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-medium uppercase tracking-wider text-zinc-500">{children}</label>
);

// Map leverage types to badge colors
const leverageColors: Record<CardItem["leverage"], string> = {
  Informational: "bg-blue-100 text-blue-800",
  Relational: "bg-green-100 text-green-800",
  Resource: "bg-yellow-100 text-yellow-800",
  Urgency: "bg-red-100 text-red-800",
  Narrative: "bg-violet-100 text-violet-800",
  Authority: "bg-emerald-100 text-emerald-800"
};

// ————————————————————————————————————————————————
// FaceCard component
// ————————————————————————————————————————————————

function FaceCard({ item, onDelete }: { 
  item: CardItem; 
  onDelete?: (item: CardItem) => void;
}) {
  const [mode, setMode] = useState<"direct" | "inception">("direct");
  const [lineIdx, setLineIdx] = useState(0);

  const phrases = item.modes[mode];
  const phrase = phrases[Math.min(lineIdx, Math.max(phrases.length - 1, 0))] || "";

  function cycle(delta: number) {
    if (!phrases.length) return;
    const next = (lineIdx + delta + phrases.length) % phrases.length;
    setLineIdx(next);
  }

  return (
    <motion.div
      layout
      className="group relative flex h-full flex-col rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
      whileHover={{ y: -2 }}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="font-semibold text-zinc-900">{item.name}</h3>
          <div className="mt-1 flex items-center gap-2">
            <Badge className={leverageColors[item.leverage]}>{item.leverage}</Badge>
            <Badge className="bg-zinc-100 text-zinc-700">{item.intent}</Badge>
            <Badge className="bg-zinc-100 text-zinc-700">{item.tier}</Badge>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-3">
        <FieldLabel>Summary</FieldLabel>
        <p className="mt-1 text-sm text-zinc-800">{item.summary}</p>
      </div>

      {/* Mode Toggle */}
      <div className="mb-2 flex items-center gap-2">
        <FieldLabel>Mode</FieldLabel>
        <div className="ml-auto"></div>
        <div className="grid grid-cols-2 rounded-2xl border border-zinc-300 p-1">
          <button
            className={`rounded-xl px-3 py-1 text-sm font-medium ${mode === "direct" ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100"}`}
            onClick={() => { setMode("direct"); setLineIdx(0); }}
          >
            Direct
          </button>
          <button
            className={`rounded-xl px-3 py-1 text-sm font-medium ${mode === "inception" ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100"}`}
            onClick={() => { setMode("inception"); setLineIdx(0); }}
          >
            Inception
          </button>
        </div>
      </div>

      {/* Phrase */}
      <div className="mb-3">
        <FieldLabel>Phrase</FieldLabel>
        <div className="mt-1">
          <div className="relative">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mode + ":" + lineIdx}
                initial={{ rotateX: 90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: -90, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-zinc-900"
              >
                {phrase || <span className="text-zinc-400">No phrase</span>}
              </motion.div>
            </AnimatePresence>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-xs text-zinc-500">{phrases.length} option{phrases.length !== 1 ? "s" : ""}</div>
                {phrases.length > 1 && (
                  <div className="text-xs bg-zinc-200 text-zinc-700 px-2 py-1 rounded-full">
                    {lineIdx + 1} of {phrases.length}
                  </div>
                )}
              </div>
              {phrases.length > 1 && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => cycle(-1)} ariaLabel="Previous phrase">
                    <RefreshCw className="h-4 w-4 -scale-x-100" /> Prev
                  </Button>
                  <Button variant="outline" onClick={() => cycle(1)} ariaLabel="Next phrase">
                    Next <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="mb-3">
        <FieldLabel>Steps</FieldLabel>
        <ol className="mt-1 space-y-2">
          {item.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium text-white">
                {i + 1}
              </span>
              <span className="text-sm text-zinc-800">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Recovery */}
      <div className="mb-4">
        <FieldLabel>Recovery</FieldLabel>
        <div className="mt-1 rounded-2xl border border-zinc-200 bg-white p-3 text-sm text-zinc-800">
          {item.recovery}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-end">
        <Button 
          variant="ghost" 
          onClick={() => onDelete?.(item)}
          ariaLabel="Delete card"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

// ————————————————————————————————————————————————
// Main component with Supabase integration
// ————————————————————————————————————————————————

export default function FaceCardDisplay() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [lev, setLev] = useState<"All" | CardItem["leverage"]>("All");
  const [intent, setIntent] = useState<"All" | CardItem["intent"]>("All");
  const [tier, setTier] = useState<"All" | CardItem["tier"]>("All");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Array<{type: string, value: string, label: string}>>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load cards from Supabase
  useEffect(() => {
    async function loadCards() {
      try {
        setLoading(true);
        const data = await cardOperations.getAll();
        setCards(data);
        setError(null);
      } catch (err) {
        console.error('Error loading cards:', err);
        setError('Failed to load cards from database');
      } finally {
        setLoading(false);
      }
    }

    loadCards();
  }, []);

  // Apply filter preset
  const applyPreset = (preset: FilterPreset) => {
    if (preset.filters.leverage) setLev(preset.filters.leverage);
    if (preset.filters.intent) setIntent(preset.filters.intent);
    if (preset.filters.tier) setTier(preset.filters.tier);
  };

  // Update active filters when filter states change
  useEffect(() => {
    const filters: Array<{type: string, value: string, label: string}> = [];
    if (lev !== "All") filters.push({type: "leverage", value: lev, label: `Leverage: ${lev}`});
    if (intent !== "All") filters.push({type: "intent", value: intent, label: `Intent: ${intent}`});
    if (tier !== "All") filters.push({type: "tier", value: tier, label: `Tier: ${tier}`});
    setActiveFilters(filters);
  }, [lev, intent, tier]);

  // Remove specific filter
  const removeFilter = (filterToRemove: {type: string, value: string, label: string}) => {
    switch (filterToRemove.type) {
      case "leverage": setLev("All"); break;
      case "intent": setIntent("All"); break;
      case "tier": setTier("All"); break;
    }
  };

  // Update search suggestions based on cards
  useEffect(() => {
    if (query.length > 1) {
      const suggestions = new Set<string>();
      cards.forEach(card => {
        [card.name, card.leverage, card.intent, ...card.modes.direct, ...card.modes.inception]
          .forEach(text => {
            if (text.toLowerCase().includes(query.toLowerCase()) && text.toLowerCase() !== query.toLowerCase()) {
              suggestions.add(text);
            }
          });
      });
      setSearchSuggestions(Array.from(suggestions).slice(0, 5));
    } else {
      setSearchSuggestions([]);
    }
  }, [query, cards]);

  // Handle delete card
  const handleDelete = (item: CardItem) => {
    setDeleteConfirm(item.id);
  };

  // Confirm delete
  const confirmDelete = async (cardId: string) => {
    try {
      await cardOperations.delete(cardId);
      setCards(prev => prev.filter(c => c.id !== cardId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting card:', err);
      alert('Failed to delete card. Please try again.');
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards.filter((c) => {
      const hit = !q || [c.name, c.summary, c.id, c.leverage, c.intent, ...c.modes.direct, ...c.modes.inception, ...c.steps, c.recovery].join("\n").toLowerCase().includes(q);
      const okLev = lev === "All" || c.leverage === lev;
      const okInt = intent === "All" || c.intent === intent;
      const okTier = tier === "All" || c.tier === tier;
      return hit && okLev && okInt && okTier;
    });
  }, [cards, query, lev, intent, tier]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cards from database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-800 font-medium">{error}</p>
          <p className="mt-2 text-gray-600">Make sure your database schema is set up correctly.</p>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Cards Found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first card to the database.</p>
          <Button asChild>
            <Link href="/cards/input">
              <Upload className="h-4 w-4 mr-2" />
              Add Cards via JSON
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Card Library</h1>
          <p className="text-gray-600">Browse and use your negotiation cards</p>
        </div>
        <Button asChild>
          <Link href="/cards/input">
            <Plus className="h-4 w-4 mr-2" />
            Add Cards
          </Link>
        </Button>
      </div>

      {/* Filter Presets */}
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="text-sm font-medium text-zinc-700">Quick filters:</span>
        {FILTER_PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => applyPreset(preset)}
            className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
          >
            {preset.icon}
            {preset.name}
          </button>
        ))}
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="text-sm font-medium text-zinc-700">Active filters:</span>
          {activeFilters.map((filter) => (
            <div
              key={`${filter.type}-${filter.value}`}
              className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
            >
              {filter.label}
              <button
                onClick={() => removeFilter(filter)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              setQuery("");
              setLev("All");
              setIntent("All");
              setTier("All");
            }}
            className="text-sm text-zinc-500 hover:text-zinc-700 underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Enhanced Search and Filters */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search cards, phrases, steps…"
            className="w-full rounded-2xl border border-zinc-300 bg-white px-10 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          
          {/* Search Suggestions */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-xl border border-zinc-200 bg-white shadow-lg">
              {searchSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(suggestion);
                    setShowSuggestions(false);
                  }}
                  className="flex w-full items-center px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 first:rounded-t-xl last:rounded-b-xl"
                >
                  <Search className="h-3 w-3 mr-2 text-zinc-400" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-600">Leverage</span>
          <select
            value={lev}
            onChange={(e) => setLev(e.target.value as any)}
            className="ml-auto w-full rounded-2xl border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            {(["All", "Informational", "Relational", "Resource", "Urgency", "Narrative", "Authority"] as const).map((x) => (
              <option key={x} value={x}>{x}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-600">Intent</span>
          <select
            value={intent}
            onChange={(e) => setIntent(e.target.value as any)}
            className="ml-auto w-full rounded-2xl border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            {(["All", "Extract", "Increase"] as const).map((x) => (
              <option key={x} value={x}>{x}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-600">Tier</span>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value as any)}
            className="ml-auto w-full rounded-2xl border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            {(["All", "L1", "L2", "L3", "L4", "L5"] as const).map((x) => (
              <option key={x} value={x}>{x}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-3 py-2.5">
          <div className="flex items-center gap-2 text-sm text-zinc-600"><Filter className="h-4 w-4"/> {filtered.length} / {cards.length} cards</div>
          <button
            className="text-sm font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900"
            onClick={() => { setQuery(""); setLev("All"); setIntent("All"); setTier("All"); }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => (
          <FaceCard key={c.id} item={c} onDelete={handleDelete} />
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Card</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{cards.find(c => c.id === deleteConfirm)?.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button 
                onClick={() => confirmDelete(deleteConfirm)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}