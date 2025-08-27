'use client'

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Search, Filter, Eye, EyeOff, Folder, FolderOpen } from "lucide-react";
import { CardItem } from "@/lib/firebase";

interface TreeNode {
  id: string;
  name: string;
  card: CardItem;
  children: TreeNode[];
  references: string[];
  isExpanded?: boolean;
}

interface TreeViewNavigatorProps {
  cards: CardItem[];
  onCardSelect?: (card: CardItem) => void;
  selectedCardId?: string | null;
  className?: string;
}

export function TreeViewNavigator({ 
  cards, 
  onCardSelect, 
  selectedCardId,
  className = "" 
}: TreeViewNavigatorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showOnlyWithReferences, setShowOnlyWithReferences] = useState(false);

  // Build tree structure from cards
  const treeData = useMemo(() => {
    // Create a map of all cards
    const cardMap = new Map<string, CardItem>();
    cards.forEach(card => cardMap.set(card.id, card));

    // Extract references from each card
    const cardReferences = new Map<string, string[]>();
    cards.forEach(card => {
      const references: string[] = [];
      card.steps?.forEach(step => {
        const matches = step.match(/`([^`]+)`/g);
        if (matches) {
          matches.forEach(match => {
            const reference = match.slice(1, -1);
            if (cardMap.has(reference)) {
              references.push(reference);
            }
          });
        }
      });
      cardReferences.set(card.id, references);
    });

    // Create nodes for each card
    const nodes = new Map<string, TreeNode>();
    cards.forEach(card => {
      nodes.set(card.id, {
        id: card.id,
        name: card.name,
        card,
        children: [],
        references: cardReferences.get(card.id) || [],
        isExpanded: expandedNodes.has(card.id)
      });
    });

    // Build parent-child relationships based on references
    cards.forEach(card => {
      const references = cardReferences.get(card.id) || [];
      const node = nodes.get(card.id);
      if (node) {
        // Add referenced cards as children
        references.forEach(refId => {
          const referencedNode = nodes.get(refId);
          if (referencedNode) {
            node.children.push(referencedNode);
          }
        });
      }
    });

    // Find root nodes (cards that aren't referenced by others)
    const referencedCardIds = new Set<string>();
    cards.forEach(card => {
      const references = cardReferences.get(card.id) || [];
      references.forEach(refId => referencedCardIds.add(refId));
    });

    const rootNodes: TreeNode[] = [];
    cards.forEach(card => {
      if (!referencedCardIds.has(card.id)) {
        const node = nodes.get(card.id);
        if (node) {
          rootNodes.push(node);
        }
      }
    });

    // Sort by tier and name
    const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.sort((a, b) => {
        // First by tier (L1, L2, L3, etc.)
        const tierOrder = { "L1": 1, "L2": 2, "L3": 3, "L4": 4, "L5": 5 };
        const aTier = tierOrder[a.card.tier] || 999;
        const bTier = tierOrder[b.card.tier] || 999;
        
        if (aTier !== bTier) {
          return aTier - bTier;
        }
        
        // Then by name
        return a.name.localeCompare(b.name);
      });
    };

    // Recursively sort all nodes
    const sortRecursively = (nodes: TreeNode[]): TreeNode[] => {
      const sorted = sortNodes(nodes);
      sorted.forEach(node => {
        node.children = sortRecursively(node.children);
      });
      return sorted;
    };

    return sortRecursively(rootNodes);
  }, [cards, expandedNodes]);

  // Filter tree based on search and options
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim() && !showOnlyWithReferences) {
      return treeData;
    }

    const filterNode = (node: TreeNode): TreeNode | null => {
      const matchesSearch = !searchQuery.trim() || 
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.card.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.card.leverage.toLowerCase().includes(searchQuery.toLowerCase());

      const hasReferences = node.references.length > 0;
      const matchesReferenceFilter = !showOnlyWithReferences || hasReferences;

      // Filter children recursively
      const filteredChildren = node.children
        .map(child => filterNode(child))
        .filter(Boolean) as TreeNode[];

      // Include node if it matches criteria or has matching children
      if ((matchesSearch && matchesReferenceFilter) || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren
        };
      }

      return null;
    };

    return treeData
      .map(node => filterNode(node))
      .filter(Boolean) as TreeNode[];
  }, [treeData, searchQuery, showOnlyWithReferences]);

  const toggleExpanded = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allNodeIds = new Set<string>();
    const collectIds = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        allNodeIds.add(node.id);
        collectIds(node.children);
      });
    };
    collectIds(treeData);
    setExpandedNodes(allNodeIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const renderTreeNode = (node: TreeNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const isSelected = selectedCardId === node.id;

    return (
      <div key={node.id} className="select-none">
        <motion.div
          className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-white/60 backdrop-blur-sm transition-all duration-200 cursor-pointer group ${
            isSelected ? 'bg-blue-100/80 border border-blue-200/60' : ''
          }`}
          style={{ marginLeft: `${depth * 16}px` }}
          onClick={() => onCardSelect?.(node.card)}
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Expand/Collapse Button */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) {
                toggleExpanded(node.id);
              }
            }}
            className={`flex items-center justify-center w-4 h-4 rounded ${
              hasChildren 
                ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/80' 
                : 'text-transparent'
            }`}
            whileHover={hasChildren ? { scale: 1.1 } : {}}
            whileTap={hasChildren ? { scale: 0.9 } : {}}
          >
            {hasChildren && (
              <motion.div
                initial={false}
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-3 h-3" />
              </motion.div>
            )}
          </motion.button>

          {/* Folder Icon */}
          <motion.div
            className="text-gray-500"
            animate={hasChildren && isExpanded ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {hasChildren ? (
              isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />
            ) : (
              <div className="w-4 h-4 rounded bg-gradient-to-br from-gray-200 to-gray-300" />
            )}
          </motion.div>

          {/* Card Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {/* Tier Badge */}
              <span className={`px-1.5 py-0.5 rounded text-xs font-medium
                ${node.card.tier === 'L1' ? 'bg-green-100 text-green-700' :
                  node.card.tier === 'L2' ? 'bg-blue-100 text-blue-700' :
                  node.card.tier === 'L3' ? 'bg-purple-100 text-purple-700' :
                  'bg-gray-100 text-gray-700'}`}>
                {node.card.tier}
              </span>
              
              {/* Card Name */}
              <span className={`text-sm font-medium truncate ${
                isSelected ? 'text-blue-800' : 'text-gray-800 group-hover:text-gray-900'
              }`}>
                {node.name}
              </span>
            </div>
            
            {/* Reference Count */}
            {node.references.length > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-gray-500">
                  {node.references.length} reference{node.references.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Leverage Type */}
          <span className="text-xs text-gray-500 bg-gray-100/80 px-2 py-1 rounded-full">
            {node.card.leverage.slice(0, 4)}
          </span>
        </motion.div>

        {/* Children */}
        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              {node.children.map(child => renderTreeNode(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className={`bg-white/80 backdrop-blur-md border border-white/20 rounded-3xl shadow-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Card Tree</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 rounded bg-gray-100/60 hover:bg-gray-100/80 transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 rounded bg-gray-100/60 hover:bg-gray-100/80 transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white/60 border border-white/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowOnlyWithReferences(!showOnlyWithReferences)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              showOnlyWithReferences
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100/60 text-gray-600 border border-transparent hover:bg-gray-100/80'
            }`}
          >
            {showOnlyWithReferences ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            With References Only
          </button>
        </div>
      </div>

      {/* Tree View */}
      <div className="p-4 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {filteredTree.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-1"
            >
              {filteredTree.map(node => renderTreeNode(node))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-gray-500"
            >
              <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No cards match your current filters</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}