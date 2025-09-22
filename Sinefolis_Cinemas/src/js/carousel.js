document.addEventListener("DOMContentLoaded", () => {
    const track = document.querySelector(".carousel-track");
    const items = document.querySelectorAll(".carousel-item");
    const nextBtn = document.querySelector(".next");
    const prevBtn = document.querySelector(".prev");

    let index = 0;

    function updateCarousel() {
        const slideWidth = items[0].clientWidth;
        track.style.transform = `translateX(-${index * slideWidth}px)`;

        // Update active class
        items.forEach((item, i) => {
        item.classList.toggle("active", i === index);
        });
    }

    nextBtn.addEventListener("click", () => {
        index = (index + 1) % items.length;
        updateCarousel();
    });

    prevBtn.addEventListener("click", () => {
        index = (index - 1 + items.length) % items.length;
        updateCarousel();
    });

    window.addEventListener("resize", updateCarousel);
    updateCarousel();
});
