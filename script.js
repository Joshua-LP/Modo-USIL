// ============================================
// Configuracion y Constantes
// ============================================
const CONFIG = {
    STORAGE_KEYS: {
        USER_NAME: "usil_user_name",
        USER_PHOTO: "usil_user_photo",
        USER_ID: "usil_user_id",
        CHAT_HISTORY: "usil_chat_history",
        CUSTOM_NEWS: "usil_custom_news"
    },
    DEFAULT_PHOTO: "https://ui-avatars.com/api/?name=Usuario+USIL&background=0047BB&color=fff&size=200",
    ADMIN_PASSWORD: "admin123",
    CORS_PROXIES: [
        "https://api.allorigins.win/raw?url=",
        "https://corsproxy.io/?",
        "https://api.codetabs.com/v1/proxy?quest="
    ],
    // Configuración de Firebase
    FIREBASE_CONFIG: {
        apiKey: "AIzaSyDW1hRvDWzqBGIdq3FV1jqP5wzk8x4C924",
        authDomain: "usil-portal.firebaseapp.com",
        databaseURL: "https://usil-portal-default-rtdb.firebaseio.com",
        projectId: "usil-portal",
        storageBucket: "usil-portal.firebasestorage.app",
        messagingSenderId: "1001454215249",
        appId: "1:1001454215249:web:43c31682b089d85a0b1870"
    },
    USE_FIREBASE: true // Firebase activado - Las noticias se comparten globalmente
};

// Inicializar Firebase
let firebaseDB = null;
if (CONFIG.USE_FIREBASE && typeof firebase !== 'undefined') {
    try {
        firebase.initializeApp(CONFIG.FIREBASE_CONFIG);
        firebaseDB = firebase.database();
        console.log("✅ Firebase inicializado correctamente");
    } catch (error) {
        console.error("❌ Error iniciando Firebase:", error);
        console.log("📝 Usando localStorage como respaldo");
    }
}

// ============================================
// Gestion de Usuario con Foto Editable
// ============================================
class UserManager {
    constructor() {
        this.userName = null;
        this.userPhoto = null;
        this.userId = null;
        this.initUser();
        this.initEditHandlers();
        this.updateDateTime();
        setInterval(() => this.updateDateTime(), 1000);
    }

