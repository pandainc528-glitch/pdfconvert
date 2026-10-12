// ============================================================
// Firebase
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDQNmQLYVNvCbO-GniWXdSaZMtE11xKHC8",
  authDomain: "confecciones-anonimas.firebaseapp.com",
  projectId: "confecciones-anonimas",
  storageBucket: "confecciones-anonimas.firebasestorage.app",
  messagingSenderId: "29590086688",
  appId: "1:29590086688:web:890fb191eb4717e9884845",
  measurementId: "G-2PTP19872F",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// ============================================================
// Categorías (icono, color, colección Firestore)
// ============================================================
const CATEGORIES = [
  { id: "historias", label: "Historias", icon: "📖", color: "#7c5cff" },
  { id: "videos", label: "Videos", icon: "▶️", color: "#ff5c8a" },
  { id: "amor", label: "Amor", icon: "❤️", color: "#ff5c8a" },
  { id: "confesiones", label: "Confesiones", icon: "🙂", color: "#34d399" },
  { id: "escuela", label: "Escuela", icon: "🎓", color: "#f7b955" },
  { id: "misterios", label: "Misterios", icon: "👻", color: "#a78bfa" },
  { id: "trabajo", label: "Trabajo", icon: "💼", color: "#5b8cff" },
  { id: "secretos", label: "Secretos", icon: "🔒", color: "#22c1a6" },
];

const POPULAR_TAGS = [
  { tag: "amor", count: 412 },
  { tag: "historias", count: 389 },
  { tag: "confesiones", count: 352 },
  { tag: "misterios", count: 298 },
  { tag: "trabajo", count: 241 },
];

// ============================================================
// Estado
// ============================================================
let currentUser = null;
let selectedCategory = null; // para publicar
let activeFilterCategory = null; // para filtrar el feed
let authMode = "login"; // "login" | "register"
let allPosts = [];

// ============================================================
// Referencias DOM
// ============================================================
const $ = (id) => document.getElementById(id);

const loggedOutArea = $("loggedOutArea");
const loggedInArea = $("loggedInArea");
const userLabel = $("userLabel");
const userChip = $("userChip");
const userMenu = $("userMenu");

const authOverlay = $("authOverlay");
const authForm = $("authForm");
const authTitle = $("authTitle");
const authSubtitle = $("authSubtitle");
const authEmail = $("authEmail");
const authPassword = $("authPassword");
const authError = $("authError");
const authSubmit = $("authSubmit");
const authSwitchText = $("authSwitchText");
const authSwitchBtn = $("authSwitchBtn");
const termsField = $("termsField");
const acceptTerms = $("acceptTerms");

const categoryBtn = $("categoryBtn");
const categoryLabel = $("categoryLabel");
const categoryDropdown = $("categoryDropdown");
const secretText = $("secretText");
const charCount = $("charCount");
const publishBtn = $("publishBtn");

const postsList = $("postsList");
const loadingState = $("loadingState");
const emptyState = $("emptyState");

const categoryList = $("categoryList");
const tagList = $("tagList");
const searchInput = $("searchInput");
const themeToggle = $("themeToggle");
const toast = $("toast");

// ============================================================
// Utilidades
// ============================================================
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove("hidden");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.add("hidden"), 2600);
}

function catMeta(id) {
  return CATEGORIES.find((c) => c.id === id);
}

function timeAgo(date) {
  if (!date) return "Ahora mismo";
  const diffMs = Date.now() - date.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "Justo ahora";
  if (min < 60) return `Hace ${min} min`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `Hace ${hrs} hora${hrs > 1 ? "s" : ""}`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `Hace ${days} día${days > 1 ? "s" : ""}`;
  return date.toLocaleDateString("es-ES");
}

// ============================================================
// Tema claro/oscuro
// ============================================================
function initTheme() {
  const saved = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", saved);
}
themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
});
initTheme();

// ============================================================
// Render: categorías del sidebar
// ============================================================
function renderCategoryList() {
  categoryList.innerHTML = "";

  const allItem = document.createElement("li");
  allItem.className = "cat-all" + (activeFilterCategory === null ? " active" : "");
  allItem.innerHTML = `
    <div class="cat-icon" style="background:rgba(124,92,255,.15); color:#7c5cff;">✦</div>
    <div class="cat-info"><span>Todas</span><span class="cat-count">Ver todo el feed</span></div>
  `;
  allItem.addEventListener("click", () => {
    activeFilterCategory = null;
    renderCategoryList();
    renderPosts();
  });
  categoryList.appendChild(allItem);

  CATEGORIES.forEach((cat) => {
    const count = allPosts.filter((p) => p.category === cat.id).length;
    const li = document.createElement("li");
    li.className = activeFilterCategory === cat.id ? "active" : "";
    li.innerHTML = `
      <div class="cat-icon" style="background:${cat.color}22; color:${cat.color};">${cat.icon}</div>
      <div class="cat-info"><span>${cat.label}</span><span class="cat-count">${count} publicaciones</span></div>
      <svg class="cat-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
    `;
    li.addEventListener("click", () => {
      if (cat.id === "videos") {
        window.location.href = "videos/index.html";
        return;
      }
      activeFilterCategory = activeFilterCategory === cat.id ? null : cat.id;
      renderCategoryList();
      renderPosts();
    });
    categoryList.appendChild(li);
  });
}

