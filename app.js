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
        
        this.init();
    }

    async init() {
        try {
            console.log('Initializing Professional Portfolio...');
            
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
            // Load portfolios from localStorage based on user FID
            const storageKey = `portfolios_${this.userFid}`;
            const savedPortfolios = localStorage.getItem(storageKey);
            
            if (savedPortfolios) {
                this.portfolios = JSON.parse(savedPortfolios);
                console.log(`Loaded ${this.portfolios.length} portfolios for user ${this.userFid}`);
            } else {
                this.portfolios = [];
                console.log(`No saved portfolios found for user ${this.userFid}`);
            }
        } catch (error) {
            console.error('Error loading user portfolios:', error);
            this.portfolios = [];
        }
    }

    saveUserPortfolios() {
        try {
            const storageKey = `portfolios_${this.userFid}`;
            localStorage.setItem(storageKey, JSON.stringify(this.portfolios));
            console.log(`Saved ${this.portfolios.length} portfolios for user ${this.userFid}`);
        } catch (error) {
            console.error('Error saving user portfolios:', error);
        }
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
        const title = document.getElementById('portfolio-title');
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
        const title = document.getElementById('portfolio-title');
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
        
        // Reset form
        this.resetPortfolioForm();
        
        // Show modal
        modal.classList.add('active');
        
        // Setup event listeners
        this.setupModalEventListeners();
        
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
            this.resetPortfolioForm();
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
            this.modalCloseHandler = () => this.hideCreatePortfolioModal();
            closeBtn.addEventListener('click', this.modalCloseHandler);
        }
        
        // Cancel button
        const cancelBtn = document.getElementById('cancel-portfolio');
        if (cancelBtn) {
            this.modalCancelHandler = () => this.hideCreatePortfolioModal();
            cancelBtn.addEventListener('click', this.modalCancelHandler);
        }
        
        // Form submission
        const form = document.getElementById('portfolio-creation-form');
        console.log('Form element found:', !!form);
        if (form) {
            console.log('Setting up form submit handler');
            this.modalFormHandler = (e) => {
                console.log('Form submit event triggered');
                e.preventDefault();
                this.createNewPortfolioFromModal();
            };
            form.addEventListener('submit', this.modalFormHandler);
        } else {
            console.error('Portfolio creation form not found!');
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
                }
            };
            modal.addEventListener('click', this.modalBackdropHandler);
        }
    }
    
    removeModalEventListeners() {
        const closeBtn = document.getElementById('portfolio-modal-close');
        const cancelBtn = document.getElementById('cancel-portfolio');
        const form = document.getElementById('portfolio-creation-form');
        const fileInput = document.getElementById('modal-file-input');
        const uploadZone = document.getElementById('modal-upload-zone');
        const modal = document.getElementById('portfolio-creation-modal');
        
        if (closeBtn && this.modalCloseHandler) {
            closeBtn.removeEventListener('click', this.modalCloseHandler);
        }
        if (cancelBtn && this.modalCancelHandler) {
            cancelBtn.removeEventListener('click', this.modalCancelHandler);
        }
        if (form && this.modalFormHandler) {
            form.removeEventListener('submit', this.modalFormHandler);
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

    handleFileSelection(files) {
        console.log('handleFileSelection called with:', files);
        
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
            console.log('Initializing tempPhotos array');
            this.tempPhotos = [];
        }
        
        console.log('Current tempPhotos length:', this.tempPhotos.length);
        
        const remainingSlots = maxFiles - this.tempPhotos.length;
        const filesToProcess = Array.from(files).slice(0, remainingSlots);
        
        console.log('Files to process:', filesToProcess.length);
        
        filesToProcess.forEach(file => {
            // Validate file type
            if (!allowedTypes.includes(file.type)) {
                alert(`${file.name} is not a supported image format. Please use JPG, PNG, or WebP.`);
                return;
            }
            
            // Validate file size
            if (file.size > maxFileSize) {
                alert(`${file.name} is too large. Maximum file size is 10MB.`);
                return;
            }
            
            // Read file and create preview
            console.log('Reading file:', file.name, 'Size:', file.size, 'Type:', file.type);
            const reader = new FileReader();
            
            reader.onload = (e) => {
                console.log('File read successfully:', file.name);
                const photoData = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    data: e.target.result,
                    name: file.name,
                    size: file.size,
                    type: file.type
                };
                
                console.log('Adding photo to tempPhotos:', photoData.name);
                this.tempPhotos.push(photoData);
                console.log('tempPhotos length after push:', this.tempPhotos.length);
                this.updatePhotoPreviewGrid();
            };
            
            reader.onerror = (e) => {
                console.error('Error reading file:', file.name, e);
            };
            
            reader.readAsDataURL(file);
        });
        
        if (filesToProcess.length < files.length) {
            alert(`Only ${filesToProcess.length} photos were added. Portfolio limit is ${maxFiles} photos.`);
        }
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
                <img src="${photo.data}" alt="${photo.name}" class="photo-preview-image">
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
    
    createNewPortfolioFromModal() {
        console.log('=== PORTFOLIO CREATION START ===');
        
        // Get form elements with multiple fallback methods
        const modal = document.getElementById('portfolio-creation-modal');
        const form = document.getElementById('portfolio-creation-form');
        
        console.log('Modal found:', !!modal);
        console.log('Form found:', !!form);
        
        // Try multiple ways to get the title input
        let titleElement = document.getElementById('portfolio-title');
        if (!titleElement && form) {
            titleElement = form.querySelector('#portfolio-title');
        }
        if (!titleElement && modal) {
            titleElement = modal.querySelector('#portfolio-title');
        }
        
        // Try multiple ways to get the description textarea
        let descriptionElement = document.getElementById('portfolio-description');
        if (!descriptionElement && form) {
            descriptionElement = form.querySelector('#portfolio-description');
        }
        if (!descriptionElement && modal) {
            descriptionElement = modal.querySelector('#portfolio-description');
        }
        
        console.log('Title element found:', !!titleElement);
        console.log('Description element found:', !!descriptionElement);
        
        if (!titleElement) {
            console.error('Title element not found!');
            alert('Error: Could not find title field. Please refresh and try again.');
            return;
        }
        
        const title = titleElement.value ? titleElement.value.trim() : '';
        const description = descriptionElement ? (descriptionElement.value ? descriptionElement.value.trim() : '') : '';
        
        console.log('Final title value:', `"${title}"`);
        console.log('Final description value:', `"${description}"`);
        
        if (!title || title.length === 0) {
            console.log('Title validation failed');
            alert('Please enter a portfolio title');
            titleElement.focus();
            return;
        }
        
        console.log('Portfolio count check:', this.portfolios.length, 'max:', this.maxPortfolios);
        
        if (this.portfolios.length >= this.maxPortfolios) {
            console.log('Portfolio limit reached');
            alert(`You can only create up to ${this.maxPortfolios} portfolios. Delete an existing portfolio to create a new one.`);
            return;
        }
        
        console.log('Creating portfolio with photos:', this.tempPhotos ? this.tempPhotos.length : 0);
        
        const newPortfolio = {
            id: Date.now().toString(),
            title: title,
            description: description,
            photos: this.tempPhotos ? [...this.tempPhotos] : [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        console.log('New portfolio object:', newPortfolio);
        
        try {
            this.portfolios.push(newPortfolio);
            console.log('Portfolio added to array, total portfolios:', this.portfolios.length);
            
            this.saveUserPortfolios();
            console.log('Portfolios saved to storage');
            
            // Clear temp photos
            this.tempPhotos = [];
            console.log('Temp photos cleared');
            
            this.hideCreatePortfolioModal();
            console.log('Modal hidden');
            
            this.updateUI();
            console.log('UI updated');
            
            // Show success message
            alert(`Portfolio "${title}" created successfully!`);
            console.log('=== PORTFOLIO CREATION SUCCESS ===');
            
        } catch (error) {
            console.error('Error creating portfolio:', error);
            alert('Error creating portfolio. Please try again.');
        }
    }
    
    createNewPortfolio() {
        const title = document.getElementById('portfolio-title').value.trim();
        const description = document.getElementById('portfolio-description').value.trim();
        
        if (!title) {
            alert('Please enter a portfolio title');
            return;
        }

        if (this.portfolios.length >= this.maxPortfolios) {
            alert(`You can only create up to ${this.maxPortfolios} portfolios. Delete an existing portfolio to create a new one.`);
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

        const newTitle = prompt('Enter new title:', portfolio.title);
        if (newTitle && newTitle.trim()) {
            portfolio.title = newTitle.trim();
            
            const newDescription = prompt('Enter new description:', portfolio.description || '');
            portfolio.description = newDescription ? newDescription.trim() : '';
            
            portfolio.updatedAt = new Date().toISOString();
            this.saveUserPortfolios();
            this.updateUI();
        }
    }

    deletePortfolio(portfolioId) {
        const portfolio = this.portfolios.find(p => p.id === portfolioId);
        if (!portfolio) return;

        if (confirm(`Delete "${portfolio.title}" portfolio? This will permanently remove all ${portfolio.photos.length} photos.`)) {
            this.portfolios = this.portfolios.filter(p => p.id !== portfolioId);
            this.saveUserPortfolios();
            
            if (this.currentPortfolio && this.currentPortfolio.id === portfolioId) {
                this.showPortfoliosView();
            } else {
                this.updateUI();
            }
        }
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
                
                this.currentPortfolio.photos.push(photo);
                resolve();
            };
            reader.readAsDataURL(file);
        });
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
        
        if (confirm('Remove this photo from your portfolio?')) {
            this.currentPortfolio.photos.splice(index, 1);
            this.currentPortfolio.updatedAt = new Date().toISOString();
            this.saveUserPortfolios();
            this.updateUI();
        }
    }

    clearCurrentPortfolio() {
        if (!this.currentPortfolio) return;
        
        if (confirm(`Remove all photos from \"${this.currentPortfolio.title}\"? This cannot be undone.`)) {
            this.currentPortfolio.photos = [];
            this.currentPortfolio.updatedAt = new Date().toISOString();
            this.saveUserPortfolios();
            this.updateUI();
        }
    }

    editCurrentPortfolio() {
        if (!this.currentPortfolio) return;
        this.editPortfolio(this.currentPortfolio.id);
    }

    async shareCurrentPortfolio() {
        if (!this.currentPortfolio) return;
        
        try {
            if (this.currentPortfolio.photos.length === 0) {
                alert('Add some photos to your portfolio before sharing!');
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
                    alert('Portfolio link copied to clipboard!');
                }
            }
        } catch (error) {
            console.error('Error sharing portfolio:', error);
            alert('Unable to share portfolio. Please try again.');
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
}

// Make portfolio globally accessible for onclick handlers
let portfolio;

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
