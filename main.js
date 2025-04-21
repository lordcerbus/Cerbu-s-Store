// --- Banco de Produtos ---
const products = {
  smartphones: [
    { img: 'assets/img/smartphone1.jpg', price: '2300', name: 'Smartphone A' },
    { img: 'assets/img/smartphone2.jpg', price: '2500', name: 'Smartphone B' },
    { img: 'assets/img/smartphone3.jpg', price: '2000', name: 'Smartphone C' },
    { img: 'assets/img/smartphone4.jpg', price: '2200', name: 'Smartphone D' },
    { img: 'assets/img/smartphone5.jpg', price: '2400', name: 'Smartphone E' },
    { img: 'assets/img/smartphone6.jpg', price: '2100', name: 'Smartphone F' },
    { img: 'assets/img/smartphone7.jpg', price: '2600', name: 'Smartphone G' },
    { img: 'assets/img/smartphone8.jpg', price: '2700', name: 'Smartphone H' },
  ],
  relogiosdigitais: Array(11).fill({ img: 'assets/img/relogio.jpg', price: '2300', name: 'Relogio' }),
  headset: Array(10).fill({ img: 'assets/img/headset.jpg', price: '2300', name: 'Headset' }),
  mouses: Array(6).fill({ img: 'assets/img/mouse.jpg', price: '2300', name: 'Mouse' }),
  teclados: Array(5).fill({ img: 'assets/img/teclado.jpg', price: '2300', name: 'Teclado' })
};

// --- Controle de Usuário ---
let users = JSON.parse(localStorage.getItem('users')) || {};
let currentUser = null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentCategory = 'smartphones';
let currentIndex = 0;
let autoSlide;

// --- Troca de telas ---
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

function handleRegister() {
  const user = document.getElementById('register-username').value;
  const pass = document.getElementById('register-password').value;
  if (user && pass && !users[user]) {
    users[user] = pass;
    localStorage.setItem('users', JSON.stringify(users));
    alert("Usuário cadastrado com sucesso!");
    showScreen('login-screen');
  } else {
    alert("Preencha os dados corretamente ou usuário já existe.");
  }
}

function handleLogin() {
  const user = document.getElementById('login-username').value;
  const pass = document.getElementById('login-password').value;
  if (users[user] === pass) {
    currentUser = user;
    showScreen('store-screen');
    renderProducts();
    renderCart();
  } else {
    alert("Usuário ou senha inválido.");
  }
}

// --- Produtos ---
function renderProducts() {
  const store = document.getElementById('store');
  store.innerHTML = '';

  const visibleProducts = getVisibleProducts();
  visibleProducts.forEach((prod, index) => {
    const div = document.createElement('div');
    div.classList.add('product');
    div.innerHTML = `
      <img src="${prod.img}" alt="${prod.name}">
      <h3>${prod.name}</h3>
      <p>R$ ${prod.price}</p>
      <button onclick="addToCart('${prod.name}', ${prod.price}, '${prod.img}')">Adicionar</button>
    `;
    store.appendChild(div);
    setTimeout(() => div.classList.add('show'), 5 * index);
  });
}

function getVisibleProducts() {
  const categoryArray = products[currentCategory];
  const total = categoryArray.length;
  const indexes = [];
  for (let i = 0; i < 5; i++) {
    indexes.push((currentIndex + i) % total);
  }
  return indexes.map(i => categoryArray[i]);
}

// --- Controle de Categorias ---
document.querySelectorAll('.categories li').forEach((li) => {
  li.addEventListener('click', (e) => {
    const selected = e.target.getAttribute('data-category');
    if (products[selected]) {
      currentCategory = selected;
      currentIndex = 0;
      renderProducts();
      resetAutoSlide();
    }
  });
});

function next() {
  const total = products[currentCategory].length;
  currentIndex = (currentIndex + 1) % total;
  renderProducts();
}

function prev() {
  const total = products[currentCategory].length;
  currentIndex = (currentIndex - 1 + total) % total;
  renderProducts();
}

// --- Carrinho ---
function toggleCart() {
  const cartEl = document.getElementById('cart');
  if (cartEl.classList.contains('show')) {
    cartEl.classList.remove('show');
    cartEl.classList.add('hide');
    setTimeout(() => {
      cartEl.classList.add('hidden');
      cartEl.classList.remove('hide');
    }, 500);
  } else {
    cartEl.classList.remove('hidden');
    cartEl.classList.add('show');
  }
}

function addToCart(name, price, img) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name, price, img, quantity: 1 });
  }
  saveCart();
  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

function renderCart() {
  const list = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  list.innerHTML = '';
  let total = 0;

  cart.forEach((item, idx) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.name}">
        <strong>${item.name}</strong> - R$ ${item.price}
      </div>
      <div class="quantity">
        <button onclick="updateCart(${idx}, 'decrease')">-</button>
        <input type="number" min="1" value="${item.quantity}" onchange="updateCart(${idx}, this.value)">
        <button onclick="updateCart(${idx}, 'increase')">+</button>
      </div>
      <button onclick="removeFromCart(${idx})">X</button>
    `;
    list.appendChild(li);
  });

  totalEl.innerText = `R$ ${total.toFixed(2)}`;
}

function updateCart(index, action) {
  if (typeof action === 'string') {
    if (action === 'increase') {
      cart[index].quantity += 1;
    } else if (action === 'decrease' && cart[index].quantity > 1) {
      cart[index].quantity -= 1;
    }
  } else {
    const value = parseInt(action);
    if (!isNaN(value) && value >= 1) {
      cart[index].quantity = value;
    }
  }
  saveCart();
  renderCart();
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function checkout() {
  if (cart.length === 0) return alert("Seu carrinho está vazio!");
  alert("Compra finalizada com sucesso!");
  cart = [];
  saveCart();
  renderCart();
  toggleCart();
}

// --- Navegação automática ---
document.getElementById('nextBtn').addEventListener('click', () => {
  next();
  resetAutoSlide();
});

document.getElementById('prevBtn').addEventListener('click', () => {
  prev();
  resetAutoSlide();
});

function startAutoSlide() {
  autoSlide = setInterval(next, 8000);
}

function resetAutoSlide() {
  clearInterval(autoSlide);
  startAutoSlide();
}

startAutoSlide();
