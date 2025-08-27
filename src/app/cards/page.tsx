import FaceCardDisplay from '@/components/cards/FaceCardDisplay'
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function CardsPage() {
  return (
    <ProtectedRoute>
      <FaceCardDisplay />
    </ProtectedRoute>
  )
}

export const metadata = {
  title: 'Cards Library | Maps & Cards',
  description: 'Browse and use your negotiation cards',
}

