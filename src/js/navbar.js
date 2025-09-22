document.addEventListener("DOMContentLoaded", function () {
    fetch("components/navbar.html") 
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok: " + response.statusText);
            return response.text();
        })
        .then(data => {
            const navbarElement = document.querySelector(".navbar");
            if (navbarElement) {
                navbarElement.innerHTML = data;

                const navbarToggler = navbarElement.querySelector(".navbar-toggler");
                const navbarCollapse = navbarElement.querySelector(".navbar_collapse");

                if (navbarToggler && navbarCollapse) {
                    navbarToggler.addEventListener("click", function () {
                        const isOpen = navbarCollapse.classList.toggle("open");
                        navbarToggler.setAttribute("aria-expanded", isOpen);
                        if (isOpen) {
                            navbarToggler.innerHTML = "&#10005;";
                        } else {
                            navbarToggler.innerHTML = "&#9776;";
                        }
                    });
                } else {
                    console.error("Navbar toggler or collapse element not found after loading navbar HTML. Check class names in components/navbar.html.");
                }

                populateAuthLinks(navbarElement);

            } else {
                console.error("Element with class 'navbar' (the main container) not found in your host HTML.");
            }
        })
        .catch(err => console.error("Failed to load navbar:", err));
});

function populateAuthLinks(navbarElement) {
    const navbarCollapse = navbarElement.querySelector(".navbar_collapse");
    if (!navbarCollapse) {
        console.error(".navbar_collapse element not found within the loaded navbar.");
        return;
    }

    let authContainer = navbarCollapse.querySelector(".navbar_auth");
    if (!authContainer) {
        console.warn(".navbar_auth container not found in components/navbar.html, creating one.");
        authContainer = document.createElement('div');
        authContainer.className = 'navbar_auth';
        navbarCollapse.appendChild(authContainer); 
    }
    
    authContainer.innerHTML = ''; 

    const isLoggedIn = false; 

    if (isLoggedIn) {
        const profileLink = document.createElement('a');
        profileLink.href = 'profile.html'; 
        profileLink.className = 'navbar_item'; 
        profileLink.textContent = 'Profile';
        authContainer.appendChild(profileLink);

        const logoutButton = document.createElement('a');
        logoutButton.href = '#'; 
        logoutButton.className = 'navbar_item navbar_button'; 
        logoutButton.textContent = 'Logout';
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Logout clicked! Implement logout logic.');
            window.location.reload(); 
        });
        authContainer.appendChild(logoutButton);

    } else {
        const loginButton = document.createElement('a');
        loginButton.href = 'login.html'; 
        loginButton.className = 'navbar_item navbar_button login-button';
        loginButton.textContent = 'Login';
        authContainer.appendChild(loginButton);

        const signupButton = document.createElement('a');
        signupButton.href = 'signup.html'; 
        signupButton.className = 'navbar_item navbar_button signup-button';
        signupButton.textContent = 'Sign Up';
        authContainer.appendChild(signupButton);
    }
}