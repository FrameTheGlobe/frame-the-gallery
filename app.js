import { sdk } from '@farcaster/miniapp-sdk';

class ProfessionalPortfolio {
    constructor() {
        this.portfolios = [];
        this.currentPortfolio = null;
        this.currentUser = null;
        this.userFid = null;
        this.maxPortfolios = 10;
        this.maxPhotosPerPortfolio = 10;
        this.currentPhotoIndex = 0;
        this.currentView = 'portfolios'; // 'portfolios' or 'portfolio-detail'
        this.tempPhotos = []; // For modal photo uploads
        this.editingPortfolio = null; // For edit modal
        this.cloudStorage = new CloudStorageService();
        this.useCloudStorage = true; // Enable cloud storage by default
        this.uploadProgress = { current: 0, total: 0, currentFile: '' };
        
        this.init();
    }

    async init() {
        try {
            console.log('🌐 Initializing Cloud-Enabled Portfolio...');
            
            // Test cloud connectivity first
            if (this.useCloudStorage) {
                try {
                    const cloudConnected = await this.cloudStorage.testConnection();
                    console.log('Cloud connectivity:', cloudConnected ? '✅ Connected' : '❌ Failed');
                    
                    if (!cloudConnected) {
                        console.warn('Cloud storage unavailable, falling back to localStorage');
                        this.useCloudStorage = false;
                        this.showToast('Using local storage. Portfolios won\'t sync across devices.', 'info', 'Offline Mode');
                    } else {
                        console.log('✅ Cloud storage enabled');
                        this.showToast('Cloud storage connected. Portfolios will sync across devices.', 'success', 'Cloud Connected');
                    }
                } catch (error) {
                    console.error('Cloud connectivity test failed:', error);
                    this.useCloudStorage = false;
                }
            }
            
            // Setup event listeners first
            this.setupEventListeners();
            
            // Try to get user context from Farcaster
            await this.getUserContext();
            
            // Load user's portfolios
            await this.loadUserPortfolios();
            
            // Update UI
            this.updateUI();
            
            // Setup global event listeners
            this.setupGlobalEventListeners();
            
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
            console.log('Attempting to get Farcaster context...');
            console.log('Running in Farcaster mini app context:', !!window.parent !== window);
            
            // Try to get user context from Farcaster with timeout
            const contextPromise = sdk.context;
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Context timeout')), 5000)
            );
            
            const context = await Promise.race([contextPromise, timeoutPromise]);
            
            if (context && context.user) {
                this.currentUser = context.user;
                this.userFid = context.user.fid;
                console.log('✅ Farcaster user context loaded:', this.currentUser);
                console.log('User FID:', this.userFid);
                this.updateUserInfo();
                
                // Test localStorage in Farcaster context
                this.testLocalStorage();
            } else {
                console.log('⚠️ No user in Farcaster context, using session ID');
                this.userFid = this.generateSessionId();
                console.log('Session ID:', this.userFid);
            }
        } catch (error) {
            console.error('❌ Error getting Farcaster context:', error);
            // Fallback: generate a session-based ID
            this.userFid = this.generateSessionId();
            console.log('🔄 Using fallback session ID:', this.userFid);
        }
        
