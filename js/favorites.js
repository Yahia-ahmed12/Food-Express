import { restaurantsData } from "./data.js";

// دالة لجلب مفتاح التخزين الخاص بكل مستخدم بناءً على إيميله
function getUserKey(prefix) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  return user ? `${prefix}_${user.email}` : prefix;
}

// دالة لجلب تقييمات المطعم من التخزين المحلي
function getRestaurantRating(resId) {
  const allReviews =
    JSON.parse(localStorage.getItem("restaurantReviews")) || [];
  const resReviews = allReviews.filter(
    (rev) => String(rev.restaurantId) === String(resId),
  );
  if (resReviews.length === 0) return { average: 0, count: 0 };
  const sum = resReviews.reduce((acc, rev) => acc + parseInt(rev.rating), 0);
  return {
    average: (sum / resReviews.length).toFixed(1),
    count: resReviews.length,
  };
}

// الدالة المسؤولة عن تحويل البيانات لـ HTML وعرضها
function renderToContainer(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = data
    .map((res) => {
      const ratingData = getRestaurantRating(res.id);
      const favoritesKey = getUserKey("userFavorites");
      const favorites = JSON.parse(localStorage.getItem(favoritesKey)) || [];
      const isFavorite = favorites.map(String).includes(String(res.id));

      // 1. معالجة التقييم
      const displayRating =
        ratingData.count > 0 ? ratingData.average : res.rating || "5.0";
      const reviewText =
        ratingData.count > 0 ? `(${ratingData.count}+)` : "(New)";

      // 2. معالجة سعر التوصيل (Free Delivery vs $ Price)
      let deliveryFeeText = "";
      const rawFee =
        res.deliveryFeeValue !== undefined
          ? res.deliveryFeeValue
          : res.deliveryFee;

      if (
        rawFee === 0 ||
        rawFee === "0" ||
        String(rawFee).toLowerCase() === "free"
      ) {
        deliveryFeeText = "Free Delivery";
      } else {
        const cleanFee = String(rawFee).replace(/[^0-9.]/g, "");
        deliveryFeeText = `Delivery $${cleanFee || "0"}`;
      }

      // 3. ✅ التعديل السحري لـ Min Price (قراءة كل الاحتمالات)
      // بنجرب نقرأ minPrice الأول (بتاعة المالك والداتا الجديدة) وبعدين minPriceValue
      let rawMin =
        res.minPrice !== undefined ? res.minPrice : res.minPriceValue;

      // لو القيمة لسه مش موجودة أو صفر، نبحث في المنيو
      if (
        rawMin === undefined ||
        rawMin === null ||
        rawMin === 0 ||
        rawMin === "0"
      ) {
        if (res.menu && res.menu.length > 0) {
          rawMin = Math.min(...res.menu.map((p) => parseFloat(p.price)));
        } else {
          // لو مفيش أي بيانات، نضع 10 كقيمة احتياطية
          rawMin = 10;
        }
      }
      const minOrder = parseFloat(rawMin).toFixed(0);

      return `
        <div class="col">
            <div class="restaurant-card favorite-card h-100 position-relative" onclick="showRestaurantDetails('${res.id}')">
                ${res.isOpen ? '<span class="status-badge open">Open Now</span>' : ""}
                <div class="favorite-btn" onclick="event.stopPropagation(); toggleFavorite('${res.id}')">
                    <i class="fas fa-heart heart-icon ${isFavorite ? "active" : ""}" id="heart-${res.id}"></i>
                </div>
                <div class="card-image-wrapper">
                    <img src="${res.image}" class="card-image" alt="${res.name}">
                    <div class="image-overlay"></div>
                    <div class="rating-badge">
                        <i class="fas fa-star"></i>
                        ${displayRating} <span class="review-count">${reviewText}</span>
                    </div>
                </div>
                <div class="card-details">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h5 class="restaurant-name">${res.name}</h5>
                            <div class="category-text">${res.category}</div>
                        </div>
                        <div class="delivery-fee-badge">${deliveryFeeText}</div>
                    </div>
                 <div class="delivery-info">
    <span><i class="far fa-clock"></i> ${res.deliveryTime || "20-30 min"}</span>
    <span class="price text-success fw-bold">$${minOrder} Min</span>
</div>
                    <button class="btn btn-sm btn-outline-warning w-100 mt-3 order-btn" 
                        onclick="event.stopPropagation(); window.location.href='dashboard.html?resId=${res.id}'">
                        Order Again <i class="fas fa-chevron-right ms-1"></i>
                    </button>
                </div>
            </div>
        </div>`;
    })
    .join("");
}

// دالة التبديل (Toggle)
window.toggleFavorite = function (resId) {
  const favoritesKey = getUserKey("userFavorites");
  let favorites = JSON.parse(localStorage.getItem(favoritesKey)) || [];
  const stringId = String(resId);
  const index = favorites.map(String).indexOf(stringId);
  if (index !== -1) favorites.splice(index, 1);
  else favorites.push(resId);
  localStorage.setItem(favoritesKey, JSON.stringify(favorites));
  renderFavorites();
};

// الدالة الأساسية لعرض المفضلة
export function renderFavorites() {
  const favoritesKey = getUserKey("userFavorites");
  const favorites = JSON.parse(localStorage.getItem(favoritesKey)) || [];
  const container = document.getElementById("favoritesContainer");
  if (!container) return;

  if (favorites.length === 0) {
    container.innerHTML = "";
    document.getElementById("emptyState")?.classList.remove("d-none");
    return;
  }
  document.getElementById("emptyState")?.classList.add("d-none");

  const ownerShops = JSON.parse(localStorage.getItem("allShops")) || [];
  const allPossibleShops = [...ownerShops, ...restaurantsData];

  const favoriteRestaurants = allPossibleShops.filter((res) =>
    favorites.map(String).includes(String(res.id)),
  );

  renderToContainer("favoritesContainer", favoriteRestaurants);
}

document.addEventListener("DOMContentLoaded", renderFavorites);

Object.assign(window, { toggleFavorite, renderFavorites });
