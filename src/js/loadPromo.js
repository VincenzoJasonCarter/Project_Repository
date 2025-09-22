document.addEventListener('DOMContentLoaded', function() {
    // To select which promo to display:
    // Option 1: Get promo ID from URL query parameter (e.g., index.html?promo=20offfries)
    const urlParams = new URLSearchParams(window.location.search);
    let promoIdToLoad = urlParams.get('id');

    // Option 2: If no URL parameter, use a default or a predefined one.
    if (!promoIdToLoad) {
        // IMPORTANT: Make sure '20offfries' or another valid key from your JSON is here
        promoIdToLoad = '20offfries';
    }

    fetch('../../data/promos.json') // Make sure this path is correct
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json(); // This parses the JSON
        })
        .then(allPromos => { // 'allPromos' will be the entire object from your promos.json
            const promoData = allPromos[promoIdToLoad];

            if (promoData) {
                populatePromoDetails(promoData);
                setupCopyButton();
            } else {
                console.error('Promo not found:', promoIdToLoad);
                document.querySelector('.promo-container').innerHTML = `<h1>Promo "${promoIdToLoad}" not found</h1><p>Please ensure the ID is correct and exists in promos.json.</p>`;
            }
        })
        .catch(error => {
            console.error('Error fetching or processing promo data:', error);
            // This will catch the "TypeError" if it's happening before this point,
            // or other errors like network issues or if promos.json is not valid JSON.
            document.querySelector('.promo-container').innerHTML = '<h1>Error loading promo details. Please try again later.</h1>';
        });
});

// Ensure the rest of your populatePromoDetails function is as provided in the second example,
// as it's tailored to the field names in your JSON (title, description, image, code, prerequisite).
function populatePromoDetails(promo) {
    // Required fields from your JSON
    document.getElementById('promo-title').textContent = promo.title || 'Promo Title Missing';
    document.getElementById('promo-description').textContent = promo.description || 'No description available.';
    document.getElementById('promo-prerequisite').textContent = promo.prerequisite || 'No specific prerequisites listed.';
    document.getElementById('promo-code').textContent = promo.code || 'N/A';

    const promoImage = document.getElementById('promo-image');
    if (promo.image) {
        promoImage.src = promo.image;
        promoImage.alt = promo.title || 'Promotion Image';
    } else {
        promoImage.src = ''; // Clear src if no image
        promoImage.alt = 'No image available';
        promoImage.style.display = 'none';
    }

    // Optional fields (check if they exist in the promo data)
    const taglineElement = document.getElementById('promo-tagline');
    if (promo.tagline) {
        taglineElement.textContent = promo.tagline;
        taglineElement.style.display = 'block';
    } else {
        taglineElement.style.display = 'none';
    }

    const detailedTermsSection = document.getElementById('promo-detailed-terms-section');
    const termsList = document.getElementById('promo-detailed-terms');
    if (promo.detailedTerms && Array.isArray(promo.detailedTerms) && promo.detailedTerms.length > 0) {
        termsList.innerHTML = ''; // Clear any existing terms
        promo.detailedTerms.forEach(term => {
            const listItem = document.createElement('li');
            listItem.textContent = term;
            termsList.appendChild(listItem);
        });
        detailedTermsSection.style.display = 'block';
    } else {
        detailedTermsSection.style.display = 'none';
    }

    const validitySection = document.getElementById('promo-validity-section');
    const validityElement = document.getElementById('promo-validity');
    if (promo.validUntil) {
        validityElement.textContent = promo.validUntil;
        validitySection.style.display = 'block';
    } else {
        validitySection.style.display = 'none';
    }

    const ctaButton = document.getElementById('promo-cta-button');
    if (promo.ctaButton && promo.ctaButton.text && promo.ctaButton.link) {
        ctaButton.textContent = promo.ctaButton.text;
        ctaButton.href = promo.ctaButton.link;
        ctaButton.style.display = 'inline-block';
    } else {
        ctaButton.style.display = 'none';
    }
}


function setupCopyButton() {
    const copyButton = document.getElementById('copy-promo-button');
    const promoCodeSpan = document.getElementById('promo-code');

    if (copyButton && promoCodeSpan) {
        // Only show button if there's a code to copy (and it's not 'N/A')
        if (promoCodeSpan.textContent && promoCodeSpan.textContent !== 'N/A') {
            copyButton.style.display = 'inline-block'; // Ensure it's visible
            
            copyButton.addEventListener('click', function() {
                const promoCodeToCopy = promoCodeSpan.textContent;

                // Use the Clipboard API
                navigator.clipboard.writeText(promoCodeToCopy).then(function() {
                    // Success feedback
                    const originalText = copyButton.textContent;
                    copyButton.textContent = 'Copied!';
                    copyButton.classList.add('copied'); // Optional: for styling
                    copyButton.disabled = true; // Prevent multiple clicks

                    // Revert button text and state after a few seconds
                    setTimeout(function() {
                        copyButton.textContent = originalText;
                        copyButton.classList.remove('copied');
                        copyButton.disabled = false;
                    }, 2000); // 2 seconds

                }).catch(function(err) {
                    console.error('Failed to copy promo code: ', err);
                    // You could alert the user or display a small error message here
                    // For example: alert('Could not copy code. Please try manually.');
                });
            });
        } else {
            copyButton.style.display = 'none'; // Hide if no code or code is 'N/A'
        }
    }
}