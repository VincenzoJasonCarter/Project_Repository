  function navigateTo(url) {
    const loader = document.getElementById('loader');
    loader.classList.add('active');
    setTimeout(() => {
      window.location.href = url;
    }, 600); // adjust delay as needed
  }