import { offersData, restaurantsData } from "./data.js";

const ownerShops = JSON.parse(localStorage.getItem("allShops")) || [];
const allProducts = JSON.parse(localStorage.getItem("allProducts")) || [];

const dynamicRestaurants = ownerShops.map((shop) => {
  const shopMenu = allProducts.filter(
    (p) => String(p.shopId) === String(shop.id),
  );

  const cheapestProduct =
    shopMenu.length > 0
      ? Math.min(...shopMenu.map((p) => parseFloat(p.price)))
      : 0;

  let manualMinPrice = 0;
  if (
    shop.minPrice !== undefined &&
    shop.minPrice !== null &&
    shop.minPrice !== ""
  ) {
    manualMinPrice = parseFloat(shop.minPrice);
  }

  let finalMinPrice = Math.max(manualMinPrice, cheapestProduct);

  if (finalMinPrice === 0) finalMinPrice = 10;

  let deliveryDisplay = "";
  const feeRaw = String(shop.deliveryFee || "0").toLowerCase();

  if (feeRaw === "0" || feeRaw === "free" || feeRaw === "") {
    deliveryDisplay = "Free Delivery";
  } else {
    const cleanFee = feeRaw.replace(/[^0-9.]/g, "");
    deliveryDisplay = `$${cleanFee} Delivery`;
  }

  return {
    id: shop.id,
    name: shop.name,
    isOpen: true,
    image: shop.image || "../images/default-shop.png",
    rating: shop.rating || "5.0",
    deliveryTime: shop.deliveryTime || "25-35 min",
    deliveryFee: deliveryDisplay,
    deliveryFeeValue: parseFloat(shop.deliveryFee) || 0,

    minPrice: finalMinPrice,

    category: shop.category || "Restaurant",
    menu: shopMenu,
    hasDiscount: shop.hasDiscount || false,
  };
});

const finalData = Array.from(
  new Map(
    [...dynamicRestaurants, ...restaurantsData].map((item) => [item.id, item]),
  ).values(),
);

function protectedRedirect(targetPage) {
  const currentUser = localStorage.getItem("currentUser");

  if (!currentUser) {
    Swal.fire({
      title: "Sign in required",
      text: `Please login to access your ${targetPage.replace(".html", "")}!`,
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#ff7b00",
      cancelButtonColor: "#23242a",
      confirmButtonText: "Login Now",
      background: "#1a1b20",
      color: "#fff",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = "login.html";
      }
    });
  } else {
    window.location.href = targetPage;
  }
}

function getRestaurantRating(resId) {
  const allReviews =
    JSON.parse(localStorage.getItem("restaurantReviews")) || [];

  const resReviews = allReviews.filter(
    (rev) => String(rev.restaurantId) == String(resId),
  );

  if (resReviews.length === 0) return { average: 0, count: 0, reviews: [] };

  const sum = resReviews.reduce((acc, rev) => acc + parseInt(rev.rating), 0);
  const average = (sum / resReviews.length).toFixed(1);

  return { average, count: resReviews.length, reviews: resReviews };
}

function showReviews(resId) {
  const ratingData = getRestaurantRating(resId);
  const sortedReviews = [...(ratingData.reviews || [])].reverse();
  const reviewsHtml =
    sortedReviews.length > 0
      ? sortedReviews
          .map(
            (rev) => `
            <div class="review-item border-bottom border-secondary mb-3 pb-2" style="text-align: left;">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="fw-bold text-warning" style="font-size: 1rem;">${rev.userName}</span>
                    <span class="small text-muted">${rev.date || "Recent"}</span>
                </div>
                <div class="text-warning mb-2" style="font-size: 0.8rem;">
                    ${'<i class="fas fa-star"></i>'.repeat(rev.rating)}
                    ${'<i class="far fa-star text-muted"></i>'.repeat(5 - rev.rating)}
                </div>
                <p class="small text-white-50 mb-0" style="line-height: 1.4;">${rev.comment || "No written feedback."}</p>
            </div>`,
          )
          .join("")
      : '<div class="text-center py-4 text-muted"><p>No reviews found for this restaurant yet.</p></div>';

  Swal.fire({
    title: '<span class="text-warning">Customer Feedback</span>',
    html: `<div style="max-height: 400px; overflow-y: auto; padding-right: 10px;">${reviewsHtml}</div>`,
    background: "#1a1b1f",
    color: "#fff",
    showConfirmButton: false,
    showCloseButton: true,
    width: "450px",
  });
}

export function getUserKey(prefix) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  return user ? `${prefix}_${user.email}` : prefix;
}

function getCurrentUser() {
  let currentUser = localStorage.getItem("currentUser");
  return currentUser ? JSON.parse(currentUser) : null;
}
function syncUserProfile() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (currentUser && currentUser.role === "customer") {
    const navImg = document.getElementById("navUserImg");
    if (navImg) {
      navImg.style.display = "block";
      if (currentUser.image) {
        navImg.src = currentUser.image;
      } else {
        const userName = currentUser.username || currentUser.name || "User";
        navImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=ff7b00&color=fff&bold=true`;
      }
    }

    const navName = document.getElementById("navUserName");
    if (navName) {
      navName.textContent = currentUser.username || currentUser.name || "Guest";
    }

    const profileDiv = document.querySelector(".profile");
    const userButtons = document.querySelector(".user");
    if (profileDiv && userButtons) {
      profileDiv.classList.remove("d-none");
      userButtons.classList.add("d-none");
    }
  } else {
    document.querySelector(".profile")?.classList.add("d-none");
    document.querySelector(".user")?.classList.remove("d-none");
  }
}

document.addEventListener("DOMContentLoaded", syncUserProfile);

function showUserProfile() {
  let profileDropdown = document.querySelector(".profile");
  let loginSignupButtons = document.querySelector(".user");

  let user = getCurrentUser();

  if (user) {
    if (profileDropdown) {
      profileDropdown.classList.remove("d-none");
    }
    if (loginSignupButtons) {
      loginSignupButtons.classList.add("d-none");
    }
  } else {
    if (profileDropdown) {
      profileDropdown.classList.add("d-none");
    }
    if (loginSignupButtons) {
      loginSignupButtons.classList.remove("d-none");
    }
  }
}
window.addEventListener("load", showUserProfile);
let activeFilters = {
  text: "",
  maxPrice: 10000,
  sortBy: "default",
  freeDelivery: false,
  openNow: false,
};

function slideOffers(direction) {
  const container = document.getElementById("offersContainer");
  const scrollAmount = 350;

  if (direction === "left") {
    container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  } else {
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  }
}

////////////////////////////
let lastScrollY = window.scrollY;
const navbar = document.querySelector(".nav-custom");

window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;

  if (currentScrollY < 50) {
    navbar.classList.remove("nav-hidden");
  } else if (currentScrollY > lastScrollY) {
    navbar.classList.add("nav-hidden");
  } else {
    navbar.classList.remove("nav-hidden");
  }

  lastScrollY = currentScrollY;
});
// /////////////////////
function showAllOffers() {
  const searchInput = document.querySelector(".search-input");
  if (searchInput) searchInput.value = "";
  activeFilters.text = "Offers";

  const discounted = finalData.filter((res) => res.hasDiscount === true);

  toggleSearchLayout("Current Offers");
  renderToContainer("searchResultsContainer", discounted);
  document
    .querySelectorAll(".nav-link")
    .forEach((link) => link.classList.remove("active"));
  const offersLink = document.getElementById("offersLink");
  if (offersLink) offersLink.classList.add("active");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

window.showAllOffers = showAllOffers;
// /////////////////////////
function scrollToRestaurants() {
  if (activeFilters.text !== "") {
    resetPage();
  }

  document
    .querySelectorAll(".nav-link")
    .forEach((link) => link.classList.remove("active"));
  const resLink = document.getElementById("restaurantsLink");
  if (resLink) resLink.classList.add("active");

  const container = document.getElementById("restaurantsContainer");
  if (container) {
    const sectionTitle = document.querySelector(".section-title");
    sectionTitle.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

window.scrollToRestaurants = scrollToRestaurants;
/////////////////////////////
function scrollToCategories() {
  if (activeFilters.text !== "") {
    resetPage();
  }

  setTimeout(() => {
    document
      .querySelectorAll(".nav-link")
      .forEach((link) => link.classList.remove("active"));
    document.getElementById("categoriesLink")?.classList.add("active");

    const categoryTitle = document.querySelector(".category-title");
    if (categoryTitle) {
      categoryTitle.scrollIntoView({ behavior: "smooth", block: "start" });

      const strip = document.querySelector(".categories-strip");
      if (strip) {
        strip.style.transition = "transform 0.3s ease";
        strip.style.transform = "scale(1.02)";
        setTimeout(() => (strip.style.transform = "scale(1)"), 300);
      }
    }
  }, 100);
}
window.scrollToCategories = scrollToCategories;
// ////////////////////
function setupSearchListener() {
  const searchInput = document.querySelector(".search-input");
  if (searchInput) {
    searchInput.addEventListener("input", async (e) => {
      const searchTerm = e.target.value;
      filterRestaurants(searchTerm);

      if (searchTerm.length > 2) {
        const results = await nominatimSearch(searchTerm);
        showAutocomplete(results);
      } else {
        showAutocomplete([]);
      }
    });
  }
}

// ------------------------
// Leaflet + Modal + Search by Name (Nominatim) + Autocomplete
// ------------------------
let map = null;
let marker = null;
let userLocation = {
  address: "Default Cairo Location",
  lat: 30.0444,
  lon: 31.2357,
};

// ------------------------
//  دالة تحميل وحفظ الموقع
// ------------------------
function loadUserLocation() {
  const locationKey = getUserKey("userLocation"); // 🟢 ربط العنوان بالإيميل
  let savedLocation = localStorage.getItem(locationKey);
  if (savedLocation) {
    const locationData = JSON.parse(savedLocation);
    userLocation.address = locationData.address || "Saved Location";
    userLocation.lat = locationData.lat;
    userLocation.lon = locationData.lon;
  }
}

// ------------------------
//  دالة عكس الترميز الجغرافي (Reverse Geocoding)
// ------------------------
async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.display_name) {
      return data.display_name;
    }
    return `Location: ${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  } catch (e) {
    Toast.fire({
      icon: "error",
      title: "Could not fetch address name",
    });
    return `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`;
  }
}

// ------------------------
//  دالة تحديث العرض (تم تعديلها لاستخدام Reverse Geocoding)
// ------------------------
async function updateLocationDisplay() {
  const el = document.getElementById("currentLocationText");
  if (!el) return;

  el.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finding address...';

  const address = await reverseGeocode(userLocation.lat, userLocation.lon);

  userLocation.address = address;
  el.textContent = `Deliver to: ${userLocation.address}`;
}

function openMapModal() {
  const modal = document.getElementById("mapModalContainer");
  modal.style.display = "flex";

  setTimeout(() => {
    if (!map) initMap();
    else {
      map.invalidateSize();
      ensureMarker();
      map.setView([userLocation.lat, userLocation.lon], 14);
      marker.setLatLng([userLocation.lat, userLocation.lon]);
    }
  }, 220);
}

function closeMapModal() {
  document.getElementById("mapModalContainer").style.display = "none";
}

function ensureMarker() {
  if (!marker) {
    marker = L.marker([userLocation.lat, userLocation.lon], {
      draggable: true,
    }).addTo(map);

    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      userLocation.lat = pos.lat;
      userLocation.lon = pos.lng;
      updateLocationDisplay();
    });
  }
}

function initMap() {
  map = L.map("map").setView([userLocation.lat, userLocation.lon], 14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(map);
  marker = L.marker([userLocation.lat, userLocation.lon], {
    draggable: true,
  }).addTo(map);

  marker.on("dragend", () => {
    const p = marker.getLatLng();
    userLocation.lat = p.lat;
    userLocation.lon = p.lng;
    updateLocationDisplay();
  });

  map.on("click", (e) => {
    userLocation.lat = e.latlng.lat;
    userLocation.lon = e.latlng.lng;
    if (!marker) ensureMarker();
    marker.setLatLng(e.latlng);
    updateLocationDisplay();
  });

  setTimeout(() => map.invalidateSize(), 300);
}

// ------------------------
// Nominatim search (get list) - used by autocomplete & search button
// ------------------------
async function nominatimSearch(q, limit = 6) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=${limit}&q=${encodeURIComponent(q)}`;

  try {
    const res = await fetch(url, {
      headers: { "Accept-Language": "en" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error("Server issues");
    return await res.json();
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Connection timeout");
    }
    throw err;
  }
}

// ------------------------
// Autocomplete UI
// ------------------------
const autocompleteListEl = document.getElementById("autocompleteList");
function showAutocomplete(items) {
  if (!autocompleteListEl) return;
  if (!items || items.length === 0) {
    autocompleteListEl.style.display = "none";
    autocompleteListEl.innerHTML = "";
    return;
  }
  autocompleteListEl.style.display = "block";
  autocompleteListEl.innerHTML = items
    .map((it) => {
      const display = it.display_name || `${it.lat},${it.lon}`;
      return `<div class="autocomplete-item" data-lat="${it.lat}" data-lon="${
        it.lon
      }" data-name="${escapeHtml(display)}">${escapeHtml(display)}</div>`;
    })
    .join("");

  Array.from(autocompleteListEl.querySelectorAll(".autocomplete-item")).forEach(
    (item) => {
      item.addEventListener("click", function () {
        const name = this.dataset.name;
        const lat = parseFloat(this.dataset.lat);
        const lon = parseFloat(this.dataset.lon);
        document.getElementById("placeSearchInput").value = name;
        autocompleteListEl.style.display = "none";
        userLocation.lat = lat;
        userLocation.lon = lon;
        userLocation.address = name;
        ensureMarker();
        marker.setLatLng([lat, lon]);
        map.setView([lat, lon], 15);
      });
    },
  );
}
function escapeHtml(str) {
  return String(str).replace(
    /[&<>"']/g,
    (s) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        s
      ],
  );
}

// ------------------------
// setup autocomplete event with debounce
// ------------------------

let isSearching = false;

async function searchPlaceByName(q) {
  if (isSearching || !q.trim()) return;

  try {
    isSearching = true;
    const searchBtn = document.getElementById("searchPlaceBtn");
    if (searchBtn)
      searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    const results = await nominatimSearch(q, 1);

    if (!results || results.length === 0) {
      Swal.fire({
        title: "Location Not Found!",
        text: "Please try a more specific name.",
        icon: "info",
        confirmButtonColor: "#ff7b00",
        background: "#23242a",
        color: "#fff",
        iconColor: "#ff7b00",
      });
    } else {
      const p = results[0];
      userLocation.lat = parseFloat(p.lat);
      userLocation.lon = parseFloat(p.lon);
      userLocation.address = p.display_name;

      ensureMarker();
      marker.setLatLng([userLocation.lat, userLocation.lon]);
      map.setView([userLocation.lat, userLocation.lon], 15);
      updateLocationDisplay();
    }
  } catch (err) {
    Swal.fire({
      title: "Connection Error",
      text: "Please check your internet connection.",
      icon: "error",
      confirmButtonColor: "#ff7b00",
      background: "#23242a",
      color: "#fff",
      iconColor: "#e74c3c",
    });
  } finally {
    isSearching = false;
    const searchBtn = document.getElementById("searchPlaceBtn");
    if (searchBtn) searchBtn.innerHTML = '<i class="fas fa-search"></i>';
  }
}

function setupMapModalListeners() {
  const picker = document.getElementById("locationPicker");
  if (picker) picker.addEventListener("click", openMapModal);

  const confirmBtn = document.getElementById("confirmLocationBtn");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      const locationKey = getUserKey("userLocation");
      localStorage.setItem(locationKey, JSON.stringify(userLocation));
      updateLocationDisplay();
      closeMapModal();
    });
  }

  const searchBtn = document.getElementById("searchPlaceBtn");
  const searchInput = document.getElementById("placeSearchInput");

  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", (e) => {
      e.preventDefault();
      searchPlaceByName(searchInput.value);
    });
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        searchPlaceByName(searchInput.value);
      }
    });
  }
}

// //////////////////

function filterRestaurants(searchTerm) {
  const normalizedSearchTerm = searchTerm.toLowerCase();

  const offers = document.getElementById("offersContainer");
  const categoryTitle = document.querySelector(".category-title");
  const categoriesStrip = document.querySelector(".categories-strip");
  const sectionTitle = document.querySelector(".section-title");
  const sorting = document.querySelector(".sorting-options");

  if (normalizedSearchTerm.length > 0) {
    if (offers) offers.style.setProperty("display", "none", "important");
    if (categoriesStrip)
      categoriesStrip.style.setProperty("display", "none", "important");
    if (categoryTitle)
      categoryTitle.style.setProperty("display", "none", "important");
    if (sorting) sorting.style.setProperty("display", "none", "important");
    if (sectionTitle) sectionTitle.textContent = `Results for "${searchTerm}"`;
  } else {
    if (offers) offers.style.display = "flex";
    if (categoriesStrip) categoriesStrip.style.display = "flex";
    if (categoryTitle) categoryTitle.style.display = "block";
    if (sorting) sorting.style.display = "flex";
    if (sectionTitle) sectionTitle.textContent = "Popular Restaurants Near You";
  }

  const filteredResults = finalData.filter((restaurant) => {
    return restaurant.name.toLowerCase().includes(normalizedSearchTerm);
  });

  renderFilteredRestaurants(filteredResults);
}