function renderTagList() {
  tagList.innerHTML = "";
  POPULAR_TAGS.forEach(({ tag, count }) => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="#" data-tag="${tag}">#${tag}</a><span class="tag-count">${count} publicaciones</span>`;
    li.querySelector("a").addEventListener("click", (e) => {
      e.preventDefault();
      searchInput.value = tag;
      renderPosts();
    });
    tagList.appendChild(li);
  });
}

// ============================================================
// Selector de categoría (composer)
// ============================================================
function renderCategoryDropdown() {
  categoryDropdown.innerHTML = "";
  CATEGORIES.forEach((cat) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${cat.icon}</span> ${cat.label}`;
    li.addEventListener("click", () => {
      selectedCategory = cat.id;
      categoryLabel.textContent = cat.label;
      categoryBtn.classList.add("has-value");
      categoryDropdown.classList.add("hidden");
    });
    categoryDropdown.appendChild(li);
  });
}
categoryBtn.addEventListener("click", () => {
  categoryDropdown.classList.toggle("hidden");
});
document.addEventListener("click", (e) => {
  if (!$("categorySelect").contains(e.target)) categoryDropdown.classList.add("hidden");
  if (!userChip.contains(e.target) && !userMenu.contains(e.target)) userMenu.classList.add("hidden");
});

secretText.addEventListener("input", () => {
  charCount.textContent = `${secretText.value.length}/1000`;
});

// ============================================================
// Publicar secreto
// ============================================================
publishBtn.addEventListener("click", async () => {
  if (!currentUser) {
    openAuthModal("login");
    showToast("Inicia sesión para publicar tu secreto");
    return;
  }
  const text = secretText.value.trim();
  if (!text) {
    showToast("Escribe algo antes de publicar");
    return;
  }
  if (!selectedCategory) {
    showToast("Selecciona una categoría");
    return;
  }

  publishBtn.disabled = true;
  try {
    await addDoc(collection(db, "posts"), {
      text,
      category: selectedCategory,
      uid: currentUser.uid,
      likesCount: 0,
      likedBy: [],
      createdAt: serverTimestamp(),
    });
    secretText.value = "";
    charCount.textContent = "0/1000";
    selectedCategory = null;
    categoryLabel.textContent = "Selecciona una categoría";
    categoryBtn.classList.remove("has-value");
    showToast("Tu secreto fue publicado de forma anónima");
  } catch (err) {
    console.error(err);
    showToast("No se pudo publicar. Intenta de nuevo.");
  } finally {
    publishBtn.disabled = false;
  }
});

// ============================================================
// Feed en tiempo real (Firestore)
// ============================================================
function listenToPosts() {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  onSnapshot(
    q,
    (snap) => {
      allPosts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      loadingState.classList.add("hidden");
      renderPosts();
      renderCategoryList();
    },
    (err) => {
      console.error(err);
      loadingState.textContent = "No se pudieron cargar los secretos.";
    }
  );
}

function renderPosts() {
  const term = searchInput.value.trim().toLowerCase();

  let posts = allPosts;
  if (activeFilterCategory) posts = posts.filter((p) => p.category === activeFilterCategory);
  if (term) {
    posts = posts.filter(
      (p) =>
        p.text.toLowerCase().includes(term) ||
        (catMeta(p.category)?.label || "").toLowerCase().includes(term)
    );
  }

  postsList.innerHTML = "";

  if (posts.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }
  emptyState.classList.add("hidden");

  posts.forEach((post) => {
    postsList.appendChild(renderPostCard(post));
  });
}

function renderPostCard(post) {
  const cat = catMeta(post.category) || { label: "General", color: "#7c5cff", icon: "🔒" };
  const date = post.createdAt?.toDate ? post.createdAt.toDate() : null;
  const liked = currentUser && (post.likedBy || []).includes(currentUser.uid);

  const card = document.createElement("article");
  card.className = "post-card card";
  card.innerHTML = `
    <div class="post-head">
      <div class="avatar">🕵️</div>
      <div>
        <div class="post-author">Anónimo</div>
        <div class="post-meta">
          <span class="post-time">${timeAgo(date)}</span>
          <span class="post-tag" style="background:${cat.color}22; color:${cat.color};">${cat.icon} ${cat.label}</span>
        </div>
      </div>
    </div>
    <p class="post-text"></p>
    <div class="post-actions">
      <button class="post-action like-btn ${liked ? "liked" : ""}">
        <svg viewBox="0 0 24 24" fill="${liked ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>
        <span class="like-count">${post.likesCount || 0}</span>
      </button>
      <span class="post-action disabled" title="Los comentarios están desactivados">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
        Sin comentarios
      </span>
      <button class="post-action share-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg>
        Compartir
      </button>
    </div>
  `;
  card.querySelector(".post-text").textContent = post.text;

  card.querySelector(".like-btn").addEventListener("click", () => toggleLike(post));
  card.querySelector(".share-btn").addEventListener("click", () => shareSecret(post));

  return card;
}

async function toggleLike(post) {
  if (!currentUser) {
    openAuthModal("login");
    showToast("Inicia sesión para reaccionar");
    return;
  }
  const ref = doc(db, "posts", post.id);
  const alreadyLiked = (post.likedBy || []).includes(currentUser.uid);
  try {
    await updateDoc(ref, {
      likesCount: increment(alreadyLiked ? -1 : 1),
      likedBy: alreadyLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid),
    });
  } catch (err) {
    console.error(err);
    showToast("No se pudo registrar tu reacción");
  }
}

async function shareSecret(post) {
  const url = `${location.origin}${location.pathname}#post-${post.id}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: "Secretos de Anónimos", text: post.text, url });
    } else {
      await navigator.clipboard.writeText(url);
      showToast("Enlace copiado al portapapeles");
    }
  } catch (_) {
    /* usuario canceló el share, ignorar */
  }
}

