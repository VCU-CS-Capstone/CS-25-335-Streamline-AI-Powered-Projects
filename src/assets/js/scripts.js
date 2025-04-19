// ===== Random Background Image Logic =====
const images = [
  'assets/images/bg1.jpg',
  'assets/images/bg2.jpg',
  'assets/images/bg3.jpg',
  'assets/images/bg4.jpeg',
  'assets/images/bg5.jpg',
  'assets/images/bg6.jpg',
  'assets/images/bg7.jpg',
  'assets/images/bg8.jpg',
  'assets/images/bg9.jpg',
  'assets/images/bg10.avif',
  'assets/images/bg11.jpg',
  'assets/images/bg12.jpg',
  'assets/images/bg13.webp',
  'assets/images/bg14.jpg',
  'assets/images/bg15.jpg',
  'assets/images/bg16.jpg',
  'assets/images/bg17.jpg',
  'assets/images/bg18.jpg',
  'assets/images/bg19.jpg',
  'assets/images/bg20.jpg',
  'assets/images/bg21.jpg',
  'assets/images/bg22.avif'
];

const fadeTime = 1;   // seconds for fade transition
const delayTime = 0.5; // delay before fading out current image

let currentBgIndex = Math.floor(Math.random() * images.length);
let currentLayer = 1; // 1 means bg1 is active, 2 means bg2 is active

const bg1 = document.getElementById('bg1');
const bg2 = document.getElementById('bg2');

// Set initial background on bg1
bg1.style.backgroundImage = `url('${images[currentBgIndex]}')`;
bg1.style.opacity = 1;
bg2.style.opacity = 0;

function changeBackground() {
  let nextIndex;
  // Ensure the new image is different from the current one
  do {
    nextIndex = Math.floor(Math.random() * images.length);
  } while (nextIndex === currentBgIndex);
  currentBgIndex = nextIndex;
  const newImageUrl = images[currentBgIndex];
  
  // Preload the new image
  const img = new Image();
  img.src = newImageUrl;
  img.onload = () => {
    if (currentLayer === 1) {
      // For overlapping effect:
      // - Set bg2 to fade in immediately (no delay)
      // - Delay bg1's fade-out by delayTime seconds
      bg2.style.transition = `opacity ${fadeTime}s ease-in-out`;
      bg1.style.transition = `opacity ${fadeTime}s ease-in-out ${delayTime}s`;
      bg2.style.backgroundImage = `url('${newImageUrl}')`;
      bg2.style.opacity = 1;
      bg1.style.opacity = 0;
      currentLayer = 2;
    } else {
      bg1.style.transition = `opacity ${fadeTime}s ease-in-out`;
      bg2.style.transition = `opacity ${fadeTime}s ease-in-out ${delayTime}s`;
      bg1.style.backgroundImage = `url('${newImageUrl}')`;
      bg1.style.opacity = 1;
      bg2.style.opacity = 0;
      currentLayer = 1;
    }
  };
}

// Change background every 5 seconds
setInterval(changeBackground, 8000);

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
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredPosts = posts.filter(post =>
          post.title.toLowerCase().includes(searchTerm) ||
          post.snippet.toLowerCase().includes(searchTerm) ||
          post.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
        displayPosts(filteredPosts);
      });
    }
  });

