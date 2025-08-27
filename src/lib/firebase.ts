import { initializeApp } from 'firebase/app'
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore'

// Firebase configuration for mapsncars project
const firebaseConfig = {
  apiKey: "AIzaSyBZBAXsVId212P0fBYkXt2vZG-2CiSoVDk",
  authDomain: "mapsncars.firebaseapp.com",
  projectId: "mapsncars",
  storageBucket: "mapsncars.firebasestorage.app",
  messagingSenderId: "459046940998",
  appId: "1:459046940998:web:4e562dd724187a0897f547",
  measurementId: "G-GW8F6PX8G3"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// Types matching your FaceCardUI CardItem structure
export type CardItem = {
  id: string;
  name: string;
  summary: string;
  tier: "L1" | "L2" | "L3" | "L4" | "L5";
  leverage: "Informational" | "Relational" | "Resource" | "Urgency" | "Narrative" | "Authority";
  intent: "Extract" | "Increase";
  modes: { direct: string[]; inception: string[] };
  steps: [string, string, string];
  recovery: string;
  map_adaptations?: { map: "Chaotic" | "Stable" | "Adversarial" | "Cooperative"; tip: string }[];
  telemetry_keys: string[];
  version: string;
  status: "draft" | "beta" | "stable" | "deprecated";
  author?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Database operations
export const cardOperations = {
  // Get all cards
  async getAll() {
    const cardsRef = collection(db, 'cards')
    const q = query(cardsRef, orderBy('created_at', 'desc'))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      created_at: doc.data().created_at?.toDate(),
      updated_at: doc.data().updated_at?.toDate(),
    })) as CardItem[]
  },

  // Get cards by filter
  async getFiltered(filters: {
    leverage?: CardItem['leverage'] | 'All';
    intent?: CardItem['intent'] | 'All';
    search?: string;
  }) {
    const cardsRef = collection(db, 'cards')
    let q = query(cardsRef, orderBy('created_at', 'desc'))
    
    if (filters.leverage && filters.leverage !== 'All') {
      q = query(cardsRef, where('leverage', '==', filters.leverage), orderBy('created_at', 'desc'))
    }
    
    if (filters.intent && filters.intent !== 'All' && filters.leverage && filters.leverage !== 'All') {
      q = query(cardsRef, where('leverage', '==', filters.leverage), where('intent', '==', filters.intent), orderBy('created_at', 'desc'))
    } else if (filters.intent && filters.intent !== 'All') {
      q = query(cardsRef, where('intent', '==', filters.intent), orderBy('created_at', 'desc'))
    }
    
    const snapshot = await getDocs(q)
    let results = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      created_at: doc.data().created_at?.toDate(),
      updated_at: doc.data().updated_at?.toDate(),
    })) as CardItem[]
    
    // Client-side search filtering (since Firestore doesn't have full-text search)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      results = results.filter(card => 
        card.name.toLowerCase().includes(searchTerm) ||
        card.summary.toLowerCase().includes(searchTerm) ||
        card.recovery.toLowerCase().includes(searchTerm) ||
        card.modes.direct.some(mode => mode.toLowerCase().includes(searchTerm)) ||
        card.modes.inception.some(mode => mode.toLowerCase().includes(searchTerm)) ||
        card.steps.some(step => step.toLowerCase().includes(searchTerm))
      )
    }
    
    return results
  },

  // Insert new card
  async insert(card: Omit<CardItem, 'created_at' | 'updated_at'>) {
    const now = new Date()
    const cardWithTimestamps = {
      ...card,
      created_at: now,
      updated_at: now
    }
    
    const cardRef = doc(db, 'cards', card.id)
    await setDoc(cardRef, cardWithTimestamps)
    
    return { ...cardWithTimestamps } as CardItem
  },

  // Update existing card
  async update(id: string, updates: Partial<CardItem>) {
    const cardRef = doc(db, 'cards', id)
    const updateData = {
      ...updates,
      updated_at: new Date()
    }
    
    await updateDoc(cardRef, updateData)
    
    const updatedDoc = await getDoc(cardRef)
    return {
      ...updatedDoc.data(),
      id: updatedDoc.id,
      created_at: updatedDoc.data()?.created_at?.toDate(),
      updated_at: updatedDoc.data()?.updated_at?.toDate(),
    } as CardItem
  },

  // Delete card
  async delete(id: string) {
    const cardRef = doc(db, 'cards', id)
    await deleteDoc(cardRef)
  },

  // Get card by ID
  async getById(id: string) {
    const cardRef = doc(db, 'cards', id)
    const cardDoc = await getDoc(cardRef)
    
    if (cardDoc.exists()) {
      return {
        ...cardDoc.data(),
        id: cardDoc.id,
        created_at: cardDoc.data()?.created_at?.toDate(),
        updated_at: cardDoc.data()?.updated_at?.toDate(),
      } as CardItem
    }
    
    return null
  },

  // Get multiple cards by IDs
  async getByIds(ids: string[]) {
    const cards: CardItem[] = []
    
    for (const id of ids) {
      const card = await this.getById(id)
      if (card) {
        cards.push(card)
      }
    }
    
    return cards
  },

  // Real-time listener for cards
  onCardsChange(callback: (cards: CardItem[]) => void) {
    const cardsRef = collection(db, 'cards')
    const q = query(cardsRef, orderBy('created_at', 'desc'))
    
    return onSnapshot(q, (snapshot) => {
      const cards = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        created_at: doc.data().created_at?.toDate(),
        updated_at: doc.data().updated_at?.toDate(),
      })) as CardItem[]
      
      callback(cards)
    })
  }
}

export default app