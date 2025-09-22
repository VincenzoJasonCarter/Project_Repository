document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.classList.add('active'); // Show loader
    }

    const membershipNameElement = document.getElementById('membershipName');
    const membershipIconElement = document.getElementById('membershipIcon');
    const membershipDescriptionElement = document.getElementById('membershipDescription');
    const membershipBenefitsListElement = document.getElementById('membershipBenefitsList');
    const membershipPriceElement = document.getElementById('membershipPrice');
    const membershipCtaButtonElement = document.getElementById('membershipCtaButton');
    const membershipDetailContent = document.getElementById('membershipDetailContent');
    const membershipNotFoundElement = document.getElementById('membershipNotFound');

    const params = new URLSearchParams(window.location.search);
    const tierId = params.get('tier');

    if (!tierId) {
        displayError("No membership tier specified.");
        if (loader) loader.classList.remove('active');
        return;
    }

    // Adjust the path to your memberships.json file as needed
    fetch('../../data/memberships.json') 
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const tier = data.find(t => t.id === tierId);

            if (tier) {
                document.title = `${tier.name} - Sinefolis Cinemas`;
                if(membershipNameElement) membershipNameElement.textContent = tier.name;
                if(membershipIconElement) {
                    membershipIconElement.src = tier.icon;
                    membershipIconElement.alt = `${tier.name} Icon`;
                }
                if(membershipDescriptionElement) membershipDescriptionElement.textContent = tier.description;
                
                if(membershipBenefitsListElement) {
                    membershipBenefitsListElement.innerHTML = ''; // Clear existing
                    tier.benefits.forEach(benefit => {
                        const li = document.createElement('li');
                        li.textContent = benefit;
                        membershipBenefitsListElement.appendChild(li);
                    });
                }

                if(membershipPriceElement) membershipPriceElement.textContent = tier.price;
                
                if(membershipCtaButtonElement) {
                    membershipCtaButtonElement.textContent = tier.cta_text;
                    if (tier.action_url) {
                        membershipCtaButtonElement.onclick = () => {
                            window.location.href = tier.action_url; // Or handle signup differently
                        };
                    } else {
                         membershipCtaButtonElement.disabled = true;
                    }
                }
                if(membershipDetailContent) membershipDetailContent.style.display = 'block';
                if(membershipNotFoundElement) membershipNotFoundElement.style.display = 'none';

            } else {
                displayError(`Membership tier "${tierId}" not found.`);
            }
        })
        .catch(error => {
            console.error('Error fetching membership details:', error);
            displayError("Could not load membership details. Please try again later.");
        })
        .finally(() => {
            if (loader) {
                loader.classList.remove('active'); // Hide loader
            }
        });

    function displayError(message) {
        if(membershipDetailContent) membershipDetailContent.style.display = 'none';
        if(membershipNotFoundElement) {
            membershipNotFoundElement.style.display = 'block';
            const p = membershipNotFoundElement.querySelector('p');
            if (p) p.textContent = message;
        }
         if (loader) loader.classList.remove('active');
    }
});