    // Inicializar usuario desde localStorage
    initUser() {
        this.userName = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_NAME);
        this.userPhoto = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_PHOTO);
        this.userId = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_ID);

        // Si no hay usuario guardado, intentar extraer del sistema
        if (!this.userName) {
            this.extractUserInfo();
        }

        // Actualizar UI
        this.updateUI();
    }

    // Intentar extraer informacion del usuario
    extractUserInfo() {
        // Intentar obtener nombre del path del usuario de Windows
        const path = window.location.pathname;
        const userMatch = path.match(/Users[\/\\]([^\/\\]+)/i);
        
        if (userMatch && userMatch[1]) {
            // Limpiar el nombre (quitar caracteres especiales)
            let extractedName = userMatch[1].replace(/[._-]/g, " ");
            // Capitalizar cada palabra
            extractedName = extractedName.split(" ").map(word => 
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(" ");
            
            this.setUser(extractedName, "user-" + Date.now());
        } else {
            this.setUser("Usuario USIL", "user-001");
        }
    }

    // Guardar informacion del usuario
    setUser(name, id) {
        this.userName = name;
        this.userId = id;
        
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER_NAME, name);
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER_ID, id);
        
        this.updateUI();
    }

    // Guardar foto del usuario
    setPhoto(photoData) {
        this.userPhoto = photoData;
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER_PHOTO, photoData);
        this.updateUI();
    }

    // Actualizar toda la UI
    updateUI() {
        this.updateGreeting();
        this.updateHeaderUser();
        this.updateProfilePhoto();
    }

    // Actualizar saludo
    updateGreeting() {
        const userNameElement = document.getElementById("userName");
        const greetingElement = document.getElementById("greeting");
        
        if (userNameElement && this.userName) {
            userNameElement.textContent = this.userName;
        }

        if (greetingElement) {
            const hour = new Date().getHours();
            let greeting = "Hola";
            
            if (hour >= 5 && hour < 12) greeting = "Buenos dias";
            else if (hour >= 12 && hour < 19) greeting = "Buenas tardes";
            else greeting = "Buenas noches";
            
            greetingElement.innerHTML = greeting + ", <span id=\"userName\">" + (this.userName || "Usuario") + "</span>";
        }
    }

    // Actualizar usuario en el header
    updateHeaderUser() {
        const headerName = document.getElementById("headerUserName");
        const headerPhoto = document.getElementById("headerUserPhoto");
        
        if (headerName) {
            headerName.textContent = this.userName || "Usuario";
        }
        
        if (headerPhoto) {
            const photoUrl = this.userPhoto || this.generateAvatarUrl();
            headerPhoto.src = photoUrl;
            headerPhoto.onerror = () => {
                headerPhoto.src = CONFIG.DEFAULT_PHOTO;
            };
        }
    }

    // Actualizar foto de perfil principal
    updateProfilePhoto() {
        const userPhoto = document.getElementById("userPhoto");
        const defaultIcon = document.getElementById("defaultUserIcon");
        
        if (this.userPhoto) {
            if (userPhoto) {
                userPhoto.src = this.userPhoto;
                userPhoto.style.display = "block";
            }
            if (defaultIcon) {
                defaultIcon.style.display = "none";
            }
        } else {
            // Generar avatar con iniciales
            const avatarUrl = this.generateAvatarUrl();
            if (userPhoto) {
                userPhoto.src = avatarUrl;
                userPhoto.style.display = "block";
            }
            if (defaultIcon) {
                defaultIcon.style.display = "none";
            }
        }
    }

    // Generar URL de avatar con iniciales
    generateAvatarUrl() {
        const name = this.userName || "Usuario";
        const encodedName = encodeURIComponent(name.replace(/ /g, "+"));
        return "https://ui-avatars.com/api/?name=" + encodedName + "&background=0047BB&color=fff&size=200&font-size=0.4";
    }

    // Actualizar fecha y hora
    updateDateTime() {
        const dateElement = document.getElementById("currentDate");
        const timeElement = document.getElementById("currentTime");
        
        const now = new Date();
        
        if (dateElement) {
            const options = { day: "numeric", month: "short", year: "numeric" };
            dateElement.textContent = now.toLocaleDateString("es-ES", options);
        }
        
        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString("es-ES", { 
                hour: "2-digit", 
                minute: "2-digit"
            });
        }
    }

    // Inicializar manejadores de edicion
    initEditHandlers() {
        // Boton editar foto
        const editPhotoBtn = document.getElementById("editPhotoBtn");
        const photoInput = document.getElementById("photoInput");
        
        if (editPhotoBtn && photoInput) {
            editPhotoBtn.addEventListener("click", () => photoInput.click());
            
            photoInput.addEventListener("change", (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handlePhotoUpload(file);
                }
            });
        }

        // Modal editar nombre
        const editNameBtn = document.getElementById("editNameBtn");
        const modal = document.getElementById("editNameModal");
        const closeModal = document.getElementById("closeNameModal");
        const cancelEdit = document.getElementById("cancelNameEdit");
        const saveEdit = document.getElementById("saveNameEdit");
        const nameInput = document.getElementById("newNameInput");

        if (editNameBtn && modal) {
            editNameBtn.addEventListener("click", () => {
                nameInput.value = this.userName || "";
                modal.classList.add("active");
                setTimeout(() => nameInput.focus(), 100);
            });

            const closeModalFn = () => {
                modal.classList.remove("active");
            };

            closeModal?.addEventListener("click", closeModalFn);
            cancelEdit?.addEventListener("click", closeModalFn);
            
            modal.addEventListener("click", (e) => {
                if (e.target === modal) closeModalFn();
            });

            saveEdit?.addEventListener("click", () => {
                const newName = nameInput.value.trim();
                if (newName && newName.length > 0) {
                    this.setUser(newName, this.userId);
                    closeModalFn();
                }
            });

            nameInput?.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    saveEdit?.click();
                }
            });
        }
    }

    // Manejar subida de foto
    handlePhotoUpload(file) {
        if (!file.type.startsWith("image/")) {
            alert("Por favor selecciona una imagen valida");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("La imagen es muy grande. Maximo 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            // Comprimir imagen si es necesario
            this.compressImage(e.target.result, (compressedData) => {
                this.setPhoto(compressedData);
            });
        };
        reader.readAsDataURL(file);
    }

    // Comprimir imagen para localStorage
    compressImage(dataUrl, callback) {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const maxSize = 200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxSize) {
                    height *= maxSize / width;
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width *= maxSize / height;
                    height = maxSize;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            
            callback(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.src = dataUrl;
    }
}

// ============================================
// Gestion de Noticias con Imagenes
// ============================================
class NewsManager {
    constructor() {
        this.newsContainer = document.getElementById("newsGrid");
        this.loadMoreBtn = document.getElementById("loadMoreNews");
        this.currentPage = 1;
        this.newsPerPage = 6;
        this.allNews = [];
        
        this.init();
    }

    init() {
        // Limpiar noticias viejas con errores
        this.cleanOldNews();
        this.loadNews();
        this.loadMoreBtn?.addEventListener("click", () => this.loadMore());
    }

    // Limpiar noticias que tienen errores o imágenes rotas
    cleanOldNews() {
        // Limpiar localStorage
        const customNews = localStorage.getItem(CONFIG.STORAGE_KEYS.CUSTOM_NEWS);
        if (customNews) {
            try {
                const parsed = JSON.parse(customNews);
                const cleaned = parsed.filter(n => 
                    n && n.title && 
                    !n.title.toLowerCase().includes("error") &&
                    n.title.trim().length > 5 &&
                    n.category && n.excerpt
                );
                if (cleaned.length !== parsed.length) {
                    if (cleaned.length > 0) {
                        localStorage.setItem(CONFIG.STORAGE_KEYS.CUSTOM_NEWS, JSON.stringify(cleaned));
                    } else {
                        localStorage.removeItem(CONFIG.STORAGE_KEYS.CUSTOM_NEWS);
                    }
                }
            } catch (e) {
                localStorage.removeItem(CONFIG.STORAGE_KEYS.CUSTOM_NEWS);
            }
        }

        // Limpiar Firebase si hay noticias inválidas
        if (firebaseDB) {
            firebaseDB.ref('news').once('value', (snapshot) => {
                const firebaseNews = snapshot.val();
                if (firebaseNews && Array.isArray(firebaseNews)) {
                    const validNews = firebaseNews.filter(news => 
                        news && 
                        news.title && 
                        news.title.trim().length > 3 &&
                        news.category &&
                        news.excerpt
                    );
                    // Si hay menos noticias válidas, actualizar Firebase
                    if (validNews.length !== firebaseNews.length) {
                        firebaseDB.ref('news').set(validNews);
                        console.log("🧹 Limpieza de Firebase: eliminadas " + (firebaseNews.length - validNews.length) + " noticias inválidas");
                    }
                }
            });
        }
    }

    loadNews() {
        if (firebaseDB) {
            // Cargar desde Firebase (datos globales)
            firebaseDB.ref('news').once('value', (snapshot) => {
                const firebaseNews = snapshot.val();
                if (firebaseNews && Array.isArray(firebaseNews)) {
                    // Filtrar noticias válidas (que tengan título y contenido)
                    this.allNews = firebaseNews.filter(news => 
                        news && 
                        news.title && 
                        news.title.trim().length > 3 &&
                        news.category &&
                        news.excerpt
                    );
                } else {
                    this.allNews = [];
                }
                this.renderNews();
            }).catch((error) => {
                console.error("Error cargando noticias de Firebase:", error);
                // Fallback a localStorage
                this.loadNewsFromLocalStorage();
            });
        } else {
            // Usar localStorage como respaldo
            this.loadNewsFromLocalStorage();
        }
    }

    loadNewsFromLocalStorage() {
        const customNews = localStorage.getItem(CONFIG.STORAGE_KEYS.CUSTOM_NEWS);
        let custom = [];
        if (customNews) {
            try {
                custom = JSON.parse(customNews);
            } catch (e) {
                custom = [];
            }
        }
        this.allNews = [...custom, ...this.getMockNews()];
        this.renderNews();
    }

    // Recargar noticias (usado por el admin)
    refresh() {
        this.loadNews();
    }

    getMockNews() {
        // No hay noticias predeterminadas - solo se mostrarán las agregadas por el administrador
        return [];
    }

    renderNews() {
        if (!this.newsContainer) return;

        const newsHTML = this.allNews.map(news => {
            // Validar que la imagen tenga una URL válida
            const imageUrl = (news.image && news.image.length > 10) ? news.image : 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500&h=300&fit=crop';
            return "<article class=\"news-card\">" +
                "<div class=\"news-image\">" +
                    "<img src=\"" + imageUrl + "\" alt=\"" + news.title + "\" loading=\"lazy\" onerror=\"this.classList.add('img-error'); this.src='https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500&h=300&fit=crop'\">" +
                    "<span class=\"news-badge\">" + news.category + "</span>" +
                "</div>" +
                "<div class=\"news-content\">" +
                    "<div class=\"news-meta\">" +
                        "<span><i class=\"fas fa-calendar\"></i> " + this.formatDate(news.date) + "</span>" +
                    "</div>" +
                    "<h3>" + news.title + "</h3>" +
                    "<p>" + news.excerpt + "</p>" +
                    "<a href=\"" + news.link + "\" class=\"news-link\">" +
                        "Leer mas" +
                        "<i class=\"fas fa-arrow-right\"></i>" +
                    "</a>" +
                "</div>" +
            "</article>";
        }).join("");

        this.newsContainer.innerHTML = newsHTML;
    }

    formatDate(dateString) {
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString("es-ES", options);
    }

    loadMore() {
        this.currentPage++;
        this.loadNews();
    }
}

// ============================================
// Gestion del Chatbot (Talenten)
// ============================================
class ChatbotManager {
    constructor() {
        this.toggle = document.getElementById("chatbotToggle");
        this.window = document.getElementById("chatbotWindow");
        this.close = document.getElementById("chatbotClose");
        this.input = document.getElementById("chatbotInput");
        this.send = document.getElementById("chatbotSend");
        this.messages = document.getElementById("chatbotMessages");
        this.chatHistory = this.loadChatHistory();
        
        this.init();
    }

    init() {
        this.toggle?.addEventListener("click", () => this.toggleChat());
        this.close?.addEventListener("click", () => this.toggleChat());
        this.send?.addEventListener("click", () => this.sendMessage());
        this.input?.addEventListener("keypress", (e) => {
            if (e.key === "Enter") this.sendMessage();
        });
    }

    toggleChat() {
        this.window?.classList.toggle("active");
        if (this.window?.classList.contains("active")) {
            this.input?.focus();
        }
    }

    async sendMessage() {
        const message = this.input?.value.trim();
        if (!message) return;

        this.addMessage(message, "user");
        this.input.value = "";

        this.showTypingIndicator();

        setTimeout(() => {
            this.removeTypingIndicator();
            const response = this.getSimulatedResponse(message);
            this.addMessage(response, "bot");
            this.saveChatHistory();
        }, 800);
    }

    getSimulatedResponse(message) {
        const responses = {
            "hola": "Hola! En que puedo ayudarte hoy?",
            "horario": "Puedes consultar tus horarios en el portal academico. Necesitas ayuda con algo mas?",
            "biblioteca": "La biblioteca virtual esta disponible 24/7. Puedes acceder desde el menu principal.",
            "becas": "Tenemos varios programas de becas disponibles. Quieres informacion sobre alguna en particular?",
            "default": "Gracias por tu mensaje. Un asesor te respondera pronto. Hay algo mas en lo que pueda ayudarte?"
        };

        const lowerMessage = message.toLowerCase();
        for (let key in responses) {
            if (lowerMessage.includes(key)) {
                return responses[key];
            }
        }
        return responses.default;
    }

    addMessage(text, type) {
        if (!this.messages) return;

        const messageDiv = document.createElement("div");
        messageDiv.className = "message " + type + "-message";
        
        const iconClass = type === "user" ? "user" : "robot";
        messageDiv.innerHTML = 
            "<div class=\"message-avatar\">" +
                "<i class=\"fas fa-" + iconClass + "\"></i>" +
            "</div>" +
            "<div class=\"message-content\">" +
                "<p>" + this.escapeHtml(text) + "</p>" +
            "</div>";

        this.messages.appendChild(messageDiv);
        this.messages.scrollTop = this.messages.scrollHeight;

        this.chatHistory.push({ text, type, timestamp: Date.now() });
    }

    showTypingIndicator() {
        const indicator = document.createElement("div");
        indicator.className = "message bot-message";
        indicator.id = "typingIndicator";
        indicator.innerHTML = 
            "<div class=\"message-avatar\">" +
                "<i class=\"fas fa-robot\"></i>" +
            "</div>" +
            "<div class=\"message-content\">" +
                "<div class=\"typing-indicator\">" +
                    "<span></span><span></span><span></span>" +
                "</div>" +
            "</div>";
        this.messages?.appendChild(indicator);
        this.messages.scrollTop = this.messages.scrollHeight;
    }

    removeTypingIndicator() {
        const indicator = document.getElementById("typingIndicator");
        indicator?.remove();
    }

    loadChatHistory() {
        const history = localStorage.getItem(CONFIG.STORAGE_KEYS.CHAT_HISTORY);
        return history ? JSON.parse(history) : [];
    }

    saveChatHistory() {
        localStorage.setItem(CONFIG.STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(this.chatHistory));
    }

    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
}

// ============================================
// Administrador de Noticias
// ============================================
class NewsAdminManager {
    constructor() {
        this.isAuthenticated = false;
        this.pendingNews = [];
        
        // Elementos
        this.adminBtn = document.getElementById("adminNewsBtn");
        this.loginModal = document.getElementById("adminLoginModal");
        this.newsModal = document.getElementById("addNewsModal");
        this.passwordInput = document.getElementById("adminPassword");
        this.errorText = document.getElementById("adminError");
        this.urlInput = document.getElementById("newsUrlInput");
        this.previewContainer = document.getElementById("newsPreview");
        this.loadingNews = document.getElementById("loadingNews");
        this.previewCard = document.getElementById("previewCard");
        this.addedNewsList = document.getElementById("addedNewsList");
        
        this.init();
    }

    init() {
        // Cargar noticias pendientes desde localStorage
        this.loadPendingNews();
        
        // Botón admin
        this.adminBtn?.addEventListener("click", () => this.showLoginModal());
        
        // Modal login
        document.getElementById("closeAdminLogin")?.addEventListener("click", () => this.closeModal(this.loginModal));
        document.getElementById("adminLoginSubmit")?.addEventListener("click", () => this.handleLogin());
        this.passwordInput?.addEventListener("keypress", (e) => {
            if (e.key === "Enter") this.handleLogin();
        });
        
        // Modal noticias
        document.getElementById("closeAddNews")?.addEventListener("click", () => this.closeModal(this.newsModal));
        document.getElementById("addNewsUrl")?.addEventListener("click", () => this.addNewsFromUrl());
        document.getElementById("clearAllNews")?.addEventListener("click", () => this.clearAllNews());
        document.getElementById("saveNewsChanges")?.addEventListener("click", () => this.saveChanges());
        this.urlInput?.addEventListener("keypress", (e) => {
            if (e.key === "Enter") this.addNewsFromUrl();
        });
        
        // Cerrar modales al hacer clic fuera
        this.loginModal?.addEventListener("click", (e) => {
            if (e.target === this.loginModal) this.closeModal(this.loginModal);
        });
        this.newsModal?.addEventListener("click", (e) => {
            if (e.target === this.newsModal) this.closeModal(this.newsModal);
        });
    }

    loadPendingNews() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.CUSTOM_NEWS);
        if (saved) {
            try {
                this.pendingNews = JSON.parse(saved);
            } catch (e) {
                this.pendingNews = [];
            }
        }
    }

    showLoginModal() {
        if (this.isAuthenticated) {
            this.showNewsModal();
            return;
        }
        this.loginModal?.classList.add("active");
        this.passwordInput.value = "";
        this.errorText.style.display = "none";
        setTimeout(() => this.passwordInput?.focus(), 100);
    }

    handleLogin() {
        const password = this.passwordInput?.value;
        if (password === CONFIG.ADMIN_PASSWORD) {
            this.isAuthenticated = true;
            this.closeModal(this.loginModal);
            this.showNewsModal();
        } else {
            this.errorText.style.display = "block";
            this.passwordInput.value = "";
            this.passwordInput?.focus();
        }
    }

    showNewsModal() {
        this.newsModal?.classList.add("active");
        this.urlInput.value = "";
        this.previewContainer.style.display = "none";
        this.renderAddedNewsList();
    }

    closeModal(modal) {
        modal?.classList.remove("active");
    }

    async addNewsFromUrl() {
        const url = this.urlInput?.value.trim();
        if (!url) return;
        
        if (!url.includes("blogs.usil.edu.pe") && !url.includes("usil.edu.pe")) {
            alert("Por favor ingresa una URL válida de usil.edu.pe");
            return;
        }

        // Verificar si ya existe
        if (this.pendingNews.some(n => n.link === url)) {
            alert("Esta noticia ya fue agregada");
            return;
        }

        // Mostrar loading
        this.previewContainer.style.display = "block";
        this.loadingNews.style.display = "block";
        this.previewCard.style.display = "none";

        try {
            const newsData = await this.scrapeNewsUrl(url);
            
            this.loadingNews.style.display = "none";
            this.previewCard.style.display = "block";
            this.previewCard.innerHTML = this.renderPreviewCard(newsData);
            
            // Agregar a la lista
            this.pendingNews.unshift(newsData);
            this.renderAddedNewsList();
            this.urlInput.value = "";
            
            // Ocultar preview después de un momento
            setTimeout(() => {
                this.previewContainer.style.display = "none";
            }, 2000);
        } catch (error) {
            console.error("Error al cargar noticia:", error);
            
            // Aún así intentar crear noticia básica
            const basicNews = this.createBasicNewsFromUrl(url);
            this.loadingNews.style.display = "none";
            this.previewCard.style.display = "block";
            this.previewCard.innerHTML = this.renderPreviewCard(basicNews);
            
            this.pendingNews.unshift(basicNews);
            this.renderAddedNewsList();
            this.urlInput.value = "";
            
            setTimeout(() => {
                this.previewContainer.style.display = "none";
            }, 2000);
        }
    }

    async scrapeNewsUrl(url) {
        let html = null;
        let lastError = null;
        
        // Intentar con múltiples proxies CORS
        for (const proxy of CONFIG.CORS_PROXIES) {
            try {
                const proxyUrl = proxy + encodeURIComponent(url);
                const response = await fetch(proxyUrl, { 
                    timeout: 10000,
                    headers: {
                        'Accept': 'text/html,application/xhtml+xml'
                    }
                });
                
                if (response.ok) {
                    html = await response.text();
                    // Verificar que sea HTML válido y no un error
                    if (html && html.length > 500 && !html.includes("Error response") && !html.includes("error response")) {
                        break; // Éxito, salir del loop
                    } else {
                        html = null; // Resetear para intentar siguiente proxy
                    }
                }
            } catch (error) {
                lastError = error;
                console.log("Proxy fallido:", proxy, error.message);
                continue; // Intentar siguiente proxy
            }
        }
        
        // Si ningún proxy funcionó, crear noticia básica desde la URL
        if (!html || html.length < 500) {
            console.log("Usando extracción básica de URL");
            return this.createBasicNewsFromUrl(url);
        }
        
        try {
            // Crear un DOM parser
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            
            // Extraer metadatos Open Graph
            const getMetaContent = (property) => {
                const meta = doc.querySelector("meta[property=\"" + property + "\"]") || 
                            doc.querySelector("meta[name=\"" + property + "\"]");
                return meta ? meta.getAttribute("content") : null;
            };
            
            let title = getMetaContent("og:title") || doc.querySelector("title")?.textContent || "";
            const description = getMetaContent("og:description") || getMetaContent("description") || "";
            let image = getMetaContent("og:image") || "";
            
            // Verificar si el título es válido (no es un error)
            if (!title || title.toLowerCase().includes("error") || title.length < 5) {
                return this.createBasicNewsFromUrl(url);
            }
            
            // Intentar encontrar imagen en el contenido si no hay og:image
            if (!image) {
                const articleImg = doc.querySelector("article img") || doc.querySelector(".post-thumbnail img") || doc.querySelector(".entry-content img");
                if (articleImg) {
                    image = articleImg.src || articleImg.getAttribute("data-src") || "";
                }
            }
            
            // Asegurar que la imagen tenga URL completa
            if (image && !image.startsWith("http")) {
                image = "https://blogs.usil.edu.pe" + image;
            }
            
            // Si aún no hay imagen, usar una por defecto
            if (!image) {
                image = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500&h=300&fit=crop";
            }
            
            // Extraer categoría de la URL o del contenido
            let category = "General";
            const urlParts = url.split("/");
            if (urlParts.length > 3) {
                const potentialCategory = urlParts[3];
                if (potentialCategory && potentialCategory !== "novedades") {
                    category = potentialCategory.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
                } else {
                    category = "Novedades";
                }
            }
            
            return {
                id: Date.now(),
                title: title.substring(0, 100),
                excerpt: description.substring(0, 150) + (description.length > 150 ? "..." : ""),
                date: new Date().toISOString().split("T")[0],
                category: category.substring(0, 20),
                image: image,
                link: url
            };
        } catch (error) {
            console.error("Error parsing HTML:", error);
            return this.createBasicNewsFromUrl(url);
        }
    }

    // Crear noticia básica cuando el scraping falla
    createBasicNewsFromUrl(url) {
        // Extraer título de la URL
        const urlParts = url.split("/").filter(part => part.length > 0);
        let slug = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2] || "noticia";
        
        // Limpiar el slug
        slug = slug.replace(/[?#].*/g, ""); // Quitar query strings
        
        // Convertir slug a título legible
        let title = slug
            .replace(/-/g, " ")
            .replace(/_/g, " ")
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
        
        // Evitar títulos vacíos o de error
        if (!title || title.length < 5 || title.toLowerCase().includes("error")) {
            title = "Noticia USIL";
        }
        
        // Extraer categoría
        let category = "Novedades";
        if (urlParts.length > 3) {
            const potentialCategory = urlParts[3];
            if (potentialCategory && potentialCategory !== "novedades" && !potentialCategory.includes("http")) {
                category = potentialCategory.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
            }
        }
        
        return {
            id: Date.now() + Math.random(),
            title: title.substring(0, 100),
            excerpt: "Haz clic para leer la noticia completa en el blog de USIL...",
            date: new Date().toISOString().split("T")[0],
            category: category.substring(0, 20),
            image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500&h=300&fit=crop",
            link: url
        };
    }

    renderPreviewCard(news) {
        return "<img src=\"" + news.image + "\" alt=\"Preview\" class=\"preview-card-image\" onerror=\"this.src='https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500&h=300&fit=crop'\">" +
               "<div class=\"preview-card-content\">" +
                   "<div class=\"preview-card-title\">" + news.title + "</div>" +
                   "<div class=\"preview-card-excerpt\">" + news.excerpt + "</div>" +
               "</div>";
    }

    renderAddedNewsList() {
        if (!this.addedNewsList) return;
        
        if (this.pendingNews.length === 0) {
            this.addedNewsList.innerHTML = "<div class=\"empty-news-list\"><i class=\"fas fa-inbox\"></i> No hay noticias agregadas</div>";
            return;
        }
        
        this.addedNewsList.innerHTML = this.pendingNews.map((news, index) => 
            "<div class=\"added-news-item\" data-index=\"" + index + "\">" +
                "<img src=\"" + news.image + "\" alt=\"\" onerror=\"this.src='https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=50&h=50&fit=crop'\">" +
                "<div class=\"added-news-item-info\">" +
                    "<div class=\"added-news-item-title\">" + news.title + "</div>" +
                    "<div class=\"added-news-item-url\">" + news.link + "</div>" +
                "</div>" +
                "<button class=\"added-news-item-remove\" onclick=\"newsAdminManager.removeNews(" + index + ")\">" +
                    "<i class=\"fas fa-trash\"></i>" +
                "</button>" +
            "</div>"
        ).join("");
    }

    removeNews(index) {
        if (confirm("¿Eliminar esta noticia?")) {
            this.pendingNews.splice(index, 1);
            this.renderAddedNewsList();
            // Guardar cambios automáticamente (en Firebase o localStorage)
            this.saveToStorage();
            // Refrescar noticias en la página
            newsManager.refresh();
        }
    }

    clearAllNews() {
        if (confirm("¿Estás seguro de eliminar todas las noticias?")) {
            this.pendingNews = [];
            this.saveToStorage();
            this.renderAddedNewsList();
            newsManager.refresh();
        }
    }

    saveChanges() {
        this.saveToStorage();

        // Refrescar noticias en la página
        newsManager.refresh();

        this.closeModal(this.newsModal);
        alert("Cambios guardados correctamente");
    }

    // Guardar en Firebase o localStorage
    saveToStorage() {
        if (firebaseDB) {
            // Guardar en Firebase (global para todos los usuarios)
            firebaseDB.ref('news').set(this.pendingNews)
                .then(() => {
                    console.log("✅ Noticias guardadas en Firebase");
                    // También guardar en localStorage como respaldo
                    if (this.pendingNews.length > 0) {
                        localStorage.setItem(CONFIG.STORAGE_KEYS.CUSTOM_NEWS, JSON.stringify(this.pendingNews));
                    } else {
                        localStorage.removeItem(CONFIG.STORAGE_KEYS.CUSTOM_NEWS);
                    }
                })
                .catch((error) => {
                    console.error("❌ Error guardando en Firebase:", error);
                    alert("Error al guardar. Se guardó solo localmente.");
                    // Guardar en localStorage como respaldo
                    if (this.pendingNews.length > 0) {
                        localStorage.setItem(CONFIG.STORAGE_KEYS.CUSTOM_NEWS, JSON.stringify(this.pendingNews));
                    } else {
                        localStorage.removeItem(CONFIG.STORAGE_KEYS.CUSTOM_NEWS);
                    }
                });
        } else {
            // Guardar solo en localStorage (solo local)
            if (this.pendingNews.length > 0) {
                localStorage.setItem(CONFIG.STORAGE_KEYS.CUSTOM_NEWS, JSON.stringify(this.pendingNews));
            } else {
                localStorage.removeItem(CONFIG.STORAGE_KEYS.CUSTOM_NEWS);
            }
        }
    }
}

