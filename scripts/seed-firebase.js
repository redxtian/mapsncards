const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDocs } = require('firebase/firestore');

// Firebase configuration (same as in your app)
const firebaseConfig = {
  apiKey: "AIzaSyBZBAXsVId212P0fBYkXt2vZG-2CiSoVDk",
  authDomain: "mapsncars.firebaseapp.com",
  projectId: "mapsncars",
  storageBucket: "mapsncars.firebasestorage.app",
  messagingSenderId: "459046940998",
  appId: "1:459046940998:web:4e562dd724187a0897f547",
  measurementId: "G-GW8F6PX8G3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample card data
const sampleCards = [
  {
    id: "market_research_leverage",
    name: "Market Research Leverage",
    summary: "Use market salary data to support your request",
    tier: "L1",
    leverage: "Informational",
    intent: "Extract",
    modes: {
      direct: [
        "Based on my research, professionals with my experience earn 15-20% more in this market",
        "Industry data shows my current compensation is below market rate",
        "I've compiled salary benchmarks that demonstrate the value alignment opportunity"
      ],
      inception: [
        "I'm curious about how our compensation philosophy aligns with market trends I've been seeing",
        "What's your perspective on the current market rates for this role?",
        "I'd love to understand how we stay competitive with industry standards"
      ]
    },
    steps: [
      "Gather comprehensive salary data from multiple sources (Glassdoor, PayScale, industry reports)",
      "Present data professionally with specific percentiles and ranges",
      "Frame as market alignment rather than personal need"
    ],
    recovery: "If they question the data, offer to share sources and suggest we both do additional research to ensure accuracy",
    telemetry_keys: ["salary_negotiation", "market_research", "informational_leverage"],
    version: "2.0.0",
    status: "stable",
    author: "system"
  },
  {
    id: "performance_documentation",
    name: "Performance Documentation",
    summary: "Document achievements and contributions for leverage",
    tier: "L1",
    leverage: "Informational", 
    intent: "Extract",
    modes: {
      direct: [
        "Over the past year, I've exceeded targets by 25% and delivered three major projects ahead of schedule",
        "My contributions have directly resulted in $X revenue increase and improved team efficiency",
        "Here's a comprehensive overview of my impact and achievements since my last review"
      ],
      inception: [
        "I've been reflecting on some of the key wins we've had as a team this year",
        "I'd love to get your perspective on which of my contributions have been most valuable",
        "What metrics do you think best capture the impact I've been making?"
      ]
    },
    steps: [
      "Document all major achievements, projects, and quantifiable results",
      "Organize by impact: revenue generated, costs saved, efficiency improved",
      "Present as a comprehensive review of value delivered"
    ],
    recovery: "If impact is questioned, offer to provide additional detail and metrics, and suggest establishing clearer success measurement going forward",
    telemetry_keys: ["performance", "achievements", "documentation"],
    version: "2.0.0",
    status: "stable",
    author: "system"
  },
  {
    id: "timing_strategy",
    name: "Strategic Timing",
    summary: "Choose optimal timing for salary discussions",
    tier: "L1",
    leverage: "Relational",
    intent: "Increase",
    modes: {
      direct: [
        "Given the successful completion of the Q3 project, I'd like to discuss my compensation",
        "With the new budget cycle approaching, I wanted to discuss my role and compensation",
        "Following my recent promotion and expanded responsibilities, let's review my compensation"
      ],
      inception: [
        "I've been thinking about the best time to have career development conversations",
        "What's your preferred timing for discussing team member growth and advancement?",
        "How do you typically approach compensation conversations with high performers?"
      ]
    },
    steps: [
      "Identify optimal timing: after major successes, during budget planning, at performance reviews",
      "Prepare context for why now is the right time",
      "Frame timing as strategic rather than desperate"
    ],
    recovery: "If timing seems off, acknowledge and ask when would be better, showing respect for their schedule and priorities",
    telemetry_keys: ["timing", "strategic", "relationship"],
    version: "2.0.0",
    status: "stable",
    author: "system"
  }
];

async function seedDatabase() {
  console.log('🌱 Starting Firebase seeding process...');
  
  try {
    // Check if cards already exist
    const cardsRef = collection(db, 'cards');
    const existingCards = await getDocs(cardsRef);
    
    if (existingCards.docs.length > 0) {
      console.log(`⚠️  Found ${existingCards.docs.length} existing cards in database`);
      console.log('Continuing with seed (will overwrite duplicates)...');
    }
    
    // Add sample cards
    for (const card of sampleCards) {
      const cardWithTimestamps = {
        ...card,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const cardRef = doc(db, 'cards', card.id);
      await setDoc(cardRef, cardWithTimestamps);
      console.log(`✅ Added card: ${card.name}`);
    }
    
    console.log(`\n🎉 Successfully seeded ${sampleCards.length} cards to Firebase!`);
    console.log('You can now view them at: http://localhost:3000/cards');
    
    // Verify the seeding
    const finalCount = await getDocs(cardsRef);
    console.log(`📊 Total cards in database: ${finalCount.docs.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase();