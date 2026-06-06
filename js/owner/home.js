document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser || currentUser.role !== "owner") {
    window.location.href = "../login.html";
    return;
  }

  const ownerNameElement = document.getElementById("ownerName");
  if (ownerNameElement) {
    ownerNameElement.textContent = currentUser.username || "Owner";
  }

  const navOwnerName = document.getElementById("navOwnerName");
  if (navOwnerName) {
    navOwnerName.textContent = currentUser.username || "Owner";
  }

  const navProfileImg = document.getElementById("navProfileImg");
  if (navProfileImg) {
    navProfileImg.src = currentUser.image || "../../images/default-avatar.png";
  }

  const allShops = JSON.parse(localStorage.getItem("allShops")) || [];
  const allProducts = JSON.parse(localStorage.getItem("allProducts")) || [];
  const allOrders = JSON.parse(localStorage.getItem("allOrders")) || [];
  const allOffers = JSON.parse(localStorage.getItem("allOffers")) || [];

  const myShops = allShops.filter(
    (shop) => shop.ownerEmail === currentUser.email,
  );

  const myShopIds = myShops.map((s) => String(s.id));

  const myProducts = allProducts.filter((p) =>
    myShopIds.includes(String(p.shopId)),
  );

  const myNewOrders = allOrders.filter(
    (order) =>
      myShopIds.includes(String(order.shopId)) && order.status === "pending",
  );

  const myOffers = allOffers.filter(
    (offer) => offer.ownerEmail === currentUser.email,
  );

  if (document.getElementById("totalShops"))
    document.getElementById("totalShops").textContent = myShops.length;

  if (document.getElementById("totalProducts"))
    document.getElementById("totalProducts").textContent = myProducts.length;

  if (document.getElementById("totalOrders"))
    document.getElementById("totalOrders").textContent = myNewOrders.length;

  if (document.getElementById("totalOffers"))
    document.getElementById("totalOffers").textContent = myOffers.length;
});

window.logout = () => {
  Swal.fire({
    title: "Logout?",
    text: "Are you sure you want to leave the dashboard?",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#ff7b00",
    cancelButtonColor: "#34353c",
    confirmButtonText: "Yes, Logout",
    cancelButtonText: "Cancel",
    background: "#23242a",
    color: "#fff",
    iconColor: "#ff7b00",
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("currentUser");
      Swal.fire({
        title: "Logged Out!",
        text: "See you soon!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: "#23242a",
        color: "#fff",
      }).then(() => {
        window.location.href = "../login.html";
      });
    }
  });
};
