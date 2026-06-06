import { restaurantsData } from "./data.js";

/**
 Global Bridge to HTML
 */
Object.assign(window, {
  logout: () => {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
  },
  updateQuantity,
  deleteGroup,
});

/**
 دالة جلب مفتاح التخزين الخاص بكل مستخدم بناءً على إيميله
 */
function getUserKey(prefix) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  return user ? `${prefix}_${user.email}` : prefix;
}

function getRandomRegisteredDriver() {
  const allDrivers = JSON.parse(localStorage.getItem("drivers")) || [];
  if (allDrivers.length > 0) {
    const randomIndex = Math.floor(Math.random() * allDrivers.length);
    return {
      name:
        allDrivers[randomIndex].username ||
        allDrivers[randomIndex].name ||
        "Hamed Ahmed",
      phone: allDrivers[randomIndex].phone || "0123456789",
    };
  }
  return { name: "Hamed Ahmed", phone: "0123456789" };
}

/**
 Initialize UI (Automatic Fill: Name, Image, Address)
 */
function initializeCheckoutUI() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const locationKey = getUserKey("userLocation");
  const savedLocation = JSON.parse(localStorage.getItem(locationKey));

  if (user) {
    const navName = document.getElementById("navUserName");
    const navImg = document.getElementById("navUserImg");
    const nameInput = document.getElementById("userName");

    if (navName) navName.textContent = user.username || user.name || "User";
    if (navImg && user.image) {
      navImg.src = user.image;
      navImg.style.display = "block";
    }
    if (nameInput) nameInput.value = user.username || user.name || "";

    if (user.defaultPayment) {
      const paymentSelect = document.getElementById("paymentMethod");
      if (paymentSelect) paymentSelect.value = user.defaultPayment;
    }
  }

  if (savedLocation && savedLocation.address) {
    const addressInput = document.getElementById("userAddress");
    if (addressInput) addressInput.value = savedLocation.address;
  }
}

