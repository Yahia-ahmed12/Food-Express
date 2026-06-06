import { restaurantsData } from "./data.js";

function getOrdersKey() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  return user ? `orders_${user.email}` : "userOrders";
}

function getCartKey() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  return user ? `userCart_${user.email}` : "userCart";
}

function simulateDeliveryProgress() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) return;

  const ordersKey = getOrdersKey();
  let orders = JSON.parse(localStorage.getItem(ordersKey)) || [];
  let changed = false;
  const now = Date.now();

  orders.forEach((order) => {
    const diffInSeconds = (now - order.orderId) / 1000;

    if (diffInSeconds < 300) {
      let statusUpdated = false;

      if (diffInSeconds > 15 && order.status === "Preparing") {
        order.status = "On the Way";
        statusUpdated = true;
        changed = true;
      } else if (diffInSeconds > 60 && order.status === "On the Way") {
        order.status = "Delivered";
        statusUpdated = true;
        changed = true;
      }

      if (statusUpdated && user.notifications === true) {
        showOrderToast(order);
      }
    } else if (order.status !== "Delivered") {
      order.status = "Delivered";
      changed = true;
    }
  });

  if (changed) {
    localStorage.setItem(ordersKey, JSON.stringify(orders));
    renderOrders();
  }
}

/**
 * دالة إظهار تنبيهات تحديث الحالة
 */
function showOrderToast(order) {
  if (typeof Swal !== "undefined") {
    Swal.fire({
      title: "Order Update!",
      text: `Your order #${order.orderId.toString().slice(-6)} is now ${order.status}`,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      icon: "info",
      background: "#23242a",
      color: "#fff",
      iconColor: "#ff7b00",
    });
  }
}

// تشغيل المحاكي كل 5 ثواني
setInterval(simulateDeliveryProgress, 5000);

