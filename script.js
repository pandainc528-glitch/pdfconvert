// ---------------------------------------------------------------
// Datos de categorías
// Cada categoría tiene un id, nombre, contador de publicaciones,
// color de fondo del ícono y el ícono en sí (SVG inline).
// ---------------------------------------------------------------
const ICONS = {
  book: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z" fill="#fff"/><path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H13v16h5.5c.8 0 1.5-.7 1.5-1.5v-13Z" fill="#fff" opacity="0.75"/></svg>',
  play: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 4.5c0-1.2 1.3-1.9 2.3-1.3l10 6.5a1.5 1.5 0 0 1 0 2.6l-10 6.5c-1 .6-2.3-.1-2.3-1.3V4.5Z" fill="#fff"/></svg>',
  heart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 20.5s-8-4.9-8-11A4.7 4.7 0 0 1 12 6.6 4.7 4.7 0 0 1 20 9.5c0 6.1-8 11-8 11Z" fill="#fff"/></svg>',
  smile: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" fill="#fff"/><circle cx="9" cy="10.5" r="1.2" fill="#0c8b4f"/><circle cx="15" cy="10.5" r="1.2" fill="#0c8b4f"/><path d="M8 14.5c1.1 1.5 2.5 2.2 4 2.2s2.9-.7 4-2.2" stroke="#0c8b4f" stroke-width="1.4" stroke-linecap="round" fill="none"/></svg>',
  grad: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 4 2 8.5 12 13l8-3.6V13h1.4V8.5L12 4Z" fill="#fff"/><path d="M6 11v3.8c0 1.6 2.7 2.9 6 2.9s6-1.3 6-2.9V11l-6 2.7L6 11Z" fill="#fff" opacity="0.85"/></svg>',
  ghost: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3.5c-4.1 0-7 3-7 7v9l2.3-2 2.2 2 2.5-2 2.5 2 2.2-2 2.3 2v-9c0-4-2.9-7-7-7Z" fill="#fff"/><circle cx="9.5" cy="10.5" r="1.1" fill="#5b1fb3"/><circle cx="14.5" cy="10.5" r="1.1" fill="#5b1fb3"/></svg>',
  briefcase: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="8" width="18" height="11" rx="1.8" fill="#fff"/><path d="M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8" stroke="#1d63c9" stroke-width="1.5" fill="none"/></svg>',
  lock: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="5" y="10.5" width="14" height="9.5" rx="2" fill="#fff"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="#0f7a7a" stroke-width="1.8" fill="none"/></svg>'
};

const CATEGORIES = [
  { id: 'historias',   name: 'Historias',   count: '1.2k publicaciones', color: '#6d5bd0', icon: ICONS.book },
  { id: 'hot',         name: 'Confesiones Hot',      count: '856 publicaciones',  color: '#e5484d', icon: ICONS.play },
  { id: 'amor',        name: 'Amor',        count: '934 publicaciones',  color: '#e0568c', icon: ICONS.heart },
  { id: 'confesiones', name: 'Confesiones', count: '1.1k publicaciones', color: '#2fae66', icon: ICONS.smile },
  { id: 'escuela',     name: 'Escuela',     count: '642 publicaciones',  color: '#d6a92c', icon: ICONS.grad },
  { id: 'misterios',   name: 'Misterios',   count: '438 publicaciones',  color: '#8b5cf6', icon: ICONS.ghost },
  { id: 'trabajo',     name: 'Trabajo',     count: '521 publicaciones',  color: '#3b82f6', icon: ICONS.briefcase },
  { id: 'secretos',    name: 'Secretos',    count: '793 publicaciones',  color: '#14b8a6', icon: ICONS.lock },
];

// ---------------------------------------------------------------
// Video de prueba (Mega). Se muestra en TODAS las categorías
// mientras no haya contenido real cargado.
// El formato "embed" de Mega reemplaza /file/ por /embed/ en la URL.
// ---------------------------------------------------------------
const TEST_VIDEO = {
  title: 'Título del video',
  meta: 'Video de prueba',
  embedUrl: 'https://mega.nz/embed/fDpl0KoB#mE7lgflhkhfiX2pCJr-GdwVVJuCd9USlFcTRckzgFu8'
};

// Mapa categoría -> lista de videos. Por ahora cada categoría
// apunta al mismo video de prueba; cuando haya contenido real,
// basta con reemplazar el array correspondiente.
const VIDEOS_BY_CATEGORY = {};

// Todas las categorías empiezan con el video de prueba
CATEGORIES.forEach(cat => {
  VIDEOS_BY_CATEGORY[cat.id] = [TEST_VIDEO];
});