// Function to display blog posts
function displayPosts(posts) {
  const blogPostsContainer = document.getElementById('blogPostsContainer');
  if (!blogPostsContainer) return;
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

// Blog post data for random pick
const blogPosts = [
    // Caribbean Destinations
  {
    title: "Jamaica",
    lat: 18.1096,
    lng: -77.2975,
    url: "blogs/jamaica.html"
  },
  {
    title: "Dominican Republic",
    lat: 18.7357,
    lng: -70.1627,
    url: "blogs/dominican-republic.html"
  },
  {
    title: "Curaçao",
    lat: 12.1696,
    lng: -68.9900,
    url: "blogs/curacao.html"
  },
  {
    title: "Aruba",
    lat: 12.5211,
    lng: -69.9683,
    url: "blogs/aruba.html"
  },
  {
    title: "Turks and Caicos",
    lat: 21.6940,
    lng: -71.7979,
    url: "blogs/turks-and-caicos.html"
  },
  {
    title: "Bahamas",
    lat: 25.0343,
    lng: -77.3963,
    url: "blogs/bahamas.html"
  },

  // Mexico Destinations
  {
    title: "Cancun",
    lat: 21.1619,
    lng: -86.8515,
    url: "blogs/cancun.html"
  },
  {
    title: "Riviera Maya",
    lat: 20.6231,
    lng: -87.0739,
    url: "blogs/riviera-maya.html"
  },
  {
    title: "Yucatan Peninsula",
    lat: 20.4004,
    lng: -89.1349,
    url: "blogs/yucatan-peninsula.html"
  },
  {
    title: "Puerto Vallarta",
    lat: 20.6534,
    lng: -105.2253,
    url: "blogs/puerto-vallarta.html"
  },
  {
    title: "Cabo San Lucas",
    lat: 22.8905,
    lng: -109.9167,
    url: "blogs/cabo-san-lucas.html"
  },

  // Hawaii Destinations
  {
    title: "Oahu",
    lat: 21.4389,
    lng: -158.0001,
    url: "blogs/oahu.html"
  },
  {
    title: "Maui",
    lat: 20.7984,
    lng: -156.3319,
    url: "blogs/maui.html"
  },
  {
    title: "Kauai",
    lat: 22.0964,
    lng: -159.5261,
    url: "blogs/kauai.html"
  },
  {
    title: "Big Island",
    lat: 19.5429,
    lng: -155.6659,
    url: "blogs/big-island.html"
  },

  // Latin America Destinations
  {
    title: "Costa Rica",
    lat: 9.7489,
    lng: -83.7534,
    url: "blogs/costa-rica.html"
  },
  {
    title: "Panama",
    lat: 8.5380,
    lng: -80.7821,
    url: "blogs/panama.html"
  },
  {
    title: "Belize",
    lat: 17.1899,
    lng: -88.4976,
    url: "blogs/belize.html"
  },

  // Greece Destinations
  {
    title: "Santorini",
    lat: 36.3932,
    lng: 25.4615,
    url: "blogs/santorini.html"
  },
  {
    title: "Mykonos",
    lat: 37.4467,
    lng: 25.3289,
    url: "blogs/mykonos.html"
  },
  {
    title: "Athens",
    lat: 37.9838,
    lng: 23.7275,
    url: "blogs/athens.html"
  },

  // Italy Destinations
  {
    title: "Amalfi Coast",
    lat: 40.6333,
    lng: 14.6020,
    url: "blogs/amalfi-coast.html"
  },
  {
    title: "Venice",
    lat: 45.4408,
    lng: 12.3155,
    url: "blogs/venice.html"
  },
  {
    title: "Tuscany",
    lat: 43.7711,
    lng: 11.2486,
    url: "blogs/tuscany.html"
  },
  {
    title: "Florence",
    lat: 43.7696,
    lng: 11.2558,
    url: "blogs/florence.html"
  },
  {
    title: "Rome",
    lat: 41.9028,
    lng: 12.4964,
    url: "blogs/rome.html"
  },

  // Florida Destinations
  {
    title: "Florida Keys",
    lat: 24.5551,
    lng: -81.7800,
    url: "blogs/florida-keys.html"
  },
  {
    title: "Tampa Bay Area",
    lat: 27.9506,
    lng: -82.4572,
    url: "blogs/tampabayarea.html"
  },
  {
    title: "Destin",
    lat: 30.3935,
    lng: -86.4958,
    url: "blogs/destin.html"
  },
  {
    title: "Daytona Beach",
    lat: 29.2108,
    url: "blogs/daytona-beach.html"},
  {
    title: "England",
    lat: 52.908,
    lng: -2.306,
    url: "blogs/england.html"
  },

  // Ireland
  {
    title: "Ireland",
    lat: 53.0000,
    lng: -8.0000,
    url: "blogs/ireland.html"
  },

  // Scotland
  {
    title: "Scotland",
    lat: 56.4907,
    lng: -4.2026,
    url: "blogs/scotland.html"
  }
];

// 1. Choose a random index from the array
const randomIndex = Math.floor(Math.random() * blogPosts.length);
const randomPost = blogPosts[randomIndex];

// 2. Build the HTML for our random post
// For demonstration, we keep placeholders for snippet/image
const randomBlogHTML = `
  <div class="blog-post-card">
    <img src="${randomPost.imageSrc || 'assets/images/daytona.jpg'}" alt="${randomPost.title || 'Random Post'}">
    <h3>${randomPost.title || ''}</h3>
    <p>${randomPost.snippet || 'Random snippet...'}</p>
    <a href="${randomPost.link || '#'}" class="read-more">Read More</a>
  </div>
`;

// 3. Inject this HTML into the page (if the container is present)
const randomBlogContainer = document.getElementById("randomBlogContainer");
if (randomBlogContainer) {
  randomBlogContainer.innerHTML = randomBlogHTML;
}

// Initialize map if #map is present
const mapElement = document.getElementById('map');
if (mapElement) {
  const map = L.map('map', { minZoom: 2 }).setView([20.0, 0.0], 2); // World view

  // Add tile layer to map
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Add markers for each blog post that has lat/lng
  blogPosts.forEach(post => {
    if (post.lat && post.lng) {
      const marker = L.marker([post.lat, post.lng]).addTo(map);
      marker.bindPopup(`<b>${post.title}</b><br><a href="${post.url}">Read More</a>`);
      marker.on('click', function() {
        window.location.href = post.url;
      });
    }
  });
}

// Search function for blog posts
function searchBlogPosts() {
  const query = document.getElementById("searchBar").value.toLowerCase();
  const postsContainer = document.getElementById("blogPostsContainer");
  if (!postsContainer) return;
  const blogCards = postsContainer.getElementsByClassName("blog-post-card");

  Array.from(blogCards).forEach(card => {
    const title = card.querySelector("h3").textContent.toLowerCase();
    card.style.display = title.includes(query) ? "block" : "none";
  });
}