function renderOrders() {
  const ordersList = document.getElementById("ordersList");
  if (!ordersList) return;

  const ordersKey = getOrdersKey();
  const savedOrders = JSON.parse(localStorage.getItem(ordersKey)) || [];

  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (user) {
    const navName = document.getElementById("navUserName");
    const navImg = document.getElementById("navUserImg");
    if (navName) navName.textContent = user.username || user.name || "User";
    if (navImg && user.image) navImg.src = user.image;
  }

  if (savedOrders.length === 0) {
    ordersList.innerHTML = `
            <div class="text-center py-5 w-100">
                <i class="fas fa-receipt fa-4x text-muted mb-4"></i>
                <h4 class="text-white">No orders for this account yet!</h4>
                <p class="text-muted">Explore our menu and place your first order.</p>
                <a href="dashboard.html" class="btn btn-warning px-5 py-2 fw-bold mt-3">Order Now</a>
            </div>`;
    return;
  }

  // ترتيب الطلبات من الأحدث للأقدم
  const reversedOrders = [...savedOrders].sort((a, b) => b.orderId - a.orderId);

  ordersList.innerHTML = reversedOrders
    .map((order) => {
      const statusColor =
        order.status === "Preparing"
          ? "text-warning"
          : order.status === "On the Way"
            ? "text-info"
            : "text-success";
      const statusIcon =
        order.status === "Preparing"
          ? "fa-utensils"
          : order.status === "On the Way"
            ? "fa-motorcycle"
            : "fa-check-circle";

      const isDelivered = order.status === "Delivered";
      const isRated = order.isRated || false;

      // منطق زر التقييم
      const rateButton =
        isDelivered && !isRated
          ? `<button class="btn btn-sm btn-outline-warning w-100 mt-2 fw-bold" onclick="openRateModal(${order.orderId}, ${order.restaurantId})">
                <i class="fas fa-star me-2"></i> RATE ORDER
               </button>`
          : isRated
            ? `<div class="text-success small mt-2 text-center fw-bold"><i class="fas fa-check-circle me-1"></i> Already Rated</div>`
            : "";

      // بناء قائمة الوجبات داخل الكارت
      const itemsHtml = order.items
        .map(
          (item) => `
            <div class="item-row d-flex justify-content-between mb-1">
                <span class="text-white"><span>${item.quantity}x</span> ${item.name}</span>
                <span class="text-muted small">$${(item.totalPrice || item.price * item.quantity || 0).toFixed(2)}</span>
            </div>`,
        )
        .join("");

      // زر التتبع على الخريطة
      const trackButton =
        order.status === "On the Way"
          ? `<button class="btn btn-sm btn-outline-info w-100 mt-2 fw-bold shadow-sm" onclick="openTrackingMap(${order.orderId})">
                <i class="fas fa-map-marker-alt me-2"></i> TRACK LIVE ON MAP
               </button>`
          : "";

      // قسم معلومات السائق
      const driverSection =
        order.status === "On the Way" || order.status === "Delivered"
          ? `<div class="driver-info-box mt-3 p-2 rounded" style="background: rgba(255,255,255,0.05); border: 1px dashed rgba(255,255,255,0.2);">
                <div class="d-flex align-items-center gap-2">
                    <img src="https://ui-avatars.com/api/?name=${order.driverName || "Rider"}&background=random" class="rounded-circle" width="30">
                    <div>
                        <small class="text-muted d-block" style="font-size: 0.6rem;">YOUR RIDER</small>
                        <span class="small fw-bold text-white">${order.driverName || "Assigning..."}</span>
                    </div>
                    <div class="ms-auto">
                        <a href="tel:${order.driverPhone}" class="btn btn-sm btn-success rounded-circle" style="padding: 2px 7px;">
                            <i class="fas fa-phone" style="font-size: 10px;"></i>
                        </a>
                    </div>
                </div>
                ${trackButton}
               </div>`
          : "";

      return `
            <div class="col-md-6 col-lg-4 position-relative">
                <button class="btn-delete-history" onclick="deleteOrderFromHistory(${order.orderId})" title="Delete History" style="position: absolute; top: 10px; right: 25px; z-index: 10; background: none; border: none; color: #ff4d4d; cursor: pointer;">
                    <i class="fas fa-times"></i>
                </button>
                <div class="order-card h-100 shadow-heavy p-4 bg-dark rounded-4 border border-secondary mb-4" style="background-color: #1f2026 !important;">
                    <div class="order-header-bg d-flex justify-content-between align-items-center mb-3">
                        <div class="d-flex align-items-center gap-2">
                            <div class="icon-box-id" style="background: rgba(255,193,7,0.1); width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
                                 <i class="fas ${statusIcon} ${statusColor}"></i>
                            </div>
                            <div>
                                <small class="text-muted d-block" style="font-size: 0.6rem;">STATUS</small>
                                <span class="fw-bold ${statusColor}">${order.status}</span>
                            </div>
                        </div>
                        <small class="text-muted">#${order.orderId.toString().slice(-6)}</small>
                    </div>
                    <div class="mb-3 text-muted small">
                        <i class="far fa-calendar-alt me-1"></i> ${order.date} | <i class="far fa-clock me-1"></i> ${order.time}
                    </div>
                    <div class="items-container-premium p-3 rounded bg-black mb-3" style="background-color: rgba(0,0,0,0.3) !important;">
                        ${itemsHtml}
                    </div>
                    ${driverSection}
                    <div class="mt-4 pt-3 border-top border-secondary">
                        <div class="d-flex justify-content-between align-items-end">
                            <div>
                                <small class="text-muted d-block mb-1">Total Paid (${order.paymentMethod || "Cash"})</small>
                                <span class="fs-3 fw-bold text-warning">${order.total}</span>
                            </div>
                            <button class="btn btn-sm btn-warning fw-bold px-3 py-2" onclick="reOrder(${order.orderId})" style="border-radius: 8px;">
                                <i class="fas fa-redo-alt me-1"></i> RE-ORDER
                            </button>
                        </div>
                        ${rateButton}
                    </div>
                </div>
            </div>`;
    })
    .join("");
}

let currentRating = 0;
let targetOrderId = null;
let targetResId = null;

