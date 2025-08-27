'use client'

import React from "react";
import { ReferenceChip } from "./ReferenceChip";
import { CardItem } from "@/lib/firebase";

interface TextWithReferencesProps {
  text: string;
  onReferenceClick?: (reference: string) => void;
  referenceCards?: Record<string, CardItem>;
  className?: string;
}

export function TextWithReferences({ 
  text, 
  onReferenceClick, 
  referenceCards = {},
  className = "" 
}: TextWithReferencesProps) {
  // Parse text and split by backtick references
  const parseText = (inputText: string) => {
    const parts = [];
    let currentIndex = 0;
    let key = 0;

    // Find all references in backticks
    const referenceRegex = /`([^`]+)`/g;
    let match;

    while ((match = referenceRegex.exec(inputText)) !== null) {
      // Add text before the reference
      if (match.index > currentIndex) {
        const beforeText = inputText.slice(currentIndex, match.index);
        parts.push(
          <span key={`text-${key++}`}>
            {beforeText}
          </span>
        );
      }

      // Add the reference chip
      const reference = match[1];
      const referencedCard = referenceCards[reference];
      
      parts.push(
        <ReferenceChip
          key={`ref-${key++}`}
          reference={reference}
          referencedCard={referencedCard}
          onChipClick={onReferenceClick}
          className="mx-1"
        />
      );

      currentIndex = match.index + match[0].length;
    }

    // Add remaining text after the last reference
    if (currentIndex < inputText.length) {
      parts.push(
        <span key={`text-${key++}`}>
          {inputText.slice(currentIndex)}
        </span>
      );
    }

    // If no references found, return original text
    if (parts.length === 0) {
      parts.push(<span key="text-only">{inputText}</span>);
    }

    return parts;
  };

  return (
    <span className={className}>
      {parseText(text)}
    </span>
  );
}