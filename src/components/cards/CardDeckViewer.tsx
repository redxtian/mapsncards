import React from 'react';
import { CardDeckPayload } from '@/types';
import { SimplifiedCardDeckViewer } from './SimplifiedCardDeckViewer';

type Props = {
  deck: CardDeckPayload;
};

export function CardDeckViewer({ deck }: Props) {
  return <SimplifiedCardDeckViewer deck={deck} />;
}

export default CardDeckViewer;

