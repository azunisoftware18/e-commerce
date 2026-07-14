// utils/cartSession.js

const CART_SESSION_KEY = 'cart_session_id';

// Generate unique session ID
const generateSessionId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `guest_${timestamp}_${randomStr}`;
};

// Get or create session ID
const getSessionId = () => {
  let sessionId = localStorage.getItem(CART_SESSION_KEY);
  
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(CART_SESSION_KEY, sessionId);
  }
  
  return sessionId;
};

// Remove session ID after login
const clearSession = () => {
  localStorage.removeItem(CART_SESSION_KEY);
};

// API calls with session
const addToCart = async (productId, quantity = 1) => {
  const sessionId = getSessionId();
  
  const response = await fetch('/api/cart/add-to-cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ productId, quantity, sessionId })
  });
  
  return response.json();
};

const getCart = async () => {
  const sessionId = getSessionId();
  
  const response = await fetch(`/api/cart/get-cart?sessionId=${sessionId}`, {
    credentials: 'include'
  });
  
  return response.json();
};

const removeFromCart = async (productId) => {
  const sessionId = getSessionId();
  
  const response = await fetch(`/api/cart/remove-cart-item/${productId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ sessionId })
  });
  
  return response.json();
};

const mergeCartAfterLogin = async () => {
  const sessionId = localStorage.getItem(CART_SESSION_KEY);
  
  if (!sessionId) return;
  
  await fetch('/api/cart/merge-cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ sessionId })
  });
  
  clearSession();
};

// Export all functions
export {
  getSessionId,
  clearSession,
  addToCart,
  getCart,
  removeFromCart,
  mergeCartAfterLogin
};