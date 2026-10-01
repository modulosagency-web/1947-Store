/* ═══════════════════════════════════════════════════════
   1947 Clothing Store — Main JS
   Cart + WhatsApp Order Logic
   Language: English Only
═══════════════════════════════════════════════════════ */

// ─── CONFIG ───
function getWhatsAppNumber() {
  if (typeof window.WHATSAPP_NUMBER !== 'undefined' && window.WHATSAPP_NUMBER) {
    return window.WHATSAPP_NUMBER;
  }
  if (typeof WHATSAPP_NUMBER !== 'undefined' && WHATSAPP_NUMBER) {
    return WHATSAPP_NUMBER;
  }
  return "918590988090";
}

// ─── GET ALL PRODUCTS ───
function getAllProducts() {
  if (typeof window.PRODUCTS_DATA !== 'undefined' && Array.isArray(window.PRODUCTS_DATA)) {
    return window.PRODUCTS_DATA;
  }
  if (typeof window.products !== 'undefined' && Array.isArray(window.products)) {
    return window.products;
  }
  if (typeof products !== 'undefined' && Array.isArray(products)) {
    return products;
  }
  return [];
}

// ─── CART ───
let cart = JSON.parse(localStorage.getItem('1947_cart') || '[]');

function saveCart() {
  localStorage.setItem('1947_cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const el = document.getElementById('cartCount');
  if (el) {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    el.textContent = count;
  }
}

function addToCart(id, qty = 1) {
  const allProducts = getAllProducts();
  const product = allProducts.find(p => p.id === id);
  if (!product) {
    alert('Product not found');
    return;
  }

  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || (product.images && product.images[0]) || '',
      qty: qty
    });
  }
  saveCart();
  renderCart();
  openCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
  } else {
    saveCart();
    renderCart();
  }
}

function renderCart() {
  const box = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');

  if (!box) return;

  if (cart.length === 0) {
    box.innerHTML = `
      <div class="cart-empty">
        <i class="fa-solid fa-bag-shopping"></i>
        <p>Your cart is empty</p>
      </div>`;
    if (totalEl) totalEl.textContent = '₹0';
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  if (checkoutBtn) checkoutBtn.disabled = false;

  box.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <div class="cart-item-price">₹${item.price}</div>
        <div class="qty-control">
          <button onclick="changeQty(${item.id},-1)">−</button>
          <span>${item.qty}</span>
          <button onclick="changeQty(${item.id},1)">+</button>
        </div>
      </div>
      <button class="cart-remove" onclick="removeFromCart(${item.id})">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  `).join('');

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  if (totalEl) totalEl.textContent = '₹' + total;
}

// ─── CART DRAWER ───
function openCart() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (drawer) drawer.classList.add('open');
  if (overlay) overlay.classList.add('open');
}

function closeCart() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
}

// ═══════════════════════════════════════════════════════
// WHATSAPP ORDER — SINGLE PRODUCT
// ═══════════════════════════════════════════════════════
function orderOnWhatsApp(id, qty = 1) {
  const allProducts = getAllProducts();
  const product = allProducts.find(p => p.id === id);

  if (!product) {
    alert('Product not found. Please refresh the page.');
    return;
  }

  // Product page direct link
  const baseUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
  const productLink = `${baseUrl}product.html?id=${product.id}`;

  // WhatsApp message
  const message =
`New Order - 1947 Clothing Store

Product: ${product.name}
Price: Rs. ${product.price}
Quantity: ${qty}
Total: Rs. ${product.price * qty}

Description:
${product.description || 'N/A'}

Product Link:
${productLink}

Please confirm my order. Thank you!`;

  const waNumber = getWhatsAppNumber();
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

  window.open(waUrl, '_blank');
}

// ═══════════════════════════════════════════════════════
// WHATSAPP ORDER — FULL CART (Checkout)
// ═══════════════════════════════════════════════════════
function checkoutWhatsApp() {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  const baseUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');

  let message = `New Order - 1947 Clothing Store\n\n`;
  let total = 0;

  cart.forEach((item, index) => {
    const productLink = `${baseUrl}product.html?id=${item.id}`;
    message += `${index + 1}. ${item.name}\n`;
    message += `   Qty: ${item.qty} x Rs. ${item.price} = Rs. ${item.qty * item.price}\n`;
    message += `   Link: ${productLink}\n\n`;
    total += item.qty * item.price;
  });

  message += `--------------------------------\n`;
  message += `Grand Total: Rs. ${total}\n`;
  message += `--------------------------------\n\n`;
  message += `Please confirm my order. Thank you!`;

  const waNumber = getWhatsAppNumber();
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

  window.open(waUrl, '_blank');
}

// ═══════════════════════════════════════════════════════
// WHATSAPP DIRECT MESSAGE (Contact Page)
// ═══════════════════════════════════════════════════════
function whatsappMessage(text) {
  const waNumber = getWhatsAppNumber();
  const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  renderCart();
});

window.addEventListener('load', () => {
  updateCartCount();
  renderCart();
});
