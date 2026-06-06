let username = document.querySelector("#username");
let email = document.querySelector("#email");
let phone = document.querySelector("#phone");
let city = document.querySelector("#city");
let contract = document.querySelector("#contract");
let password = document.querySelector("#password");
let confirmPassword = document.querySelector("#confirmPassword");
let ownerSubmit = document.querySelector("#ownerSubmit");

let usernameError = document.querySelector("#usernameError");
let emailError = document.querySelector("#emailError");
let phoneError = document.querySelector("#phoneError");
let cityError = document.querySelector("#cityError");
let contractError = document.querySelector("#contractError");
let passwordError = document.querySelector("#passwordError");
let confirmPasswordError = document.querySelector("#confirmPasswordError");

username.addEventListener("input", () => {
  usernameError.textContent = "";
});
email.addEventListener("input", () => {
  emailError.textContent = "";
});
phone.addEventListener("input", () => {
  phoneError.textContent = "";
});
city.addEventListener("input", () => {
  cityError.textContent = "";
});
contract.addEventListener("change", () => {
  contractError.textContent = "";
});
password.addEventListener("input", () => {
  passwordError.textContent = "";
});
confirmPassword.addEventListener("input", () => {
  confirmPasswordError.textContent = "";
});

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidEgyptianPhone(phone) {
  const phoneRegex = /^(010|011|012|015)\d{8}$/;
  return phoneRegex.test(phone);
}

function isStrongPassword(password) {
  const strongRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  return strongRegex.test(password);
}

ownerSubmit.addEventListener("click", function (e) {
  e.preventDefault();

  if (!username.value.trim()) {
    usernameError.textContent = "Please enter your username";
    username.focus();
    return;
  }
  if (!email.value.trim()) {
    emailError.textContent = "Please enter your email";
    email.focus();
    return;
  }
  if (!phone.value.trim()) {
    phoneError.textContent = "Please enter your phone number";
    phone.focus();
    return;
  }
  if (!city.value.trim()) {
    cityError.textContent = "Please enter your city";
    city.focus();
    return;
  }
  if (!contract.files[0]) {
    contractError.textContent = "Please upload your contract";
    contract.focus();
    return;
  }
  if (!password.value) {
    passwordError.textContent = "Please enter a password";
    password.focus();
    return;
  }
  if (!confirmPassword.value) {
    confirmPasswordError.textContent = "Please confirm your password";
    confirmPassword.focus();
    return;
  }

  if (!isValidEmail(email.value)) {
    emailError.textContent = "Invalid email!";
    email.focus();
    return;
  }

  if (!isValidEgyptianPhone(phone.value)) {
    phoneError.textContent = "Invalid Egyptian phone number!";
    phone.focus();
    return;
  }

  if (!isStrongPassword(password.value)) {
    passwordError.textContent = "Weak password!";
    password.focus();
    return;
  }

  if (password.value !== confirmPassword.value) {
    confirmPasswordError.textContent = "Passwords do not match!";
    confirmPassword.focus();
    return;
  }

  let owners = JSON.parse(localStorage.getItem("owners")) || [];
  if (owners.some((o) => o.email === email.value.trim())) {
    emailError.textContent = "Email already registered!";
    email.focus();
    return;
  }

  let newOwner = {
    username: username.value.trim(),
    email: email.value.trim(),
    phone: phone.value.trim(),
    city: city.value.trim(),
    contract: contract.files[0].name,
    password: password.value,
    role: "owner",
  };

  owners.push(newOwner);
  localStorage.setItem("owners", JSON.stringify(owners));
  window.location = "Login.html";
});
