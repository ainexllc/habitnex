import { db } from './firebase';
import app from './firebase';

// Re-export the firestore instance for compatibility
export { db };

// Export any other Firebase services that might be needed
export { auth } from './firebase';
export default app;