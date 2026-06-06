window.logout = function (event) {
  if (event) event.preventDefault();

  Swal.fire({
    title: "Are you sure?",
    text: "You will be signed out of your account!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ff7b00",
    cancelButtonColor: "#333",
    confirmButtonText: "Yes, Logout!",
    background: "#23242a",
    color: "#fff",
    iconColor: "#ff7b00",
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("currentUser");
      window.location.href = "../html/Login.html";
    }
  });
};

/**
 دالة تحديث الـ Navbar بالبيانات الديناميكية
 */
function updateNavbar() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const nameEl = document.getElementById("navUserName");
  const imgEl = document.getElementById("navUserImg");
  const profileDiv = document.querySelector(".profile");
  const userDiv = document.querySelector(".user");

  if (user) {
    if (nameEl) nameEl.textContent = user.username || user.name;

    if (imgEl) {
      if (user.image) {
        imgEl.src = user.image;
      } else {
        imgEl.src = `https://ui-avatars.com/api/?name=${user.username || user.name}&background=ff7b00&color=fff&bold=true`;
      }
    }
    if (profileDiv) profileDiv.classList.remove("d-none");
    if (userDiv) userDiv.classList.add("d-none");
  } else {
    if (profileDiv) profileDiv.classList.add("d-none");
    if (userDiv) userDiv.classList.remove("d-none");
  }
}

document.addEventListener("DOMContentLoaded", updateNavbar);