        // Additional debugging for mini app context
        console.log('Final userFid:', this.userFid);
        console.log('localStorage available:', !!window.localStorage);
        console.log('Farcaster SDK available:', !!window.farcaster);
    }

    testLocalStorage() {
        try {
            const testKey = 'farcaster_test_' + Date.now();
            const testValue = 'test_data';
            
            localStorage.setItem(testKey, testValue);
            const retrieved = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            
            if (retrieved === testValue) {
                console.log('✅ localStorage working in Farcaster context');
            } else {
                console.log('❌ localStorage not working properly in Farcaster context');
            }
        } catch (error) {
            console.error('❌ localStorage error in Farcaster context:', error);
        }
    }

    generateSessionId() {
        // Generate a session-based ID for testing without authentication
        // In Farcaster context, try multiple storage keys for resilience
        const possibleKeys = [
            'portfolio_session_id',
            'farcaster_portfolio_session',
            'mini_app_session_id'
        ];
        
        let sessionId = null;
        
        // Try to find existing session ID
        for (const key of possibleKeys) {
            try {
                sessionId = localStorage.getItem(key);
                if (sessionId) {
                    console.log(`Found existing session ID with key: ${key}`);
                    break;
                }
            } catch (error) {
                console.log(`Could not access localStorage with key: ${key}`);
            }
        }
        
        // Generate new session ID if none found
        if (!sessionId) {
            sessionId = 'farcaster_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            console.log('Generated new session ID:', sessionId);
            
            // Try to save with all keys for redundancy
            for (const key of possibleKeys) {
                try {
                    localStorage.setItem(key, sessionId);
                    console.log(`Saved session ID with key: ${key}`);
                } catch (error) {
                    console.log(`Failed to save session ID with key: ${key}`, error);
                }
            }
        }
        
        return sessionId;
    }
    
    setupGlobalEventListeners() {
        console.log('Setting up global event listeners');
        
        // Back to portfolios button
        const backButton = document.getElementById('back-to-portfolios-btn');
        if (backButton) {
            backButton.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Back button clicked');
                this.showPortfoliosView();
            });
        }
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
                userAvatar.innerHTML = `<img src=\"${this.currentUser.pfpUrl}\" alt=\"Profile\" style=\"width: 100%; height: 100%; border-radius: 50%; object-fit: cover;\">`;
            } else {
                userAvatar.textContent = (this.currentUser.displayName || this.currentUser.username || 'U').charAt(0).toUpperCase();
            }
        } else {
            // Show guest info
            userProfile.classList.add('hidden');
            guestInfo.classList.remove('hidden');
        }
    }

    async loadUserPortfolios() {
        try {
            if (this.useCloudStorage) {
                console.log('🌐 Loading portfolios from cloud...');
                this.portfolios = await this.cloudStorage.loadPortfolios(this.userFid);
                console.log(`✅ Loaded ${this.portfolios.length} portfolios from cloud`);
            } else {
                // Fallback to localStorage
                const storageKey = `portfolios_${this.userFid}`;
                const savedPortfolios = localStorage.getItem(storageKey);
                
                console.log('📁 Loading portfolios from localStorage:');
                console.log('- Storage key:', storageKey);
                console.log('- Raw data found:', !!savedPortfolios);
                
                if (savedPortfolios) {
                    this.portfolios = JSON.parse(savedPortfolios);
                    console.log(`✅ Loaded ${this.portfolios.length} portfolios from localStorage`);
                } else {
                    this.portfolios = [];
                    console.log(`⚠️ No saved portfolios found for user ${this.userFid}`);
                }
            }
            
            // Log portfolio details
            this.portfolios.forEach((portfolio, index) => {
                console.log(`- Portfolio ${index + 1}: "${portfolio.title}" with ${portfolio.photos.length} photos`);
            });
            
        } catch (error) {
            console.error('❌ Error loading user portfolios:', error);
            this.portfolios = [];
            this.showToast('Failed to load existing portfolios', 'warning', 'Load Error');
        }
    }

    async saveUserPortfolios() {
        try {
            console.log('💾 Saving portfolios...');
            console.log('- Number of portfolios:', this.portfolios.length);
            
            if (this.useCloudStorage) {
                console.log('🌐 Saving to cloud storage...');
                await this.cloudStorage.savePortfolios(this.portfolios, this.userFid);
                console.log(`✅ Saved ${this.portfolios.length} portfolios to cloud`);
            } else {
                // Fallback to localStorage with quota checking
                const storageKey = `portfolios_${this.userFid}`;
                const portfolioData = JSON.stringify(this.portfolios);
                
                console.log('📁 Saving to localStorage:');
                console.log('- Storage key:', storageKey);
                console.log('- Data size:', portfolioData.length, 'characters');
                console.log('- Data size (MB):', Math.round(portfolioData.length / 1024 / 1024 * 100) / 100);
                
                // Check storage quota before saving
                const estimatedQuota = this.getStorageQuota();
                if (portfolioData.length > estimatedQuota * 0.8) {
                    console.warn('⚠️ Data size approaching storage quota limit');
                    throw new Error('Portfolio data too large for storage. Try using fewer or smaller photos.');
                }
                
                localStorage.setItem(storageKey, portfolioData);
                console.log(`✅ Saved ${this.portfolios.length} portfolios to localStorage`);
            }
        } catch (error) {
            console.error('❌ Error saving user portfolios:', error);
            
            if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
                this.showToast('Storage quota exceeded. Try reducing image count or quality.', 'error', 'Storage Full');
                this.showStorageQuotaDialog();
            } else {
                this.showToast('Failed to save portfolio. Please try again.', 'error', 'Save Error');
            }
            throw error; // Re-throw for calling functions to handle
        }
    }

    getStorageQuota() {
        // Estimate storage quota - Farcaster iframe typically has ~5-10MB
        // We'll be conservative and assume 5MB
        return 5 * 1024 * 1024; // 5MB in characters
    }

    getCurrentStorageUsage() {
        let totalSize = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            if (value) {
                totalSize += key.length + value.length;
            }
        }
        return totalSize;
    }

    showStorageQuotaDialog() {
        this.showConfirmDialog(
            'Storage Quota Exceeded',
            'Your portfolio is too large for the available storage. Would you like to reduce image quality to fit within the limits?',
            () => {
                this.compressExistingPortfolios();
            },
            () => {
                // User chose not to compress, remove the last portfolio to avoid data loss
                if (this.portfolios.length > 0) {
                    this.portfolios.pop();
                    this.showToast('Portfolio creation cancelled to prevent data loss', 'info', 'Cancelled');
                }
            }
        );
    }

    async compressExistingPortfolios() {
        this.showToast('Compressing images to fit storage...', 'info', 'Compressing');
        
        for (let portfolio of this.portfolios) {
            for (let i = 0; i < portfolio.photos.length; i++) {
                const photo = portfolio.photos[i];
                if (photo.src && photo.src.length > 500000) { // If larger than 500KB
                    try {
                        // Re-compress with lower quality
                        const compressed = await this.recompressImageData(photo.src, 0.5);
                        portfolio.photos[i].src = compressed;
                        portfolio.photos[i].compressedSize = compressed.length;
                    } catch (error) {
                        console.error('Failed to recompress photo:', photo.name, error);
                    }
                }
            }
        }
        
        // Try saving again
        this.saveUserPortfolios();
    }

    async recompressImageData(dataURL, quality = 0.5) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const compressedDataURL = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedDataURL);
            };
            
            img.onerror = () => reject(new Error('Failed to recompress image'));
            img.src = dataURL;
        });
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('back-to-portfolios')?.addEventListener('click', () => {
            this.showPortfoliosView();
        });

        document.getElementById('create-portfolio')?.addEventListener('click', () => {
            this.showCreatePortfolioModal();
        });

        // Portfolio creation modal
        document.getElementById('create-portfolio-btn')?.addEventListener('click', () => {
            this.createNewPortfolio();
        });

        document.getElementById('cancel-create')?.addEventListener('click', () => {
            this.hideCreatePortfolioModal();
        });

        // File input for portfolio detail
        const fileInput = document.getElementById('file-input');
        const uploadArea = document.getElementById('upload-area');

        if (uploadArea) {
            uploadArea.addEventListener('click', () => {
                if (this.currentPortfolio && this.currentPortfolio.photos.length < this.maxPhotosPerPortfolio) {
                    fileInput.click();
                }
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
                if (this.currentPortfolio && this.currentPortfolio.photos.length < this.maxPhotosPerPortfolio) {
                    this.handlePortfolioFileSelection(e.dataTransfer.files);
                }
            });
        }

        // File selection
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handlePortfolioFileSelection(e.target.files);
            });
        }

        // Control buttons
        document.getElementById('clear-all')?.addEventListener('click', () => {
            this.clearCurrentPortfolio();
        });

        document.getElementById('share-portfolio')?.addEventListener('click', () => {
            this.shareCurrentPortfolio();
        });

        document.getElementById('edit-portfolio')?.addEventListener('click', () => {
            this.editCurrentPortfolio();
        });

        // Modal controls
        document.getElementById('modal-close')?.addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('modal-prev')?.addEventListener('click', () => {
            this.showPreviousPhoto();
        });

        document.getElementById('modal-next')?.addEventListener('click', () => {
            this.showNextPhoto();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('photo-modal');
            if (modal && modal.classList.contains('active')) {
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
        document.getElementById('photo-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'photo-modal') {
                this.closeModal();
            }
        });
    }

    updateUI() {
        if (this.currentView === 'portfolios') {
            this.showPortfoliosView();
        } else if (this.currentView === 'portfolio-detail') {
            this.showPortfolioDetailView();
        }
    }

    showPortfoliosView() {
        this.currentView = 'portfolios';
        this.currentPortfolio = null;
        
        // Update header
        const title = document.getElementById('header-title');
        const subtitle = document.getElementById('portfolio-subtitle');
        const meta = document.querySelector('.portfolio-meta');
        
        if (title) title.textContent = this.currentUser ? `${this.currentUser.displayName || this.currentUser.username}'s Portfolios` : 'Your Photography Portfolios';
        if (subtitle) subtitle.textContent = `Create up to ${this.maxPortfolios} portfolios with ${this.maxPhotosPerPortfolio} photos each to showcase your photojournalism work.`;
        if (meta) meta.innerHTML = `<span>${this.portfolios.length} of ${this.maxPortfolios} portfolios</span><span>•</span><span>${this.getTotalPhotoCount()} total photos</span>`;

        // Show/hide sections
        this.hideElement('upload-section');
        this.hideElement('controls');
        this.hideElement('photo-grid');
        this.hideElement('empty-state');
        this.showElement('portfolio-grid-section');
        this.hideElement('back-button');

        this.updatePortfolioGrid();
    }

    showPortfolioDetailView() {
        this.currentView = 'portfolio-detail';
        
        if (!this.currentPortfolio) return;

        // Update header
        const title = document.getElementById('header-title');
        const subtitle = document.getElementById('portfolio-subtitle');
        const meta = document.querySelector('.portfolio-meta');
        
        if (title) title.textContent = this.currentPortfolio.title;
        if (subtitle) subtitle.textContent = this.currentPortfolio.description || 'Add photos to tell your story';
        if (meta) meta.innerHTML = `<span>${this.currentPortfolio.photos.length} of ${this.maxPhotosPerPortfolio} photos</span><span>•</span><span>Updated ${this.formatDate(new Date(this.currentPortfolio.updatedAt))}</span>`;

        // Show/hide sections
        this.showElement('upload-section');
        this.showElement('controls');
        this.hideElement('portfolio-grid-section');
        this.showElement('back-button');

        if (this.currentPortfolio.photos.length > 0) {
            this.showElement('photo-grid');
            this.hideElement('empty-state');
        } else {
            this.hideElement('photo-grid');
            this.showElement('empty-state');
        }

        this.updatePhotoGrid();
        this.updateControls();
    }

    updatePortfolioGrid() {
        const portfolioGridSection = document.getElementById('portfolio-grid-section');
        if (!portfolioGridSection) return;

        if (this.portfolios.length === 0) {
            portfolioGridSection.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📁</div>
                    <h3>Create Your First Portfolio</h3>
                    <p>Start showcasing your photojournalism work by creating your first portfolio.<br>
                    Each portfolio can tell a unique story with up to ${this.maxPhotosPerPortfolio} images.</p>
                    <button class="btn create-portfolio-btn" data-action="create-portfolio">
                        ➕ Create Portfolio
                    </button>
                </div>
            `;
        } else {
            const canCreateMore = this.portfolios.length < this.maxPortfolios;
            portfolioGridSection.innerHTML = `
                <div class="portfolio-controls">
                    <div class="portfolio-stats">
                        ${this.portfolios.length} of ${this.maxPortfolios} portfolios • ${this.getTotalPhotoCount()} total photos
                    </div>
                    ${canCreateMore ? `<button class="btn create-portfolio-btn" data-action="create-portfolio">➕ Create Portfolio</button>` : '<span class="limit-reached">Portfolio limit reached</span>'}
                </div>
                <div class="portfolio-grid">
                    ${this.portfolios.map(p => this.renderPortfolioCard(p)).join('')}
                </div>
            `;
        }
        
        // Setup event listeners for portfolio grid
        this.setupPortfolioGridEventListeners();
    }

    setupPortfolioGridEventListeners() {
        // Add event delegation for Create Portfolio buttons
        const createButtons = document.querySelectorAll('.create-portfolio-btn');
        createButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Create Portfolio button clicked');
                this.showCreatePortfolioModal();
            });
        });
        
        // Add event delegation for portfolio cards
        const portfolioCards = document.querySelectorAll('.portfolio-card');
        portfolioCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking on action buttons
                if (e.target.closest('.portfolio-action')) {
                    return;
                }
                const portfolioId = card.getAttribute('data-portfolio-id');
                console.log('Opening portfolio:', portfolioId);
                this.openPortfolio(portfolioId);
            });
        });
        
        // Add event delegation for portfolio action buttons
        const actionButtons = document.querySelectorAll('.portfolio-action');
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent card click
                const portfolioId = button.getAttribute('data-portfolio-id');
                const action = button.getAttribute('data-action');
                console.log('Portfolio action:', action, 'for portfolio:', portfolioId);
                
                if (action === 'edit-portfolio') {
                    this.editPortfolio(portfolioId);
                } else if (action === 'delete-portfolio') {
                    this.deletePortfolio(portfolioId);
                }
            });
        });
    }

    renderPortfolioCard(portfolio) {
        const coverPhoto = portfolio.photos[0];
        const photoCount = portfolio.photos.length;
        
        return `
            <div class="portfolio-card" data-portfolio-id="${portfolio.id}" data-action="open-portfolio">
                <div class="portfolio-cover">
                    ${coverPhoto ? 
                        `<img src="${coverPhoto.src}" alt="${portfolio.title}" loading="lazy">` :
                        `<div class="portfolio-placeholder">📸</div>`
                    }
                    <div class="portfolio-overlay">
                        <div class="portfolio-actions">
                            <button class="portfolio-action" data-portfolio-id="${portfolio.id}" data-action="edit-portfolio" title="Edit">
                                ✏️
                            </button>
                            <button class="portfolio-action" data-portfolio-id="${portfolio.id}" data-action="delete-portfolio" title="Delete">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
                <div class="portfolio-info">
                    <h3 class="portfolio-card-title">${portfolio.title}</h3>
                    <p class="portfolio-card-description">${portfolio.description || 'No description'}</p>
                    <div class="portfolio-card-meta">
                        <span>${photoCount} photo${photoCount !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>${this.formatDate(new Date(portfolio.updatedAt))}</span>
                    </div>
                </div>
            </div>
        `;
    }

    showCreatePortfolioModal() {
        console.log('showCreatePortfolioModal called');
        const modal = document.getElementById('portfolio-creation-modal');
        if (!modal) {
            console.error('Portfolio creation modal not found');
            return;
        }
        
        // Initialize tempPhotos array if not exists
        if (!this.tempPhotos) {
            this.tempPhotos = [];
            console.log('tempPhotos created as new array');
        } else {
            console.log('tempPhotos already exists with', this.tempPhotos.length, 'photos');
        }
        console.log('tempPhotos initialized:', this.tempPhotos);
        
        // Clear only the text form fields, NOT the file input
        const titleInput = document.getElementById('portfolio-title');
        const descriptionInput = document.getElementById('portfolio-description');
        
        if (titleInput) titleInput.value = '';
        if (descriptionInput) descriptionInput.value = '';
        // DO NOT clear file input - let it keep the selected files
        
        // Show modal
        modal.classList.add('active');
        
        // Setup event listeners
        this.setupModalEventListeners();
        
        // Update photo preview grid in case there are existing photos
        this.updatePhotoPreviewGrid();
        
        // Focus on title input
        setTimeout(() => {
            const titleInput = document.getElementById('portfolio-title');
            if (titleInput) titleInput.focus();
        }, 100);
    }

    hideCreatePortfolioModal() {
        const modal = document.getElementById('portfolio-creation-modal');
        if (modal) {
            modal.classList.remove('active');
            // Don't reset form immediately - let the creation process complete first
        }
    }
    
    resetPortfolioForm() {
        // Clear form fields
        const titleInput = document.getElementById('portfolio-title');
        const descriptionInput = document.getElementById('portfolio-description');
        const fileInput = document.getElementById('modal-file-input');
        const previewGrid = document.getElementById('photo-preview-grid');
        
        if (titleInput) titleInput.value = '';
        if (descriptionInput) descriptionInput.value = '';
        if (fileInput) fileInput.value = '';
        if (previewGrid) {
            previewGrid.innerHTML = '';
            previewGrid.style.display = 'none';
        }
        
        // Reset upload zone
        const uploadZone = document.getElementById('modal-upload-zone');
        if (uploadZone) {
            uploadZone.classList.remove('dragover');
        }
        
        // Clear temporary photos array
        this.tempPhotos = [];
    }
    
    setupModalEventListeners() {
        console.log('Setting up modal event listeners');
        
        // Remove existing listeners to prevent duplicates
        this.removeModalEventListeners();
        
        // Close button
        const closeBtn = document.getElementById('portfolio-modal-close');
        if (closeBtn) {
            this.modalCloseHandler = () => {
                this.hideCreatePortfolioModal();
                this.resetPortfolioForm();
            };
            closeBtn.addEventListener('click', this.modalCloseHandler);
        }
        
        // Cancel button
        const cancelBtn = document.getElementById('cancel-portfolio');
        if (cancelBtn) {
            this.modalCancelHandler = () => {
                this.hideCreatePortfolioModal();
                this.resetPortfolioForm();
            };
            cancelBtn.addEventListener('click', this.modalCancelHandler);
        }
        
        // Form submission - disabled to prevent double triggering
        const form = document.getElementById('portfolio-creation-form');
        console.log('Form element found:', !!form);
        if (form) {
            console.log('Form found but not setting up submit handler - using direct click handler instead');
        } else {
            console.error('Portfolio creation form not found!');
        }
        
        // Also add direct click handler to Create Portfolio button as backup
        const createBtn = document.getElementById('create-portfolio-btn');
        if (createBtn) {
            console.log('Setting up direct click handler for Create Portfolio button');
            this.createBtnHandler = (e) => {
                console.log('Create Portfolio button clicked directly');
                e.preventDefault();
                e.stopPropagation();
                
                // Debug file input state
                const fileInput = document.getElementById('modal-file-input');
                console.log('File input found:', !!fileInput);
                console.log('Files in input:', fileInput ? fileInput.files.length : 'no input');
                
                this.createNewPortfolioFromModal();
            };
            createBtn.addEventListener('click', this.createBtnHandler);
        }
        
        // File input and upload zone
        const fileInput = document.getElementById('modal-file-input');
        const uploadZone = document.getElementById('modal-upload-zone');
        
        console.log('File input found:', !!fileInput);
        console.log('Upload zone found:', !!uploadZone);
        console.log('File input element:', fileInput);
        console.log('Upload zone element:', uploadZone);
        
        if (fileInput && uploadZone) {
            console.log('Setting up file input and upload zone');
            
            // Click handler for upload zone
            this.uploadZoneClickHandler = (e) => {
                console.log('Upload zone clicked, triggering file input');
                console.log('Click event:', e);
                console.log('File input before click:', fileInput);
                fileInput.click();
                console.log('File input clicked');
            };
            uploadZone.addEventListener('click', this.uploadZoneClickHandler);
            
            // File selection
            this.fileInputChangeHandler = (e) => {
                console.log('Files selected:', e.target.files.length);
                this.handleFileSelection(e.target.files);
            };
            fileInput.addEventListener('change', this.fileInputChangeHandler);
            
            // Drag and drop
            this.dragOverHandler = (e) => {
                e.preventDefault();
                uploadZone.classList.add('dragover');
            };
            
            this.dragLeaveHandler = () => {
                uploadZone.classList.remove('dragover');
            };
            
            this.dropHandler = (e) => {
                e.preventDefault();
                uploadZone.classList.remove('dragover');
                console.log('Files dropped:', e.dataTransfer.files.length);
                this.handleFileSelection(e.dataTransfer.files);
            };
            
            uploadZone.addEventListener('dragover', this.dragOverHandler);
            uploadZone.addEventListener('dragleave', this.dragLeaveHandler);
            uploadZone.addEventListener('drop', this.dropHandler);
        } else {
            console.error('File input or upload zone not found!');
        }
        
        // Close on backdrop click
        const modal = document.getElementById('portfolio-creation-modal');
        if (modal) {
            this.modalBackdropHandler = (e) => {
                if (e.target === modal) {
                    this.hideCreatePortfolioModal();
                    this.resetPortfolioForm();
                }
            };
            modal.addEventListener('click', this.modalBackdropHandler);
        }
    }
    
    removeModalEventListeners() {
        const closeBtn = document.getElementById('portfolio-modal-close');
        const cancelBtn = document.getElementById('cancel-portfolio');
        const form = document.getElementById('portfolio-creation-form');
        const createBtn = document.getElementById('create-portfolio-btn');
        const fileInput = document.getElementById('modal-file-input');
        const uploadZone = document.getElementById('modal-upload-zone');
        const modal = document.getElementById('portfolio-creation-modal');
        
        if (closeBtn && this.modalCloseHandler) {
            closeBtn.removeEventListener('click', this.modalCloseHandler);
        }
        if (cancelBtn && this.modalCancelHandler) {
            cancelBtn.removeEventListener('click', this.modalCancelHandler);
        }
        // Form handler removed - using direct click handler instead
        if (createBtn && this.createBtnHandler) {
            createBtn.removeEventListener('click', this.createBtnHandler);
        }
        if (fileInput && this.fileInputChangeHandler) {
            fileInput.removeEventListener('change', this.fileInputChangeHandler);
        }
        if (uploadZone) {
            if (this.uploadZoneClickHandler) uploadZone.removeEventListener('click', this.uploadZoneClickHandler);
            if (this.dragOverHandler) uploadZone.removeEventListener('dragover', this.dragOverHandler);
            if (this.dragLeaveHandler) uploadZone.removeEventListener('dragleave', this.dragLeaveHandler);
            if (this.dropHandler) uploadZone.removeEventListener('drop', this.dropHandler);
        }
        if (modal && this.modalBackdropHandler) {
            modal.removeEventListener('click', this.modalBackdropHandler);
        }
    }

    async handleFileSelection(files) {
        console.log('🌐 handleFileSelection called with:', files);
        
        if (!files || files.length === 0) {
            console.log('No files provided');
            return;
        }
        
        console.log('Number of files:', files.length);
        
        const maxFiles = 10;
        const maxFileSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        
        // Initialize tempPhotos if not exists
        if (!this.tempPhotos) {
            this.tempPhotos = [];
        }
        
        const remainingSlots = maxFiles - this.tempPhotos.length;
        const filesToProcess = Array.from(files).slice(0, remainingSlots);
        
        console.log('Files to process:', filesToProcess.length);
        
        // Validate files first
        const validFiles = [];
        for (const file of filesToProcess) {
            if (!allowedTypes.includes(file.type)) {
                this.showToast(`${file.name} is not a supported image format.`, 'error', 'Invalid File Type');
                continue;
            }
            
            if (file.size > maxFileSize) {
                this.showToast(`${file.name} is too large. Maximum file size is 10MB.`, 'error', 'File Too Large');
                continue;
            }
            
            validFiles.push(file);
        }
        
        if (validFiles.length === 0) {
            return;
        }
        
        try {
            if (this.useCloudStorage) {
                // Upload to cloud storage
                console.log('🌐 Uploading files to cloud storage...');
                this.showUploadProgress(true);
                
                const results = await this.cloudStorage.uploadImages(
                    validFiles, 
                    this.userFid,
                    (current, total, fileName) => {
                        this.updateUploadProgress(current, total, fileName);
                    }
                );
                
                // Add successful uploads to tempPhotos
                const successfulUploads = results.filter(r => !r.error);
                this.tempPhotos.push(...successfulUploads);
                
                // Report failed uploads
                const failedUploads = results.filter(r => r.error);
                if (failedUploads.length > 0) {
                    this.showToast(`${failedUploads.length} files failed to upload`, 'warning', 'Partial Upload');
                }
                
                console.log(`✅ Successfully uploaded ${successfulUploads.length} files to cloud`);
                this.showUploadProgress(false);
                
            } else {
                // Fallback to local compression
                console.log('📁 Processing files locally...');
                for (const file of validFiles) {
                    try {
                        const photoData = await this.compressAndProcessImage(file);
                        console.log('File processed:', file.name, 'Compressed size:', photoData.compressedSize);
                        this.tempPhotos.push(photoData);
                    } catch (error) {
                        console.error('Error processing file:', file.name, error);
                        this.showToast(`Failed to process ${file.name}`, 'error', 'Processing Error');
                    }
                }
            }
            
            this.updatePhotoPreviewGrid();
            
        } catch (error) {
            console.error('❌ File processing failed:', error);
            this.showToast('Failed to process files. Please try again.', 'error', 'Upload Error');
        }
        
        if (filesToProcess.length < files.length) {
            this.showToast(`Only ${filesToProcess.length} photos were processed. Portfolio limit is ${maxFiles} photos.`, 'warning', 'Upload Limit');
        }
    }

    showUploadProgress(show) {
        if (show) {
            console.log('📤 Starting upload...');
            // You could show a progress modal here
        } else {
            console.log('✅ Upload complete');
        }
    }

    updateUploadProgress(current, total, fileName) {
        this.uploadProgress = { current, total, currentFile: fileName };
        console.log(`📤 Uploading ${current}/${total}: ${fileName}`);
        // Update progress UI here if needed
    }

    async compressAndProcessImage(file, maxWidth = 1200, maxHeight = 800, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calculate new dimensions while maintaining aspect ratio
                let { width, height } = img;
                
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }
                
                // Set canvas dimensions
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress image
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to base64 with compression
                const compressedDataURL = canvas.toDataURL('image/jpeg', quality);
                
                const photoData = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    src: compressedDataURL,
                    name: file.name,
                    size: file.size,
                    compressedSize: compressedDataURL.length,
                    type: 'image/jpeg', // Always convert to JPEG for better compression
                    originalType: file.type,
                    dimensions: { width, height }
                };
                
                resolve(photoData);
            };
            
            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };
            
            // Convert file to data URL for image loading
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            reader.readAsDataURL(file);
        });
    }
    
    updatePhotoPreviewGrid() {
        console.log('updatePhotoPreviewGrid called, tempPhotos length:', this.tempPhotos.length);
        
        const previewGrid = document.getElementById('photo-preview-grid');
        if (!previewGrid) {
            console.error('Photo preview grid element not found!');
            return;
        }
        
        console.log('Preview grid element found');
        
        if (this.tempPhotos.length === 0) {
            console.log('No photos to display, hiding grid');
            previewGrid.style.display = 'none';
            return;
        }
        
        console.log('Showing grid with', this.tempPhotos.length, 'photos');
        previewGrid.style.display = 'grid';
        previewGrid.innerHTML = this.tempPhotos.map(photo => `
            <div class="photo-preview-item">
                <img src="${photo.src}" alt="${photo.name}" class="photo-preview-image">
                <button class="photo-preview-remove" data-photo-id="${photo.id}" title="Remove photo">
                    ×
                </button>
            </div>
        `).join('');
        
        // Add event listeners for remove buttons
        const removeButtons = previewGrid.querySelectorAll('.photo-preview-remove');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const photoId = button.getAttribute('data-photo-id');
                console.log('Removing photo:', photoId);
                this.removePreviewPhoto(photoId);
            });
        });
    }
    
    removePreviewPhoto(photoId) {
        if (!this.tempPhotos) return;
        
        this.tempPhotos = this.tempPhotos.filter(photo => photo.id !== photoId);
        this.updatePhotoPreviewGrid();
    }
    
    async createNewPortfolioFromModal() {
        console.log('=== PORTFOLIO CREATION START ===');
        console.log('🔍 Farcaster Context Debug:');
        console.log('- Running in iframe:', window.parent !== window);
        console.log('- User FID:', this.userFid);
        console.log('- Current user:', this.currentUser);
        console.log('- Storage key will be:', `portfolios_${this.userFid}`);
        
        console.log('📸 Photo Debug:');
        console.log('- tempPhotos at start:', this.tempPhotos);
        console.log('- tempPhotos length:', this.tempPhotos ? this.tempPhotos.length : 0);
        console.log('- tempPhotos is array:', Array.isArray(this.tempPhotos));
        
        if (this.tempPhotos && this.tempPhotos.length > 0) {
            console.log('- First photo preview:', {
                id: this.tempPhotos[0].id,
                name: this.tempPhotos[0].name,
                srcLength: this.tempPhotos[0].src ? this.tempPhotos[0].src.length : 0,
                type: this.tempPhotos[0].type
            });
        }
        
        // Get form data
        const titleElement = document.getElementById('portfolio-title');
        const descriptionElement = document.getElementById('portfolio-description');
        const fileInput = document.getElementById('modal-file-input');
        
        if (!titleElement || !fileInput) {
            console.error('Required elements not found');
            this.showToast('Form elements not found. Please refresh and try again.', 'error', 'Error');
            return;
        }
        
        const title = titleElement.value.trim();
        const description = descriptionElement ? descriptionElement.value.trim() : '';
        
        if (!title) {
            this.showToast('Please enter a portfolio title', 'error', 'Title Required');
            titleElement.focus();
            return;
        }
        
        if (this.portfolios.length >= this.maxPortfolios) {
            this.showToast(`You can only create up to ${this.maxPortfolios} portfolios. Delete an existing portfolio to create a new one.`, 'warning', 'Portfolio Limit Reached');
            return;
        }
        
        // Use tempPhotos array directly since it's already populated
        console.log('tempPhotos before creating portfolio:', this.tempPhotos);
        console.log('tempPhotos length before creating portfolio:', this.tempPhotos ? this.tempPhotos.length : 0);
        
        // Make a deep copy to preserve the data
        const photosToUse = this.tempPhotos && this.tempPhotos.length > 0 ? 
            this.tempPhotos.map(photo => ({...photo})) : [];
        
        console.log('Photos to use (copied):', photosToUse);
        console.log('Creating portfolio with', photosToUse.length, 'photos');
        
        // Create portfolio with photos from tempPhotos
        const newPortfolio = {
            id: Date.now().toString(),
            title: title,
            description: description,
            photos: photosToUse,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        console.log('Portfolio created:', newPortfolio);
        console.log('Portfolio photos count:', newPortfolio.photos.length);
        
        try {
            this.portfolios.push(newPortfolio);
            await this.saveUserPortfolios();
            
            console.log('Portfolio saved successfully');
            
            // Clear tempPhotos after successful creation
            this.tempPhotos = [];
            
            this.hideCreatePortfolioModal();
            this.resetPortfolioForm(); // Reset form after successful creation
            this.showPortfoliosView();
            this.showToast(`Portfolio "${title}" created successfully with ${photosToUse.length} photos!`, 'success', 'Portfolio Created');
            
        } catch (error) {
            // Remove portfolio from local array if save failed
            this.portfolios.pop();
            this.showToast('Failed to save portfolio. Please try again.', 'error', 'Save Failed');
        }
        
        console.log('=== PORTFOLIO CREATION END ===');
    }
    
    createNewPortfolio() {
        const title = document.getElementById('portfolio-title').value.trim();
        const description = document.getElementById('portfolio-description').value.trim();
        
        if (!title) {
            this.showToast('Please enter a portfolio title', 'error', 'Title Required');
            return;
        }

        if (this.portfolios.length >= this.maxPortfolios) {
            this.showToast(`You can only create up to ${this.maxPortfolios} portfolios. Delete an existing portfolio to create a new one.`, 'warning', 'Portfolio Limit Reached');
            return;
        }

        const newPortfolio = {
            id: Date.now().toString(),
            title: title,
            description: description,
            photos: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.portfolios.push(newPortfolio);
        this.saveUserPortfolios();
        this.hideCreatePortfolioModal();
        
        // Open the new portfolio
        this.openPortfolio(newPortfolio.id);
    }

    openPortfolio(portfolioId) {
        const portfolio = this.portfolios.find(p => p.id === portfolioId);
        if (!portfolio) return;

        this.currentPortfolio = portfolio;
        this.showPortfolioDetailView();
    }

    editPortfolio(portfolioId) {
        const portfolio = this.portfolios.find(p => p.id === portfolioId);
        if (!portfolio) return;

        this.editingPortfolio = portfolio;
        this.showEditPortfolioModal();
    }

    showEditPortfolioModal() {
        if (!this.editingPortfolio) return;

        const modal = document.getElementById('portfolio-edit-modal');
        if (!modal) return;

        // Populate form with current portfolio data
        const titleInput = document.getElementById('edit-portfolio-title');
        const descriptionInput = document.getElementById('edit-portfolio-description');
        
        if (titleInput) titleInput.value = this.editingPortfolio.title;
        if (descriptionInput) descriptionInput.value = this.editingPortfolio.description || '';

        // Show existing photos
        this.updateEditPhotoGrid();

        // Show modal
        modal.classList.add('active');

        // Setup event listeners
        this.setupEditModalEventListeners();

        // Focus on title input
        setTimeout(() => {
            if (titleInput) titleInput.focus();
        }, 100);
    }

    hideEditPortfolioModal() {
        const modal = document.getElementById('portfolio-edit-modal');
        if (modal) {
            modal.classList.remove('active');
            this.editingPortfolio = null;
        }
    }

    updateEditPhotoGrid() {
        const grid = document.getElementById('edit-photo-grid');
        if (!grid || !this.editingPortfolio) return;

        if (this.editingPortfolio.photos.length === 0) {
            grid.style.display = 'none';
            return;
        }

        grid.style.display = 'grid';
        grid.innerHTML = this.editingPortfolio.photos.map(photo => `
            <div class="photo-preview-item">
                <img src="${photo.src}" alt="${photo.name}" class="photo-preview-image">
                <button class="photo-preview-remove" data-photo-id="${photo.id}" title="Remove photo">
                    ×
                </button>
            </div>
        `).join('');

        // Add event listeners for remove buttons
        const removeButtons = grid.querySelectorAll('.photo-preview-remove');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const photoId = button.getAttribute('data-photo-id');
                this.removePhotoFromEdit(photoId);
            });
        });
    }

    removePhotoFromEdit(photoId) {
        if (!this.editingPortfolio) return;
        
        this.editingPortfolio.photos = this.editingPortfolio.photos.filter(photo => photo.id !== photoId);
        this.updateEditPhotoGrid();
    }

    setupEditModalEventListeners() {
        // Remove existing listeners
        this.removeEditModalEventListeners();

        // Close button
        const closeBtn = document.getElementById('edit-modal-close');
        if (closeBtn) {
            this.editModalCloseHandler = () => this.hideEditPortfolioModal();
            closeBtn.addEventListener('click', this.editModalCloseHandler);
        }

        // Cancel button
        const cancelBtn = document.getElementById('cancel-edit');
        if (cancelBtn) {
            this.editModalCancelHandler = () => this.hideEditPortfolioModal();
            cancelBtn.addEventListener('click', this.editModalCancelHandler);
        }

        // Save button
        const saveBtn = document.getElementById('save-portfolio-btn');
        if (saveBtn) {
            this.editModalSaveHandler = (e) => {
                e.preventDefault();
                this.saveEditedPortfolio();
            };
            saveBtn.addEventListener('click', this.editModalSaveHandler);
        }

        // File input for adding photos
        const fileInput = document.getElementById('edit-file-input');
        const uploadZone = document.getElementById('edit-upload-zone');

        if (fileInput && uploadZone) {
            this.editUploadZoneClickHandler = () => {
                if (this.editingPortfolio.photos.length < this.maxPhotosPerPortfolio) {
                    fileInput.click();
                }
            };
            uploadZone.addEventListener('click', this.editUploadZoneClickHandler);

            this.editFileInputChangeHandler = (e) => {
                this.handleEditFileSelection(e.target.files);
            };
            fileInput.addEventListener('change', this.editFileInputChangeHandler);
        }

        // Close on backdrop click
        const modal = document.getElementById('portfolio-edit-modal');
        if (modal) {
            this.editModalBackdropHandler = (e) => {
                if (e.target === modal) {
                    this.hideEditPortfolioModal();
                }
            };
            modal.addEventListener('click', this.editModalBackdropHandler);
        }
    }

    removeEditModalEventListeners() {
        const closeBtn = document.getElementById('edit-modal-close');
        const cancelBtn = document.getElementById('cancel-edit');
        const saveBtn = document.getElementById('save-portfolio-btn');
        const fileInput = document.getElementById('edit-file-input');
        const uploadZone = document.getElementById('edit-upload-zone');
        const modal = document.getElementById('portfolio-edit-modal');

        if (closeBtn && this.editModalCloseHandler) {
            closeBtn.removeEventListener('click', this.editModalCloseHandler);
        }
        if (cancelBtn && this.editModalCancelHandler) {
            cancelBtn.removeEventListener('click', this.editModalCancelHandler);
        }
        if (saveBtn && this.editModalSaveHandler) {
            saveBtn.removeEventListener('click', this.editModalSaveHandler);
        }
        if (fileInput && this.editFileInputChangeHandler) {
            fileInput.removeEventListener('change', this.editFileInputChangeHandler);
        }
        if (uploadZone && this.editUploadZoneClickHandler) {
            uploadZone.removeEventListener('click', this.editUploadZoneClickHandler);
        }
        if (modal && this.editModalBackdropHandler) {
            modal.removeEventListener('click', this.editModalBackdropHandler);
        }
    }

    async handleEditFileSelection(files) {
        if (!this.editingPortfolio || !files || files.length === 0) return;

        const remainingSlots = this.maxPhotosPerPortfolio - this.editingPortfolio.photos.length;
        const filesToProcess = Array.from(files).slice(0, remainingSlots);

        for (const file of filesToProcess) {
            if (file.type.startsWith('image/')) {
                await this.addPhotoToEdit(file);
            }
        }

        this.updateEditPhotoGrid();
    }

    async addPhotoToEdit(file) {
        try {
            const photoData = await this.compressAndProcessImage(file);
            this.editingPortfolio.photos.push(photoData);
            return photoData;
        } catch (error) {
            console.error('Error adding photo to edit:', error);
            throw error;
        }
    }

    saveEditedPortfolio() {
        if (!this.editingPortfolio) return;

        const titleElement = document.getElementById('edit-portfolio-title');
        const descriptionElement = document.getElementById('edit-portfolio-description');

        if (!titleElement) return;

        const title = titleElement.value.trim();
        const description = descriptionElement ? descriptionElement.value.trim() : '';

        if (!title) {
            this.showToast('Please enter a portfolio title', 'error');
            titleElement.focus();
            return;
        }

        // Update portfolio
        this.editingPortfolio.title = title;
        this.editingPortfolio.description = description;
        this.editingPortfolio.updatedAt = new Date().toISOString();

        // Save to storage
        this.saveUserPortfolios();

        // Update current portfolio if it's the one being edited
        if (this.currentPortfolio && this.currentPortfolio.id === this.editingPortfolio.id) {
            this.currentPortfolio = this.editingPortfolio;
        }

        this.hideEditPortfolioModal();
        this.updateUI();
        
        this.showToast(`Portfolio "${title}" updated successfully!`, 'success', 'Saved');
    }

    deletePortfolio(portfolioId) {
        const portfolio = this.portfolios.find(p => p.id === portfolioId);
        if (!portfolio) return;

        this.showConfirmDialog(
            'Delete Portfolio',
            `Are you sure you want to delete "${portfolio.title}"? This will permanently remove all ${portfolio.photos.length} photos and cannot be undone.`,
            () => {
                this.portfolios = this.portfolios.filter(p => p.id !== portfolioId);
                this.saveUserPortfolios();
                
                if (this.currentPortfolio && this.currentPortfolio.id === portfolioId) {
                    this.showPortfoliosView();
                } else {
                    this.updateUI();
                }
                
                this.showToast(`Portfolio "${portfolio.title}" deleted successfully`, 'success', 'Deleted');
            }
        );
    }

    async handlePortfolioFileSelection(files) {
        if (!this.currentPortfolio) return;
        
        const remainingSlots = this.maxPhotosPerPortfolio - this.currentPortfolio.photos.length;
        const filesToProcess = Array.from(files).slice(0, remainingSlots);

        for (const file of filesToProcess) {
            if (file.type.startsWith('image/')) {
                await this.addPhotoToCurrentPortfolio(file);
            }
        }

        this.currentPortfolio.updatedAt = new Date().toISOString();
        this.saveUserPortfolios();
        this.updateUI();
    }

    async addPhotoToCurrentPortfolio(file) {
        try {
            const photoData = await this.compressAndProcessImage(file);
            photoData.uploadedAt = new Date().toISOString();
            this.currentPortfolio.photos.push(photoData);
            return photoData;
        } catch (error) {
            console.error('Error adding photo to current portfolio:', error);
            throw error;
        }
    }

    updatePhotoGrid() {
        const photoGrid = document.getElementById('photo-grid');
        if (!photoGrid || !this.currentPortfolio) return;

        if (this.currentPortfolio.photos.length === 0) {
            photoGrid.style.display = 'none';
        } else {
            photoGrid.style.display = 'grid';
            photoGrid.innerHTML = this.currentPortfolio.photos.map((photo, index) => `
                <div class="photo-item" data-index="${index}">
                    <img src="${photo.src}" alt="${photo.name}" loading="lazy">
                    <div class="photo-overlay">
                        <div class="photo-actions">
                            <button class="photo-action" onclick="window.portfolio.viewPhoto(${index})" title="View">
                                👁️
                            </button>
                            <button class="photo-action" onclick="window.portfolio.removePhoto(${index})" title="Remove">
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
        const uploadArea = document.getElementById('upload-area');
        
        if (!this.currentPortfolio) return;

        if (this.currentPortfolio.photos.length > 0) {
            controls.style.display = 'flex';
            
            // Update photo counter
            const photoCounter = document.getElementById('photo-counter');
            if (photoCounter) {
                photoCounter.textContent = `${this.currentPortfolio.photos.length} of ${this.maxPhotosPerPortfolio} photos`;
            }
        } else {
            controls.style.display = 'none';
        }

        // Update upload area state
        if (uploadArea) {
            if (this.currentPortfolio.photos.length >= this.maxPhotosPerPortfolio) {
                uploadArea.style.opacity = '0.5';
                uploadArea.style.cursor = 'not-allowed';
                uploadArea.querySelector('.upload-text').textContent = 'Portfolio is full (10/10 photos)';
                uploadArea.querySelector('.upload-hint').textContent = 'Remove photos to add new ones';
            } else {
                uploadArea.style.opacity = '1';
                uploadArea.style.cursor = 'pointer';
                uploadArea.querySelector('.upload-text').textContent = 'Drop your photos here or click to browse';
                uploadArea.querySelector('.upload-hint').textContent = `Maximum ${this.maxPhotosPerPortfolio} photos • JPG, PNG, WebP • Up to 10MB each`;
            }
        }
    }

    getTotalPhotoCount() {
        return this.portfolios.reduce((total, portfolio) => total + portfolio.photos.length, 0);
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
        if (!this.currentPortfolio) return;
        
        this.currentPhotoIndex = index;
        const modal = document.getElementById('photo-modal');
        const modalImage = document.getElementById('modal-image');
        
        modalImage.src = this.currentPortfolio.photos[index].src;
        modal.classList.add('active');
    }

    closeModal() {
        const modal = document.getElementById('photo-modal');
        modal.classList.remove('active');
    }

    showPreviousPhoto() {
        if (!this.currentPortfolio || this.currentPortfolio.photos.length <= 1) return;
        
        this.currentPhotoIndex = (this.currentPhotoIndex - 1 + this.currentPortfolio.photos.length) % this.currentPortfolio.photos.length;
        document.getElementById('modal-image').src = this.currentPortfolio.photos[this.currentPhotoIndex].src;
    }

    showNextPhoto() {
        if (!this.currentPortfolio || this.currentPortfolio.photos.length <= 1) return;
        
        this.currentPhotoIndex = (this.currentPhotoIndex + 1) % this.currentPortfolio.photos.length;
        document.getElementById('modal-image').src = this.currentPortfolio.photos[this.currentPhotoIndex].src;
    }

    removePhoto(index) {
        if (!this.currentPortfolio) return;
        
        this.showConfirmDialog(
            'Remove Photo',
            'Are you sure you want to remove this photo from your portfolio?',
            () => {
                this.currentPortfolio.photos.splice(index, 1);
                this.currentPortfolio.updatedAt = new Date().toISOString();
                this.saveUserPortfolios();
                this.updateUI();
                this.showToast('Photo removed from portfolio', 'success', 'Photo Removed');
            }
        );
    }

    clearCurrentPortfolio() {
        if (!this.currentPortfolio) return;
        
        this.showConfirmDialog(
            'Clear All Photos',
            `Remove all photos from "${this.currentPortfolio.title}"? This cannot be undone.`,
            () => {
                this.currentPortfolio.photos = [];
                this.currentPortfolio.updatedAt = new Date().toISOString();
                this.saveUserPortfolios();
                this.updateUI();
                this.showToast('All photos removed from portfolio', 'success', 'Portfolio Cleared');
            }
        );
    }

    editCurrentPortfolio() {
        if (!this.currentPortfolio) return;
        this.editPortfolio(this.currentPortfolio.id);
    }

    async shareCurrentPortfolio() {
        if (!this.currentPortfolio) return;
        
        try {
            if (this.currentPortfolio.photos.length === 0) {
                this.showToast('Add some photos to your portfolio before sharing!', 'warning', 'No Photos to Share');
                return;
            }

            // Try to use Farcaster SDK to compose a cast
            if (this.currentUser && sdk.actions.composeCast) {
                const portfolioUrl = `https://framethegallery.xyz/portfolio/${this.userFid}/${this.currentPortfolio.id}`;
                const text = `Check out my \"${this.currentPortfolio.title}\" portfolio on FrameTheGallery! 📸\\n\\n${this.currentPortfolio.description || ''}\\n\\n${this.currentPortfolio.photos.length} photos showcasing my work.\\n\\n${portfolioUrl}`;
                
                await sdk.actions.composeCast({
                    text: text,
                    embeds: [portfolioUrl]
                });
            } else {
                // Fallback to Web Share API
                const portfolioUrl = `https://framethegallery.xyz/portfolio/${this.userFid}/${this.currentPortfolio.id}`;
                const shareData = {
                    title: `${this.currentPortfolio.title} - Photography Portfolio`,
                    text: `Check out my \"${this.currentPortfolio.title}\" portfolio! ${this.currentPortfolio.photos.length} photos showcasing my work.`,
                    url: portfolioUrl
                };

                if (navigator.share) {
                    await navigator.share(shareData);
                } else {
                    // Fallback: copy to clipboard
                    await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                    this.showToast('Portfolio link copied to clipboard!', 'success', 'Link Copied');
                }
            }
        } catch (error) {
            console.error('Error sharing portfolio:', error);
            this.showToast('Unable to share portfolio. Please try again.', 'error', 'Share Failed');
        }
    }

    // Utility methods
    showElement(id) {
        const element = document.getElementById(id);
        if (element) element.style.display = element.dataset.originalDisplay || 'block';
    }

    hideElement(id) {
        const element = document.getElementById(id);
        if (element) {
            if (!element.dataset.originalDisplay) {
                element.dataset.originalDisplay = getComputedStyle(element).display;
            }
            element.style.display = 'none';
        }
    }

    showApp() {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        sdk.actions.ready();
    }

    // Toast Notification System
    showToast(message, type = 'info', title = null, duration = 4000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toastId = 'toast-' + Date.now();
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.id = toastId;
        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="portfolio.removeToast('${toastId}')">×</button>
        `;

        container.appendChild(toast);

        // Show toast with animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.removeToast(toastId);
            }, duration);
        }

        return toastId;
    }

    removeToast(toastId) {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }
    }

    // Custom Confirmation Dialog
    showConfirmDialog(title, message, onConfirm, onCancel = null) {
        const modal = document.createElement('div');
        modal.className = 'modal confirm-modal active';
        modal.innerHTML = `
            <div class="modal-content confirm-modal-content">
                <div class="confirm-header">
                    <div class="confirm-icon">❓</div>
                    <div class="confirm-title">${title}</div>
                    <div class="confirm-message">${message}</div>
                </div>
                <div class="confirm-actions">
                    <button class="btn btn-secondary" id="confirm-cancel">Cancel</button>
                    <button class="btn btn-primary" id="confirm-ok">Confirm</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const cancelBtn = modal.querySelector('#confirm-cancel');
        const confirmBtn = modal.querySelector('#confirm-ok');

        const cleanup = () => {
            modal.remove();
        };

        cancelBtn.addEventListener('click', () => {
            cleanup();
            if (onCancel) onCancel();
        });

        confirmBtn.addEventListener('click', () => {
            cleanup();
            onConfirm();
        });

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cleanup();
                if (onCancel) onCancel();
            }
        });
    }
}

