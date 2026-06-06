document.addEventListener("DOMContentLoaded", () => {
  renderMyOffers();
});

function renderMyOffers() {
  const offersList = document.getElementById("offersList");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const allOffers = JSON.parse(localStorage.getItem("allOffers")) || [];

  const myOffers = allOffers.filter(
    (off) => off.ownerEmail === currentUser?.email,
  );

  if (myOffers.length === 0) {
    offersList.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-percentage fa-3x text-muted mb-3"></i>
                <h4 class="text-white-50">No active offers found</h4>
                <p class="small">Click 'Add New Offer' to start promoting your shop.</p>
            </div>`;
    return;
  }

  offersList.innerHTML = myOffers
    .map(
      (offer) => `
      <div class="col-md-4">
        <div class="manage-offer-card">

          <div class="offer-img-container">
            <img src="${offer.image}" alt="Offer Banner">
          </div>

          <div class="offer-content">
            <span class="badge bg-warning text-dark mb-2">${offer.searchTerm}</span>
            <h5 class="fw-bold text-white mb-1">${offer.title}</h5>
            <p class="text-white-50 small mb-3">${offer.subtitle}</p>

            <button onclick="confirmDelete(${offer.id})" class="btn btn-delete">
              <i class="fas fa-trash-alt me-2"></i>REMOVE OFFER
            </button>

          </div>
        </div>
      </div>
    `,
    )
    .join("");
}

window.confirmDelete = (id) => {
  Swal.fire({
    title: "Delete Offer?",
    text: "Customers won't see this promotion anymore.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#34353c",
    confirmButtonText: "Yes, Remove it!",
    background: "#23242a",
    color: "#fff",
  }).then((result) => {
    if (result.isConfirmed) {
      let allOffers = JSON.parse(localStorage.getItem("allOffers")) || [];

      allOffers = allOffers.filter((off) => off.id !== id);
      localStorage.setItem("allOffers", JSON.stringify(allOffers));

      Swal.fire({
        title: "Removed!",
        icon: "success",
        background: "#23242a",
        color: "#fff",
      }).then(() => {
        renderMyOffers();
      });
    }
  });
};
