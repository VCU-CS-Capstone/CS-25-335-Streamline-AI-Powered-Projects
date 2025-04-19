// Global Navbar Functionality
document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const overlay = document.getElementById('overlay');
  const body = document.body;
  
  function toggleMenu() {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
    overlay.classList.toggle('active');
    body.classList.toggle('menu-open');
  }
  
  function closeMenu() {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
    overlay.classList.remove('active');
    body.classList.remove('menu-open');
  }
  
  if (hamburger) {
    hamburger.addEventListener('click', toggleMenu);
  }
  
  if (overlay) {
    overlay.addEventListener('click', closeMenu);
  }
  
  // Close menu when clicking a nav link
  document.querySelectorAll('.nav-links').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
  
  // Set active link based on current page
  const currentPage = window.location.pathname.split('/').pop();
  const navLinks2 = document.querySelectorAll('.nav-links');
  
  navLinks2.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || 
        (currentPage === '' && href === 'index.html') || 
        (href !== 'index.html' && currentPage.includes(href.split('.')[0]))) {
      link.classList.add('active');
    }
  });
  
  // Dark mode functionality
  const themeToggle = document.getElementById('theme-toggle');
  const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
  
  // Check for saved theme preference or use preferred color scheme
  const savedTheme = localStorage.getItem('theme') || 
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  // Apply saved theme on load
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    updateThemeIcons(true);
  } else {
    updateThemeIcons(false);
  }
  
  // Function to update theme icons
  function updateThemeIcons(isDark) {
    const icon = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    const mobileLabel = isDark ? 'Toggle light mode' : 'Toggle dark mode';
    
    if (themeToggle) {
      themeToggle.innerHTML = icon;
    }
    
    if (mobileThemeToggle) {
      mobileThemeToggle.innerHTML = icon;
      mobileThemeToggle.style.setProperty('--theme-label', `'${mobileLabel}'`);
    }
  }
  
  // Function to toggle theme
  function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcons(isDark);
  }
  
  // Toggle theme on button click
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  if (mobileThemeToggle) {
    mobileThemeToggle.addEventListener('click', toggleTheme);
  }
  // ===== Replace glitch CDN URLs with local assets =====
  // Replace image sources
  document.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src');
    if (src && src.includes('cdn.glitch')) {
      const parts = src.split('/');
      const file = parts.pop().split('?')[0];
      const fileName = decodeURIComponent(file);
      const prefix = window.location.pathname.includes('/blogs/') ? '../assets/images/' : 'assets/images/';
      img.src = prefix + fileName;
    }
  });
  // Replace video source URLs to use local assets
  document.querySelectorAll('video source').forEach(source => {
    const src = source.getAttribute('src');
    if (src && src.includes('cdn.glitch')) {
      const parts = src.split('/');
      const file = parts.pop().split('?')[0];
      const fileName = decodeURIComponent(file);
      // Determine correct relative path prefix
      const videoPrefix = window.location.pathname.includes('/blogs/')
        ? '../assets/videos/'
        : 'assets/videos/';
      source.src = videoPrefix + fileName;
      const video = source.closest('video');
      if (video) video.load();
    }
  });
  // Replace computed background-image URLs
  document.querySelectorAll('*').forEach(el => {
    const bgImage = window.getComputedStyle(el).getPropertyValue('background-image');
    if (bgImage && bgImage !== 'none' && bgImage.includes('cdn.glitch')) {
      const match = bgImage.match(/url\(['"]?(.*?)['"]?\)/);
      if (match) {
        const url = match[1];
        const parts = url.split('/');
        const file = parts.pop().split('?')[0];
        const fileName = decodeURIComponent(file);
        const prefix = window.location.pathname.includes('/blogs/') ? '../assets/images/' : 'assets/images/';
        const newBgImage = bgImage.replace(/url\(['"]?.*?['"]?\)/, `url('${prefix}${fileName}')`);
        el.style.backgroundImage = newBgImage;
      }
    }
  });
}); 