/**
 * Persistent Conversation Memory using IndexedDB for Mahi AI.
 * Keeps all conversation history and memories 100% local on the user's device.
 */

export interface SavedMessage {
  id?: number;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

const DB_NAME = 'MahiMemoryDB';
const MESSAGES_STORE = 'messages';
const META_STORE = 'meta';

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

export function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    // Calling indexedDB.open without a version parameter opens existing version
    // without VersionError, or creates version 1 if non-existent.
    const request = indexedDB.open(DB_NAME);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(MESSAGES_STORE)) {
        const store = db.createObjectStore(MESSAGES_STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = (e) => {
      dbPromise = null;
      console.warn('IndexedDB open error, will fallback to localStorage:', request.error);
      reject(request.error || e);
    };
  });

  return dbPromise;
}

/**
 * Save a single conversation message (User or Model) to IndexedDB.
 * Automatically caps total messages at 100 and condenses older messages into a summary.
 */
export async function saveMessage(role: 'user' | 'model', text: string): Promise<void> {
  const trimmedText = text.trim();
  if (!trimmedText) return;

  // 1. Mirror to localStorage first (guaranteed immediate persistence)
  try {
    const localHistory: SavedMessage[] = JSON.parse(localStorage.getItem('mahi_conversation_memory') || '[]');
    localHistory.push({ role, text: trimmedText, timestamp: Date.now() });
    if (localHistory.length > 100) localHistory.shift();
    localStorage.setItem('mahi_conversation_memory', JSON.stringify(localHistory));
  } catch (lsErr) {
    console.warn('localStorage memory backup failed:', lsErr);
  }

  // 2. Save to IndexedDB
  try {
    const db = await getDB();

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(MESSAGES_STORE, 'readwrite');
      const store = tx.objectStore(MESSAGES_STORE);
      const request = store.add({
        role,
        text: trimmedText,
        timestamp: Date.now()
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Trim overflow messages in IndexedDB if > 100
    const allMessages = await getRecentMessages(500);
    if (allMessages.length > 100) {
      const overflowCount = allMessages.length - 100;
      const toSummarize = allMessages.slice(0, overflowCount);

      const currentSummary = await getSummary();
      const updatedSummary = buildCondensedSummary(toSummarize, currentSummary);
      await saveSummary(updatedSummary);

      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(MESSAGES_STORE, 'readwrite');
        const store = tx.objectStore(MESSAGES_STORE);
        toSummarize.forEach(msg => {
          if (msg.id !== undefined) {
            store.delete(msg.id);
          }
        });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }
  } catch (err) {
    console.warn('Failed to save message to IndexedDB:', err);
  }
}

/**
 * Retrieves up to `limit` recent messages sorted by timestamp ascending.
 */
export async function getRecentMessages(limit = 100): Promise<SavedMessage[]> {
  try {
    const db = await getDB();
    const dbMsgs: SavedMessage[] = await new Promise((resolve, reject) => {
      const tx = db.transaction(MESSAGES_STORE, 'readonly');
      const store = tx.objectStore(MESSAGES_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const messages: SavedMessage[] = request.result || [];
        messages.sort((a, b) => a.timestamp - b.timestamp);
        resolve(messages);
      };

      request.onerror = () => reject(request.error);
    });

    if (dbMsgs && dbMsgs.length > 0) {
      return dbMsgs.slice(-limit);
    }
  } catch (err) {
    console.warn('Falling back to localStorage for messages:', err);
  }

  try {
    const fallback: SavedMessage[] = JSON.parse(localStorage.getItem('mahi_conversation_memory') || '[]');
    return fallback.slice(-limit);
  } catch (lsErr) {
    return [];
  }
}

/**
 * Retrieves the stored conversation summary.
 */
export async function getSummary(): Promise<string> {
  try {
    const db = await getDB();
    return await new Promise((resolve) => {
      const tx = db.transaction(META_STORE, 'readonly');
      const store = tx.objectStore(META_STORE);
      const request = store.get('summary');

      request.onsuccess = () => {
        resolve(request.result?.value || localStorage.getItem('mahi_conversation_summary') || '');
      };

      request.onerror = () => resolve(localStorage.getItem('mahi_conversation_summary') || '');
    });
  } catch (err) {
    return localStorage.getItem('mahi_conversation_summary') || '';
  }
}

/**
 * Saves or updates the conversation summary string in meta store.
 */
export async function saveSummary(summaryText: string): Promise<void> {
  try {
    try {
      localStorage.setItem('mahi_conversation_summary', summaryText);
    } catch (e) {
      /* ignore */
    }
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(META_STORE, 'readwrite');
      const store = tx.objectStore(META_STORE);
      const request = store.put({ key: 'summary', value: summaryText, updatedAt: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to save summary to IndexedDB:', err);
  }
}

/**
 * Clears all conversation messages and summary from IndexedDB and localStorage.
 */
export async function clearAllMemory(): Promise<void> {
  try {
    localStorage.removeItem('mahi_conversation_memory');
    localStorage.removeItem('mahi_conversation_summary');
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([MESSAGES_STORE, META_STORE], 'readwrite');
      tx.objectStore(MESSAGES_STORE).clear();
      tx.objectStore(META_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    console.log('IndexedDB & localStorage conversation memory cleared successfully.');
  } catch (err) {
    console.error('Failed to clear memory:', err);
  }
}

/**
 * Generates formatted conversation context combining summary and recent messages.
 * This is injected into Gemini Live session prompt so Mahi remembers context across sessions.
 */
export async function getFormattedMemoryContext(): Promise<{
  summary: string;
  recentMessages: SavedMessage[];
  formattedContext: string;
}> {
  const [summary, recentMessages] = await Promise.all([
    getSummary(),
    getRecentMessages(100)
  ]);

  let formattedContext = '';

  if (summary.trim()) {
    formattedContext += `[ARCHIVED CONVERSATION SUMMARY & USER MEMORIES]:\n${summary.trim()}\n\n`;
  }

  if (recentMessages.length > 0) {
    formattedContext += `[RECENT CONVERSATION HISTORY (Last ${recentMessages.length} Messages)]:\n`;
    recentMessages.forEach((msg) => {
      const speaker = msg.role === 'user' ? 'User' : 'Mahi';
      formattedContext += `${speaker}: ${msg.text}\n`;
    });
  }

  return { summary, recentMessages, formattedContext };
}

/**
 * Condenses overflow messages into a readable summary.
 */
function buildCondensedSummary(messages: SavedMessage[], existingSummary: string): string {
  const dateStr = new Date().toLocaleDateString();
  const newLines = messages.map(m => `${m.role === 'user' ? 'User' : 'Mahi'}: ${m.text}`);
  const chunk = `[Summary of past session (${dateStr})]:\n` + newLines.join('\n');

  let full = existingSummary ? `${existingSummary}\n\n${chunk}` : chunk;
  // Keep summary capped around 3000 characters to prevent huge prompts
  if (full.length > 3000) {
    full = full.slice(full.length - 3000);
  }
  return full;
}