// ============================================
// Interacciones de Tarjetas de Servicio
// ============================================
class ServicesManager {
    constructor() {
        this.cards = document.querySelectorAll(".service-card");
        this.emergencyModal = document.getElementById("emergencyModal");
        this.init();
    }

    init() {
        this.cards.forEach(card => {
            card.addEventListener("click", (e) => {
                // No hacer nada si es el card de talentin (es un enlace)
                if (card.dataset.service === "talentin") {
                    return;
                }
                e.preventDefault();
                this.handleCardClick(card);
            });
        });

        // Cerrar modal de emergencia
        document.getElementById("closeEmergencyModal")?.addEventListener("click", () => {
            this.closeEmergencyModal();
        });

        this.emergencyModal?.addEventListener("click", (e) => {
            if (e.target === this.emergencyModal) {
                this.closeEmergencyModal();
            }
        });
    }

    handleCardClick(card) {
        const service = card.dataset.service;

        switch(service) {
            case "news":
                document.getElementById("newsSection")?.scrollIntoView({ behavior: "smooth" });
                break;
            case "emergency":
                this.showEmergencyModal();
                break;
            default:
                console.log("Servicio seleccionado: " + service);
        }
    }

    showEmergencyModal() {
        this.emergencyModal?.classList.add("active");
    }

    closeEmergencyModal() {
        this.emergencyModal?.classList.remove("active");
    }
}

// ============================================
// Inicializacion Global
// ============================================
let userManager;
let newsManager;
let newsAdminManager;
let servicesManager;

document.addEventListener("DOMContentLoaded", () => {
    userManager = new UserManager();
    newsManager = new NewsManager();
    newsAdminManager = new NewsAdminManager();
    servicesManager = new ServicesManager();

    initScrollAnimations();
});

// ============================================
// Animaciones al Scroll
// ============================================
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll(".service-card, .news-card").forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        el.style.transition = "all 0.6s ease-out";
        observer.observe(el);
    });
}
