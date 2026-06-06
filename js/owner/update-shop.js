const urlParams = new URLSearchParams(window.location.search);
const shopId = parseInt(urlParams.get("id"));

let allShops = JSON.parse(localStorage.getItem("allShops")) || [];
const shopToUpdate = allShops.find((s) => s.id === shopId);

if (!shopToUpdate) {
  window.location.href = "my-shops.html";
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("shopName").value = shopToUpdate.name;
  document.getElementById("shopCategory").value = shopToUpdate.category;
  document.getElementById("shopCity").value = shopToUpdate.city;
  document.getElementById("shopDesc").value = shopToUpdate.description;
  document.getElementById("shopAddress").value = shopToUpdate.address;
  document.getElementById("shopImg").value = shopToUpdate.image;
  document.getElementById("currentPreview").src =
    shopToUpdate.image || "../../images/default-shop.png";
});

document.getElementById("shopImg").addEventListener("input", (e) => {
  document.getElementById("currentPreview").src = e.target.value;
});

document.getElementById("updateShopForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const index = allShops.findIndex((s) => s.id === shopId);

  if (index !== -1) {
    allShops[index] = {
      ...allShops[index],
      name: document.getElementById("shopName").value.trim(),
      category: document.getElementById("shopCategory").value,
      city: document.getElementById("shopCity").value,
      description: document.getElementById("shopDesc").value.trim(),
      address: document.getElementById("shopAddress").value.trim(),
      image: document.getElementById("shopImg").value.trim(),
    };

    localStorage.setItem("allShops", JSON.stringify(allShops));

    Swal.fire({
      title: "Success!",
      text: "Shop updated successfully",
      icon: "success",
      background: "#23242a",
      color: "#fff",
      confirmButtonColor: "#ff7b00",
    }).then(() => {
      window.location.href = "my-shops.html";
    });
  }
});