searchInput.addEventListener("input", () => renderPosts());

// ============================================================
// Autenticación
// ============================================================
function openAuthModal(mode) {
  authMode = mode;
  authError.classList.add("hidden");
  authForm.reset();
  updateAuthModeUI();
  authOverlay.classList.remove("hidden");
}
function closeAuthModal() {
  authOverlay.classList.add("hidden");
}
function updateAuthModeUI() {
  if (authMode === "login") {
    authTitle.textContent = "Iniciar sesión";
    authSubtitle.textContent = "Entra para contar tu secreto de forma anónima.";
    authSubmit.textContent = "Iniciar sesión";
    authSwitchText.textContent = "¿No tienes cuenta?";
    authSwitchBtn.textContent = "Regístrate";
    termsField.classList.add("hidden");
  } else {
    authTitle.textContent = "Crear cuenta";
    authSubtitle.textContent = "Regístrate para empezar a compartir de forma anónima.";
    authSubmit.textContent = "Crear cuenta";
    authSwitchText.textContent = "¿Ya tienes cuenta?";
    authSwitchBtn.textContent = "Inicia sesión";
    termsField.classList.remove("hidden");
  }
}

$("loginBtn").addEventListener("click", () => openAuthModal("login"));
$("authClose").addEventListener("click", closeAuthModal);
authOverlay.addEventListener("click", (e) => {
  if (e.target === authOverlay) closeAuthModal();
});
authSwitchBtn.addEventListener("click", () => {
  authMode = authMode === "login" ? "register" : "login";
  authError.classList.add("hidden");
  updateAuthModeUI();
});

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  authError.classList.add("hidden");

  const email = authEmail.value.trim();
  const password = authPassword.value;

  if (authMode === "register" && !acceptTerms.checked) {
    authError.textContent = "Debes aceptar los Términos y Condiciones para registrarte.";
    authError.classList.remove("hidden");
    return;
  }

  authSubmit.disabled = true;
  try {
    if (authMode === "login") {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
    }
    closeAuthModal();
    showToast(authMode === "login" ? "Sesión iniciada" : "Cuenta creada. ¡Bienvenido!");
  } catch (err) {
    authError.textContent = friendlyAuthError(err.code);
    authError.classList.remove("hidden");
  } finally {
    authSubmit.disabled = false;
  }
});

$("googleBtn").addEventListener("click", async () => {
  if (authMode === "register" && !acceptTerms.checked) {
    authError.textContent = "Debes aceptar los Términos y Condiciones para registrarte.";
    authError.classList.remove("hidden");
    return;
  }
  try {
    await signInWithPopup(auth, googleProvider);
    closeAuthModal();
    showToast("Sesión iniciada con Google");
  } catch (err) {
    authError.textContent = friendlyAuthError(err.code);
    authError.classList.remove("hidden");
  }
});

function friendlyAuthError(code) {
  const map = {
    "auth/email-already-in-use": "Ese correo ya está registrado. Intenta iniciar sesión.",
    "auth/invalid-email": "El correo electrónico no es válido.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/user-not-found": "No existe una cuenta con ese correo.",
    "auth/wrong-password": "Contraseña incorrecta.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/popup-closed-by-user": "Se cerró la ventana de Google antes de terminar.",
    "auth/too-many-requests": "Demasiados intentos. Intenta más tarde.",
  };
  return map[code] || "Ocurrió un error. Intenta de nuevo.";
}

$("userChip").addEventListener("click", () => userMenu.classList.toggle("hidden"));
$("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  userMenu.classList.add("hidden");
  showToast("Sesión cerrada");
});

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    loggedOutArea.classList.add("hidden");
    loggedInArea.classList.remove("hidden");
    userLabel.textContent = "Anónimo";
  } else {
    loggedOutArea.classList.remove("hidden");
    loggedInArea.classList.add("hidden");
  }
  renderPosts();
});

// ============================================================
// Init
// ============================================================
renderCategoryDropdown();
renderCategoryList();
renderTagList();
listenToPosts();
