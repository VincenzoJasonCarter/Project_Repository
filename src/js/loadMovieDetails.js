// js/loadMovieDetails.js

document.addEventListener('DOMContentLoaded', function () {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.classList.add('active'); // Show loader
    }

    const params = new URLSearchParams(window.location.search);
    const movieIdFromUrl = params.get('id');

    // HTML elements to populate (ensure these exist in your movie_details.html)
    const mainContent = document.querySelector('.movie-details-container .details-content-wrapper') || document.querySelector('.movie-details-container');


    if (!movieIdFromUrl) {
        displayErrorMessage('No movie ID provided in the URL.');
        if (loader) loader.classList.remove('active');
        return;
    }

    // Ensure navigateTo is defined (it might be in a global script or needs to be here)
    // For now, defining a simple version here if not already available.
    if (typeof navigateTo === 'undefined') {
        window.navigateTo = function(url) { // Make it global for this script if not already
            window.location.href = url;
        }
    }


    fetch('../../data/movies.json') // Adjust path if your JSON is elsewhere relative to movie_details.html
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} while fetching movies.json. Check path: ${response.url}`);
            }
            return response.json();
        })
        .then(movies => {
            // Movie ID normalization as in your provided script
            const cleanedMovieIdFromUrl = movieIdFromUrl.toLowerCase().replace(/[^a-z0-9\s-]/g, '');
            const normalizedMovieIdFromUrl = cleanedMovieIdFromUrl.replace(/\s+/g, '-');
            
            const movie = movies.find(m => m.id === normalizedMovieIdFromUrl);

            if (movie) {
                populateMovieDetails(movie);

                // --- *** MODIFICATION FOR BOOK TICKETS BUTTON *** ---
                const bookBtn = document.getElementById('book-tickets-btn');
                if (bookBtn) {
                    bookBtn.onclick = () => {
                        // Navigate to nowshowing.html and pass the movie ID to trigger the modal
                        // Assuming nowshowing.html is in the same directory (e.g., both in 'pages/')
                        // If nowshowing.html is one level up: '../nowshowing.html'
                        navigateTo(`nowshowing.html?showModalForMovie=${encodeURIComponent(movie.id)}`);
                    };
                }
                // --- *** END OF MODIFICATION *** ---

            } else {
                displayErrorMessage(`Movie with ID "${movieIdFromUrl}" (normalized to "${normalizedMovieIdFromUrl}") not found.`);
            }
        })
        .catch(error => {
            console.error('Error fetching or processing movie data:', error);
            displayErrorMessage('Could not load movie details. ' + error.message);
        })
        .finally(() => {
            if (loader) {
                setTimeout(() => loader.classList.remove('active'), 300);
            }
        });
});

function populateMovieDetails(movie) {
    document.title = `${movie.title} | Sinéfolis Cinemas`; 

    const backdropImg = document.getElementById('movie-backdrop');
    const posterImg = document.getElementById('movie-poster');
    if (backdropImg) backdropImg.src = movie.backdrop || 'https://placehold.co/1200x600/1A2B3C/FFFFFF?text=Backdrop+Not+Available';
    if (posterImg) {
        posterImg.src = movie.poster || 'https://placehold.co/300x450/e0e0e0/757575?text=Poster+Not+Available';
        posterImg.alt = `${movie.title} Poster`;
    }

    setTextContent('movie-title', movie.title);
    setTextContent('movie-rating-details', movie.rating);
    setTextContent('movie-duration-details', `⏳ ${movie.duration}`); 
    setTextContent('movie-year-details', `🗓️ ${movie.year}`); 
    setTextContent('movie-genres-details', movie.genres ? movie.genres.join(', ') : 'N/A');

    const synopsisSection = document.querySelector('.synopsis-section h2');
    if (synopsisSection) synopsisSection.innerHTML = `📝 Synopsis`;
    
    const ratingsSectionTitle = document.querySelector('.ratings-section h2');
    if (ratingsSectionTitle) ratingsSectionTitle.innerHTML = `🌟 Ratings`;

    const crewSectionTitle = document.querySelector('.crew-section h2');
    if (crewSectionTitle) crewSectionTitle.innerHTML = `🎬 Crew`;

    const castSectionTitle = document.querySelector('.cast-section h2');
    if (castSectionTitle) castSectionTitle.innerHTML = `🎭 Main Cast`;

    setTextContent('movie-synopsis', movie.synopsis);

    const imdbRatingSource = document.querySelector('.ratings-grid .rating-item:nth-child(1) .rating-source');
    if (imdbRatingSource) imdbRatingSource.textContent = `⭐ IMDb`;
    setTextContent('movie-imdb-rating', movie.imdbRating);

    const rtRatingSource = document.querySelector('.ratings-grid .rating-item:nth-child(2) .rating-source');
    if (rtRatingSource) rtRatingSource.textContent = `🍅 Rotten Tomatoes`;
    setTextContent('movie-rt-rating', movie.rtRating);

    const audienceScoreSource = document.querySelector('.ratings-grid .rating-item:nth-child(3) .rating-source');
    if (audienceScoreSource) audienceScoreSource.textContent = `👍 Audience Score`;
    setTextContent('movie-audience-score', movie.audienceScore);

    const directorElement = document.querySelector('.crew-section p:nth-child(1) strong');
    if (directorElement) directorElement.innerHTML = `🎬 Director:`;
    setTextContent('movie-director', movie.director);

    const producerElement = document.querySelector('.crew-section p:nth-child(2) strong');
    if (producerElement) producerElement.innerHTML = `💼 Producer(s):`;
    setTextContent('movie-producer', movie.producer);

    const writerElement = document.querySelector('.crew-section p:nth-child(3) strong');
    if (writerElement) writerElement.innerHTML = `✍️ Writer(s):`;
    setTextContent('movie-writer', movie.writer);

    const castGrid = document.getElementById('movie-cast-grid');
    if (castGrid) {
        castGrid.innerHTML = ''; 
        if (movie.cast && movie.cast.length > 0) {
            movie.cast.forEach(member => {
                const castMemberDiv = document.createElement('div');
                castMemberDiv.classList.add('cast-member');
                castMemberDiv.innerHTML = `
                    <img src="${member.photo || 'https://placehold.co/150x225/D3D3D3/000000?text=Photo+N/A'}" alt="${member.name}" class="cast-member-photo">
                    <p class="cast-member-name">${member.name}</p>
                    <p class="cast-member-character">${member.character}</p>
                `;
                castGrid.appendChild(castMemberDiv);
            });
        } else {
            castGrid.innerHTML = '<p>Main cast information not available.</p>';
        }
    }
}

function setTextContent(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text || 'N/A';
    } else {
        // console.warn(`Element with ID "${id}" not found in movie_details.html.`);
    }
}

function displayErrorMessage(message) {
    const container = document.querySelector('.movie-details-container .details-content-wrapper') || 
                      document.querySelector('.movie-details-container') || 
                      document.body;
    
    let errorDisplayTarget = container;
    // If we found the specific content wrapper, clear it. Otherwise, clear the whole container.
    if (container.classList.contains('details-content-wrapper') || container.classList.contains('movie-details-container')) {
        container.innerHTML = ''; 
    } else { // If appended to body, find a main area or create one.
        errorDisplayTarget = document.body;
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.classList.add('error-message-details'); 
    errorDiv.style.padding = '20px'; // Add some padding for visibility
    errorDiv.style.textAlign = 'center';
    errorDiv.innerHTML = `<h2>Oops! Something went wrong.</h2><p>${message}</p><a href="home.html" class="details-book-btn" style="text-decoration:none; display:inline-block; margin-top:15px;">Go to Homepage</a>`;
    
    errorDisplayTarget.appendChild(errorDiv);
    document.title = "Error Loading Movie | Sinéfolis Cinemas";
}