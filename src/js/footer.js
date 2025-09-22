document.addEventListener("DOMContentLoaded", function () {
    fetch("components/footer.html") // Correct relative path from home.html
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.text();
        })
        .then(data => {
            const navbar = document.querySelector(".footer");
            if (navbar) {
                navbar.innerHTML = data;
            } else {
                console.error("Element with class 'navbar' not found.");
            }
        })
        .catch(err => console.error("Failed to load navbar:", err));
});