function renderFilteredRestaurants(dataToDisplay) {
  const container = document.getElementById("restaurantsContainer");
  if (!container) return;

  if (dataToDisplay.length === 0) {
    container.innerHTML = `
            <div class="text-center w-100 mt-5">
                <i class="fas fa-search-minus fa-3x text-muted mb-3" style="color: #6c757d;"></i>
                <p class="text-white mt-3">Sorry, we couldn't find any restaurants matching your search.</p>
            </div>
        `;
    return;
  }

  let restaurantHtml = "";
  dataToDisplay.forEach((restaurant) => {
    restaurantHtml += `
            <div class="col">
                <div class="restaurant-card">
                    <img src="${restaurant.image}" alt="${restaurant.name}" class="card-image">
                    <div class="card-details">
                     <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="restaurant-name mb-0">${restaurant.name}</h5>
                <span class="price-tag text-success fw-bold">$${restaurant.minPrice}</span>
            </div>
                        <div class="rating-info pt-2">
                        <i class="fas fa-star rating-star"></i>
                <span class="rating-value">${restaurant.rating}</span>
             
                        </div>
                        <div class="delivery-info">
                            <div class="delivery-time"><i class="far fa-clock"></i><span>${restaurant.deliveryTime}</span></div>
                            <div class="delivery-fee"><i class="fas fa-motorcycle"></i><span>${restaurant.deliveryFee}</span></div>
                        </div>
                    </div>
                </div>
            </div>`;
  });
  container.innerHTML = restaurantHtml;
}

//(Offers Logic)

function renderOffers() {
  const container = document.getElementById("offersContainer");
  if (!container) return;

  // 1. جلب عروض الملاك من الـ Storage
  const ownerOffers = JSON.parse(localStorage.getItem("allOffers")) || [];

  // 2. دمج عروض الملاك مع الـ offersData الثابتة اللي في data.js
  const finalOffers = [...ownerOffers, ...offersData];

  let offersHTML = "";
  finalOffers.forEach((offer) => {
    offersHTML += `
            <div class="offer-card offer-${offer.id}" 
                 style="background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${offer.image}'); cursor: pointer;"
                 onclick="handleOfferClick('${offer.searchTerm}')"> 
                <p class="offer-text">
                    <span class="${offer.type}">${offer.title}</span>
                    <span class="subtitle">${offer.subtitle}</span>
                </p>
            </div>`;
  });
  container.innerHTML = offersHTML;
}
function handleOfferClick(term) {
  const searchInput = document.querySelector(".search-input");
  if (!searchInput) return;

  // 1. تحديث شكل خانة البحث
  searchInput.value = term;

  // 2. تحديث قيمة الفلتر النصي
  activeFilters.text = term;

  // 3. 💡 التعديل الذكي هنا:
  // لو الكلمة هي Drinks، هنخلي السيستم يفلتر أي حاجة تبع المشروبات
  // لو عايز الفلترة تكون عامة، بنعدل applyAllFilters عشان تفهم الـ logic ده

  toggleSearchLayout(term);

  // تنفيذ الفلترة
  applyAllFilters();

  // سكرول لفوق عشان الزبون يشوف النتائج
  window.scrollTo({ top: 0, behavior: "smooth" });
}
// (Filtering Engine)

