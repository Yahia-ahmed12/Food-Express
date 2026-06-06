function getUserKey(prefix) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  return user ? `${prefix}_${user.email}` : prefix;
}

function loadProfileData() {
  const user = JSON.parse(localStorage.getItem("currentUser"));

  if (!user || user.role !== "customer") {
    console.warn("Access denied: currentUser is not a customer.");

    return;
  }

  const locationKey = getUserKey("userLocation");
  const location = JSON.parse(localStorage.getItem(locationKey));

  if (user) {
    const displayUser = document.getElementById("displayUserName");
    const displayEmail = document.getElementById("displayEmail");
    const editName = document.getElementById("editName");
    const editPhone = document.getElementById("editPhone");
    const editEmail = document.getElementById("editEmail");

    if (displayUser) displayUser.textContent = user.username || "Guest";
    if (displayEmail)
      displayEmail.textContent = user.email || "No email registered";

    if (editName) editName.value = user.username || "";
    if (editPhone) editPhone.value = user.phone || "";
    if (editEmail) editEmail.value = user.email || "";

    updateImagePreview(user);
  }

  if (location) {
    const addressInput = document.getElementById("editAddress");
    if (addressInput) {
      addressInput.value = location.address || "Address not set yet";
    }
  }
}

function updateImagePreview(user) {
  const profileImg = document.getElementById("profileImgPreview");

  if (user.image) {
    profileImg.src = user.image;
  } else {
    profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.username,
    )}&background=ff7b00&color=fff&bold=true`;
  }
}

const imgUpload = document.getElementById("imgUpload");

if (imgUpload) {
  imgUpload.addEventListener("change", function (e) {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = function (event) {
        const base64Image = event.target.result;

        document.getElementById("profileImgPreview").src = base64Image;

        let user = JSON.parse(localStorage.getItem("currentUser"));
        user.image = base64Image;

        localStorage.setItem("currentUser", JSON.stringify(user));

        updateAllUsers(user);
      };

      reader.readAsDataURL(file);
    }
  });
}

window.removeProfileImage = function () {
  let user = JSON.parse(localStorage.getItem("currentUser"));

  if (!user.image) {
    Swal.fire({
      icon: "info",
      title: "No photo to remove",
      background: "#23242a",
      color: "#fff",
      timer: 1500,
      showConfirmButton: false,
    });
    return;
  }

  Swal.fire({
    title: "Remove profile photo?",
    text: "Your photo will be replaced by a default avatar.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ff4d4d",
    cancelButtonColor: "#333",
    confirmButtonText: "Yes, remove it!",
    background: "#23242a",
    color: "#fff",
  }).then((result) => {
    if (result.isConfirmed) {
      user.image = null;

      localStorage.setItem("currentUser", JSON.stringify(user));

      updateAllUsers(user);

      updateImagePreview(user);

      Swal.fire({
        title: "Removed!",
        text: "Your profile photo has been reset.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: "#23242a",
        color: "#fff",
      });
    }
  });
};

const profileForm = document.getElementById("profileForm");

if (profileForm) {
  profileForm.addEventListener("submit", function (e) {
    e.preventDefault();

    let oldUser = JSON.parse(localStorage.getItem("currentUser"));
    let updatedUser = { ...oldUser };

    updatedUser.username = document.getElementById("editName").value.trim();
    updatedUser.phone = document.getElementById("editPhone").value.trim();

    const emailInput = document.getElementById("editEmail");

    if (emailInput) {
      updatedUser.email = emailInput.value.trim();
    }

    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    updateAllUsers(updatedUser, oldUser.email);

    Swal.fire({
      icon: "success",
      title: "Profile Updated!",
      text: "Your information has been synced successfully.",
      timer: 1500,
      showConfirmButton: false,
      background: "#23242a",
      color: "#fff",
      iconColor: "#28a745",
    });

    document.getElementById("displayUserName").textContent =
      updatedUser.username;
    document.getElementById("displayEmail").textContent = updatedUser.email;

    if (!updatedUser.image) updateImagePreview(updatedUser);
  });
}

function updateAllUsers(updatedUser, oldEmail) {
  let roleKey = "";

  if (updatedUser.role === "owner") roleKey = "owners";
  else if (updatedUser.role === "customer") roleKey = "customers";
  else if (updatedUser.role === "driver") roleKey = "drivers";

  if (!roleKey) return;

  let usersList = JSON.parse(localStorage.getItem(roleKey)) || [];

  const index = usersList.findIndex(
    (u) =>
      (updatedUser.id && u.id === updatedUser.id) ||
      u.email === (oldEmail || updatedUser.email),
  );

  if (index !== -1) {
    usersList[index] = updatedUser;
    localStorage.setItem(roleKey, JSON.stringify(usersList));
  }

  localStorage.setItem("currentUser", JSON.stringify(updatedUser));
}

document.addEventListener("DOMContentLoaded", loadProfileData);
