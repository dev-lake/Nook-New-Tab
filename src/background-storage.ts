const DATABASE_NAME = 'nook-backgrounds';
const DATABASE_VERSION = 1;
const STORE_NAME = 'images';
const CUSTOM_BACKGROUND_KEY = 'custom';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open background storage'));
  });
}

export async function loadCustomBackground(): Promise<Blob | null> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).get(CUSTOM_BACKGROUND_KEY);
    request.onsuccess = () => resolve(request.result instanceof Blob ? request.result : null);
    request.onerror = () => reject(request.error ?? new Error('Could not load background'));
    transaction.oncomplete = () => database.close();
  });
}

export async function saveCustomBackground(image: Blob): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(image, CUSTOM_BACKGROUND_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Could not save background'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Could not save background'));
  });
  database.close();
}

export async function clearCustomBackground(): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(CUSTOM_BACKGROUND_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Could not remove background'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Could not remove background'));
  });
  database.close();
}
