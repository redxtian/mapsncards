const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

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

// Simple test
async function testFirestore() {
  console.log('🔍 Testing basic Firestore connection...');
  
  try {
    // Try to add a simple document
    const testData = {
      test: true,
      message: "Hello Firebase!",
      timestamp: new Date()
    };
    
    const docRef = await addDoc(collection(db, 'test'), testData);
    console.log('✅ Success! Document written with ID: ', docRef.id);
    
  } catch (error) {
    console.error('❌ Error:', error.code, error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

testFirestore();