Object.assign(window, {
  logout: () => {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
  },
  openRateModal: (orderId, resId) => {
    targetOrderId = orderId;
    targetResId = resId;
    currentRating = 0;
    const reviewInput = document.getElementById("reviewText");
    if (reviewInput) reviewInput.value = "";
    resetStars();
    const modalEl = document.getElementById("rateModal");
    if (modalEl) new bootstrap.Modal(modalEl).show();
  },
  deleteOrderFromHistory: (orderId) => {
    Swal.fire({
      title: "Remove from history?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff4d4d",
      background: "#23242a",
      color: "#fff",
    }).then((result) => {
      if (result.isConfirmed) {
        const ordersKey = getOrdersKey();
        let orders = JSON.parse(localStorage.getItem(ordersKey)) || [];
        localStorage.setItem(
          ordersKey,
          JSON.stringify(orders.filter((o) => o.orderId !== orderId)),
        );
        renderOrders();
      }
    });
  },
  openTrackingMap: (orderId) => {
    const ordersKey = getOrdersKey();
    const orders = JSON.parse(localStorage.getItem(ordersKey)) || [];
    const order = orders.find((o) => o.orderId === orderId);
    const trackingModalEl = document.getElementById("trackingModal");
    const trackingModal = new bootstrap.Modal(trackingModalEl);
    trackingModal.show();

    trackingModalEl.addEventListener(
      "shown.bs.modal",
      function () {
        const container = L.DomUtil.get("trackingMap");
        if (container != null) {
          container._leaflet_id = null;
        }

        let activeTrackingMap = L.map("trackingMap").setView(
          [order.restaurantLat || 27.18, order.restaurantLng || 31.18],
          14,
        );
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
          activeTrackingMap,
        );

        L.marker([order.restaurantLat || 27.18, order.restaurantLng || 31.18])
          .addTo(activeTrackingMap)
          .bindPopup("Restaurant");
        L.marker([order.userLat || 27.18, order.userLng || 31.18])
          .addTo(activeTrackingMap)
          .bindPopup("Your Location")
          .openPopup();
      },
      { once: true },
    );
  },
  reOrder: (orderId) => {
    const ordersKey = getOrdersKey();
    const savedOrders = JSON.parse(localStorage.getItem(ordersKey)) || [];
    const oldOrder = savedOrders.find((o) => o.orderId === orderId);

    if (oldOrder) {
      let newItems = oldOrder.items.flatMap((item) =>
        Array(item.quantity).fill({
          name: item.name,
          price: item.unitPrice || parseFloat(item.totalPrice) / item.quantity,
          restaurantId: oldOrder.restaurantId,
          id: Date.now() + Math.random(),
        }),
      );
      localStorage.setItem(getCartKey(), JSON.stringify(newItems));
      window.location.href = "checkout.html";
    }
  },
  clearAllOrders: () => {
    Swal.fire({
      title: "Clear All History?",
      text: "You will lose all your order records permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff4d4d",
      background: "#23242a",
      color: "#fff",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem(getOrdersKey());
        renderOrders();
        Swal.fire({
          title: "History Cleared!",
          icon: "success",
          background: "#23242a",
          color: "#fff",
        });
      }
    });
  },
});

function resetStars() {
  document.querySelectorAll(".star-btn").forEach((star) => {
    star.classList.replace("fas", "far");
    star.classList.remove("text-warning");
  });
}

document.querySelectorAll(".star-btn").forEach((star) => {
  star.addEventListener("click", function () {
    currentRating = parseInt(this.getAttribute("data-value"));
    document.querySelectorAll(".star-btn").forEach((s) => {
      const val = parseInt(s.getAttribute("data-value"));
      if (val <= currentRating) {
        s.classList.replace("far", "fas");
        s.classList.add("text-warning");
      } else {
        s.classList.replace("fas", "far");
        s.classList.remove("text-warning");
      }
    });
  });
});

document.getElementById("submitRateBtn")?.addEventListener("click", () => {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) {
    Swal.fire({
      title: "Sign in Required",
      text: "You must be logged in to submit a review!",
      icon: "error",
      background: "#23242a",
      color: "#fff",
    });
    return;
  }
  if (currentRating === 0)
    return Swal.fire({
      title: "Rating Required",
      text: "Please select stars!",
      icon: "warning",
      background: "#23242a",
      color: "#fff",
    });

  const review = document.getElementById("reviewText").value;
  const ordersKey = getOrdersKey();
  let orders = JSON.parse(localStorage.getItem(ordersKey)) || [];

  const orderIndex = orders.findIndex((o) => o.orderId === targetOrderId);
  if (orderIndex !== -1) {
    orders[orderIndex].isRated = true;
    localStorage.setItem(ordersKey, JSON.stringify(orders));

    let allReviews =
      JSON.parse(localStorage.getItem("restaurantReviews")) || [];
    allReviews.push({
      restaurantId: targetResId,
      userName: user.username || user.name || "Guest",
      rating: currentRating,
      comment: review,
      date: new Date().toLocaleDateString(),
    });
    localStorage.setItem("restaurantReviews", JSON.stringify(allReviews));

    Swal.fire({
      title: "Thank You!",
      text: "Review submitted successfully.",
      icon: "success",
      background: "#23242a",
      color: "#fff",
    }).then(() => {
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("rateModal"),
      );
      if (modal) modal.hide();
      renderOrders();
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  renderOrders();
});
