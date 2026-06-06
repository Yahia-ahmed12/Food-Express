const urlParams = new URLSearchParams(window.location.search);
const shopId = urlParams.get("id");

if (!shopId) {
  window.location.href = "my-shops.html";
}

document.getElementById("prodImg").addEventListener("input", function (e) {
  const previewDiv = document.getElementById("imgPreview");
  const previewImg = previewDiv.querySelector("img");
  const url = e.target.value.trim();

  if (url) {
    previewImg.src = url;
    previewDiv.classList.remove("d-none");
  } else {
    previewDiv.classList.add("d-none");
  }
});

document
  .getElementById("addProductForm")
  ?.addEventListener("submit", function (e) {
    e.preventDefault();

    const newProduct = {
      id: Date.now(),
      shopId: shopId,
      name: document.getElementById("prodName").value.trim(),
      price: parseFloat(document.getElementById("prodPrice").value),

      discount: parseInt(document.getElementById("prodDiscount").value) || 0,

      category: document.getElementById("prodCategory").value,
      quantity: parseInt(document.getElementById("prodQty").value),
      description: document.getElementById("prodDesc").value.trim(),
      image:
        document.getElementById("prodImg").value.trim() ||
        "../../images/default-food.png",
    };

    saveProductData(newProduct);
  });

function saveProductData(product) {
  let allProducts = JSON.parse(localStorage.getItem("allProducts")) || [];
  allProducts.push(product);
  localStorage.setItem("allProducts", JSON.stringify(allProducts));

  Swal.fire({
    title: "Product Added! 🍔",
    text: "Your delicious item is now in the shop menu.",
    icon: "success",
    background: "#23242a",
    color: "#fff",
    confirmButtonColor: "#ff7b00",
  }).then(() => {
    window.location.href = `manage-products.html?id=${shopId}`;
  });
}
