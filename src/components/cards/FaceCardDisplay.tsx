'use client'

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, RefreshCw, Search, Plus, Upload, Trash2, X, Star, Clock, TrendingUp, Grid3X3, List, LayoutGrid, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare, Square } from "lucide-react";
import Link from "next/link";
import { cardOperations, CardItem } from "@/lib/firebase";
import { TextWithReferences } from "./TextWithReferences";
import { CardReferenceModal } from "./CardReferenceModal";

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

type GridDensity = "compact" | "comfortable" | "spacious";
type SortOption = "newest" | "oldest" | "alphabetical" | "tier";

const GRID_DENSITY_CONFIG: Record<GridDensity, { cols: string; gap: string; cardSize: string }> = {
  compact: { cols: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4", gap: "gap-3", cardSize: "p-4" },
  comfortable: { cols: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3", gap: "gap-4", cardSize: "p-5" },
  spacious: { cols: "grid-cols-1 sm:grid-cols-1 md:grid-cols-2", gap: "gap-6", cardSize: "p-6" }
};

const SORT_OPTIONS: Array<{value: SortOption, label: string, icon: React.ReactNode}> = [
  { value: "newest", label: "Newest First", icon: <ArrowDown className="h-3 w-3" /> },
  { value: "oldest", label: "Oldest First", icon: <ArrowUp className="h-3 w-3" /> },
  { value: "alphabetical", label: "A-Z", icon: <ArrowUpDown className="h-3 w-3" /> },
  { value: "tier", label: "By Tier", icon: <TrendingUp className="h-3 w-3" /> }
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

function FaceCard({ item, onDelete, density, isSelected, onSelect, onReferenceClick, referenceCards }: { 
  item: CardItem; 
  onDelete?: (item: CardItem) => void;
  density: GridDensity;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onReferenceClick?: (reference: string) => void;
  referenceCards?: Record<string, CardItem>;
}) {
  const [mode, setMode] = useState<"direct" | "inception">("direct");
  const [lineIdx, setLineIdx] = useState(0);
  
  const densityConfig = GRID_DENSITY_CONFIG[density];

  const phrases = item.modes[mode];
  const phrase = phrases[Math.min(lineIdx, Math.max(phrases.length - 1, 0))] || "";

  function cycle(delta: number) {
    if (!phrases.length) return;
    const next = (lineIdx + delta + phrases.length) % phrases.length;
    setLineIdx(next);
  }

  return (
    <motion.div
      id={`card-${item.id}`}
      layout
      className={`group relative flex h-full flex-col rounded-3xl border backdrop-blur-md transition-all duration-300 overflow-hidden ${
        isSelected 
          ? "border-blue-400/30 bg-gradient-to-br from-blue-50/80 via-blue-50/60 to-blue-100/40 shadow-xl shadow-blue-500/10" 
          : "border-white/20 bg-gradient-to-br from-white/90 via-white/80 to-gray-50/60 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10"
      } ${densityConfig.cardSize}`}
      whileHover={{ 
        y: -4,
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring" }}
    >
      {/* Glass shine effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Floating particles effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute top-4 right-4 w-1 h-1 bg-white/60 rounded-full animate-pulse" />
        <div className="absolute top-6 right-8 w-0.5 h-0.5 bg-blue-200/80 rounded-full animate-pulse delay-300" />
        <div className="absolute top-8 right-6 w-0.5 h-0.5 bg-white/40 rounded-full animate-pulse delay-700" />
      </div>
      {/* Header */}
      <div className="relative mb-3 flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-start gap-3">
            {onSelect && (
              <motion.button
                onClick={() => onSelect(item.id)}
                className="mt-1 text-zinc-400 hover:text-zinc-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  initial={false}
                  animate={isSelected ? { scale: [1, 1.2, 1], rotate: [0, 5, 0] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {isSelected ? <CheckSquare className="h-4 w-4 text-blue-600" /> : <Square className="h-4 w-4" />}
                </motion.div>
              </motion.button>
            )}
            <div className="flex-1">
              <motion.h3 
                className="font-semibold text-zinc-900 group-hover:text-zinc-800 transition-colors duration-300"
                layoutId={`card-title-${item.id}`}
              >
                {item.name}
              </motion.h3>
              <div className="mt-1 flex items-center gap-2">
                <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400 }}>
                  <Badge className={`${leverageColors[item.leverage]} backdrop-blur-sm border border-white/20`}>{item.leverage}</Badge>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, delay: 0.05 }}>
                  <Badge className="bg-white/60 text-zinc-700 backdrop-blur-sm border border-white/30">{item.intent}</Badge>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, delay: 0.1 }}>
                  <Badge className="bg-gradient-to-r from-zinc-100/80 to-zinc-200/60 text-zinc-800 backdrop-blur-sm border border-white/20">{item.tier}</Badge>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="relative mb-3">
        <FieldLabel>Summary</FieldLabel>
        <motion.div 
          className="mt-1 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/30 p-3 shadow-inner"
          whileHover={{ 
            background: "rgba(255, 255, 255, 0.6)",
            transition: { duration: 0.3 }
          }}
        >
          <p className="text-sm text-zinc-800 leading-relaxed">{item.summary}</p>
        </motion.div>
      </div>

      {/* Mode Toggle */}
      <div className="mb-2 flex items-center gap-2">
        <FieldLabel>Mode</FieldLabel>
        <div className="ml-auto"></div>
        <motion.div 
          className="grid grid-cols-2 rounded-2xl border border-white/30 bg-white/20 backdrop-blur-sm p-1 shadow-inner"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <motion.button
            className={`rounded-xl px-3 py-1 text-sm font-medium transition-all duration-300 ${
              mode === "direct" 
                ? "bg-gradient-to-r from-zinc-900 to-zinc-800 text-white shadow-lg" 
                : "text-zinc-700 hover:bg-white/40 backdrop-blur-sm"
            }`}
            onClick={() => { setMode("direct"); setLineIdx(0); }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Direct
          </motion.button>
          <motion.button
            className={`rounded-xl px-3 py-1 text-sm font-medium transition-all duration-300 ${
              mode === "inception" 
                ? "bg-gradient-to-r from-zinc-900 to-zinc-800 text-white shadow-lg" 
                : "text-zinc-700 hover:bg-white/40 backdrop-blur-sm"
            }`}
            onClick={() => { setMode("inception"); setLineIdx(0); }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Inception
          </motion.button>
        </motion.div>
      </div>

      {/* Phrase */}
      <div className="mb-3">
        <FieldLabel>Phrase</FieldLabel>
        <div className="mt-1">
          <div className="relative">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mode + ":" + lineIdx}
                initial={{ rotateX: 90, opacity: 0, scale: 0.95 }}
                animate={{ rotateX: 0, opacity: 1, scale: 1 }}
                exit={{ rotateX: -90, opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, type: "spring" }}
                className="rounded-2xl border border-white/30 bg-gradient-to-br from-white/60 via-white/40 to-zinc-50/30 backdrop-blur-sm p-3 text-zinc-900 shadow-inner relative overflow-hidden"
              >
                {/* Glass reflection effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-50" />
                <div className="relative">
                  {phrase || <span className="text-zinc-400">No phrase</span>}
                </div>
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
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outline" 
                      onClick={() => cycle(-1)} 
                      ariaLabel="Previous phrase"
                      className="bg-white/60 backdrop-blur-sm border-white/40 hover:bg-white/80 transition-all duration-300 shadow-sm"
                    >
                      <RefreshCw className="h-4 w-4 -scale-x-100" /> Prev
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="outline" 
                      onClick={() => cycle(1)} 
                      ariaLabel="Next phrase"
                      className="bg-white/60 backdrop-blur-sm border-white/40 hover:bg-white/80 transition-all duration-300 shadow-sm"
                    >
                      Next <RefreshCw className="h-4 w-4" />
                    </Button>
                  </motion.div>
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
            <motion.li 
              key={i} 
              className="flex items-start gap-3 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/20 p-3 shadow-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              whileHover={{ 
                scale: 1.02, 
                backgroundColor: "rgba(255, 255, 255, 0.5)",
                transition: { duration: 0.2 }
              }}
            >
              <motion.span 
                className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-zinc-900 to-zinc-700 text-xs font-bold text-white shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                {i + 1}
              </motion.span>
              <TextWithReferences
                text={step}
                onReferenceClick={onReferenceClick}
                referenceCards={referenceCards}
                className="text-sm text-zinc-800 leading-relaxed"
              />
            </motion.li>
          ))}
        </ol>
      </div>

      {/* Recovery */}
      <div className="mb-4">
        <FieldLabel>Recovery</FieldLabel>
        <motion.div 
          className="mt-1 rounded-2xl border border-white/30 bg-gradient-to-br from-amber-50/60 via-white/50 to-orange-50/40 backdrop-blur-sm p-3 text-sm text-zinc-800 shadow-inner relative overflow-hidden"
          whileHover={{ 
            background: "linear-gradient(to bottom right, rgba(255, 251, 235, 0.8), rgba(255, 255, 255, 0.7), rgba(255, 247, 237, 0.6))",
            transition: { duration: 0.3 }
          }}
        >
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-200/10 via-transparent to-orange-200/10 opacity-50" />
          <div className="relative">
            {item.recovery}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-end relative">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="ghost" 
            onClick={() => onDelete?.(item)}
            ariaLabel="Delete card"
            className="text-red-600 hover:text-red-700 hover:bg-red-50/80 backdrop-blur-sm border border-transparent hover:border-red-200/50 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Trash2 className="h-4 w-4" />
            </motion.div>
          </Button>
        </motion.div>
        
        {/* Floating action indicator */}
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-br from-red-400 to-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
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
  const [gridDensity, setGridDensity] = useState<GridDensity>("comfortable");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [referenceCards, setReferenceCards] = useState<Record<string, CardItem>>({});
  const [modalCard, setModalCard] = useState<CardItem | null>(null);
  const [showModal, setShowModal] = useState(false);

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

  // Load referenced cards when cards change
  useEffect(() => {
    async function loadReferencedCards() {
      const allReferences = new Set<string>();
      
      // Extract all references from card steps
      cards.forEach(card => {
        card.steps?.forEach(step => {
          const matches = step.match(/`([^`]+)`/g);
          if (matches) {
            matches.forEach(match => {
              const reference = match.slice(1, -1); // Remove backticks
              allReferences.add(reference);
            });
          }
        });
      });

      if (allReferences.size > 0) {
        try {
          const referencedCardsList = await cardOperations.getByIds(Array.from(allReferences));
          const referencedCardsMap: Record<string, CardItem> = {};
          
          referencedCardsList.forEach(card => {
            referencedCardsMap[card.id] = card;
          });
          
          setReferenceCards(referencedCardsMap);
        } catch (err) {
          console.error('Error loading referenced cards:', err);
        }
      }
    }

    if (cards.length > 0) {
      loadReferencedCards();
    }
  }, [cards]);

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
      // Remove from selection if it was selected
      if (selectedCards.has(cardId)) {
        setSelectedCards(prev => {
          const newSet = new Set(prev);
          newSet.delete(cardId);
          return newSet;
        });
      }
    } catch (err) {
      console.error('Error deleting card:', err);
      alert('Failed to delete card. Please try again.');
    }
  };

  // Handle reference chip click
  const handleReferenceClick = (reference: string) => {
    const referencedCard = referenceCards[reference];
    if (referencedCard) {
      setModalCard(referencedCard);
      setShowModal(true);
    }
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setModalCard(null);
  };

  // Bulk operations
  const toggleCardSelection = (cardId: string) => {
    setSelectedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const selectAllVisible = () => {
    setSelectedCards(new Set(filteredAndSorted.map(card => card.id)));
  };

  const clearSelection = () => {
    setSelectedCards(new Set());
  };

  const bulkDelete = async () => {
    if (selectedCards.size === 0) return;
    
    const cardNames = filteredAndSorted
      .filter(c => selectedCards.has(c.id))
      .map(c => c.name)
      .slice(0, 3)
      .join(", ");
    
    if (confirm(`Delete ${selectedCards.size} selected cards including "${cardNames}"${selectedCards.size > 3 ? ' and others' : ''}? This cannot be undone.`)) {
      try {
        for (const cardId of selectedCards) {
          await cardOperations.delete(cardId);
        }
        setCards(prev => prev.filter(c => !selectedCards.has(c.id)));
        clearSelection();
      } catch (err) {
        console.error('Error bulk deleting cards:', err);
        alert('Failed to delete some cards. Please try again.');
      }
    }
  };

  const filteredAndSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    let filtered = cards.filter((c) => {
      const hit = !q || [c.name, c.summary, c.id, c.leverage, c.intent, ...c.modes.direct, ...c.modes.inception, ...c.steps, c.recovery].join("\n").toLowerCase().includes(q);
      const okLev = lev === "All" || c.leverage === lev;
      const okInt = intent === "All" || c.intent === intent;
      const okTier = tier === "All" || c.tier === tier;
      return hit && okLev && okInt && okTier;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (b.created_at?.getTime() || 0) - (a.created_at?.getTime() || 0);
        case "oldest":
          return (a.created_at?.getTime() || 0) - (b.created_at?.getTime() || 0);
        case "alphabetical":
          return a.name.localeCompare(b.name);
        case "tier":
          const tierOrder = { "L1": 1, "L2": 2, "L3": 3, "L4": 4, "L5": 5 };
          return (tierOrder[a.tier] || 999) - (tierOrder[b.tier] || 999);
        default:
          return 0;
      }
    });

    return filtered;
  }, [cards, query, lev, intent, tier, sortBy]);

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
          <div className="text-gray-400 mb-6">
            <LayoutGrid className="h-16 w-16 mx-auto" strokeWidth={1} />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">Your Card Library is Empty</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start building your negotiation toolkit by adding cards. You can upload JSON files with multiple cards or create them individually.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/cards/input">
                <Upload className="h-4 w-4 mr-2" />
                Import Card Collection
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/cards/input">
                <Plus className="h-4 w-4 mr-2" />
                Create First Card
              </Link>
            </Button>
          </div>
          <div className="mt-8 text-sm text-gray-500">
            <p>💡 <strong>Pro tip:</strong> Upload a JSON array to quickly populate your library with multiple cards</p>
          </div>
        </div>
      </div>
    );
  }

  if (filteredAndSorted.length === 0) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        {/* Header and controls would still be shown */}
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
        
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" strokeWidth={1} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No cards match your current filters</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search terms or clearing some filters to see more results.</p>
          <Button 
            variant="outline"
            onClick={() => {
              setQuery("");
              setLev("All");
              setIntent("All");
              setTier("All");
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Clear All Filters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6 relative">
      {/* Background glass effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white/10 to-purple-50/20 backdrop-blur-3xl -z-10 rounded-3xl" />
      {/* Header */}
      <motion.div 
        className="mb-6 flex items-center justify-between relative"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
      >
        <div className="relative">
          <motion.h1 
            className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent"
            layoutId="page-title"
          >
            Card Library
          </motion.h1>
          <motion.p 
            className="text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            Browse and use your negotiation cards
          </motion.p>
          {/* Decorative glass orb */}
          <div className="absolute -top-2 -right-4 w-8 h-8 bg-gradient-to-br from-blue-200/40 to-purple-200/40 rounded-full backdrop-blur-sm opacity-60" />
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4, type: "spring" }}
        >
          <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
            <Link href="/cards/input">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <Plus className="h-4 w-4 mr-2" />
              </motion.div>
              Add Cards
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Filter Presets */}
      <motion.div 
        className="mb-4 flex flex-wrap gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <span className="text-sm font-medium text-zinc-700 bg-white/60 backdrop-blur-sm px-2 py-1 rounded-full border border-white/30">Quick filters:</span>
        {FILTER_PRESETS.map((preset, index) => (
          <motion.button
            key={preset.name}
            onClick={() => applyPreset(preset)}
            className="flex items-center gap-2 rounded-full border border-white/30 bg-white/60 backdrop-blur-sm px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-white/80 hover:border-white/50 transition-all duration-300 shadow-sm hover:shadow-md"
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
          >
            <motion.div
              whileHover={{ scale: 1.2, rotate: 10 }}
              transition={{ duration: 0.2 }}
            >
              {preset.icon}
            </motion.div>
            {preset.name}
          </motion.button>
        ))}
      </motion.div>

      {/* Active Filters */}
      <AnimatePresence>
        {activeFilters.length > 0 && (
          <motion.div 
            className="mb-4 flex flex-wrap gap-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-sm font-medium text-zinc-700 bg-white/60 backdrop-blur-sm px-2 py-1 rounded-full border border-white/30">Active filters:</span>
            {activeFilters.map((filter, index) => (
              <motion.div
                key={`${filter.type}-${filter.value}`}
                className="flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-100/80 to-blue-200/60 backdrop-blur-sm border border-blue-200/40 px-3 py-1 text-sm font-medium text-blue-800 shadow-sm"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
              >
                {filter.label}
                <motion.button
                  onClick={() => removeFilter(filter)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                  whileHover={{ scale: 1.2, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-3 w-3" />
                </motion.button>
              </motion.div>
            ))}
            <motion.button
              onClick={() => {
                setQuery("");
                setLev("All");
                setIntent("All");
                setTier("All");
              }}
              className="text-sm text-zinc-500 hover:text-zinc-700 underline bg-white/40 backdrop-blur-sm px-2 py-1 rounded-full border border-white/20 hover:bg-white/60 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear all
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layout Controls */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Grid Density */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-700">Density:</span>
            <div className="flex items-center border border-zinc-200 rounded-lg p-1">
              {(["compact", "comfortable", "spacious"] as GridDensity[]).map((density) => {
                const Icon = density === "compact" ? Grid3X3 : density === "comfortable" ? LayoutGrid : List;
                return (
                  <button
                    key={density}
                    onClick={() => setGridDensity(density)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                      gridDensity === density
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                    }`}
                    title={`${density.charAt(0).toUpperCase() + density.slice(1)} view`}
                  >
                    <Icon className="h-3 w-3" />
                    <span className="hidden sm:inline">{density.charAt(0).toUpperCase() + density.slice(1)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-700">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-lg border border-zinc-200 px-2 py-1 text-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant={bulkMode ? "default" : "outline"}
            onClick={() => {
              setBulkMode(!bulkMode);
              if (bulkMode) clearSelection();
            }}
            className="text-sm"
          >
            <CheckSquare className="h-4 w-4 mr-1" />
            {bulkMode ? "Exit Bulk" : "Bulk Select"}
          </Button>
          
          {bulkMode && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-600">{selectedCards.size} selected</span>
              {selectedCards.size > 0 && (
                <>
                  <Button variant="outline" onClick={clearSelection} className="text-xs px-2 py-1">
                    Clear
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={bulkDelete} 
                    className="text-xs px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Delete {selectedCards.size}
                  </Button>
                </>
              )}
              {selectedCards.size < filteredAndSorted.length && (
                <Button variant="outline" onClick={selectAllVisible} className="text-xs px-2 py-1">
                  Select All ({filteredAndSorted.length})
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

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
          <div className="flex items-center gap-2 text-sm text-zinc-600"><Filter className="h-4 w-4"/> {filteredAndSorted.length} / {cards.length} cards</div>
          <button
            className="text-sm font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-900"
            onClick={() => { setQuery(""); setLev("All"); setIntent("All"); setTier("All"); }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Grid */}
      <motion.div 
        className={`grid ${GRID_DENSITY_CONFIG[gridDensity].cols} ${GRID_DENSITY_CONFIG[gridDensity].gap}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <AnimatePresence>
          {filteredAndSorted.map((c, index) => (
            <motion.div
              key={c.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ 
                delay: index * 0.05, 
                duration: 0.4, 
                type: "spring",
                stiffness: 100 
              }}
            >
              <FaceCard 
                item={c} 
                onDelete={handleDelete}
                density={gridDensity}
                isSelected={selectedCards.has(c.id)}
                onSelect={bulkMode ? toggleCardSelection : undefined}
                onReferenceClick={handleReferenceClick}
                referenceCards={referenceCards}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

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

      {/* Reference Card Modal */}
      <CardReferenceModal 
        isOpen={showModal}
        onClose={closeModal}
        card={modalCard}
      />
    </div>
  );
}