// Videos específicos de la categoría "Videos"
VIDEOS_BY_CATEGORY.historias = [
  {
    title: 'Secreto de infancia',
    meta: 'Video',
    embedUrl: 'https://mega.nz/embed/WK4wQYqA#w0Xv5BJrErytNRvjvqQBs9tXICcsEudfCdKL7l_AMeM'
  }
];
VIDEOS_BY_CATEGORY.hot = [
  {
    title: 'hice el frutifantastico con mi primo',
    meta: 'Video',
    embedUrl: 'https://mega.nz/embed/ffZzQITD#ws-kligkQzBbxQa45TTHnPyBLMupgKh_KIB24ASJ6SU'
  },
  {
    title: 'Les enseñe a mis hijas a dar mamadas',
    meta: 'Video',
    embedUrl: 'https://mega.nz/embed/bCoViAhY#-0Qn7tTHw08HKlMuItztalXKPSbl3VxG9fsYbTrUU3k'
  },
  {
    title: 'Video 3',
    meta: 'Video',
    embedUrl: 'https://mega.nz/embed/KWQlzIpT#084bFS2VoQq0lGCXtCx7mIK7ZHrmdoG2-e06YV-N5E0'
  },
];

VIDEOS_BY_CATEGORY.amor = [
  {
    title: 'Mi novia me fue infiel con su ex',
    meta: 'Video',
    embedUrl: 'https://mega.nz/embed/3KRzFYib#eHTwBIjZuw8YXgOK_1BVMRdYzB-w7m1NpLAEzDGEuYg'
  },
  {
    title: 'Les enseñe a mis hijas a dar mamadas',
    meta: 'Video',
    embedUrl: 'https://mega.nz/embed/bCoViAhY#-0Qn7tTHw08HKlMuItztalXKPSbl3VxG9fsYbTrUU3k'
  },
    {
      title: 'Video 3',
      meta: 'Video',
      embedUrl: 'https://mega.nz/embed/KWQlzIpT#084bFS2VoQq0lGCXtCx7mIK7ZHrmdoG2-e06YV-N5E0'
    },
    {
    title: 'Secreto de primos',
    meta: 'Video',
    embedUrl: 'https://mega.nz/embed/fDpl0KoB#mE7lgflhkhfiX2pCJr-GdwVVJuCd9USlFcTRckzgFu8'
    }

];
VIDEOS_BY_CATEGORY.confesiones = [
  {
    title: 'Un dolor que no parece ser',
    meta: 'Video',
    embedUrl: 'https://mega.nz/embed/HSYxCYZA#yi5JwC3Mf3e67byKHoqdg5widJkA7PqO5pmuOKzcD9g'
  }
];
// ---------------------------------------------------------------
// Render
// ---------------------------------------------------------------
const categoryListEl = document.getElementById('category-list');
const videoGridEl = document.getElementById('video-grid');
const categoryTitleEl = document.getElementById('category-title');
const categoryCountEl = document.getElementById('category-count');

function renderCategories(activeId) {
  categoryListEl.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'category-item' + (cat.id === activeId ? ' active' : '');
    btn.setAttribute('data-id', cat.id);
    btn.innerHTML = `
      <span class="cat-icon" style="background:${cat.color}">${cat.icon}</span>
      <span class="cat-text">
        <span class="cat-name">${cat.name}</span>
        <span class="cat-count">${cat.count}</span>
      </span>
    `;
    btn.addEventListener('click', () => selectCategory(cat.id));
    categoryListEl.appendChild(btn);
  });
}

function renderVideos(categoryId) {
  const cat = CATEGORIES.find(c => c.id === categoryId);
  const videos = VIDEOS_BY_CATEGORY[categoryId] || [];

  categoryTitleEl.textContent = cat.name;
  categoryCountEl.textContent = `${videos.length} video${videos.length === 1 ? '' : 's'} en esta categoría`;

  videoGridEl.innerHTML = '';
  videos.forEach(video => {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.innerHTML = `
      <div class="video-frame-wrap">
        <iframe src="${video.embedUrl}" allow="autoplay; fullscreen" allowfullscreen></iframe>
      </div>
      <div class="video-info">
        <h3>${video.title}</h3>
        <p>${video.meta}</p>
      </div>
    `;
    videoGridEl.appendChild(card);
  });
}

function selectCategory(categoryId) {
  renderCategories(categoryId);
  renderVideos(categoryId);
}

// Estado inicial: primera categoría seleccionada
selectCategory(CATEGORIES[0].id);
