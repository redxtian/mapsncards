'use client'

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, ArrowRight } from "lucide-react";
import { CardItem } from "@/lib/firebase";

interface CardReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CardItem | null;
  onNavigateToCard?: (cardId: string) => void;
  referencingCards?: CardItem[]; // Cards that reference this card
}

export function CardReferenceModal({ isOpen, onClose, card, onNavigateToCard, referencingCards = [] }: CardReferenceModalProps) {
  if (!card) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative bg-white/95 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glass shine effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />
              
              {/* Header */}
              <div className="flex items-start justify-between p-6 border-b border-white/10">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${card.tier === 'L1' ? 'bg-green-100 text-green-700' :
                        card.tier === 'L2' ? 'bg-blue-100 text-blue-700' :
                        card.tier === 'L3' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'}`}>
                      {card.tier}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                      {card.leverage}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                      {card.intent}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{card.name}</h3>
                  <p className="text-gray-600 text-sm">{card.summary}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100/80 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {/* Direct/Inception Modes */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Deployment Modes</h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Direct</h5>
                      <ul className="space-y-1">
                        {card.modes.direct.map((mode, i) => (
                          <li key={i} className="text-sm text-gray-700 bg-gray-50/80 rounded-lg p-3">
                            "{mode}"
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Inception</h5>
                      <ul className="space-y-1">
                        {card.modes.inception.map((mode, i) => (
                          <li key={i} className="text-sm text-gray-700 bg-gray-50/80 rounded-lg p-3">
                            "{mode}"
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Steps */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Steps</h4>
                  <ol className="space-y-2">
                    {card.steps.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-sm text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Recovery */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Recovery Strategy</h4>
                  <p className="text-sm text-gray-700 bg-red-50/80 rounded-lg p-3">
                    {card.recovery}
                  </p>
                </div>

                {/* Referenced By Section */}
                {referencingCards && referencingCards.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Referenced By</h4>
                    <div className="space-y-2">
                      {referencingCards.map((refCard) => (
                        <motion.button
                          key={refCard.id}
                          onClick={() => onNavigateToCard?.(refCard.id)}
                          className="w-full text-left p-3 bg-white/60 hover:bg-white/80 backdrop-blur-sm border border-white/30 rounded-lg transition-all duration-200 group"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                                  ${refCard.tier === 'L1' ? 'bg-green-100 text-green-700' :
                                    refCard.tier === 'L2' ? 'bg-blue-100 text-blue-700' :
                                    refCard.tier === 'L3' ? 'bg-purple-100 text-purple-700' :
                                    'bg-gray-100 text-gray-700'}`}>
                                  {refCard.tier}
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                                  {refCard.leverage}
                                </span>
                              </div>
                              <h5 className="font-medium text-gray-900 text-sm group-hover:text-gray-800">
                                {refCard.name}
                              </h5>
                              <p className="text-xs text-gray-600 line-clamp-1">{refCard.summary}</p>
                            </div>
                            <div className="flex items-center gap-1 text-gray-400 group-hover:text-gray-600">
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Card ID: {card.id}</span>
                  <div className="flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    <span>Referenced Card</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}