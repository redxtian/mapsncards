'use client'

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Search, Plus, Upload, Trash2 } from "lucide-react";
import Link from "next/link";
import { cardOperations, CardItem } from "@/lib/firebase";

// ————————————————————————————————————————————————
// Small UI helpers (Tailwind only)
// ————————————————————————————————————————————————

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
    <button aria-label={ariaLabel} disabled={disabled} onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="text-xs uppercase tracking-wide text-zinc-500 font-semibold">{children}</div>
);

// ————————————————————————————————————————————————
// Mapping utils
// ————————————————————————————————————————————————

const leverageHue: Record<CardItem["leverage"], string> = {
  Informational: "bg-sky-100 text-sky-800",
  Relational: "bg-pink-100 text-pink-800",
  Resource: "bg-amber-100 text-amber-800",
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

  const phrases = item.modes[mode];
  const phrase = phrases[0] || "";

  return (
    <motion.div
      layout
      className="group relative flex h-full flex-col rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
      whileHover={{ y: -2 }}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="text-lg font-semibold text-zinc-900">{item.name}</div>
          <div className="text-sm text-zinc-500">{item.summary}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={` ${leverageHue[item.leverage]}`}>{item.leverage}</Badge>
          <Badge className="bg-zinc-100 text-zinc-800">{item.intent}</Badge>
          <Badge className="bg-zinc-900 text-white">{item.tier}</Badge>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="mb-2 flex items-center gap-2">
        <FieldLabel>Mode</FieldLabel>
        <div className="ml-auto"></div>
        <div className="grid grid-cols-2 rounded-2xl border border-zinc-300 p-1">
          <button
            className={`rounded-xl px-3 py-1 text-sm font-medium ${mode === "direct" ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100"}`}
            onClick={() => setMode("direct")}
          >
            Direct
          </button>
          <button
            className={`rounded-xl px-3 py-1 text-sm font-medium ${mode === "inception" ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100"}`}
            onClick={() => setMode("inception")}
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
                key={mode}
                initial={{ rotateX: 90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: -90, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-zinc-900"
              >
                {phrase || <span className="text-zinc-400">No phrase</span>}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="mb-3">
        <FieldLabel>Steps</FieldLabel>
        <ol className="mt-1 space-y-2">
          {item.steps.map((s, i) => (
            <li key={i} className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">{i + 1}</span>
              <span className="text-sm text-zinc-800">{s}</span>
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

      {/* Toolbar */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cards, phrases, steps…"
            className="w-full rounded-2xl border border-zinc-300 bg-white px-10 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
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
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}