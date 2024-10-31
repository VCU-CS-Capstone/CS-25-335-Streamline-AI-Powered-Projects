// Fetch blog posts from JSON file
fetch('posts.json')
  .then(response => response.json())
  .then(posts => {
    displayPosts(posts);

    // Add event listener for category filtering
    const filterButtons = document.querySelectorAll('.blog-filters button');
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const filter = button.getAttribute('data-filter');
        const filteredPosts = filter === "All" ? posts : posts.filter(post => post.category === filter);
        displayPosts(filteredPosts);
      });
    });

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', () => {
      const searchTerm = searchInput.value.toLowerCase();
      const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.snippet.toLowerCase().includes(searchTerm) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
      displayPosts(filteredPosts);
    });
  });

// Function to display blog posts
function displayPosts(posts) {
  const blogPostsContainer = document.getElementById('blogPostsContainer');
  blogPostsContainer.innerHTML = ''; // Clear previous content
  posts.forEach(post => {
    const postElement = document.createElement('div');
    postElement.classList.add('blog-post-card');
    postElement.innerHTML = `
      <img src="${post.image}" alt="${post.title}">
      <div class="blog-post-content">
        <h3>${post.title}</h3>
        <p>${post.snippet}</p>
        <a href="${post.url}" class="read-more">Read More</a>
      </div>
    `;
    blogPostsContainer.appendChild(postElement);
  });
}

// Blog post data
const blogPosts = [
    {
      title: "Alps Adventure",
      lat: 46.8182,
      lng: 8.2275,
      url: "alps-blog-post.html"
    },
    {
      title: "Paris City Guide",
      lat: 48.8566,
      lng: 2.3522,
      url: "paris-blog-post.html"
    },
    {
      title: "Exploring Thailand",
      lat: 15.8700,
      lng: 100.9925,
      url: "thailand-blog-post.html"
    }
  ];


  // Initialize map
  const map = L.map('map').setView([20.0, 0.0], 2); // World view

  // Add tile layer to map
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Add markers for each blog post
  blogPosts.forEach(post => {
    const marker = L.marker([post.lat, post.lng]).addTo(map);
    marker.bindPopup(`<b>${post.title}</b><br><a href="${post.url}">Read More</a>`);
    marker.on('click', function() {
      window.location.href = post.url;
    });
  });

  // Search function
  function searchBlogPosts() {
    const query = document.getElementById("searchBar").value.toLowerCase();
    const postsContainer = document.getElementById("blogPostsContainer");
    const blogCards = postsContainer.getElementsByClassName("blog-post-card");

    Array.from(blogCards).forEach(card => {
      const title = card.querySelector("h3").textContent.toLowerCase();
      card.style.display = title.includes(query) ? "block" : "none";
    });
  }
