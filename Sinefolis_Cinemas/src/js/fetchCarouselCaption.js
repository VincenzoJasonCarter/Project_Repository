document.addEventListener("DOMContentLoaded", function () {
    fetch("../../data/carousel_data.json")
    .then(res => res.json())
    .then(data => {
        const captions = document.querySelectorAll(".carousel_caption");

        captions.forEach((captionEl, index) => {
            const movie = data[index];
            if (movie) {
                captionEl.innerHTML = `
                    <h2>${movie.title}</h2>
                    <p>${movie.description}</p>
                    <button class="play-btn" data-trailer="${movie.trailer}">▶ Play Trailer</button>
                `;
            }
        });

        document.querySelectorAll('.play-btn').forEach(button => {
            button.addEventListener('click', function () {
                const trailerUrl = this.getAttribute('data-trailer');
                window.open(trailerUrl, '_blank'); // opens in new tab
            });
        });
    });
});
