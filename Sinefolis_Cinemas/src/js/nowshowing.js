function goToBookingPage(movieId, date, showtimeIndex) {
    const bookingPageUrl = 'booking.html';
    const url = `${bookingPageUrl}?movie=${encodeURIComponent(movieId)}&date=${encodeURIComponent(date)}&showtime=${encodeURIComponent(showtimeIndex)}`;
    window.location.href = url;
}

function navigateTo(url) {
    window.location.href = url;
}

function navigateToNotifyPage(movieId) {
    const notifyPageUrl = 'notify.html';
    window.location.href = `${notifyPageUrl}?movie=${encodeURIComponent(movieId)}`;
}

document.addEventListener('DOMContentLoaded', function() {
    const nowShowingBtn = document.getElementById('nowShowingBtn');
    const upcomingBtn = document.getElementById('upcomingBtn');
    const nowShowingSection = document.getElementById('nowShowingSection');
    const upcomingSection = document.getElementById('upcomingSection');
    
    const nowShowingMoviesGrid = nowShowingSection ? nowShowingSection.querySelector('.movies-grid') : null;
    const upcomingMoviesGrid = upcomingSection ? upcomingSection.querySelector('.movies-grid') : null;
    
    const showtimeModal = document.getElementById('showtimeModal');
    const closeShowtimeModalBtn = document.getElementById('closeShowtimeModalBtn');
    const showtimeModalMovieTitle = document.getElementById('showtimeModalMovieTitle');
    const showtimeModalBody = document.getElementById('showtimeModalBody');

    if (!nowShowingMoviesGrid) {
        console.error("Container '.movies-grid' in '#nowShowingSection' not found.");
    }
    if (!upcomingMoviesGrid) {
        console.error("Container '.movies-grid' in '#upcomingSection' not found.");
    }
    if (!showtimeModal || !closeShowtimeModalBtn || !showtimeModalMovieTitle || !showtimeModalBody) {
        console.error("Showtime modal elements not found. Modal functionality will be broken.");
    }
    
    let nowShowingMoviesLoaded = false;
    let upcomingMoviesLoaded = false;
    let currentMoviesArray = []; 
    let currentBookingInfo = {}; 

    function openShowtimeModal(movieId) {
        if (!showtimeModal || !showtimeModalMovieTitle || !showtimeModalBody) {
            console.error("Modal elements are missing.");
            return;
        }
        if (!currentMoviesArray || currentMoviesArray.length === 0 || !currentBookingInfo || !currentBookingInfo.showtimes) {
            alert("Showtime information is not available. Data might not have loaded. Please check console for fetch errors (Network tab) and ensure JSON paths are correct.");
            console.error("Cannot open showtime modal: required data missing.");
            return;
        }

        const movieDetails = currentMoviesArray.find(m => m.id === movieId);
        if (!movieDetails) {
            alert(`Details for movie ID '${movieId}' not found. Cannot display showtimes.`);
            console.error(`Movie details for ${movieId} not found for modal.`);
            return;
        }

        showtimeModalMovieTitle.textContent = `Showtimes for: ${movieDetails.title}`;
        showtimeModalBody.innerHTML = '<p>Gathering showtimes...</p>'; 

        let modalContent = '';
        const showtimesForMovieData = currentBookingInfo.showtimes[movieId];
        if (!showtimesForMovieData || Object.keys(showtimesForMovieData).length === 0) {
            modalContent = `<p>No showtimes currently listed for "${movieDetails.title}".</p>`;
        } else {
            for (const date in showtimesForMovieData) {
                if (showtimesForMovieData.hasOwnProperty(date)) {
                    modalContent += `<div class="showtime-date-block-modal"><h5>On ${new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', weekday: 'short' })}:</h5>`;
                    const theatersForDate = showtimesForMovieData[date];
                    for (const theaterName in theatersForDate) {
                        if (theatersForDate.hasOwnProperty(theaterName)) {
                            modalContent += `<div class="showtime-theater-block-modal"><h6>${theaterName}</h6>`;
                            const screensForTheater = theatersForDate[theaterName];
                            for (const screenId in screensForTheater) {
                                if (screensForTheater.hasOwnProperty(screenId)) {
                                    const screenObject = currentBookingInfo.theaters[theaterName]?.screens[screenId];
                                    const screenName = screenObject ? screenObject.name : `Screen ${screenId}`;
                                    modalContent += `<div class="showtime-screen-block-modal"><p class="screen-name-modal"><em>${screenName}:</em></p>`;
                                    modalContent += `<div class="showtime-slots-wrapper-modal">`;
                                    const showtimeSlotsArray = screensForTheater[screenId];
                                    showtimeSlotsArray.forEach((slot, index) => {
                                        modalContent += `<button class="modal-showtime-button" 
                                                            data-movie-id="${movieId}" 
                                                            data-date="${date}" 
                                                            data-showtime-index="${index}">
                                                            ${slot.time} (${slot.format})
                                                        </button>`;
                                    });
                                    modalContent += `</div></div>`;
                                }
                            }
                            modalContent += `</div>`;
                        }
                    }
                    modalContent += `</div>`;
                }
            }
        }
        showtimeModalBody.innerHTML = modalContent;
        if (showtimeModal) showtimeModal.style.display = 'flex'; 
    }

    function closeShowtimeModal() {
        if (showtimeModal) showtimeModal.style.display = 'none';
    }

    if(closeShowtimeModalBtn) closeShowtimeModalBtn.onclick = closeShowtimeModal;
    if(showtimeModal) window.onclick = function(event) { 
        if (event.target === showtimeModal) {
            closeShowtimeModal();
        }
    };

    async function loadAndDisplayNowShowingMovies() {
        if (!nowShowingMoviesGrid) { console.warn("Now Showing grid not found."); return; }
        if (!nowShowingSection || !nowShowingSection.classList.contains('active')) return; 
        if (nowShowingMoviesLoaded && !nowShowingSection.classList.contains('force-reload')) return;

        nowShowingMoviesGrid.innerHTML = '<p>Loading now showing movies...</p>'; 
        try {
            const moviesResponse = await fetch('../../data/movies.json'); 
            if (!moviesResponse.ok) throw new Error(`Failed to fetch movies.json: ${moviesResponse.statusText} (Path: ${moviesResponse.url})`);
            currentMoviesArray = await moviesResponse.json();

            const bookingInfoResponse = await fetch('../../data/booking_info.json'); 
            if (!bookingInfoResponse.ok) throw new Error(`Failed to fetch booking_info.json: ${bookingInfoResponse.statusText} (Path: ${bookingInfoResponse.url})`);
            currentBookingInfo = await bookingInfoResponse.json();
            
            nowShowingMoviesGrid.innerHTML = ''; 

            if (!currentBookingInfo.showtimes || Object.keys(currentBookingInfo.showtimes).length === 0) {
                nowShowingMoviesGrid.innerHTML = '<p>No showtime information currently available.</p>';
                nowShowingMoviesLoaded = true;
                return;
            }

            let moviesDisplayedCount = 0;
            for (const movieId in currentBookingInfo.showtimes) {
                if (currentBookingInfo.showtimes.hasOwnProperty(movieId)) {
                    const movieDetails = currentMoviesArray.find(m => m.id === movieId);
                    if (!movieDetails) {
                        console.warn(`Now Showing: Movie details for ID '${movieId}' not found in movies.json.`);
                        continue;
                    }
                    moviesDisplayedCount++;
                    const movieCard = document.createElement('div');
                    movieCard.className = 'movie-card dynamic-movie-item'; 
                    movieCard.innerHTML = `
                        <div class="movie-poster">
                            <img src="${movieDetails.poster}" alt="${movieDetails.title}">
                            <div class="movie-overlay">
                                <button type="button" class="btn-book dynamic-btn-show-schedule" data-movie-id="${movieDetails.id}">Book Now</button>
                                <button type="button" class="btn-details dynamic-btn-details" data-movie-id="${movieDetails.id}">Details</button>
                            </div>
                        </div>
                        <div class="movie-info">
                            <h3 class="movie-title">${movieDetails.title}</h3>
                            <div class="movie-meta">
                                <span class="movie-rating">${movieDetails.rating}</span>
                                <span class="movie-duration">${movieDetails.duration}</span>
                            </div>
                            <div class="movie-genre">${movieDetails.genres.join(', ')}</div>
                        </div>`;
                    nowShowingMoviesGrid.appendChild(movieCard);
                }
            }
            if (moviesDisplayedCount === 0) {
                nowShowingMoviesGrid.innerHTML = '<p>No movies currently showing match the available showtimes data.</p>';
            }
            nowShowingMoviesLoaded = true;
            if(nowShowingSection) nowShowingSection.classList.remove('force-reload');
        } catch (error) {
            console.error('CRITICAL ERROR in loadAndDisplayNowShowingMovies:', error);
            if (nowShowingMoviesGrid) {
                nowShowingMoviesGrid.innerHTML = `<p style="color: red; font-weight: bold;">Could not load "Now Showing" movies. Check console (F12) for errors. Error: ${error.message}</p>`;
            }
            currentMoviesArray = []; 
            currentBookingInfo = {};   
            nowShowingMoviesLoaded = false; 
        }
    }
    
    async function loadAndDisplayUpcomingMovies() {
        if (!upcomingMoviesGrid) { console.warn("Upcoming movies grid not found."); return; }
        if (!upcomingSection || !upcomingSection.classList.contains('active')) return;
        if (upcomingMoviesLoaded && !upcomingSection.classList.contains('force-reload')) return;

        upcomingMoviesGrid.innerHTML = '<p>Loading upcoming movies...</p>';
        try {
            const response = await fetch('../../data/upcoming_movies.json'); 
            if (!response.ok) throw new Error(`Failed to fetch upcoming_movies.json: ${response.statusText} (Path: ${response.url})`);
            const upcomingMoviesArray = await response.json();

            upcomingMoviesGrid.innerHTML = ''; 

            if (!upcomingMoviesArray || upcomingMoviesArray.length === 0) {
                upcomingMoviesGrid.innerHTML = '<p>No upcoming movies to display at the moment.</p>';
                upcomingMoviesLoaded = true;
                return;
            }

            upcomingMoviesArray.forEach(movie => {
                const movieCard = document.createElement('div');
                movieCard.className = 'movie-card dynamic-upcoming-item'; 
                movieCard.innerHTML = `
                    <div class="movie-poster">
                        <img src="${movie.poster}" alt="${movie.title}">
                        <div class="movie-overlay">
                            <button type="button" class="btn-notify dynamic-btn-notify" data-movie-id="${movie.id}" data-movie-title="${encodeURIComponent(movie.title)}">Notify Me</button>
                            <button type="button" class="btn-details dynamic-btn-details-upcoming" data-movie-id="${movie.id}">Details</button>
                        </div>
                    </div>
                    <div class="movie-info">
                        <h3 class="movie-title">${movie.title}</h3>
                        <div class="movie-meta">
                            <span class="movie-rating">${movie.rating || 'TBA'}</span>
                            <span class="movie-release">Releases: ${movie.year || 'TBA'}</span>
                        </div>
                        <div class="movie-genre">${movie.genres ? movie.genres.join(', ') : 'N/A'}</div>
                    </div>
                `;
                upcomingMoviesGrid.appendChild(movieCard);
            });
            upcomingMoviesLoaded = true;
            if(upcomingSection) upcomingSection.classList.remove('force-reload');
        } catch (error) {
            console.error('CRITICAL ERROR in loadAndDisplayUpcomingMovies:', error);
            if (upcomingMoviesGrid) {
                upcomingMoviesGrid.innerHTML = `<p style="color: red; font-weight:bold;">Could not load upcoming movies. Check console (F12) for errors. Error: ${error.message}</p>`;
            }
            upcomingMoviesLoaded = false; 
        }
    }

    if (nowShowingBtn && upcomingBtn && nowShowingSection && upcomingSection) {
        nowShowingBtn.addEventListener('click', function() {
            if (!this.classList.contains('active')) {
                this.classList.add('active');
                upcomingBtn.classList.remove('active');
                if(upcomingSection) upcomingSection.classList.remove('active');
                nowShowingMoviesLoaded = false; 
                if(nowShowingSection) nowShowingSection.classList.add('force-reload'); 
                setTimeout(() => {
                    if(nowShowingSection) nowShowingSection.classList.add('active');
                    loadAndDisplayNowShowingMovies(); 
                }, 50);
                window.location.hash = 'now-showing';
            } else { 
                nowShowingMoviesLoaded = false; 
                if(nowShowingSection) nowShowingSection.classList.add('force-reload');
                loadAndDisplayNowShowingMovies();
            }
        });
        
        upcomingBtn.addEventListener('click', function() {
            if (!this.classList.contains('active')) {
                this.classList.add('active');
                nowShowingBtn.classList.remove('active');
                if(nowShowingSection) nowShowingSection.classList.remove('active');
                upcomingMoviesLoaded = false; 
                if(upcomingSection) upcomingSection.classList.add('force-reload');
                setTimeout(() => {
                    if(upcomingSection) upcomingSection.classList.add('active');
                    loadAndDisplayUpcomingMovies(); 
                }, 50);
                window.location.hash = 'upcoming';
            } else { 
                upcomingMoviesLoaded = false; 
                if(upcomingSection) upcomingSection.classList.add('force-reload');
                loadAndDisplayUpcomingMovies();
            }
        });
        
        function checkUrlHash() {
            const hash = window.location.hash;
            if (hash === '#upcoming' && upcomingBtn) {
                upcomingBtn.click();
            } else if (nowShowingBtn) { // Default or #now-showing
                nowShowingBtn.click(); 
            } else if (nowShowingSection && nowShowingMoviesGrid) { 
                nowShowingSection.classList.add('active');
                if(upcomingSection) upcomingSection.classList.remove('active');
                loadAndDisplayNowShowingMovies();
            }
            handleShowModalFromUrlParam(); // Check for modal trigger from URL
        }
        
        checkUrlHash();

        // Handle modal trigger from URL after initial tab setup
        function handleShowModalFromUrlParam() {
            const urlParams = new URLSearchParams(window.location.search);
            const movieToModal = urlParams.get('showModalForMovie');
            if (movieToModal) {
                // Ensure the "Now Showing" tab is active for modal context
                if (!nowShowingSection.classList.contains('active') && nowShowingBtn) {
                    nowShowingBtn.click(); // This will trigger loadAndDisplayNowShowingMovies
                    // Wait for data to potentially load before opening modal
                    const tryOpenModal = () => {
                        if (nowShowingMoviesLoaded && currentMoviesArray.length > 0 && currentBookingInfo.showtimes) {
                            openShowtimeModal(movieToModal);
                            // Clean URL
                            const newUrl = window.location.pathname + window.location.hash;
                            window.history.replaceState({}, document.title, newUrl);
                        } else if (!nowShowingMoviesLoaded) {
                            // Data is still loading or failed, try again shortly
                            console.log("Data for modal not ready, retrying soon for movie:", movieToModal);
                            setTimeout(tryOpenModal, 1000); // Retry after 1 sec
                        } else {
                             console.warn("Data loaded but seems insufficient to open modal for movie:", movieToModal);
                        }
                    };
                    setTimeout(tryOpenModal, 500); // Initial delay for tab switch and load initiation
                } else if (nowShowingMoviesLoaded) { // If Now Showing already active and loaded
                    openShowtimeModal(movieToModal);
                    const newUrl = window.location.pathname + window.location.hash;
                    window.history.replaceState({}, document.title, newUrl);
                } else if (!nowShowingMoviesLoaded && nowShowingSection && nowShowingSection.classList.contains('active')) {
                    // Tab is active, but data not loaded (e.g. initial load failed, then param added)
                    // loadAndDisplayNowShowingMovies should have shown an error or content.
                    // We'll wait a bit for its completion.
                     console.log("Now Showing tab active, data not yet loaded. Waiting for load before modal for:", movieToModal);
                     const tryOpenModalAfterLoad = () => {
                        if (nowShowingMoviesLoaded && currentMoviesArray.length > 0 && currentBookingInfo.showtimes) {
                            openShowtimeModal(movieToModal);
                            const newUrl = window.location.pathname + window.location.hash;
                            window.history.replaceState({}, document.title, newUrl);
                        } else {
                            console.warn("Still no data for modal even after waiting, movie:", movieToModal);
                        }
                     };
                     // if loadAndDisplayNowShowingMovies returns a promise, await it.
                     // For now, using timeout after ensuring it's called.
                     if (typeof loadAndDisplayNowShowingMovies === 'function') {
                        const DYNAMIC_LOAD_PROMISE = loadAndDisplayNowShowingMovies(); // Assuming it could be made to return promise
                        if(DYNAMIC_LOAD_PROMISE && typeof DYNAMIC_LOAD_PROMISE.then === 'function'){
                            DYNAMIC_LOAD_PROMISE.then(tryOpenModalAfterLoad).catch(e => console.error("Error during load for modal:", e));
                        } else {
                            setTimeout(tryOpenModalAfterLoad, 1500); // Fallback if not a promise
                        }
                     } else {
                        setTimeout(tryOpenModalAfterLoad, 1500);
                     }
                }
            }
        }
        // Call it after a slight delay to allow initial tab logic to settle
        // setTimeout(handleShowModalFromUrlParam, 100); 
        // The call is now integrated into checkUrlHash for better timing.


    } else { console.error("Tab toggle buttons or sections missing from HTML."); }
    
    function setupEventListenersForGrid(gridContainer, bookClass, detailsClass, detailsPagePrefix, isNotifyButton = false) {
        if (!gridContainer) return;
        gridContainer.addEventListener('click', function(e) {
            const targetButton = e.target.closest('button');
            if (!targetButton) return;

            const movieId = targetButton.dataset.movieId;

            if (targetButton.classList.contains(bookClass)) { 
                e.stopPropagation();
                if (movieId) {
                    if (isNotifyButton) {
                        const movieTitle = decodeURIComponent(targetButton.dataset.movieTitle || 'this movie');
                        alert(`Notification request for "${movieTitle}" received!`);
                        // navigateToNotifyPage(movieId); // Uncomment to navigate
                    } else { // This is dynamic-btn-show-schedule
                        openShowtimeModal(movieId);
                    }
                } else { console.error("Movie ID missing on button:", targetButton); }
            } else if (targetButton.classList.contains(detailsClass)) { 
                e.stopPropagation();
                if (movieId) {
                    navigateTo(`${detailsPagePrefix}?id=${encodeURIComponent(movieId)}`);
                } else { console.error("Movie ID missing on details button:", targetButton); }
            }
        });
    }

    setupEventListenersForGrid(nowShowingMoviesGrid, 'dynamic-btn-show-schedule', 'dynamic-btn-details', 'movie_details.html');
    setupEventListenersForGrid(upcomingMoviesGrid, 'dynamic-btn-notify', 'dynamic-btn-details-upcoming', 'upcoming_details.html', true);


    if (showtimeModalBody) {
        showtimeModalBody.addEventListener('click', function(e) {
            const targetButton = e.target.closest('button.modal-showtime-button');
            if (targetButton) {
                const movieId = targetButton.dataset.movieId;
                const date = targetButton.dataset.date;
                const showtimeIndex = targetButton.dataset.showtimeIndex;
                if (movieId && date && showtimeIndex !== undefined) {
                    goToBookingPage(movieId, date, showtimeIndex);
                    closeShowtimeModal(); 
                }
            }
        });
    }
    
    document.querySelectorAll('.movie-card:not(.dynamic-movie-item):not(.dynamic-upcoming-item) .btn-book').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const movieCard = this.closest('.movie-card');
            const movieId = movieCard?.dataset.movieId; 
            const movieTitle = movieCard?.querySelector('.movie-title')?.textContent;
            if (movieId) {
                openShowtimeModal(movieId); 
            } else {
                alert(`Movie ID missing for "${movieTitle}". Add 'data-movie-id' to static card.`);
            }
        });
    });
    
    document.querySelectorAll('.movie-card:not(.dynamic-movie-item):not(.dynamic-upcoming-item) .btn-notify').forEach(button => { 
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const movieTitle = this.closest('.movie-card')?.querySelector('.movie-title')?.textContent;
            alert(`Will notify for "${movieTitle}".`);
        });
    });
    
    document.querySelectorAll('.movie-card:not(.dynamic-movie-item):not(.dynamic-upcoming-item) .btn-details').forEach(button => {
         button.addEventListener('click', function(e) {
            e.stopPropagation();
            const movieCard = this.closest('.movie-card');
            let movieId = this.dataset.movieId || movieCard?.dataset.movieId; 
            const movieTitle = movieCard?.querySelector('.movie-title')?.textContent;
            const isUpcomingStatic = movieCard.closest('#upcomingSection');
            const detailsPage = isUpcomingStatic ? 'upcoming_details.html' : 'movie_details.html';

            if (movieId) navigateTo(`${detailsPage}?id=${encodeURIComponent(movieId)}`);
            else if (movieTitle) navigateTo(`${detailsPage}?id=${encodeURIComponent(movieTitle)}`); 
        });
    });

    document.querySelectorAll('.movie-card:not(.dynamic-movie-item):not(.dynamic-upcoming-item)').forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('button')) return;
            const detailsBtn = this.querySelector('.btn-details');
            if (detailsBtn) detailsBtn.click();
        });
        card.addEventListener('mouseenter', function() { this.style.transform = 'translateY(-8px)'; this.style.transition = this.style.transition || 'transform 0.2s ease-out'; });
        card.addEventListener('mouseleave', function() { this.style.transform = 'translateY(0)'; });
    });
});