function updateSpecificRoleList(updatedUser) {
  const roles = ["owners", "customers", "drivers"];

  roles.forEach((roleKey) => {
    let list = JSON.parse(localStorage.getItem(roleKey)) || [];
    const index = list.findIndex((u) => u.email === updatedUser.email);

    if (index !== -1) {
      list[index] = updatedUser;
      localStorage.setItem(roleKey, JSON.stringify(list));
      console.log(`Successfully synced data in ${roleKey} list.`);
    }
  });
}

document.getElementById("changePassForm")?.addEventListener("submit", (e) => {
  e.preventDefault();

  let user = JSON.parse(localStorage.getItem("currentUser"));
  const currentPass = document.getElementById("currentPass").value;
  const newPass = document.getElementById("newPass").value;

  if (currentPass !== user.password) {
    Swal.fire({
      icon: "error",
      title: "Wrong Password",
      text: "The current password you entered is incorrect.",
      background: "#23242a",
      color: "#fff",
      confirmButtonColor: "#ff7b00",
    });
    return;
  }

  user.password = newPass;
  localStorage.setItem("currentUser", JSON.stringify(user));
  updateSpecificRoleList(user);

  Swal.fire({
    icon: "success",
    title: "Password Updated!",
    text: "You can now use your new password next time you log in.",
    background: "#23242a",
    color: "#fff",
    confirmButtonColor: "#28a745",
  });

  e.target.reset();
});

const notifySwitch = document.getElementById("notifySwitch");
if (notifySwitch) {
  notifySwitch.addEventListener("change", (e) => {
    let user = JSON.parse(localStorage.getItem("currentUser"));
    user.notifications = e.target.checked;

    localStorage.setItem("currentUser", JSON.stringify(user));
    updateSpecificRoleList(user);

    const status = e.target.checked ? "Enabled" : "Disabled";
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
      background: "#23242a",
      color: "#fff",
    });
    Toast.fire({
      icon: "success",
      title: `Notifications ${status}`,
    });
  });
}

const paymentSelect = document.getElementById("paymentDefaultSelect");
if (paymentSelect) {
  paymentSelect.addEventListener("change", (e) => {
    let user = JSON.parse(localStorage.getItem("currentUser"));
    user.defaultPayment = e.target.value;

    localStorage.setItem("currentUser", JSON.stringify(user));
    updateSpecificRoleList(user);

    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
      background: "#23242a",
      color: "#fff",
    });
    Toast.fire({
      icon: "success",
      title: "Payment method updated",
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (user) {
    if (user.notifications !== undefined && notifySwitch) {
      notifySwitch.checked = user.notifications;
    }

    if (user.defaultPayment && paymentSelect) {
      paymentSelect.value = user.defaultPayment;
    }
  }
});
