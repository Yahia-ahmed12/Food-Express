document
  .getElementById("addOfferForm")
  ?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const fileInput = document.getElementById("offerFile");
    const title = document.getElementById("offerTitle").value.trim();
    const subtitle = document.getElementById("offerSubtitle").value.trim();
    const searchTerm = document.getElementById("offerSearchTerm").value;

    const getBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    };

    let imageData = "";

    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];

      if (file.size > 1024 * 1024) {
        Swal.fire({
          title: "Image too large!",
          text: "Please upload an image smaller than 1MB",
          icon: "warning",
          background: "#23242a",
          color: "#fff",
        });
        return;
      }

      try {
        imageData = await getBase64(file);
      } catch (err) {
        console.error("Base64 Error:", err);
        return;
      }
    } else {
      Swal.fire({
        title: "Image Required",
        text: "Please upload a banner image for your offer.",
        icon: "info",
        background: "#23242a",
        color: "#fff",
      });
      return;
    }

    const newOffer = {
      id: Date.now(),
      ownerEmail: currentUser?.email || "Guest",
      title: title,
      subtitle: subtitle,
      type: "discount",
      searchTerm: searchTerm,
      image: imageData,
      createdAt: new Date().toISOString(),
    };

    try {
      let allOffers = JSON.parse(localStorage.getItem("allOffers")) || [];

      allOffers.unshift(newOffer);

      localStorage.setItem("allOffers", JSON.stringify(allOffers));

      Swal.fire({
        title: "Offer Published! 🚀",
        text: "Your promotion is now visible and you can manage it from your dashboard.",
        icon: "success",
        background: "#23242a",
        color: "#fff",
        confirmButtonColor: "#ff7b00",
      }).then(() => {
        window.location.href = "manage-offers.html";
      });
    } catch (error) {
      console.error("Storage Error:", error);
      Swal.fire({
        title: "Storage Full!",
        text: "Could not save offer. Try using a smaller image or clear some browser data.",
        icon: "error",
        background: "#23242a",
        color: "#fff",
      });
    }
  });
