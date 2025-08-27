import JsonCardInput from '@/components/cards/JsonCardInput'
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function CardInputPage() {
  return (
    <ProtectedRoute>
      <JsonCardInput />
    </ProtectedRoute>
  )
}

export const metadata = {
  title: 'Card JSON Input | Maps & Cards',
  description: 'Input and validate card JSON data',
}