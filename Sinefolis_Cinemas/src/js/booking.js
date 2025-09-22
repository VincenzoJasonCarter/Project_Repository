function goToBookingPage(movieId, date, showtimeIndex) {
    const bookingPageUrl = 'booking.html';
    const url = `${bookingPageUrl}?movie=${encodeURIComponent(movieId)}&date=${encodeURIComponent(date)}&showtime=${encodeURIComponent(showtimeIndex)}`;
    window.location.href = url;
}

function navigateTo(url) {
    window.location.href = url;
}

document.addEventListener("DOMContentLoaded", () => {
  let currentStep = 1;
  let selectedSeats = [];
  const selectedSeatTypes = {};
  const ticketCounts = { adult: 0, child: 0, senior: 0, student: 0 };
  const addonCounts = {};
  let moviesData = null;
  let bookingData = null;
  let currentMovieId = null;
  let currentTheaterId = null; 
  let currentScreenId = null;  
  let currentShowtimeIndex = null;
  let currentShowDate = null;
  let pricing = null;
  let theaters = null;
  let showtimes = null;
  let addons = null;
  let currentShowtime = null;
  let currentTheater = null;
  let currentScreen = null;

  function getBookingParamsFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      movieId: urlParams.get("movie") || "interstellar",
      showtimeIndex: Number.parseInt(urlParams.get("showtime") || "0"),
      date: urlParams.get("date") || "2024-01-15",
    };
  }

  function getTheaterIdFromName(theaterName) {
    if (theaters && theaters[theaterName] && theaters[theaterName].id) {
        return theaters[theaterName].id;
    }
    const theaterMap = {
      "Sinefolis Mall Central": "mall-central",
      "Sinefolis Downtown Plaza": "downtown-plaza",
    };
    return theaterMap[theaterName] || null;
  }

  async function loadBookingData() {
    try {
      const response = await fetch("../../data/booking_info.json"); 
      if (!response.ok) {
        throw new Error(`Failed to load booking data (status: ${response.status})`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error loading booking data:", error);
      showBookingError(`Failed to load booking data. Please check console. (${error.message})`);
      return null;
    }
  }

  async function loadMovieData() {
    try {
      const response = await fetch("../../data/movies.json"); 
      if (!response.ok) {
        throw new Error(`Failed to load movie data (status: ${response.status})`);
      }
      return await response.json(); 
    } catch (error) {
      console.error("Error loading movie data:", error);
      showBookingError("Movie details (movies.json) could not be loaded. UI will use placeholders.");
      return null;
    }
  }

  function showBookingError(message) {
    const bookingContainer = document.querySelector(".booking-container");
    const errorMessage = document.getElementById("booking-error");
    const errorText = document.getElementById("error-text");

    if (bookingContainer) bookingContainer.style.display = "none";
    if (errorMessage && errorText) {
      errorText.textContent = message;
      errorMessage.style.display = "flex";
    }
    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "none";
  }

  async function initializeBooking() {
    const params = getBookingParamsFromURL();
    currentMovieId = params.movieId;
    currentShowDate = params.date;
    currentShowtimeIndex = params.showtimeIndex;

    bookingData = await loadBookingData();
    moviesData = await loadMovieData(); 

    if (!bookingData) {
      return; 
    }

    pricing = bookingData.pricing;
    theaters = bookingData.theaters; 
    showtimes = bookingData.showtimes; 
    addons = bookingData.addons;

    if (!pricing || !theaters || !showtimes || !addons) {
        showBookingError("Essential booking information (pricing, theaters, showtimes, or addons) is missing from booking_info.json.");
        return;
    }
    
    if (!showtimes[currentMovieId] || !showtimes[currentMovieId][currentShowDate]) {
      showBookingError(`No showtimes found for movie '${currentMovieId}' on date ${currentShowDate}. Please check the movie ID and date, or the data file.`);
      return;
    }

    let movieData = null;
    if (moviesData && Array.isArray(moviesData)) {
        movieData = moviesData.find(movie => movie.id === currentMovieId);
    }

    if (!movieData && moviesData) { 
        console.warn(`Movie with ID '${currentMovieId}' not found in movies.json. UI will use placeholders.`);
    } else if (!moviesData) { 
        console.warn("movies.json could not be loaded. UI will use placeholders.");
    }

    const movieShowtimesByDate = showtimes[currentMovieId]?.[currentShowDate];
    if (!movieShowtimesByDate || Object.keys(movieShowtimesByDate).length === 0) {
      showBookingError(`No theaters found offering showtimes for '${currentMovieId}' on ${currentShowDate}.`);
      return;
    }

    let foundShowtimeData = null;
    let foundTheaterName = null;
    let foundScreenId = null;

    for (const theaterNameKey in movieShowtimesByDate) {
      if (movieShowtimesByDate.hasOwnProperty(theaterNameKey)) {
        const screens = movieShowtimesByDate[theaterNameKey];
        for (const screenIdKey in screens) {
          if (screens.hasOwnProperty(screenIdKey)) {
            const screenShowtimesArray = screens[screenIdKey];
            if (currentShowtimeIndex >= 0 && currentShowtimeIndex < screenShowtimesArray.length) {
              foundShowtimeData = screenShowtimesArray[currentShowtimeIndex];
              foundTheaterName = theaterNameKey;
              foundScreenId = screenIdKey;
              break; 
            }
          }
        }
      }
      if (foundShowtimeData) break; 
    }

    if (!foundShowtimeData) {
      showBookingError(`Showtime at index ${currentShowtimeIndex} not found for '${currentMovieId}' on ${currentShowDate}. Please check the 'showtime' URL parameter or data integrity.`);
      return;
    }

    currentShowtime = foundShowtimeData;
    currentTheater = theaters[foundTheaterName]; 

    if (!currentTheater) {
        showBookingError(`Theater data for '${foundTheaterName}' not found in booking_info.json.theaters.`);
        return;
    }
    currentTheaterId = currentTheater.id; 
    currentScreen = currentTheater.screens[foundScreenId];

    if (!currentScreen) {
      showBookingError(`Screen data for '${foundScreenId}' in theater '${foundTheaterName}' not found.`);
      return;
    }
    
    document.title = `Book ${movieData ? movieData.title : currentMovieId} - Sinefolis Cinemas`;

    loadBookingHeader(movieData, currentTheater, currentScreen, currentShowtime);
    initializeSeatMap(currentScreen, currentShowtime);
    initializeTicketTypes();
    initializeAddons();
    initializeStepNavigation();
    initializePaymentForm();
    initializeModals();
    updateOrderSummary();

    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "none";
  }
  
  function loadBookingHeader(movieData, theaterData, screenData, showtimeData) {
    if (movieData) {
        document.getElementById("movie-title").textContent = movieData.title;
        document.getElementById("movie-poster").src = movieData.poster || "/placeholder.svg?height=120&width=80";
        document.getElementById("movie-rating").textContent = movieData.rating || "-";
        document.getElementById("movie-duration").textContent = movieData.duration || "- min"; 
        document.getElementById("movie-genre").textContent = movieData.genres ? movieData.genres.join(", ") : "N/A";
    } else { 
        document.getElementById("movie-title").textContent = currentMovieId;
        document.getElementById("movie-poster").src = "/placeholder.svg?height=120&width=80";
        document.getElementById("movie-rating").textContent = "-";
        document.getElementById("movie-duration").textContent = "- min";
        document.getElementById("movie-genre").textContent = "N/A";
    }

    document.getElementById("theater-name").textContent = theaterData.name;
    document.getElementById("screen-name").textContent = screenData.name; 
    document.getElementById("show-format").textContent = showtimeData.format; 
    document.getElementById("showtime").textContent = showtimeData.time;

    const dateObj = new Date(currentShowDate + 'T00:00:00'); 
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    document.getElementById("show-date").textContent = dateObj.toLocaleDateString("en-US", options);

    const formatPricingElement = document.getElementById("format-pricing"); 
    if (showtimeData.format !== "Standard" && pricing.formatPricing[showtimeData.format] && formatPricingElement) {
      const formatNameElement = document.getElementById("format-name"); 
      const formatPriceElement = document.getElementById("format-price"); 
      if (formatNameElement && formatPriceElement) {
        const formatPrice = pricing.formatPricing[showtimeData.format] || 0;
        formatNameElement.textContent = showtimeData.format;
        formatPriceElement.textContent = `+$${formatPrice.toFixed(2)}`;
        formatPricingElement.style.display = "block";
      }
    } else if (formatPricingElement) {
        formatPricingElement.style.display = "none";
    }
  }

  function initializeSeatMap(screenData, showtimeData) {
    const seatMap = document.getElementById("seat-map");
    seatMap.innerHTML = ""; 

    const rows = screenData.rows;
    const seatsPerRow = screenData.seatsPerRow;
    const premiumRows = screenData.premiumRows || [];
    const handicapSeats = screenData.handicapSeats || [];
    const occupiedSeats = showtimeData.occupiedSeats || [];

    rows.forEach((rowLetter) => {
      const rowDiv = document.createElement("div");
      rowDiv.className = "row";
      rowDiv.dataset.row = rowLetter;
      const leftLabel = document.createElement("span");
      leftLabel.className = "row-label";
      leftLabel.textContent = rowLetter;
      rowDiv.appendChild(leftLabel);
      const seatsDiv = document.createElement("div");
      seatsDiv.className = "seats";
      for (let i = 1; i <= seatsPerRow; i++) {
        const seatId = `${rowLetter}${i}`;
        const seatBtn = document.createElement("button");
        seatBtn.className = "seat";
        seatBtn.dataset.seat = seatId;
        seatBtn.textContent = i;
        if (occupiedSeats.includes(seatId)) {
          seatBtn.classList.add("occupied");
          seatBtn.disabled = true;
        }
        if (premiumRows.includes(rowLetter)) seatBtn.classList.add("premium");
        if (handicapSeats.includes(seatId)) seatBtn.classList.add("handicap");
        seatsDiv.appendChild(seatBtn);
      }
      rowDiv.appendChild(seatsDiv);
      const rightLabel = document.createElement("span");
      rightLabel.className = "row-label";
      rightLabel.textContent = rowLetter;
      rowDiv.appendChild(rightLabel);
      seatMap.appendChild(rowDiv);
    });
    addSeatEventListeners();
  }

  function addSeatEventListeners() {
    document.querySelectorAll(".seat:not(.occupied)").forEach((seat) => {
      seat.addEventListener("click", function () {
        const seatId = this.dataset.seat;
        if (this.classList.contains("selected")) {
          this.classList.remove("selected");
          selectedSeats = selectedSeats.filter((id) => id !== seatId);
          const ticketType = selectedSeatTypes[seatId];
          if (ticketType && ticketCounts[ticketType] > 0) {
            ticketCounts[ticketType]--;
            const display = document.getElementById(`${ticketType}-qty`);
            if (display) display.textContent = ticketCounts[ticketType];
          }
          delete selectedSeatTypes[seatId];
        } else {
          showSeatSelectionModal(seatId, this);
        }
        updateSelectedSeatsDisplay();
        updateOrderSummary();
      });
    });
  }

  function showSeatSelectionModal(seatId, seatElement) {
    const modal = document.getElementById("seat-selection-modal");
    const selectedSeatIdElement = document.getElementById("selected-seat-id");
    const ticketTypeButtons = document.getElementById("ticket-type-buttons");

    if (!modal || !selectedSeatIdElement || !ticketTypeButtons) return;

    selectedSeatIdElement.textContent = seatId;
    ticketTypeButtons.innerHTML = "";

    Object.keys(pricing.tickets).forEach((type) => {
      const button = document.createElement("button");
      button.className = "ticket-type-button";
      button.dataset.type = type;
      const isPremiumSeat = seatElement.classList.contains("premium");
      const basePrice = pricing.tickets[type];
      const premiumSurcharge = isPremiumSeat ? (pricing.premiumSeating || 0) : 0;
      const formatSurcharge = (currentShowtime.format !== "Standard" && pricing.formatPricing[currentShowtime.format]) ? (pricing.formatPricing[currentShowtime.format] || 0) : 0;
      const totalPrice = basePrice + premiumSurcharge + formatSurcharge;
      button.innerHTML = `
          <span class="ticket-type-name">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
          <span class="ticket-type-price">$${totalPrice.toFixed(2)}</span>`;
      button.addEventListener("click", function () {
        ticketTypeButtons.querySelectorAll(".ticket-type-button").forEach(btn => btn.classList.remove("selected"));
        this.classList.add("selected");
      });
      ticketTypeButtons.appendChild(button);
    });
    modal.style.display = "block";
    document.getElementById("confirm-seat-selection").onclick = () => {
      const selectedButton = ticketTypeButtons.querySelector(".ticket-type-button.selected");
      if (selectedButton) {
        const ticketType = selectedButton.dataset.type;
        selectedSeats.push(seatId);
        selectedSeatTypes[seatId] = ticketType;
        ticketCounts[ticketType]++;
        const display = document.getElementById(`${ticketType}-qty`);
        if (display) display.textContent = ticketCounts[ticketType];
        seatElement.classList.add("selected");
        updateSelectedSeatsDisplay();
        updateOrderSummary();
        modal.style.display = "none";
      } else {
        alert("Please select a ticket type.");
      }
    };
    document.getElementById("cancel-seat-selection").onclick = () => {
      modal.style.display = "none";
    };
  }

  function initializeTicketTypes() {
    const ticketTypesList = document.getElementById("ticket-types");
    ticketTypesList.innerHTML = ""; 
    Object.keys(pricing.tickets).forEach((type) => {
      const basePrice = pricing.tickets[type];
      const formatSurcharge = (currentShowtime.format !== "Standard" && pricing.formatPricing[currentShowtime.format]) ? (pricing.formatPricing[currentShowtime.format] || 0) : 0;
      const displayPrice = basePrice + formatSurcharge; 
      const ticketTypeDiv = document.createElement("div");
      ticketTypeDiv.className = "ticket-type";
      ticketTypeDiv.innerHTML = `
          <div class="ticket-info">
              <h4>${type.charAt(0).toUpperCase() + type.slice(1)}</h4>
              <p>${getTicketTypeDescription(type)}</p>
          </div>
          <div class="ticket-price">$${displayPrice.toFixed(2)}</div>
          <div class="ticket-quantity">
              <button class="qty-btn minus" data-type="${type}" aria-label="Decrease ${type} quantity">-</button>
              <span class="qty-display" id="${type}-qty">0</span>
              <button class="qty-btn plus" data-type="${type}" aria-label="Increase ${type} quantity">+</button>
          </div>`;
      ticketTypesList.appendChild(ticketTypeDiv);
    });
    addTicketQuantityListeners();
  }

  function getTicketTypeDescription(type) {
    switch (type) {
      case "adult": return "Ages 18+";
      case "child": return "Ages 3-17";
      case "senior": return "Ages 65+";
      case "student": return "Valid student ID required";
      default: return "";
    }
  }

  function addTicketQuantityListeners() {
    Object.keys(pricing.tickets).forEach((type) => {
      const minusBtn = document.querySelector(`.qty-btn.minus[data-type="${type}"]`);
      const plusBtn = document.querySelector(`.qty-btn.plus[data-type="${type}"]`);
      const display = document.getElementById(`${type}-qty`);
      if (minusBtn && plusBtn && display) {
        minusBtn.addEventListener("click", () => {
          if (ticketCounts[type] > 0) {
            const seatToRemove = Object.keys(selectedSeatTypes).find(seatId => selectedSeatTypes[seatId] === type);
            if (seatToRemove) {
              selectedSeats = selectedSeats.filter((id) => id !== seatToRemove);
              delete selectedSeatTypes[seatToRemove];
              const seatElement = document.querySelector(`.seat[data-seat="${seatToRemove}"]`);
              if (seatElement) seatElement.classList.remove("selected");
              ticketCounts[type]--;
              display.textContent = ticketCounts[type];
              updateSelectedSeatsDisplay();
              updateOrderSummary();
            }
          }
        });
        plusBtn.addEventListener("click", () => {
          alert("Please select an available seat from the seat map to add tickets of a specific type.");
        });
      }
    });
  }
  
  function initializeAddons() {
    const addonsContainer = document.getElementById("addons-grid"); 
    if (!addonsContainer) {
        console.error("Addons container 'addons-grid' not found.");
        return;
    }
    addonsContainer.innerHTML = ""; 

    if (!addons || !addons.categories || !addons.items) {
        addonsContainer.innerHTML = "<p>Add-ons are currently unavailable.</p>";
        return;
    }

    Object.keys(addons.categories).forEach((categoryId) => {
      const category = addons.categories[categoryId];
      const categorySection = document.createElement("div");
      categorySection.className = "addon-category"; 
      categorySection.innerHTML = `<h3>${category.name}</h3><div class="addon-items" id="${categoryId}-items"></div>`;
      addonsContainer.appendChild(categorySection);
    });

    Object.keys(addons.items).forEach((itemId) => {
      const item = addons.items[itemId];
      const categoryItemsContainer = document.getElementById(`${item.category}-items`);
      if (categoryItemsContainer) {
        const addonItemDiv = document.createElement("div");
        addonItemDiv.className = `addon-item ${item.featured ? "featured" : ""}`; 
        let savingsHTML = item.savings ? `<span class="addon-savings">Save $${item.savings.toFixed(2)}</span>` : "";
        addonItemDiv.innerHTML = `
            <img src="${item.image || '/placeholder.svg?height=80&width=80'}" alt="${item.name}" class="addon-image">
            <div class="addon-info">
                <h4>${item.name}</h4>
                <p>${item.description}</p>
                <span class="addon-price">$${item.price.toFixed(2)}</span>
                ${savingsHTML}
            </div>
            <div class="addon-quantity">
                <button class="qty-btn minus" data-addon="${itemId}" aria-label="Decrease ${item.name}">-</button>
                <span class="qty-display" id="${itemId}-qty">0</span>
                <button class="qty-btn plus" data-addon="${itemId}" aria-label="Increase ${item.name}">+</button>
            </div>`;
        categoryItemsContainer.appendChild(addonItemDiv);
        addonCounts[itemId] = 0;
      }
    });
    addAddonQuantityListeners();
  }

  function addAddonQuantityListeners() {
    Object.keys(addons.items).forEach((itemId) => {
      const minusBtn = document.querySelector(`.qty-btn.minus[data-addon="${itemId}"]`);
      const plusBtn = document.querySelector(`.qty-btn.plus[data-addon="${itemId}"]`);
      const display = document.getElementById(`${itemId}-qty`);
      if (minusBtn && plusBtn && display) {
        minusBtn.addEventListener("click", () => {
          if (addonCounts[itemId] > 0) {
            addonCounts[itemId]--;
            display.textContent = addonCounts[itemId];
            updateOrderSummary();
          }
        });
        plusBtn.addEventListener("click", () => {
          addonCounts[itemId]++;
          display.textContent = addonCounts[itemId];
          updateOrderSummary();
        });
      }
    });
  }

  function initializeStepNavigation() {
    const continueBtn = document.getElementById("continue-btn");
    const backBtn = document.getElementById("back-btn");

    if (continueBtn) {
        continueBtn.addEventListener("click", () => { 
            if (validateCurrentStep()) {
                nextStep();
            }
        });
    }
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            if (currentStep === 4) { 
                window.location.href = "home.html"; // Changed to home.html
            } else {
                previousStep();
            }
        });
    }
  }

  function validateCurrentStep() {
    switch (currentStep) {
      case 1:
        const totalTickets = Object.values(ticketCounts).reduce((sum, count) => sum + count, 0);
        if (totalTickets === 0) {
          alert("Please select at least one ticket by clicking on available seats.");
          return false;
        }
        if (selectedSeats.length !== totalTickets) {
          alert(`Please ensure the number of selected seats (${selectedSeats.length}) matches the total tickets derived from seat selections (${totalTickets}). Re-select seats if necessary.`);
          return false;
        }
        return true;
      case 2: return true; 
      case 3:
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const termsCheckbox = document.getElementById("terms-checkbox");
        if (!email || !phone) { alert("Please fill in your contact information (Email and Phone)."); return false; }
        
        if (email.indexOf('@') === -1 || email.indexOf('.') === -1 || email.startsWith('@') || email.endsWith('.') || email.endsWith('@')) {
             alert("Please enter a valid email address."); return false; 
        }

        if (!termsCheckbox || !termsCheckbox.checked) { alert("Please agree to the terms and conditions."); return false; }
        const selectedPayment = document.querySelector('input[name="payment"]:checked');
        if (!selectedPayment) { alert("Please select a payment method."); return false; }
        if (selectedPayment.value === "card") {
          const cardNumber = document.getElementById("card-number").value;
          const expiry = document.getElementById("expiry").value;
          const cvv = document.getElementById("cvv").value;
          const cardholder = document.getElementById("cardholder").value.trim();
          if (!cardNumber || !expiry || !cvv || !cardholder) { alert("Please fill in all card details."); return false; }
        }
        return true;
      default: return true;
    }
  }

  function nextStep() {
    if (currentStep < 4) {
      currentStep++;
      updateStepDisplay();
      if (currentStep === 4) {
          processBooking();
      }
    }
  }

  function previousStep() {
    if (currentStep > 1) {
      currentStep--;
      updateStepDisplay();
    }
  }

  function updateStepDisplay() {
    document.querySelectorAll(".progress-step").forEach((step, index) => {
      step.classList.toggle("active", index + 1 <= currentStep);
    });
    document.querySelectorAll(".booking-step").forEach((step, index) => {
      step.classList.toggle("active", index + 1 === currentStep);
    });

    const backBtn = document.getElementById("back-btn");
    const continueBtn = document.getElementById("continue-btn");

    if (backBtn) {
        if (currentStep === 1) {
            backBtn.style.display = "none";
        } else if (currentStep === 4) {
            backBtn.innerHTML = '<span>🏠</span> Go to Homepage'; // Text changed for Step 4
            backBtn.style.display = "flex"; // Ensure it's visible
        } else {
            backBtn.innerHTML = '<span>←</span> Back'; // Original text for other steps
            backBtn.style.display = "flex";
        }
    }
    if (continueBtn) {
        if (currentStep === 4) {
            continueBtn.style.display = "none";
        } else {
            continueBtn.style.display = "flex";
            continueBtn.innerHTML = currentStep === 3 ? "Complete Booking <span>→</span>" : "Continue <span>→</span>";
        }
    }
  }

  function initializePaymentForm() {
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    const cardForm = document.getElementById("card-form");
    paymentOptions.forEach((option) => {
      option.addEventListener("change", function () {
        if (cardForm) cardForm.style.display = this.value === "card" ? "block" : "none";
      });
    });

    const cardNumberInput = document.getElementById("card-number");
    if (cardNumberInput) {
      cardNumberInput.addEventListener("input", function (e) { 
        let value = this.value;
        let digitsOnly = "";
        for (let i = 0; i < value.length; i++) {
            if (value[i] >= '0' && value[i] <= '9') {
                digitsOnly += value[i];
            }
        }
        digitsOnly = digitsOnly.substring(0, 16); 

        let formattedValue = "";
        for (let i = 0; i < digitsOnly.length; i++) {
          if (i > 0 && i % 4 === 0) formattedValue += " ";
          formattedValue += digitsOnly[i];
        }
        this.value = formattedValue;
      });
    }

    const expiryInput = document.getElementById("expiry");
    if (expiryInput) {
      expiryInput.addEventListener("input", function (e) { 
        let value = this.value;
        let digitsOnly = "";
        for (let i = 0; i < value.length; i++) {
            if (value[i] >= '0' && value[i] <= '9') {
                digitsOnly += value[i];
            }
        }

        let formattedValue = "";
        if (digitsOnly.length > 0) {
            formattedValue += digitsOnly.substring(0, Math.min(2, digitsOnly.length));
        }
        if (digitsOnly.length === 2 && e.inputType !== 'deleteContentBackward' && this.value.length === 2 && !this.value.includes('/')) {
            formattedValue += "/";
        } else if (digitsOnly.length > 2 && formattedValue.length === 2 && !this.value.includes('/')) {
            formattedValue += "/";
            formattedValue += digitsOnly.substring(2, Math.min(4, digitsOnly.length));
        } else if (digitsOnly.length > 2) {
             formattedValue += digitsOnly.substring(2, Math.min(4, digitsOnly.length));
        }
        
        this.value = formattedValue.substring(0,5); 
      });
    }
  }

  function initializeModals() {
    document.querySelectorAll(".close-modal").forEach(button => {
      button.addEventListener("click", function () { this.closest(".modal").style.display = "none"; });
    });
    window.addEventListener("click", (event) => { if (event.target.classList.contains("modal")) event.target.style.display = "none"; });
    document.querySelectorAll(".terms-link").forEach(link => {
      link.addEventListener("click", (e) => { e.preventDefault(); 
        const termsModal = document.getElementById("terms-modal");
        if (termsModal) termsModal.style.display = "block"; 
      });
    });
    const acceptTermsBtn = document.getElementById("accept-terms");
    if (acceptTermsBtn) {
      acceptTermsBtn.addEventListener("click", () => {
        const termsCheckbox = document.getElementById("terms-checkbox");
        if (termsCheckbox) termsCheckbox.checked = true;
        const termsModal = document.getElementById("terms-modal");
        if (termsModal) termsModal.style.display = "none";
      });
    }
  }

  function updateSelectedSeatsDisplay() {
    const selectedSeatsContainer = document.getElementById("selected-seats");
    if (!selectedSeatsContainer) return; 
    selectedSeatsContainer.innerHTML = selectedSeats.length > 0 ? selectedSeats.sort().join(", ") : '<span class="no-seats">No seats selected</span>';
  }

  function updateOrderSummary() {
    if (!pricing || !currentShowtime) return;
    updateTicketSummary();
    updateAddonsSummary();
    updatePricing(); 
  }

  function updateTicketSummary() {
    const ticketSummaryEl = document.getElementById("ticket-summary");
    if (!ticketSummaryEl) return;
    ticketSummaryEl.innerHTML = "";
    let hasTickets = false;

    Object.keys(ticketCounts).forEach(type => {
      const count = ticketCounts[type];
      if (count > 0) {
        hasTickets = true;
        let premiumCountForType = 0;
        selectedSeats.forEach(seatId => {
            if (selectedSeatTypes[seatId] === type) {
                const seatElement = document.querySelector(`.seat[data-seat="${seatId}"]`);
                if (seatElement && seatElement.classList.contains("premium")) premiumCountForType++;
            }
        });
        const regularCountForType = count - premiumCountForType;
        const basePrice = pricing.tickets[type];
        const formatSurcharge = (currentShowtime.format !== "Standard" && pricing.formatPricing[currentShowtime.format]) ? (pricing.formatPricing[currentShowtime.format] || 0) : 0;

        if (regularCountForType > 0) {
            const singleRegularPrice = basePrice + formatSurcharge;
            const item = document.createElement("div"); item.className = "summary-item";
            item.innerHTML = `<span>${regularCountForType}x ${type.charAt(0).toUpperCase() + type.slice(1)}</span><span>$${(singleRegularPrice * regularCountForType).toFixed(2)}</span>`;
            ticketSummaryEl.appendChild(item);
        }
        if (premiumCountForType > 0) {
            const singlePremiumPrice = basePrice + (pricing.premiumSeating || 0) + formatSurcharge;
            const item = document.createElement("div"); item.className = "summary-item";
            item.innerHTML = `<span>${premiumCountForType}x ${type.charAt(0).toUpperCase() + type.slice(1)} (Premium)</span><span>$${(singlePremiumPrice * premiumCountForType).toFixed(2)}</span>`;
            ticketSummaryEl.appendChild(item);
        }
      }
    });
    if (!hasTickets) ticketSummaryEl.innerHTML = '<span class="no-items">No tickets selected</span>';
  }

  function updateAddonsSummary() {
    const addonsSection = document.getElementById("addons-summary");
    const addonsList = document.getElementById("addons-list"); 
    if (!addonsList || !addonsSection || !addons || !addons.items) return;
    addonsList.innerHTML = "";
    let hasAddons = false;
    Object.keys(addonCounts).forEach((itemId) => {
      const count = addonCounts[itemId];
      if (count > 0) {
        hasAddons = true;
        const item = addons.items[itemId];
        const total = count * item.price;
        const summaryItem = document.createElement("div");
        summaryItem.className = "summary-item";
        summaryItem.innerHTML = `<span>${count}x ${item.name}</span><span>$${total.toFixed(2)}</span>`;
        addonsList.appendChild(summaryItem);
      }
    });
    addonsSection.style.display = hasAddons ? "block" : "none";
  }

  function updatePricing() { 
    let subtotal = 0;
    selectedSeats.forEach(seatId => {
        const type = selectedSeatTypes[seatId];
        const seatElement = document.querySelector(`.seat[data-seat="${seatId}"]`);
        const isPremium = seatElement && seatElement.classList.contains("premium");
        const basePrice = pricing.tickets[type];
        const premiumSurcharge = isPremium ? (pricing.premiumSeating || 0) : 0;
        const formatSurcharge = (currentShowtime.format !== "Standard" && pricing.formatPricing[currentShowtime.format]) ? (pricing.formatPricing[currentShowtime.format] || 0) : 0;
        subtotal += basePrice + premiumSurcharge + formatSurcharge;
    });
    Object.keys(addonCounts).forEach((itemId) => { 
      const count = addonCounts[itemId];
      if (count > 0) subtotal += count * addons.items[itemId].price;
    });

    const serviceFee = subtotal > 0 ? (pricing.serviceFee || 0) : 0;
    const taxes = (subtotal + serviceFee) * (pricing.taxRate || 0);
    const total = subtotal + serviceFee + taxes;

    document.getElementById("subtotal").textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById("service-fee").textContent = `$${serviceFee.toFixed(2)}`;
    document.getElementById("taxes").textContent = `$${taxes.toFixed(2)}`;
    document.getElementById("total").textContent = `$${total.toFixed(2)}`;
  }

  function processBooking() {
    const bookingId = `SIN-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    let movieTitleForConfirmation = currentMovieId; 

    if (moviesData && Array.isArray(moviesData)) {
        const movieForConfirm = moviesData.find(movie => movie.id === currentMovieId);
        if (movieForConfirm) {
            movieTitleForConfirmation = movieForConfirm.title;
        }
    }

    document.getElementById("booking-id").textContent = bookingId;
    document.getElementById("confirm-movie").textContent = movieTitleForConfirmation;
    document.getElementById("confirm-datetime").textContent = `${currentShowDate} - ${currentShowtime.time}`;
    document.getElementById("confirm-theater").textContent = currentTheater.name;
    document.getElementById("confirm-screen").textContent = currentScreen.name; 
    document.getElementById("confirm-format").textContent = currentShowtime.format; 
    document.getElementById("confirm-seats").textContent = selectedSeats.sort().join(", ");

    document.getElementById("download-tickets").addEventListener("click", () => alert("Downloading tickets... (Feature not implemented)"));
    document.getElementById("email-tickets").addEventListener("click", () => alert("Tickets sent to your email! (Feature not implemented)"));
    const addCalendarBtn = document.getElementById("add-calendar"); 
    if(addCalendarBtn) addCalendarBtn.addEventListener("click", () => alert("Event added to calendar! (Feature not implemented)"));

    const backToHomeBtnMain = document.getElementById("back-to-home-btn"); // Main content button
    if (backToHomeBtnMain) {
        backToHomeBtnMain.addEventListener("click", () => {
            window.location.href = "home.html"; 
        });
    }
  }
  initializeBooking();
});