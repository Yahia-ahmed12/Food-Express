const urlParams = new URLSearchParams(window.location.search);
const shopId = urlParams.get("id");

if (!shopId) {
  window.location.href = "my-shops.html";
}

document.getElementById("addBtn").addEventListener("click", () => {
  window.location.href = `add-product.html?id=${shopId}`;
});

function renderMenu() {
  const container = document.getElementById("productsContainer");
  const noProductsDiv = document.getElementById("noProducts");
  const allProducts = JSON.parse(localStorage.getItem("allProducts")) || [];

  const shopProducts = allProducts.filter(
    (p) => String(p.shopId) === String(shopId),
  );

  if (shopProducts.length > 0) {
    noProductsDiv.style.display = "none";
    container.innerHTML = shopProducts
      .map(
        (p) => `
            <div class="col-sm-6 col-md-4 col-lg-3 mb-4">
                <div class="card-product shadow-sm">
                    <div class="product-img-wrapper" style="height: 140px;">
                        <img src="${p.image}" class="product-img" onerror="this.src='../../images/default-food.png'">
                        <span class="category-badge" style="font-size: 0.6rem; padding: 3px 10px;">${p.category}</span>
                    </div>
                    <div class="p-3">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="fw-bold text-white mb-0 text-truncate" style="max-width: 70%;" title="${p.name}">${p.name}</h6>
                            <span class="text-warning fw-bold small">$${parseFloat(p.price).toFixed(2)}</span>
                        </div>
                        
                        <div class="action-buttons d-flex gap-2 mt-2" style="border-top: none; padding-top: 0;">
                            <button class="btn-action btn-edit-prod flex-grow-1 py-1" onclick="location.href='update-product.html?id=${p.id}&shopId=${shopId}'" style="font-size: 0.8rem;">
                                <i class="fas fa-edit"></i>
                            </button>
                            
                            <button class="btn-action btn-delete-prod py-1" onclick="deleteProduct(${p.id})" style="width: 35px; font-size: 0.8rem;">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `,
      )
      .join("");
  } else {
    container.innerHTML = "";
    noProductsDiv.style.display = "block";
  }
}

window.deleteProduct = (id) => {
  Swal.fire({
    title: "Are you sure?",
    text: "This product will be removed from your menu!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Yes, delete it!",
    background: "#23242a",
    color: "#fff",
  }).then((result) => {
    if (result.isConfirmed) {
      let allProducts = JSON.parse(localStorage.getItem("allProducts")) || [];
      allProducts = allProducts.filter((p) => p.id !== id);
      localStorage.setItem("allProducts", JSON.stringify(allProducts));

      renderMenu();

      Swal.fire({
        title: "Deleted!",
        icon: "success",
        background: "#23242a",
        color: "#fff",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  });
};

renderMenu();