function renderCheckout() {
  const cartKey = getUserKey("userCart");
  const currentCart = JSON.parse(localStorage.getItem(cartKey)) || [];
  const itemsContainer = document.getElementById("checkoutItems");
  const confirmBtn = document.querySelector(
    "#paymentForm button[type='submit']",
  );

  if (!itemsContainer) return;

  if (currentCart.length === 0) {
    itemsContainer.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="fas fa-shopping-basket fa-3x mb-3"></i>
                <p>Your cart is empty!</p>
                <a href="dashboard.html" class="btn btn-outline-warning btn-sm">Go Shopping</a>
            </div>`;
    document.getElementById("subtotal").textContent = `$0.00`;
    document.getElementById("totalPrice").textContent = `$0.00`;
    if (confirmBtn) confirmBtn.disabled = true;
    return;
  }

  const groupedCart = currentCart.reduce((acc, item) => {
    const existingItem = acc.find((i) => i.name === item.name);
    const itemPrice = parseFloat(item.price || 0);
    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.totalPrice += itemPrice;
    } else {
      acc.push({
        ...item,
        quantity: 1,
        totalPrice: itemPrice,
        unitPrice: itemPrice,
      });
    }
    return acc;
  }, []);

  let subtotal = 0;
  itemsContainer.innerHTML = groupedCart
    .map((item) => {
      subtotal += item.totalPrice;
      return `
            <div class="order-item d-flex justify-content-between align-items-center mb-3 p-3" 
                  style="border-bottom: 1px solid rgba(255,255,255,0.05)">
                <div class="d-flex align-items-center gap-3">
                    <div class="d-flex align-items-center gap-2" 
                          style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 2px 8px;">
                        <button class="btn btn-sm text-warning p-0 fw-bold" onclick="updateQuantity('${item.name}', -1)">-</button>
                        <span class="text-white fw-bold">${item.quantity}</span>
                        <button class="btn btn-sm text-warning p-0 fw-bold" onclick="updateQuantity('${item.name}', 1)">+</button>
                    </div>
                    <div>
                        <h6 class="mb-0 text-white fw-bold">${item.name}</h6>
                        <small class="text-muted">Unit: $${item.unitPrice.toFixed(2)}</small>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-3">
                    <span class="fw-bold text-warning">$${item.totalPrice.toFixed(2)}</span>
                    <button class="btn btn-sm" onclick="deleteGroup('${item.name}')" 
                            style="color:#ff4d4d; border:1px solid #ff4d4d; background:transparent; padding:2px 10px; border-radius:6px; font-weight:bold; font-size:11px;">
                        DELETE
                    </button>
                </div>
            </div>`;
    })
    .join("");

  const restaurantId = currentCart[0].restaurantId;
  const ownerShops = JSON.parse(localStorage.getItem("allShops")) || [];
  const allPossibleShops = [...ownerShops, ...restaurantsData];

  const restaurant = allPossibleShops.find(
    (r) => String(r.id) == String(restaurantId),
  );

  const deliveryFee = restaurant
    ? parseFloat(restaurant.deliveryFeeValue || 0)
    : 0;
  const minPrice = restaurant ? parseFloat(restaurant.minPrice) || 0 : 0;

  const isMinReached = subtotal >= minPrice;

  if (confirmBtn) {
    if (!isMinReached) {
      confirmBtn.disabled = true;
      confirmBtn.style.background = "#444";
      confirmBtn.style.cursor = "not-allowed";
      confirmBtn.innerHTML = `<i class="fas fa-exclamation-triangle me-2"></i> Min. Order $${minPrice} Required`;
    } else {
      confirmBtn.disabled = false;
      confirmBtn.style.background = "linear-gradient(90deg, #ff7b00, #ff9500)";
      confirmBtn.style.cursor = "pointer";
      confirmBtn.textContent = "CONFIRM ORDER";
    }
  }

  document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
  const deliveryLabel = document.getElementById("deliveryFeeDisplay");
  if (deliveryLabel)
    deliveryLabel.textContent =
      deliveryFee === 0 ? "FREE" : `$${deliveryFee.toFixed(2)}`;

  document.getElementById("totalPrice").textContent =
    `$${(subtotal + deliveryFee).toFixed(2)}`;
}

/**
 Controls (Quantity & Delete)
 */
function updateQuantity(itemName, change) {
  const cartKey = getUserKey("userCart");
  let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
  if (change === 1) {
    const item = cart.find((i) => i.name === itemName);
    if (item) cart.push({ ...item, id: Date.now() });
  } else {
    const index = cart.findIndex((i) => i.name === itemName);
    if (index > -1) cart.splice(index, 1);
  }
  localStorage.setItem(cartKey, JSON.stringify(cart));
  renderCheckout();
}

function deleteGroup(itemName) {
  const cartKey = getUserKey("userCart");
  let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
  const updatedCart = cart.filter((item) => item.name !== itemName);
  localStorage.setItem(cartKey, JSON.stringify(updatedCart));
  renderCheckout();
}

/**
 Confirm Order & Bind Driver
 */
document.getElementById("paymentForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const cartKey = getUserKey("userCart");
  const finalCartItems = JSON.parse(localStorage.getItem(cartKey)) || [];

  if (finalCartItems.length === 0) return;

  const ordersKey = getUserKey("orders");
  const orders = JSON.parse(localStorage.getItem(ordersKey)) || [];

  const assignedDriver = getRandomRegisteredDriver();

  const newOrder = {
    orderId: Date.now(),
    restaurantId: finalCartItems[0].restaurantId,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    items: finalCartItems.reduce((acc, item) => {
      const exist = acc.find((i) => i.name === item.name);
      const price = parseFloat(item.price || 0);
      if (exist) {
        exist.quantity++;
        exist.totalPrice += price;
      } else {
        acc.push({ ...item, quantity: 1, totalPrice: price });
      }
      return acc;
    }, []),
    total: document.getElementById("totalPrice").textContent,
    driverName: assignedDriver.name,
    driverPhone: assignedDriver.phone,
    status: "Preparing",
    isRated: false,
  };

  orders.push(newOrder);
  localStorage.setItem(ordersKey, JSON.stringify(orders));
  localStorage.removeItem(cartKey);

  Swal.fire({
    title: "Order Confirmed!",
    text: `Rider ${assignedDriver.name} is on the way!`,
    icon: "success",
    confirmButtonColor: "#ff7b00",
    background: "#23242a",
    color: "#fff",
  }).then(() => {
    window.location.href = "myOrder.html";
  });
});

function syncFavCount() {
  const favCountEl = document.getElementById("favCount");
  const favoritesKey = getUserKey("userFavorites");

  const favorites = JSON.parse(localStorage.getItem(favoritesKey)) || [];

  const ownerShops = JSON.parse(localStorage.getItem("allShops")) || [];
  const allPossibleShops = [...ownerShops, ...restaurantsData];

  const validFavorites = favorites.filter((favId) =>
    allPossibleShops.some((shop) => String(shop.id) === String(favId)),
  );

  if (favCountEl) {
    favCountEl.textContent = validFavorites.length;
    favCountEl.style.display = validFavorites.length > 0 ? "block" : "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initializeCheckoutUI();
  renderCheckout();
  syncFavCount();
});
