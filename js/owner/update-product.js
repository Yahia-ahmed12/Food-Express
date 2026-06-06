const urlParams = new URLSearchParams(window.location.search);
const productId = parseInt(urlParams.get("id"));
const shopId = urlParams.get("shopId");

let allProducts = JSON.parse(localStorage.getItem("allProducts")) || [];
const productToUpdate = allProducts.find((p) => p.id === productId);

if (!productToUpdate) {
  window.location.href = `manage-products.html?id=${shopId}`;
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("prodName").value = productToUpdate.name;
  document.getElementById("prodPrice").value = productToUpdate.price;
  document.getElementById("prodCategory").value = productToUpdate.category;
  document.getElementById("prodQty").value = productToUpdate.quantity || 0;
  document.getElementById("prodDesc").value = productToUpdate.description || "";
  document.getElementById("prodImg").value = productToUpdate.image || "";

  document.getElementById("prodDiscount").value = productToUpdate.discount || 0;

  if (productToUpdate.image) {
    document.getElementById("currentProdPreview").src = productToUpdate.image;
  }
});

document.getElementById("prodImg").addEventListener("input", (e) => {
  const url = e.target.value.trim();
  if (url) {
    document.getElementById("currentProdPreview").src = url;
  }
});

document.getElementById("updateProductForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const index = allProducts.findIndex((p) => p.id === productId);

  if (index !== -1) {
    allProducts[index] = {
      ...allProducts[index],
      name: document.getElementById("prodName").value.trim(),
      price: parseFloat(document.getElementById("prodPrice").value),
      category: document.getElementById("prodCategory").value,
      quantity: parseInt(document.getElementById("prodQty").value),
      description: document.getElementById("prodDesc").value.trim(),
      image: document.getElementById("prodImg").value.trim(),

      discount: parseInt(document.getElementById("prodDiscount").value) || 0,
    };

    localStorage.setItem("allProducts", JSON.stringify(allProducts));

    Swal.fire({
      title: "Updated Successfully!",
      text: "Product details and discounts have been synced.",
      icon: "success",
      background: "#23242a",
      color: "#fff",
      confirmButtonColor: "#ff7b00",
    }).then(() => {
      window.location.href = `manage-products.html?id=${shopId}`;
    });
  }
});