function applyAllFilters() {
  let filtered = [...finalData]; // finalData هنا بتشمل بيانات الـ JS + بيانات الـ LocalStorage
  const searchTerm = activeFilters.text;

  if (searchTerm === "Healthy") {
    filtered = filtered
      .filter((item) => item.category.toLowerCase() === "healthy")
      .map((item) => ({
        ...item,
        minPrice: item.hasDiscount
          ? (item.minPrice * 0.75).toFixed(2)
          : item.minPrice,
      }));
  } else if (searchTerm === "Groceries") {
    // عرض كل البقالة، والي عنده Free Delivery يظهر الأول
    filtered = filtered.filter(
      (item) => item.category.toLowerCase() === "groceries",
    );
  } else if (searchTerm === "Pharmacy") {
    filtered = filtered
      .filter((item) => item.category.toLowerCase() === "pharmacy")
      .map((item) => ({
        ...item,
        minPrice: item.hasDiscount
          ? (item.minPrice * 0.7).toFixed(2)
          : item.minPrice,
      }));
  } else if (searchTerm === "Drinks") {
    // مرونة: Drinks بتجيب Coffee و Juice كمان
    filtered = filtered
      .filter((item) => {
        const cat = item.category.toLowerCase();
        return cat === "drinks" || cat === "coffee" || cat === "juice";
      })
      .map((item) => ({
        ...item,
        minPrice: item.hasDiscount
          ? (item.minPrice * 0.7).toFixed(2)
          : item.minPrice,
      }));
  } else if (searchTerm === "Fast") {
    // أي محل توصيله سريع (أقل من 25 دقيقة) بغض النظر عن النوع
    filtered = filtered.filter((item) => item.deliveryTimeMin <= 25);
  } else if (searchTerm === "Italian") {
    filtered = filtered
      .filter((item) => item.category.toLowerCase() === "italian")
      .map((item) => ({
        ...item,
        minPrice: item.hasDiscount
          ? (item.minPrice * 0.9).toFixed(2)
          : item.minPrice,
      }));
  } else if (searchTerm) {
    // للبحث العادي بالاسم أو النوع لو مفيش تطابق مع الكروت اللي فوق
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  // باقي الفلاتر (السعر، التوصيل المجاني، المفتوح الآن، الترتيب)
  // ... (سيب الكود بتاعهم زي ما هو تحت)
  filtered = filtered.filter((item) => item.minPrice <= activeFilters.maxPrice);
  if (activeFilters.freeDelivery)
    filtered = filtered.filter((item) => item.deliveryFeeValue === 0);
  if (activeFilters.openNow)
    filtered = filtered.filter((res) => res.isOpen === true);

  if (activeFilters.sortBy === "low-to-high")
    filtered.sort((a, b) => a.minPrice - b.minPrice);
  else if (activeFilters.sortBy === "top-rated") {
    filtered.sort((a, b) => {
      const getRate = (item) => {
        const live = getRestaurantRating(item.id);
        return live.count > 0
          ? parseFloat(live.average)
          : parseFloat(item.rating) || 0;
      };
      return getRate(b) - getRate(a);
    });
  } else if (activeFilters.sortBy === "fastest")
    filtered.sort((a, b) => a.deliveryTimeMin - b.deliveryTimeMin);
  else if (activeFilters.sortBy === "low-delivery")
    filtered.sort((a, b) => a.deliveryFeeValue - b.deliveryFeeValue);

  const targetContainer =
    activeFilters.text.length > 0
      ? "searchResultsContainer"
      : "restaurantsContainer";
  renderToContainer(targetContainer, filtered);
}
function renderToContainer(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (data.length === 0) {
    container.innerHTML = `<div class="text-white text-center mt-5 w-100"><p>No matches found.</p></div>`;
    return;
  }

  container.innerHTML = data
    .map((res) => {
      // 1. جلب التقييمات الحية
      const ratingData = getRestaurantRating(res.id);

      // 2. التحقق من حالة المفضلة (Favorites)
      const favoritesKey = getUserKey("userFavorites");
      const favorites = JSON.parse(localStorage.getItem(favoritesKey)) || [];
      const isFavorite = favorites.map(Number).includes(Number(res.id));

      // 3. معالجة التقييم المعروض (لو جديد يظهر تقييمه الأصلي أو 5.0)
      const displayRating =
        ratingData.count > 0 ? ratingData.average : res.rating || "5.0";
      const reviewText =
        ratingData.count > 0
          ? `(${ratingData.count} reviews)`
          : `(${res.category})`;

      // 4. ✅ معالجة الـ Min Price (المنطق الذكي لمنع ظهور 0 أو 10 ثابتة)
      // بنجرب نقرأ minPrice أو minPriceValue
      let rawMin =
        res.minPrice !== undefined ? res.minPrice : res.minPriceValue;

      // لو القيمة صفر أو غير موجودة، نبحث في المنيو أو نضع 5 كبداية
      if (!rawMin || rawMin === 0 || rawMin === "0") {
        rawMin =
          res.menu && res.menu.length > 0
            ? Math.min(...res.menu.map((p) => parseFloat(p.price)))
            : 5; // قيمة افتراضية بسيطة
      }
      const minOrder = parseFloat(rawMin).toFixed(0);

      return `
        <div class="col">
            <div class="restaurant-card h-100 shadow-sm position-relative" 
                 style="cursor: pointer;" 
                 onclick="showRestaurantDetails(${res.id})">
                
                <div class="favorite-btn" 
                     onclick="event.stopPropagation(); toggleFavorite(${res.id})" 
                     style="position: absolute; top: 12px; right: 12px; z-index: 10; cursor: pointer;">
                    <i class="${isFavorite ? "fas" : "far"} fa-heart" 
                       id="heart-${res.id}" 
                       style="color: ${isFavorite ? "#ff4d4d" : "#fff"}; font-size: 1.3rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6)); transition: all 0.3s;">
                    </i>
                </div>

                <img src="${res.image}" class="card-image" alt="${res.name}">
                
                <div class="card-details">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5 class="restaurant-name mb-0">${res.name}</h5>
                        <span class="badge bg-success">$${minOrder}</span>
                    </div>

                    <div class="rating-info mb-2 d-flex align-items-center gap-2">
                        <i class="fas fa-star text-warning"></i> 
                        <span class="text-warning fw-bold">${displayRating}</span>
                        <small class="text-white-50">${reviewText}</small>
                        
                        <button class="btn btn-link btn-sm p-0 ms-auto" 
                                style="text-decoration:none; font-size: 0.75rem; color: #ffc107 !important; border: none !important; box-shadow: none !important; outline: none !important;" 
                                onclick="event.stopPropagation(); showReviews(${res.id})">
                            View Reviews
                        </button>
                    </div>

                   <div class="delivery-info border-top pt-2 d-flex justify-content-between align-items-center">
                        <span><i class="far fa-clock me-1"></i> ${res.deliveryTime || "25-35 min"}</span>
                        <span><i class="fas fa-motorcycle me-1"></i> ${res.deliveryFee}</span>
                    </div>
                </div>
            </div>
        </div>`;
    })
    .join("");
}
export function updateFavoriteCounter() {
  const favCountEl = document.getElementById("favCount");
  const favoritesKey = getUserKey("userFavorites");

  // 1. جلب قائمة الـ IDs المخزنة في مفضلة المستخدم
  const favorites = JSON.parse(localStorage.getItem(favoritesKey)) || [];

  // 2. جلب كل المحلات المتاحة (الأساسية + اللي المالك ضافها)
  const ownerShops = JSON.parse(localStorage.getItem("allShops")) || [];
  // تأكد إن restaurantsData معمول لها import في بداية الملف
  const allPossibleShops = [...ownerShops, ...restaurantsData];

  // 3. ✅ التعديل السحري: فلترة الـ IDs اللي ليها محل حقيقي موجود حالياً
  const validFavorites = favorites.filter((favId) =>
    allPossibleShops.some((shop) => String(shop.id) === String(favId)),
  );

  // 4. تحديث العداد بناءً على عدد المحلات الحقيقية فقط
  if (favCountEl) {
    if (validFavorites.length > 0) {
      favCountEl.textContent = validFavorites.length;
      favCountEl.style.display = "block";
    } else {
      favCountEl.style.display = "none";
    }
  }

  // 💡 نصيحة: يفضل تحديث الـ LocalStorage بالبيانات النظيفة عشان الرقم ما يضربش تاني
  // localStorage.setItem(favoritesKey, JSON.stringify(validFavorites));
}
function toggleFavorite(id) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // 1. التعديل الجوهري هنا: بدل الـ return الصامت، هنظهر الـ SweetAlert
  if (!currentUser) {
    Swal.fire({
      title: "Sign in required",
      text: "You need to login to add restaurants to your favorites!",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#ff7b00", // اللون البرتقالي بتاعك
      cancelButtonColor: "#23242a",
      confirmButtonText: "Login Now",
      background: "#1a1b20",
      color: "#fff",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = "login.html"; // تحويل لصفحة تسجيل الدخول
      }
    });
    return; // وقف تنفيذ باقي الكود
  }

  // 2. باقي الكود بتاعك شغال زي ما هو (الحفظ في localStorage)
  const key = `userFavorites_${currentUser.email}`;
  let favorites = JSON.parse(localStorage.getItem(key)) || [];

  id = Number(id);
  favorites = favorites.map(Number);
  const index = favorites.indexOf(id);

  if (index === -1) {
    favorites.push(id);
  } else {
    favorites.splice(index, 1);
  }

  localStorage.setItem(key, JSON.stringify(favorites));

  // 3. تحديث شكل القلب فوراً (UI Update)
  const hearts = document.querySelectorAll(`#heart-${id}`);
  hearts.forEach((heart) => {
    const isFavorite = favorites.includes(id);
    heart.className = `${isFavorite ? "fas" : "far"} fa-heart`;
    heart.style.color = isFavorite ? "#ff4d4d" : "#fff";
  });

  // تحديث العداد (لو موجود عندك)
  if (typeof updateFavoriteCounter === "function") {
    updateFavoriteCounter();
  }
}

