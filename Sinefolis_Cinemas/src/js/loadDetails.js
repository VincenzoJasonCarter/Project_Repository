document.addEventListener("DOMContentLoaded", () => {
  fetch('details.json')
    .then(response => response.json())
    .then(data => {
      document.getElementById('promo-image').src = data.image;
      document.getElementById('promo-title').textContent = data.title;
      document.getElementById('promo-description').textContent = data.description;
      document.getElementById('promo-code').textContent = data.promoCode;
      document.getElementById('promo-prerequisite').textContent = data.prerequisite;
    })
    .catch(err => {
      console.error('Failed to load promo details:', err);
    });
});
