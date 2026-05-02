import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Connectivity check
async function testConnection() {
  try {
    // Try to get a doc to verify connection. Permissions are check after connection.
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection successful.");
  } catch (error: any) {
    // If we get a permission error, the connection is actually working!
    if (error.code === 'permission-denied') {
      console.log("Firebase connection verified (permission denied as expected).");
      return;
    }
    
    if (error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('Could not reach Cloud Firestore backend'))) {
      console.warn("Firestore connectivity issue detected. The app will continue in offline mode.");
    } else {
      // Avoid circular structure in logging by extracting message
      console.error("Firebase connection test failed:", error?.message || error);
    }
  }
}

testConnection();
