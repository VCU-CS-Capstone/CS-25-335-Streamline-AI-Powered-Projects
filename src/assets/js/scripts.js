// ===== Random Background Image Logic =====
const images = [
  '../assets/images/bg1.jpg',
  '../assets/images/bg2.jpg',
  '../assets/images/bg3.jpg',
  '../assets/images/bg4.jpg',
  '../assets/images/bg5.jpg',
  '../assets/images/bg6.jpg',
  '../assets/images/bg7.jpg',
  '../assets/images/bg8.jpg',
  '../assets/images/bg9.jpg',
  '../assets/images/bg10.jpg',
  '../assets/images/bg11.jpg',
  '../assets/images/bg12.jpg'
];

function setRandomBackground() {
  const randomIndex = Math.floor(Math.random() * images.length);
  const selectedImage = images[randomIndex];
  document.body.style.background = `url('${selectedImage}') no-repeat center center fixed`;
  document.body.style.backgroundSize = 'cover';
}

// Set an initial random background
setRandomBackground();

// Change background every 5 seconds
setInterval(setRandomBackground, 5000);

// ===== Existing Fetch and Blog Post Logic =====
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
    },
    {
      title: "Adventure in the Amazon Rainforest",
      lat: 3.4653,
      lng: -62.2159,
      url: "amazon-blog-post.html"
    },
    {
      title: "Cultural Experiences in Japan",
      lat: 35.6764,
      lng: 139.6500,
      url: "japan-blog-post.html"
    },
    {
      title: "Daytona Beach",
      latitude: 29.2108,
      longitude: -81.0228
    },
    {
      title: "Jamaica",
      latitude: 18.1096,
      longitude: -77.2975
    },
    {
      title: "Bahamas",
      latitude: 25.0343,
      longitude: -77.3963
    },
    {
      title: "Dominican Republic",
      latitude: 18.7357,
      longitude: -70.1627
    },
    {
      title: "Curacao",
      latitude: 12.1696,
      longitude: -68.9900
    },
    {
      title: "Aruba",
      latitude: 12.5211,
      longitude: -69.9683
    },
    {
      title: "Turks and Caicos",
      latitude: 21.6940,
      longitude: -71.7979
    }
];

// 1. Choose a random index from the array
const randomIndex = Math.floor(Math.random() * blogPosts.length);
const randomPost = blogPosts[randomIndex];

// 2. Build the HTML for our random post
const randomBlogHTML = `
  <div class="blog-post-card">
    <img src="${randomPost.imageSrc}" alt="${randomPost.altText}">
    <h3>${randomPost.title}</h3>
    <p>${randomPost.snippet}</p>
    <a href="${randomPost.link}" class="read-more">Read More</a>
  </div>
`;

// 3. Inject this HTML into the page
const randomBlogContainer = document.getElementById("randomBlogContainer");
randomBlogContainer.innerHTML = randomBlogHTML;


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
