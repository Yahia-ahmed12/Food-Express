document
  .getElementById("addShopForm")
  ?.addEventListener("submit", function (e) {
    e.preventDefault();

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    const name = document.getElementById("shopName").value.trim();
    const category = document.getElementById("shopCategory").value;
    const deliveryTime = document.getElementById("shopTime").value.trim();
    const deliveryFee = document.getElementById("shopFee").value.trim();

    const minPrice =
      document.getElementById("shopMinPrice")?.value.trim() || "0";

    const city = document.getElementById("shopCity").value;
    const description = document.getElementById("shopDesc").value.trim();
    const address = document.getElementById("shopAddress").value.trim();
    const image =
      document.getElementById("shopImg").value.trim() ||
      "../../images/default-shop.png";

    const newShop = {
      id: Date.now(),
      ownerEmail: currentUser?.email || "Guest",
      name: name,
      category: category,
      deliveryTime: deliveryTime,
      deliveryFee: deliveryFee,

      minPrice: minPrice,

      city: city,
      description: description,
      address: address,
      image: image,

      rating: "5.0",
      reviews: [],
      createdAt: new Date().toISOString(),
    };

    let allShops = JSON.parse(localStorage.getItem("allShops")) || [];
    allShops.push(newShop);

    localStorage.setItem("allShops", JSON.stringify(allShops));

    Swal.fire({
      title: "Shop Created! 🎉",
      text: "Your shop is now live and ready for customers.",
      icon: "success",
      background: "#23242a",
      color: "#fff",
      confirmButtonColor: "#ff7b00",
      iconColor: "#ff7b00",
    }).then(() => {
      window.location.href = "my-shops.html";
    });
  });
