let owner = document.querySelector("#owner");
let customer = document.querySelector("#customer");
let driver = document.querySelector("#driver");
let btn = document.querySelector("#btn");

if (!btn || !owner || !customer || !driver) {
  console.error("One or more elements not found");
} else {
  btn.addEventListener("click", function () {
    btn.innerHTML = "Loading...";
    btn.disabled = true;

    setTimeout(() => {
      try {
        if (owner.checked) {
          window.location.href = "registerOwner.html";
        } else if (customer.checked) {
          window.location.href = "registerCustomer.html";
        } else if (driver.checked) {
          window.location.href = "registerDriver.html";
        }
      } catch (error) {
        console.error("Navigation error:", error);
        btn.innerHTML = "Continue";
        btn.disabled = false;
        alert("An error occurred while loading, please try again");
      }
    }, 500);
  });
}
