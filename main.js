// === ZARIYA BOUTIQUE — main.js ===

// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('navList');
  if (toggle && navList) {
    toggle.addEventListener('click', () => navList.classList.toggle('open'));
  }
});

// ── Gallery Loader ──────────────────────────────────────────
// Called by category pages: loadGallery('straight-suits')
async function loadGallery(categoryId) {
  const container = document.getElementById('galleryContainer');
  if (!container) return;

  // Show loading
  container.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading collection...</p>
    </div>`;

  try {
    const url = `${ZARIYA_CONFIG.apiUrl}?category=${categoryId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data.error) throw new Error(data.error);
    if (!data.images || data.images.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No items found in this collection yet.</p>
          <p style="margin-top:0.5rem;opacity:0.6">Add images to your Google Drive folder to see them here.</p>
        </div>`;
      return;
    }

    renderGallery(container, data.images);
  } catch (err) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Could not load images.</p>
        <p style="margin-top:0.5rem;opacity:0.6;font-size:0.75rem">${err.message}</p>
        <p style="margin-top:0.5rem;opacity:0.5;font-size:0.7rem">Check your API URL in js/config.js</p>
      </div>`;
  }
}

function renderGallery(container, images) {
  const grid = document.createElement('div');
  grid.className = 'image-grid';

  images.forEach((img, i) => {
    const card = document.createElement('div');
    card.className = 'image-card';
    card.innerHTML = `
      <img src="${img.url}" alt="${img.name}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 3 4%22><rect width=%223%22 height=%224%22 fill=%22%23f2e4d0%22/></svg>'"/>
      ${img.name ? `<div class="image-caption">${img.name}</div>` : ''}
    `;
    card.addEventListener('click', () => openLightbox(images, i));
    grid.appendChild(card);
  });

  container.innerHTML = '';
  container.appendChild(grid);
}

// ── Lightbox ────────────────────────────────────────────────
let lightboxImages = [];
let lightboxIndex = 0;

function openLightbox(images, index) {
  lightboxImages = images;
  lightboxIndex = index;

  let lb = document.getElementById('lightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.className = 'lightbox';
    lb.innerHTML = `
      <button class="lightbox-close" onclick="closeLightbox()">&#215;</button>
      <img id="lbImg" src="" alt=""/>
      <div id="lbCaption" class="lightbox-caption"></div>
    `;
    lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
    document.body.appendChild(lb);

    // Keyboard nav
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('active')) return;
      if (e.key === 'ArrowRight') shiftLightbox(1);
      if (e.key === 'ArrowLeft')  shiftLightbox(-1);
      if (e.key === 'Escape')     closeLightbox();
    });
  }

  setLightboxImage();
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function setLightboxImage() {
  const img = lightboxImages[lightboxIndex];
  document.getElementById('lbImg').src = img.url;
  document.getElementById('lbImg').alt = img.name || '';
  document.getElementById('lbCaption').textContent =
    img.name ? `${img.name} · ${lightboxIndex + 1} / ${lightboxImages.length}` :
    `${lightboxIndex + 1} / ${lightboxImages.length}`;
}

function shiftLightbox(dir) {
  lightboxIndex = (lightboxIndex + dir + lightboxImages.length) % lightboxImages.length;
  setLightboxImage();
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('active');
  document.body.style.overflow = '';
}
