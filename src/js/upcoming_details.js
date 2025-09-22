// upcoming_details.js

// Helper function for navigation (if not already in a global script)
function navigateTo(url) {
    window.location.href = url;
}

document.addEventListener('DOMContentLoaded', async () => {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'flex'; // Show loader

    // Get movie ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    // Get HTML elements to populate
    const movieBackdrop = document.getElementById('movieBackdrop');
    const moviePoster = document.getElementById('moviePoster');
    const movieTitleElement = document.getElementById('movieTitle');
    const pageTitle = document.querySelector('title'); // To update browser tab title
    const movieYear = document.getElementById('movieYear');
    const movieRating = document.getElementById('movieRating');
    const movieDuration = document.getElementById('movieDuration');
    const movieGenres = document.getElementById('movieGenres');
    const notifyMeBtn = document.getElementById('notifyMeBtn');
    const movieSynopsis = document.getElementById('movieSynopsis');
    const movieDirector = document.getElementById('movieDirector');
    const movieWriter = document.getElementById('movieWriter');
    const movieProducer = document.getElementById('movieProducer');
    const movieCast = document.getElementById('movieCast');
    const mainContent = document.querySelector('.movie-details-page .container'); // To show error message

    if (!movieId) {
        if (mainContent) mainContent.innerHTML = '<p class="error-message-details">No movie ID provided in the URL.</p>';
        if (loader) loader.style.display = 'none';
        return;
    }

    try {
        // IMPORTANT: Ensure this fetch path is correct relative to upcoming_details.html
        const response = await fetch('../../data/upcoming_movies.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch upcoming_movies.json: ${response.statusText} (Path: ${response.url})`);
        }
        const upcomingMovies = await response.json();
        
        const movie = upcomingMovies.find(m => m.id === movieId);

        if (movie) {
            if (pageTitle) pageTitle.textContent = `${movie.title} (Upcoming) - Sinefolis Cinemas`;
            if (movieTitleElement) movieTitleElement.textContent = movie.title;
            
            if (moviePoster) {
                moviePoster.src = movie.poster || 'https://placehold.co/300x450/e0e0e0/777?text=No+Poster';
                moviePoster.alt = movie.title + " Poster";
            }
            if (movieBackdrop && movie.backdrop) {
                movieBackdrop.style.backgroundImage = `url('${movie.backdrop}')`;
            } else if (movieBackdrop) {
                movieBackdrop.style.backgroundColor = '#333'; // Fallback color
            }

            if (movieYear) movieYear.textContent = movie.year || 'Release TBA';
            if (movieRating) {
                movieRating.textContent = movie.rating || 'Rating TBA';
                if (movie.rating && movie.rating !== 'TBA') {
                    movieRating.style.display = 'inline-block';
                } else {
                    movieRating.style.display = 'none';
                }
            }
            if (movieDuration) {
                movieDuration.textContent = movie.duration || 'Duration TBA';
                 if (movie.duration && movie.duration !== 'TBA') {
                    movieDuration.style.display = 'inline-block';
                } else {
                    movieDuration.style.display = 'none';
                }
            }

            if (movieGenres && movie.genres && movie.genres.length > 0) {
                movieGenres.innerHTML = ''; // Clear any loading text
                movie.genres.forEach(genre => {
                    const genreSpan = document.createElement('span');
                    genreSpan.className = 'genre-tag';
                    genreSpan.textContent = genre;
                    movieGenres.appendChild(genreSpan);
                });
            } else if (movieGenres) {
                movieGenres.innerHTML = '<span class="genre-tag">Genre TBA</span>';
            }

            if (movieSynopsis) movieSynopsis.textContent = movie.synopsis || 'Synopsis not yet available.';
            if (movieDirector) movieDirector.textContent = movie.director || 'TBA';
            if (movieWriter) movieWriter.textContent = movie.writer || 'TBA';
            if (movieProducer) movieProducer.textContent = movie.producer || 'TBA';

            if (movieCast && movie.cast && movie.cast.length > 0) {
                movieCast.innerHTML = ''; // Clear loading
                movie.cast.forEach(castMember => {
                    const castDiv = document.createElement('div');
                    castDiv.className = 'cast-member-item';
                    castDiv.innerHTML = `
                        <img src="${castMember.photo || 'https://placehold.co/100x150/cccccc/888888?text=Photo'}" alt="${castMember.name}" class="cast-photo">
                        <p class="cast-name">${castMember.name}</p>
                        <p class="cast-character">${castMember.character}</p>
                    `;
                    movieCast.appendChild(castDiv);
                });
            } else if (movieCast) {
                movieCast.innerHTML = '<p>Cast information not yet available.</p>';
            }

            if (notifyMeBtn) {
                notifyMeBtn.dataset.movieId = movie.id; // Store ID for the notify function
                notifyMeBtn.addEventListener('click', function() {
                    const idForNotify = this.dataset.movieId;
                    // Navigate to notify.html or trigger an in-page notification form
                    navigateTo(`notify.html?movie=${encodeURIComponent(idForNotify)}&title=${encodeURIComponent(movie.title)}`);
                    // alert(`Notification request for "${movie.title}" (ID: ${idForNotify}) - Link to notify.html`);
                });
            }

        } else {
            if (pageTitle) pageTitle.textContent = "Movie Not Found - Sinefolis Cinemas";
            if (mainContent) mainContent.innerHTML = `<p class="error-message-details">Sorry, the movie with ID '${movieId}' could not be found.</p>`;
        }

    } catch (error) {
        console.error("Error fetching or displaying upcoming movie details:", error);
        if (mainContent) mainContent.innerHTML = `<p class="error-message-details">Could not load movie details. ${error.message}</p>`;
    } finally {
        if (loader) loader.style.display = 'none'; // Hide loader
    }
});