let emailInput = document.querySelector("#email");
let passwordInput = document.querySelector("#password");
let remember = document.querySelector("#remember");
let loginSubmit = document.querySelector("#loginSubmit");

let emailError = document.querySelector("#emailError");
let passwordError = document.querySelector("#passwordError");

emailInput.addEventListener("input", () => (emailError.textContent = ""));
passwordInput.addEventListener("input", () => (passwordError.textContent = ""));

loginSubmit.addEventListener("click", function (e) {
  e.preventDefault();

  let email = emailInput.value.trim().toLowerCase();
  let password = passwordInput.value.trim();

  emailError.textContent = "";
  passwordError.textContent = "";

  if (!email) {
    emailError.textContent = "Please enter your email";
    emailInput.focus();
    return;
  }

  if (!password) {
    passwordError.textContent = "Please enter your password";
    passwordInput.focus();
    return;
  }

  loginSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
  loginSubmit.disabled = true;

  setTimeout(() => {
    let owners = JSON.parse(localStorage.getItem("owners")) || [];
    let customers = JSON.parse(localStorage.getItem("customers")) || [];
    let drivers = JSON.parse(localStorage.getItem("drivers")) || [];

    let user = null;
    let userRole = "";

    user = owners.find((u) => u.email.toLowerCase() === email);
    if (user) {
      userRole = "owner";
    } else {
      user = customers.find((u) => u.email.toLowerCase() === email);
      if (user) {
        userRole = "customer";
      } else {
        user = drivers.find((u) => u.email.toLowerCase() === email);
        if (user) userRole = "driver";
      }
    }

    if (!user) {
      emailError.textContent = "Email not registered";
      emailInput.focus();
      resetButton();
      return;
    }

    if (user.password !== password) {
      passwordError.textContent = "Incorrect password";
      passwordInput.focus();
      resetButton();
      return;
    }

    let currentUser = {
      ...user,
      role: userRole,
      username: user.username || user.name,
      image: user.image || user.profileImg || null,
    };

    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    if (remember.checked) {
      localStorage.setItem("rememberedEmail", email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    Swal.fire({
      title: `Welcome, ${currentUser.username}!`,
      text: `Logged in as ${userRole.toUpperCase()}`,
      icon: "success",
      confirmButtonColor: "#ff7b00",
      timer: 1500,
      showConfirmButton: false,
      background: "#23242a",
      color: "#fff",
      iconColor: "#ff7b00",
    }).then(() => {
      if (userRole === "owner") {
        window.location.href = "../html/owner/home.html";
      } else if (userRole === "customer") {
        window.location.href = "dashboard.html";
      } else if (userRole === "driver") {
        window.location.href = "../html/driver/orders.html";
      }
    });
  }, 1000);
});

function resetButton() {
  loginSubmit.innerHTML = "Sign In";
  loginSubmit.disabled = false;
}

window.addEventListener("load", function () {
  let rememberedEmail = localStorage.getItem("rememberedEmail");
  if (rememberedEmail && emailInput) {
    emailInput.value = rememberedEmail;
    if (remember) remember.checked = true;
  }
});