//  التحكم في واجهة المستخدم (UI Logic)

function resetPage() {
  activeFilters = {
    text: "",
    maxPrice: 10000,
    sortBy: "default",
    freeDelivery: false,
    openNow: false,
  };

  document.getElementById("homeContent")?.classList.remove("d-none");
  document.getElementById("searchLayout")?.classList.add("d-none");
  const searchInput = document.querySelector(".search-input");
  if (searchInput) searchInput.value = "";

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
  });

  const homeLink = document.getElementById("homeLink");
  if (homeLink) homeLink.classList.add("active");

  renderRestaurants();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleSearchLayout(searchTerm) {
  const homeContent = document.getElementById("homeContent");
  const searchLayout = document.getElementById("searchLayout");
  const resultsTitle = document.getElementById("searchResultsTitle");

  if (searchTerm.length > 0) {
    if (homeContent) homeContent.classList.add("d-none");
    if (searchLayout) searchLayout.classList.remove("d-none");
    if (resultsTitle) resultsTitle.textContent = `Results for "${searchTerm}"`;

    if (activeFilters.sortBy === "default") {
      const defaultBtn = document.querySelector('[data-sort="default"]');
      if (defaultBtn) defaultBtn.classList.add("active", "btn-warning");
    }
  } else {
    if (homeContent) homeContent.classList.remove("d-none");
    if (searchLayout) searchLayout.classList.add("d-none");
    renderRestaurants();
  }
}

// 5. ربط الأحداث (Event Listeners)

function setupEventListeners() {
  const searchInput = document.querySelector(".search-input");
  const priceSlider = document.getElementById("universalPriceRange");
  const priceLabel = document.getElementById("priceVal");
  const freeDeliveryCheck = document.getElementById("freeDeliveryOnly");
  const openNowSwitch = document.getElementById("openNow");
  const resetBtn = document.getElementById("resetAll");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      activeFilters.text = e.target.value;
      toggleSearchLayout(e.target.value);
      applyAllFilters();
    });
  }

  if (priceSlider) {
    priceSlider.addEventListener("input", (e) => {
      activeFilters.maxPrice = parseInt(e.target.value);
      if (priceLabel) priceLabel.textContent = `$${e.target.value}`;
      applyAllFilters();
    });
  }

  function syncSort(sortType) {
    activeFilters.sortBy = sortType;
    document.querySelectorAll(".filter-btn").forEach((b) => {
      b.classList.remove("active", "btn-warning");
      if (b.getAttribute("data-sort") === sortType)
        b.classList.add("active", "btn-warning");
    });
    document.querySelectorAll(".sort-link").forEach((b) => {
      b.classList.remove("active");
      if (b.getAttribute("data-sort") === sortType) b.classList.add("active");
    });
    applyAllFilters();
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn, .sort-link");
    if (btn && btn.getAttribute("data-sort")) {
      syncSort(btn.getAttribute("data-sort"));
    }
  });

  if (freeDeliveryCheck) {
    freeDeliveryCheck.addEventListener("change", (e) => {
      activeFilters.freeDelivery = e.target.checked;
      applyAllFilters();
    });
  }

  if (openNowSwitch) {
    openNowSwitch.addEventListener("change", (e) => {
      activeFilters.openNow = e.target.checked;
      applyAllFilters();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      activeFilters = {
        text: searchInput ? searchInput.value : "",
        maxPrice: 10000,
        sortBy: "default",
        freeDelivery: false,
        openNow: false,
      };
      if (priceSlider) priceSlider.value = 10000;
      if (priceLabel) priceLabel.textContent = "$10000";
      if (openNowSwitch) openNowSwitch.checked = false;
      if (freeDeliveryCheck) freeDeliveryCheck.checked = false;
      syncSort("default");
    });
  }
  const modalOverlay = document.getElementById("restaurantModal");
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        closeRestaurantModal();
      }
    });
  }
}

function renderRestaurants() {
  renderToContainer("restaurantsContainer", finalData);
}

document
  .querySelector(".subscribe-form button")
  .addEventListener("click", function () {
    const emailInput = document.querySelector(".subscribe-form input");
    const emailValue = emailInput.value.trim();

    if (emailValue === "" || !emailValue.includes("@")) {
      Swal.fire({
        title: "Wait!",
        text: "Please enter a valid email address.",
        icon: "warning",
        confirmButtonColor: "#ff7b00",

        background: "#23242a",
        color: "#fff",
        iconColor: "#ff7b00",
      });
      return;
    }

    Swal.fire({
      title: "Awesome!",
      text: "You've subscribed successfully. Check your inbox for treats!",
      icon: "success",
      confirmButtonColor: "#ff7b00",

      background: "#23242a",
      color: "#fff",
      iconColor: "#28a745",
    });
    emailInput.value = "";
  });