// Make portfolio globally accessible for onclick handlers
let portfolio;

// Debug functions for troubleshooting
window.debugPortfolio = function() {
    console.log('=== PORTFOLIO DEBUG INFO ===');
    console.log('Portfolio object:', portfolio);
    console.log('User FID:', portfolio?.userFid);
    console.log('Current user:', portfolio?.currentUser);
    console.log('Portfolios count:', portfolio?.portfolios?.length || 0);
    console.log('Current portfolio:', portfolio?.currentPortfolio);
    console.log('Temp photos:', portfolio?.tempPhotos);
    console.log('Running in iframe:', window.parent !== window);
    console.log('localStorage available:', !!window.localStorage);
    
    // Check all portfolio data in localStorage
    console.log('\n=== LOCALSTORAGE DEBUG ===');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('portfolio')) {
            const value = localStorage.getItem(key);
            console.log(`${key}: ${value ? value.length + ' chars' : 'null'}`);
            
            if (key.startsWith('portfolios_')) {
                try {
                    const data = JSON.parse(value);
                    console.log(`  - Contains ${data.length} portfolios`);
                    data.forEach((p, idx) => {
                        console.log(`    ${idx + 1}. "${p.title}" with ${p.photos.length} photos`);
                    });
                } catch (e) {
                    console.log('  - Failed to parse data');
                }
            }
        }
    }
    
    return portfolio;
};

window.clearPortfolioData = function() {
    const confirmed = confirm('Clear all portfolio data? This cannot be undone.');
    if (confirmed) {
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.includes('portfolio')) {
                localStorage.removeItem(key);
                console.log('Removed:', key);
            }
        }
        location.reload();
    }
};

// Test function to verify portfolio is accessible
window.testPortfolio = function() {
    console.log('Portfolio object:', portfolio);
    if (portfolio && portfolio.showCreatePortfolioModal) {
        console.log('showCreatePortfolioModal method exists');
        portfolio.showCreatePortfolioModal();
    } else {
        console.error('Portfolio not initialized or method missing');
    }
};

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing portfolio...');
    portfolio = new ProfessionalPortfolio();
    console.log('Portfolio initialized:', portfolio);
    // Make it globally accessible
    window.portfolio = portfolio;
});
