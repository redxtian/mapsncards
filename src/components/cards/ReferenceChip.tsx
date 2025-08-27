'use client'

import React from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { CardItem } from "@/lib/firebase";

interface ReferenceChipProps {
  reference: string;
  onChipClick?: (reference: string) => void;
  referencedCard?: CardItem | null;
  className?: string;
}

export function ReferenceChip({ 
  reference, 
  onChipClick, 
  referencedCard, 
  className = "" 
}: ReferenceChipProps) {
  const handleClick = () => {
    if (onChipClick) {
      onChipClick(reference);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`
        inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
        bg-blue-100 text-blue-800 hover:bg-blue-200 
        border border-blue-200 hover:border-blue-300
        transition-colors duration-200
        cursor-pointer
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={referencedCard?.name || `Reference: ${reference}`}
    >
      <span>{referencedCard?.name || reference}</span>
      <ExternalLink className="w-3 h-3" />
    </motion.button>
  );
}