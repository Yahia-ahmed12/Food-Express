const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser || currentUser.role !== "owner") {
  window.location.href = "../login.html";
}

function renderMyShops() {
  const container = document.getElementById("shopsContainer");
  const noShopsDiv = document.getElementById("noShops");

  if (!container) return;

  const allShops = JSON.parse(localStorage.getItem("allShops")) || [];

  const myShops = allShops.filter(
    (shop) => shop.ownerEmail === currentUser?.email,
  );

  if (myShops.length === 0) {
    if (noShopsDiv) noShopsDiv.style.display = "block";
    container.innerHTML = "";
    return;
  }

  if (noShopsDiv) noShopsDiv.style.display = "none";

  container.innerHTML = myShops
    .map(
      (shop) => `
        <div class="col-md-6 col-lg-4">
            <div class="shop-card shadow-lg">
                <div class="shop-img-wrapper" style="position: relative; height: 200px; overflow: hidden; border-radius: 15px 15px 0 0;">
                    <img src="${shop.image}" class="shop-img w-100 h-100" style="object-fit: cover;" onerror="this.src='../../images/default-shop.png'">
                    <span class="badge bg-warning text-dark position-absolute" style="top: 10px; right: 10px;">${shop.category}</span>
                </div>
                <div class="p-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5 class="fw-bold mb-0 text-white text-truncate" style="max-width: 70%;">${shop.name}</h5>
                        <small class="text-white-50"><i class="fas fa-city me-1"></i>${shop.city}</small>
                    </div>
                    <p class="text-white-50 small mb-3 text-truncate" style="max-height: 40px;">${shop.description || "No description provided."}</p>
                    
                    <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary">
                        <button class="btn btn-sm btn-outline-warning px-3 fw-bold" onclick="location.href='manage-products.html?id=${shop.id}'">
                             Products
                        </button>
                        
                        <div class="d-flex gap-2">
                            <button class="btn-action btn-edit" onclick="location.href='update-shop.html?id=${shop.id}'" title="Edit Shop">
                                <i class="fas fa-edit"></i>
                            </button>
                            
                            <button class="btn-action btn-delete" onclick="deleteShop(${shop.id})" title="Delete Shop">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    )
    .join("");
}

window.deleteShop = (id) => {
  Swal.fire({
    title: "Delete Shop?",
    text: "This action cannot be undone!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, delete it!",
    background: "#23242a",
    color: "#fff",
    iconColor: "#dc3545",
  }).then((result) => {
    if (result.isConfirmed) {
      let allShops = JSON.parse(localStorage.getItem("allShops")) || [];
      allShops = allShops.filter((s) => s.id !== id);
      localStorage.setItem("allShops", JSON.stringify(allShops));

      Swal.fire({
        title: "Deleted!",
        text: "Your shop has been removed.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: "#23242a",
        color: "#fff",
      });

      renderMyShops();
    }
  });
};

document.addEventListener("DOMContentLoaded", renderMyShops);
