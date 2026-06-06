document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const allOwners = JSON.parse(localStorage.getItem("owners")) || [];

  const nameInput = document.getElementById("editOwnerName");
  const previewImg = document.getElementById("settingsImgPreview");
  const initialsSpan = document.getElementById("avatarInitials");
  const profileForm = document.getElementById("profileUpdateForm");
  const passwordForm = document.getElementById("passwordUpdateForm");

  if (!currentUser) {
    window.location.href = "../login.html";
    return;
  }

  function setInitials(name) {
    if (!name || !initialsSpan) return;
    const parts = name.trim().split(" ");
    let initials = parts[0].charAt(0).toUpperCase();
    if (parts.length > 1) {
      initials += parts[parts.length - 1].charAt(0).toUpperCase();
    }
    initialsSpan.innerText = initials;
  }

  if (nameInput) {
    nameInput.value = currentUser.username || "";
    setInitials(currentUser.username);
  }

  if (currentUser.image) {
    previewImg.src = currentUser.image;
    previewImg.classList.remove("d-none");
    initialsSpan.classList.add("d-none");
  }

  document
    .getElementById("ownerFileSubmit")
    ?.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imgData = event.target.result;
          previewImg.src = imgData;
          previewImg.classList.remove("d-none");
          initialsSpan.classList.add("d-none");

          previewImg.dataset.newImg = imgData;
        };
        reader.readAsDataURL(file);
      }
    });

  document.getElementById("removePhotoBtn")?.addEventListener("click", () => {
    previewImg.src = "";
    previewImg.classList.add("d-none");
    initialsSpan.classList.remove("d-none");
    previewImg.dataset.newImg = "";
    setInitials(nameInput.value);
  });

  profileForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const updatedName = nameInput.value.trim();
    let updatedImg =
      previewImg.dataset.newImg !== undefined
        ? previewImg.dataset.newImg
        : currentUser.image || "";

    if (previewImg.classList.contains("d-none")) {
      updatedImg = "";
    }

    const ownerIndex = allOwners.findIndex(
      (u) => u.email.toLowerCase() === currentUser.email.toLowerCase(),
    );
    if (ownerIndex !== -1) {
      allOwners[ownerIndex].username = updatedName;
      allOwners[ownerIndex].image = updatedImg;

      allOwners[ownerIndex].role = "owner";

      currentUser.username = updatedName;
      currentUser.image = updatedImg;

      localStorage.setItem("owners", JSON.stringify(allOwners));
      localStorage.setItem("currentUser", JSON.stringify(currentUser));

      Swal.fire({
        title: "Profile Updated!",
        text: "Changes saved successfully.",
        icon: "success",
        background: "#23242a",
        color: "#fff",
        confirmButtonColor: "#ff7b00",
      }).then(() => {
        window.location.href = "../../index.html";
      });
    } else {
      allOwners.push({
        ...currentUser,
        username: updatedName,
        image: updatedImg,
        role: "owner",
      });
      localStorage.setItem("owners", JSON.stringify(allOwners));
      localStorage.setItem("currentUser", JSON.stringify(currentUser));

      Swal.fire({
        title: "Saved!",
        text: "Account synced and profile updated.",
        icon: "success",
        background: "#23242a",
        color: "#fff",
        confirmButtonColor: "#ff7b00",
      }).then(() => {
        window.location.href = "index.html";
      });
    }
  });

  passwordForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const currentPass = document.getElementById("currentPass").value;
    const newPass = document.getElementById("newPass").value;
    const confirmPass = document.getElementById("confirmPass").value;

    if (currentPass !== currentUser.password) {
      return Swal.fire("Error", "Current password is wrong", "error");
    }

    if (newPass !== confirmPass) {
      return Swal.fire("Error", "New passwords don't match", "error");
    }

    const ownerIndex = allOwners.findIndex(
      (u) => u.email.toLowerCase() === currentUser.email.toLowerCase(),
    );

    if (ownerIndex !== -1) {
      allOwners[ownerIndex].password = newPass;
      currentUser.password = newPass;

      localStorage.setItem("owners", JSON.stringify(allOwners));
      localStorage.setItem("currentUser", JSON.stringify(currentUser));

      Swal.fire({
        title: "Success",
        text: "Password Updated Successfully!",
        icon: "success",
        background: "#23242a",
        color: "#fff",
        confirmButtonColor: "#ff7b00",
      });
      passwordForm.reset();
    }
  });
});
