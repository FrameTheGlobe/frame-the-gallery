import { sdk } from '@farcaster/miniapp-sdk';

class ProfessionalPortfolio {
    constructor() {
        this.photos = [];
        this.currentUser = null;
        this.userFid = null;
        this.maxPhotos = 10;
        this.currentPhotoIndex = 0;
        
        this.init();
    }

    async init() {
        try {
            console.log('Initializing Professional Portfolio...');
            
            // Setup event listeners first
            this.setupEventListeners();
            
            // Try to get user context from Farcaster
            await this.getUserContext();
            
            // Load user's portfolio
            await this.loadUserPortfolio();
            
            // Update UI
            this.updateUI();
            
            // Hide loading screen and show main app
            setTimeout(() => {
                document.getElementById('loading-screen').classList.add('hidden');
                document.getElementById('main-app').classList.remove('hidden');
                
                // Call Farcaster SDK ready() to hide splash screen
                sdk.actions.ready();
            }, 1500);
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            // Still show the app even if there are errors
            this.showApp();
        }
    }

    async getUserContext() {
        try {
            // Try to get user context from Farcaster
            const context = await sdk.context;
            if (context && context.user) {
                this.currentUser = context.user;
                this.userFid = context.user.fid;
                console.log('User context loaded:', this.currentUser);
                this.updateUserInfo();
            } else {
                // Fallback: generate a session-based ID for testing
                this.userFid = this.generateSessionId();
                console.log('No Farcaster context, using session ID:', this.userFid);
            }
        } catch (error) {
            console.error('Error getting user context:', error);
            // Fallback: generate a session-based ID
            this.userFid = this.generateSessionId();
            console.log('Using fallback session ID:', this.userFid);
        }
    }

    generateSessionId() {
        // Generate a session-based ID for testing without authentication
        let sessionId = localStorage.getItem('portfolio_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('portfolio_session_id', sessionId);
        }
        return sessionId;
    }

    updateUserInfo() {
        const userProfile = document.getElementById('user-profile');
        const guestInfo = document.getElementById('guest-info');
        const userName = document.getElementById('user-name');
        const userAvatar = document.getElementById('user-avatar');

        if (this.currentUser) {
            // Show authenticated user info
            userProfile.classList.remove('hidden');
            guestInfo.classList.add('hidden');
            
            userName.textContent = this.currentUser.displayName || this.currentUser.username || `User ${this.userFid}`;
            
            if (this.currentUser.pfpUrl) {
                userAvatar.innerHTML = `<img src="${this.currentUser.pfpUrl}" alt="Profile" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            } else {
                userAvatar.textContent = (this.currentUser.displayName || this.currentUser.username || 'U').charAt(0).toUpperCase();
            }
            
            // Update portfolio title
            document.getElementById('portfolio-title').textContent = `${this.currentUser.displayName || this.currentUser.username}'s Portfolio`;
        } else {
            // Show guest info
            userProfile.classList.add('hidden');
            guestInfo.classList.remove('hidden');
        }
    }

    async loadUserPortfolio() {
        try {
            // Load photos from localStorage based on user FID
            const storageKey = `portfolio_${this.userFid}`;
            const savedPhotos = localStorage.getItem(storageKey);
            
            if (savedPhotos) {
                this.photos = JSON.parse(savedPhotos);
                console.log(`Loaded ${this.photos.length} photos for user ${this.userFid}`);
            } else {
                this.photos = [];
                console.log(`No saved portfolio found for user ${this.userFid}`);
            }
        } catch (error) {
            console.error('Error loading user portfolio:', error);
            this.photos = [];
        }
    }

    saveUserPortfolio() {
        try {
            const storageKey = `portfolio_${this.userFid}`;
            localStorage.setItem(storageKey, JSON.stringify(this.photos));
            console.log(`Saved ${this.photos.length} photos for user ${this.userFid}`);
        } catch (error) {
            console.error('Error saving user portfolio:', error);
        }
    }

    setupEventListeners() {
        // File input
        const fileInput = document.getElementById('file-input');
        const uploadArea = document.getElementById('upload-area');

        // Upload area click
        uploadArea.addEventListener('click', () => {
            if (this.photos.length < this.maxPhotos) {
                fileInput.click();
            }
        });

        // File selection
        fileInput.addEventListener('change', (e) => {
            this.handleFileSelection(e.target.files);
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            if (this.photos.length < this.maxPhotos) {
                this.handleFileSelection(e.dataTransfer.files);
            }
        });

        // Control buttons
        document.getElementById('clear-all').addEventListener('click', () => {
            this.clearAllPhotos();
        });

        document.getElementById('share-portfolio').addEventListener('click', () => {
            this.sharePortfolio();
        });

        // Modal controls
        document.getElementById('modal-close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('modal-prev').addEventListener('click', () => {
            this.showPreviousPhoto();
        });

        document.getElementById('modal-next').addEventListener('click', () => {
            this.showNextPhoto();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('photo-modal');
            if (modal.classList.contains('active')) {
                if (e.key === 'Escape') {
                    this.closeModal();
                } else if (e.key === 'ArrowLeft') {
                    this.showPreviousPhoto();
                } else if (e.key === 'ArrowRight') {
                    this.showNextPhoto();
                }
            }
        });

        // Click outside modal to close
        document.getElementById('photo-modal').addEventListener('click', (e) => {
            if (e.target.id === 'photo-modal') {
                this.closeModal();
            }
        });
    }

    async handleFileSelection(files) {
        const remainingSlots = this.maxPhotos - this.photos.length;
        const filesToProcess = Array.from(files).slice(0, remainingSlots);

        for (const file of filesToProcess) {
            if (file.type.startsWith('image/')) {
                await this.addPhoto(file);
            }
        }

        this.updateUI();
        this.saveUserPortfolio();
    }

