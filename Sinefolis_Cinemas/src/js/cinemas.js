if (typeof navigateTo === 'undefined') {
    function navigateTo(url) {
        window.location.href = url;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("Cinemas page loaded.");
    if (window.location.hash) {
        const element = document.querySelector(window.location.hash);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
});