//////////////////////////
function showRestaurantDetails(restaurantId) {
  // 1. جلب المنتجات المضافة يدوياً من الـ LocalStorage
  const ownerProducts = JSON.parse(localStorage.getItem("allProducts")) || [];

  // 2. تجهيز مصفوفة شاملة (تجمع بين منتجات الملاك والمنتجات الأساسية)
  const allPossibleProducts = [...ownerProducts];

  // إضافة المنتجات الـ Default من مصفوفة البيانات الأساسية (restaurantsData)
  // ملاحظة: تأكد من وجود import { restaurantsData } في بداية ملفك
  restaurantsData.forEach((repo) => {
    if (repo.menu) {
      repo.menu.forEach((item) => {
        // نربط المنتج بالـ shopId الخاص بالمحل الأصلي لضمان الفلترة
        allPossibleProducts.push({ ...item, shopId: repo.id });
      });
    }
  });

  // 3. جلب بيانات المطعم نفسه لعرض الاسم، التقييم، والصورة
  const restaurant = finalData.find(
    (r) => String(r.id) === String(restaurantId),
  );

  if (!restaurant) {
    console.error("Restaurant not found in finalData!");
    return;
  }

  const modal = document.getElementById("restaurantModal");
  const detailsContainer = document.getElementById("modalDetails");
  const cartKey = getUserKey("userCart");
  const currentCart = JSON.parse(localStorage.getItem(cartKey)) || [];

  // 4. الفلترة: جلب كل المنتجات (Default + Owner) التي تنتمي لهذا المحل بالذات
  const shopMenu = allPossibleProducts.filter(
    (p) => String(p.shopId) === String(restaurantId),
  );

  // 5. بناء الـ HTML للمنيو مع الخصم الديناميكي وتنسيق السعر
  const menuHtml =
    shopMenu && shopMenu.length > 0
      ? shopMenu
          .map((item) => {
            let finalPrice = parseFloat(item.price);
            let priceDisplay = `<small class="text-warning">$${finalPrice.toFixed(2)}</small>`;

            // ✅ منطق الخصم المطور:
            // أولاً: نتحقق من وجود خصم خاص بالمنتج (الذي وضعه المالك)
            let discount = parseInt(item.discount) || 0;

            // ثانياً: إذا لم يوجد خصم للمنتج، نتحقق إذا كان المطعم نفسه عليه خصم Default (20%)
            if (discount === 0 && restaurant.hasDiscount) {
              discount = 20;
            }

            if (discount > 0) {
              // حساب السعر الجديد بناءً على نسبة الخصم (سواء كانت خاصة بالمنتج أو للمطعم ككل)
              finalPrice = (item.price - (item.price * discount) / 100).toFixed(
                2,
              );

              priceDisplay = `
                <small class="text-muted text-decoration-line-through me-1">$${parseFloat(item.price).toFixed(2)}</small>
                <small class="text-warning fw-bold">$${finalPrice}</small>
                <span class="badge bg-danger ms-1" style="font-size: 0.6rem; vertical-align: middle;">-${discount}%</span>
              `;
            }

            const itemQuantity = currentCart.filter(
              (c) => c.name === item.name,
            ).length;

            return `
              <div class="d-flex justify-content-between align-items-center p-3 mb-2" style="background: #2c2d35; border-radius: 12px;">
                  <div>
                      <h6 class="mb-0 text-white">${item.name}</h6>
                      ${priceDisplay}
                  </div>
                  <div class="d-flex align-items-center gap-2" style="background: #1a1b1f; border-radius: 10px; padding: 5px;">
                      <button class="btn btn-sm text-white p-0 px-2" onclick="removeFromCart(${restaurantId}, '${item.name}')">-</button>
                      <span class="text-white fw-bold" style="min-width: 20px; text-align: center;">${itemQuantity}</span>
                      <button class="btn btn-sm text-white p-0 px-2" onclick="addToCart(${restaurantId}, '${item.name}', ${finalPrice})">+</button>
                  </div>
              </div>`;
          })
          .join("")
      : '<p class="text-muted text-center py-4">Menu coming soon...</p>';

  // 6. حساب إجمالي السلة والتحقق من الحد الأدنى للطلب
  const itemsTotal = currentCart.reduce(
    (sum, item) => sum + parseFloat(item.price),
    0,
  );

  const minOrder = parseFloat(restaurant.minPrice) || 0;
  const isMinReached = itemsTotal >= minOrder;
  const remainingAmount = (minOrder - itemsTotal).toFixed(2);

  // 7. بناء واجهة المودال النهائية
  detailsContainer.innerHTML = `
        <div class="position-relative">
            <button class="btn-close-modal" onclick="closeRestaurantModal()">
                <i class="fas fa-times"></i>
            </button>
            <img src="${restaurant.image}" class="w-100 rounded-4 mb-3" style="height: 200px; object-fit: cover;">
        </div>
        <div class="px-2">
            <h3 class="text-white fw-bold mb-1">${restaurant.name}</h3>
            <div class="d-flex align-items-center gap-2 mb-2 text-muted" style="font-size: 0.9rem;">
                <span class="badge bg-success" style="background-color: #28a745 !important;">
                    <i class="fas fa-star"></i> ${restaurant.rating}
                </span>
                <span>•</span> <span>${restaurant.category}</span>
                <span>•</span> <span><i class="far fa-clock"></i> ${restaurant.deliveryTime}</span>
            </div>
            
            <h5 class="text-white mb-3">Popular Dishes</h5>
            <div class="menu-list" style="max-height: 250px; overflow-y: auto; padding-right: 5px;">
                ${menuHtml}
            </div>

            <div class="mt-4">
                ${
                  itemsTotal > 0 && !isMinReached
                    ? `<div class="alert alert-danger py-2 mb-3 text-center" style="background: rgba(220, 53, 69, 0.1); border: 1px solid #dc3545; color: #dc3545; border-radius: 10px; font-size: 0.85rem;">
                        <i class="fas fa-info-circle me-1"></i> Add <strong>$${remainingAmount}</strong> more to reach the minimum order.
                       </div>`
                    : ""
                }

                <button id="checkoutBtn" class="btn w-100 py-3 fw-bold" 
                        onclick="goToCheckout()" 
                        ${!isMinReached ? "disabled" : ""} 
                        style="background: ${isMinReached ? "linear-gradient(90deg, #ff7b00, #ff9500)" : "#444"}; 
                               border: none; color: white; border-radius: 12px; transition: 0.3s;
                               cursor: ${isMinReached ? "pointer" : "not-allowed"};">
                    ${
                      isMinReached
                        ? `PROCEED TO CHECKOUT ($${itemsTotal.toFixed(2)})`
                        : itemsTotal === 0
                          ? `Minimum Order: $${minOrder}`
                          : `Min. Order $${minOrder} required`
                    }
                </button>
            </div>
        </div>`;

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}
function closeRestaurantModal() {
  const modal = document.getElementById("restaurantModal");

  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

function updateCartCounter() {
  const cartCountEl = document.getElementById("cartCount");
  const cartKey = getUserKey("userCart");
  const cart = JSON.parse(localStorage.getItem(cartKey)) || [];

  if (cartCountEl) {
    if (cart.length > 0) {
      cartCountEl.textContent = cart.length;
      cartCountEl.style.display = "block";
    } else {
      cartCountEl.style.display = "none";
    }
  }
}

function checkAuth(actionName) {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    Swal.fire({
      title: "Join FoodExpress!",
      text: `You need to login to ${actionName}!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sign In",
      confirmButtonColor: "#ff7b00",
      cancelButtonColor: "#23242a",
      background: "#1a1b20",
      color: "#fff",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = "login.html";
      }
    });
    return false;
  }
  return true;
}

function addToCart(restaurantId, itemName, itemPrice) {
  // 1. 🛡️ الحارس: منع الإضافة لو المستخدم مش مسجل
  if (!checkAuth("start adding delicious meals to your cart")) return;
  const cartKey = getUserKey("userCart");

  let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

  cart.push({
    restaurantId,
    name: itemName,
    price: Number(itemPrice),
    id: Date.now(),
  });

  localStorage.setItem(cartKey, JSON.stringify(cart));

  if (typeof updateCartCounter === "function") {
    updateCartCounter();
  }

  if (typeof showRestaurantDetails === "function") {
    showRestaurantDetails(restaurantId);
  }

  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    const newTotal = cart.reduce((sum, item) => sum + item.price, 0);
    checkoutBtn.textContent = `PROCEED TO CHECKOUT ($${newTotal.toFixed(2)})`;
  }

  // 7. ✨ إشعار نجاح (Toast)
  Swal.fire({
    title: "Added!",
    text: `${itemName} added to cart`,
    toast: true,
    position: "top-end",
    timer: 1500,
    showConfirmButton: false,
    icon: "success",
    background: "#23242a",
    color: "#fff",
    iconColor: "#28a745",
  });
}
function removeFromCart(restaurantId, itemName) {
  const cartKey = getUserKey("userCart");
  let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
  const index = cart.findIndex((item) => item.name === itemName);

  if (index > -1) {
    cart.splice(index, 1);
    localStorage.setItem(cartKey, JSON.stringify(cart));
    updateCartCounter();
    showRestaurantDetails(restaurantId);
    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
      const newTotal = cart.reduce((sum, item) => sum + item.price, 0);
      checkoutBtn.textContent = `PROCEED TO CHECKOUT ($${newTotal.toFixed(2)})`;
    }

    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 1000,
    });
    Toast.fire({
      icon: "info",
      title: "Removed from cart",
      background: "#23242a",
      color: "#fff",
      iconColor: "#ff7b00",
    });
  }
}

function goToCheckout() {
  const cartKey = getUserKey("userCart");
  const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
  if (cart.length === 0) {
    Swal.fire({
      icon: "info",
      title: "Your cart is empty",
      text: "Add some delicious food before checking out!",
      confirmButtonColor: "#ff7b00",
      background: "#23242a",
      color: "#fff",
      iconColor: "#ff7b00",
    });
  } else {
    window.location.href = "checkout.html";
  }
}

function filterByCategory(categoryName) {
  activeFilters.text = categoryName;

  const searchInput = document.querySelector(".search-input");
  if (searchInput) searchInput.value = categoryName;

  toggleSearchLayout(categoryName);

  applyAllFilters();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

window.filterByCategory = filterByCategory;

// ==========================================
// 6. تشغيل النظام (The Main Initialization)
// ==========================================
window.addEventListener("load", () => {
  loadUserLocation();
  showUserProfile();
  renderOffers();
  renderRestaurants();
  updateLocationDisplay();
  setupEventListeners();
  setupMapModalListeners();
  setupSearchListener();
  updateCartCounter();
});

function logout(e) {
  e.preventDefault();

  Swal.fire({
    title: "Are you sure?",
    text: "You will be signed out of your account!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ff7b00",
    cancelButtonColor: "#333",
    confirmButtonText: "Yes, Logout!",

    background: "#23242a",
    color: "#fff",
    iconColor: "#ff7b00",
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("currentUser");

      window.location.href = "../html/Login.html";
    }
  });
}

// ==========================================
// Global Exports (مرة واحدة فقط)
// ==========================================
Object.assign(window, {
  protectedRedirect,
  slideOffers,
  handleOfferClick,
  showRestaurantDetails,
  closeRestaurantModal,
  addToCart,
  removeFromCart,
  updateCartCounter,
  goToCheckout,
  logout,
  openMapModal,
  closeMapModal,
  resetPage,
  showReviews,
  getRestaurantRating,
  toggleFavorite,
  updateFavoriteCounter,
});
window.addEventListener("load", () => {
  updateFavoriteCounter();
  updateCartCounter();
});
