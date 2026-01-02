// src/utils/indexedDBHelper.js

// Função para abrir o banco de dados IndexedDB
export const openDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('CartDB', 1);
  
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('cart')) {
          db.createObjectStore('cart', { keyPath: 'id' });
        }
      };
  
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };
  
  // Função para adicionar um item ao carrinho
  export const addToCartDB = async (item) => {
    const db = await openDB();
    const transaction = db.transaction('cart', 'readwrite');
    const store = transaction.objectStore('cart');
    store.put(item);
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  };
  
  // Função para remover um item do carrinho
  export const removeFromCartDB = async (itemId) => {
    const db = await openDB();
    const transaction = db.transaction('cart', 'readwrite');
    const store = transaction.objectStore('cart');
    store.delete(itemId);
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  };
  
  // Função para obter todos os itens do carrinho
  export const getCartDB = async () => {
    const db = await openDB();
    const transaction = db.transaction('cart', 'readonly');
    const store = transaction.objectStore('cart');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };
  
  // Função para limpar todos os itens do carrinho
  export const clearCartDB = async () => {
    const db = await openDB();
    const transaction = db.transaction('cart', 'readwrite');
    const store = transaction.objectStore('cart');
    store.clear();
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  };