    async addPhoto(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const photo = {
                    id: Date.now() + Math.random(),
                    src: e.target.result,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    uploadedAt: new Date().toISOString()
                };
                
                this.photos.push(photo);
                resolve();
            };
            reader.readAsDataURL(file);
        });
    }

    updateUI() {
        this.updatePhotoGrid();
        this.updateControls();
        this.updateMetadata();
    }

    updatePhotoGrid() {
        const photoGrid = document.getElementById('photo-grid');
        const emptyState = document.getElementById('empty-state');

        if (this.photos.length === 0) {
            photoGrid.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            photoGrid.style.display = 'grid';
            emptyState.style.display = 'none';
            
            photoGrid.innerHTML = this.photos.map((photo, index) => `
                <div class="photo-item" data-index="${index}">
                    <img src="${photo.src}" alt="${photo.name}" loading="lazy">
                    <div class="photo-overlay">
                        <div class="photo-actions">
                            <button class="photo-action" onclick="portfolio.viewPhoto(${index})" title="View">
                                👁️
                            </button>
                            <button class="photo-action" onclick="portfolio.removePhoto(${index})" title="Remove">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    updateControls() {
        const controls = document.getElementById('controls');
        const uploadSection = document.getElementById('upload-section');
        
        if (this.photos.length > 0) {
            controls.style.display = 'flex';
            
            // Update upload area state
            const uploadArea = document.getElementById('upload-area');
            if (this.photos.length >= this.maxPhotos) {
                uploadArea.style.opacity = '0.5';
                uploadArea.style.cursor = 'not-allowed';
                uploadArea.querySelector('.upload-text').textContent = 'Portfolio is full (10/10 photos)';
                uploadArea.querySelector('.upload-hint').textContent = 'Remove photos to add new ones';
            } else {
                uploadArea.style.opacity = '1';
                uploadArea.style.cursor = 'pointer';
                uploadArea.querySelector('.upload-text').textContent = 'Drop your photos here or click to browse';
                uploadArea.querySelector('.upload-hint').textContent = 'Maximum 10 photos • JPG, PNG, WebP • Up to 10MB each';
            }
        } else {
            controls.style.display = 'none';
        }
    }

    updateMetadata() {
        const photoCount = document.getElementById('photo-count');
        const photoCounter = document.getElementById('photo-counter');
        const lastUpdated = document.getElementById('last-updated');

        const count = this.photos.length;
        photoCount.textContent = `${count} photo${count !== 1 ? 's' : ''}`;
        photoCounter.textContent = `${count} of ${this.maxPhotos} photos`;

        if (count > 0) {
            const latest = new Date(Math.max(...this.photos.map(p => new Date(p.uploadedAt))));
            lastUpdated.textContent = `Updated ${this.formatDate(latest)}`;
        } else {
            lastUpdated.textContent = 'Never updated';
        }
    }

    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    }

    viewPhoto(index) {
        this.currentPhotoIndex = index;
        const modal = document.getElementById('photo-modal');
        const modalImage = document.getElementById('modal-image');
        
        modalImage.src = this.photos[index].src;
        modal.classList.add('active');
    }

    closeModal() {
        const modal = document.getElementById('photo-modal');
        modal.classList.remove('active');
    }

    showPreviousPhoto() {
        if (this.photos.length > 1) {
            this.currentPhotoIndex = (this.currentPhotoIndex - 1 + this.photos.length) % this.photos.length;
            document.getElementById('modal-image').src = this.photos[this.currentPhotoIndex].src;
        }
    }

    showNextPhoto() {
        if (this.photos.length > 1) {
            this.currentPhotoIndex = (this.currentPhotoIndex + 1) % this.photos.length;
            document.getElementById('modal-image').src = this.photos[this.currentPhotoIndex].src;
        }
    }

    removePhoto(index) {
        if (confirm('Remove this photo from your portfolio?')) {
            this.photos.splice(index, 1);
            this.updateUI();
            this.saveUserPortfolio();
        }
    }

    clearAllPhotos() {
        if (confirm('Remove all photos from your portfolio? This cannot be undone.')) {
            this.photos = [];
            this.updateUI();
            this.saveUserPortfolio();
        }
    }

    async sharePortfolio() {
        try {
            if (this.photos.length === 0) {
                alert('Add some photos to your portfolio before sharing!');
                return;
            }

            // Try to use Farcaster SDK to compose a cast
            if (this.currentUser && sdk.actions.composeCast) {
                const portfolioUrl = `https://framethegallery.xyz/portfolio/${this.userFid}`;
                const text = `Check out my photography portfolio on FrameTheGallery! 📸\n\n${this.photos.length} photos showcasing my work.\n\n${portfolioUrl}`;
                
                await sdk.actions.composeCast({
                    text: text,
                    embeds: [portfolioUrl]
                });
            } else {
                // Fallback to Web Share API
                const portfolioUrl = `https://framethegallery.xyz/portfolio/${this.userFid}`;
                const shareData = {
                    title: 'My Photography Portfolio',
                    text: `Check out my photography portfolio! ${this.photos.length} photos showcasing my work.`,
                    url: portfolioUrl
                };

                if (navigator.share) {
                    await navigator.share(shareData);
                } else {
                    // Fallback: copy to clipboard
                    await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                    alert('Portfolio link copied to clipboard!');
                }
            }
        } catch (error) {
            console.error('Error sharing portfolio:', error);
            alert('Unable to share portfolio. Please try again.');
        }
    }

    showApp() {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        sdk.actions.ready();
    }
}

// Make portfolio globally accessible for onclick handlers
let portfolio;

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    portfolio = new ProfessionalPortfolio();
});
