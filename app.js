import { sdk } from '@farcaster/miniapp-sdk';

class FrameTheGallery {
    constructor() {
        this.portfolios = []; // Array of portfolio objects
        this.currentPortfolio = null;
        this.currentUser = null;
        this.isAuthenticated = false;
        this.currentView = 'grid';
        this.currentSort = 'newest';
        this.maxPhotosPerPortfolio = 10;
        
        this.init();
    }

    async init() {
        try {
            // Initialize the app
            await this.setupEventListeners();
            await this.loadSamplePortfolios();
            await this.checkAuthentication();
            
            // Hide loading screen and show main app
            setTimeout(() => {
                document.getElementById('loading-screen').classList.add('hidden');
                document.getElementById('main-app').classList.remove('hidden');
                
                // Call Farcaster SDK ready() to hide splash screen
                sdk.actions.ready();
            }, 2000);
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            // Still show the app even if there are errors
            document.getElementById('loading-screen').classList.add('hidden');
            document.getElementById('main-app').classList.remove('hidden');
            sdk.actions.ready();
        }
    }

    async checkAuthentication() {
        try {
            // Try to get user context from Farcaster
            const context = await sdk.context;
            if (context && context.user) {
                this.currentUser = context.user;
                this.isAuthenticated = true;
                this.updateAuthUI();
            }
        } catch (error) {
            console.log('User not authenticated yet');
        }
    }

    async authenticate() {
        try {
            // Use Farcaster Quick Auth for seamless authentication
            const result = await sdk.actions.signIn();
            if (result && result.user) {
                this.currentUser = result.user;
                this.isAuthenticated = true;
                this.updateAuthUI();
                this.showNotification('Successfully connected to Farcaster!', 'success');
            }
        } catch (error) {
            console.error('Authentication failed:', error);
            this.showNotification('Failed to connect to Farcaster', 'error');
        }
    }

    updateAuthUI() {
        const authButton = document.getElementById('auth-button');
        const userProfile = document.getElementById('user-profile');
        
        if (this.isAuthenticated && this.currentUser) {
            authButton.classList.add('hidden');
            userProfile.classList.remove('hidden');
            
            const userAvatar = document.getElementById('user-avatar');
            const userName = document.getElementById('user-name');
            
            userAvatar.src = this.currentUser.pfpUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%23667eea"/><text x="50" y="60" text-anchor="middle" fill="white" font-size="40">👤</text></svg>';
            userName.textContent = this.currentUser.displayName || this.currentUser.username || 'Farcaster User';
        } else {
            authButton.classList.remove('hidden');
            userProfile.classList.add('hidden');
        }
    }

    setupEventListeners() {
        // Authentication
        document.getElementById('auth-button').addEventListener('click', () => {
            this.authenticate();
        });

        // Portfolio creation
        document.getElementById('create-portfolio-btn').addEventListener('click', () => {
            this.openPortfolioCreationModal();
        });

        // Back to portfolios
        document.getElementById('back-to-portfolios').addEventListener('click', () => {
            this.showPortfolioGrid();
        });

        // Empty state create button
        document.querySelector('.empty-create-btn').addEventListener('click', () => {
            this.openPortfolioCreationModal();
        });

        // Sort and view controls
        document.getElementById('sort-select').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            if (this.currentPortfolio) {
                this.renderPortfolioPhotos();
            } else {
                this.renderPortfolios();
            }
        });

        document.getElementById('grid-view').addEventListener('click', () => {
            this.setView('grid');
        });

        document.getElementById('list-view').addEventListener('click', () => {
            this.setView('list');
        });

        // Portfolio creation modal
        this.setupPortfolioCreationModal();

        // Photo modal controls
        document.getElementById('photo-modal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop') || e.target.classList.contains('modal-close')) {
                this.closeModal();
            }
        });

        document.getElementById('share-btn').addEventListener('click', () => {
            this.shareCurrentPhoto();
        });

        document.getElementById('download-btn').addEventListener('click', () => {
            this.downloadCurrentPhoto();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closePortfolioCreationModal();
            }
        });
    }

    async loadSamplePortfolios() {
        // Create sample portfolios for demonstration
        const samplePortfolios = [
            {
                id: 'portfolio-1',
                title: 'Nature Adventures',
                description: 'A collection of breathtaking landscapes and outdoor moments',
                coverPhoto: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
                author: 'Nature Lover',
                date: new Date('2024-01-15'),
                photos: [
                    {
                        id: '1',
                        title: 'Sunset Over Mountains',
                        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
                        date: new Date('2024-01-15')
                    },
                    {
                        id: '2',
                        title: 'Forest Path',
                        url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
                        date: new Date('2024-01-14')
                    },
                    {
                        id: '3',
                        title: 'Mountain Lake',
                        url: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=400&h=300&fit=crop',
                        date: new Date('2024-01-13')
                    },
                    {
                        id: '4',
                        title: 'Desert Landscape',
                        url: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop',
                        date: new Date('2024-01-12')
                    }
                ]
            },
            {
                id: 'portfolio-2',
                title: 'Urban Exploration',
                description: 'City life captured through my lens',
                coverPhoto: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&h=300&fit=crop',
                author: 'Urban Explorer',
                date: new Date('2024-01-10'),
                photos: [
                    {
                        id: '5',
                        title: 'City Skyline at Night',
                        url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&h=300&fit=crop',
                        date: new Date('2024-01-10')
                    },
                    {
                        id: '6',
                        title: 'Street Architecture',
                        url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
                        date: new Date('2024-01-09')
                    },
                    {
                        id: '7',
                        title: 'Urban Reflections',
                        url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=400&h=300&fit=crop',
                        date: new Date('2024-01-08')
                    }
                ]
            },
            {
                id: 'portfolio-3',
                title: 'Ocean Serenity',
                description: 'Peaceful moments by the sea',
                coverPhoto: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop',
                author: 'Beach Walker',
                date: new Date('2024-01-05'),
                photos: [
                    {
                        id: '8',
                        title: 'Ocean Waves',
                        url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop',
                        date: new Date('2024-01-05')
                    },
                    {
                        id: '9',
                        title: 'Sunset Beach',
                        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
                        date: new Date('2024-01-04')
                    }
                ]
            }
        ];

        this.portfolios = samplePortfolios;
        this.renderPortfolios();
    }

    handleFileUpload(files) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const newPhoto = {
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        title: file.name.replace(/\.[^/.]+$/, ""),
                        url: e.target.result,
                        date: new Date(),
                        author: this.currentUser?.displayName || this.currentUser?.username || 'You',
                        isUserUploaded: true
                    };
                    
                    this.photos.unshift(newPhoto);
                    this.renderPhotos();
                    this.showNotification(`Photo "${newPhoto.title}" uploaded successfully!`, 'success');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    setView(view) {
        this.currentView = view;
        
        // Update button states
        document.getElementById('grid-view').classList.toggle('active', view === 'grid');
        document.getElementById('list-view').classList.toggle('active', view === 'list');
        
        // Update grid class
        const photoGrid = document.getElementById('photo-grid');
        photoGrid.classList.toggle('list-view', view === 'list');
    }

    renderPhotos() {
        const photoGrid = document.getElementById('photo-grid');
        const emptyState = document.getElementById('empty-state');
        
        if (this.photos.length === 0) {
            photoGrid.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }
        
        emptyState.classList.add('hidden');
        
        // Sort photos
        const sortedPhotos = [...this.photos].sort((a, b) => {
            switch (this.currentSort) {
                case 'newest':
                    return new Date(b.date) - new Date(a.date);
                case 'oldest':
                    return new Date(a.date) - new Date(b.date);
                case 'name':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });
        
        photoGrid.innerHTML = sortedPhotos.map(photo => `
            <div class="photo-card" data-photo-id="${photo.id}">
                <img src="${photo.url}" alt="${photo.title}" class="photo-image" loading="lazy">
                <div class="photo-info">
                    <h3 class="photo-title">${photo.title}</h3>
                    <p class="photo-date">${this.formatDate(photo.date)} • by ${photo.author}</p>
                </div>
            </div>
        `).join('');
        
        // Add click listeners to photo cards
        photoGrid.querySelectorAll('.photo-card').forEach(card => {
            card.addEventListener('click', () => {
                const photoId = card.dataset.photoId;
                this.openModal(photoId);
            });
        });
    }

    openModal(photoId) {
        const photo = this.photos.find(p => p.id === photoId);
        if (!photo) return;
        
        const modal = document.getElementById('photo-modal');
        const modalImage = document.getElementById('modal-image');
        const modalTitle = document.getElementById('modal-title');
        const modalDate = document.getElementById('modal-date');
        
        modalImage.src = photo.url;
        modalImage.alt = photo.title;
        modalTitle.textContent = photo.title;
        modalDate.textContent = `${this.formatDate(photo.date)} • by ${photo.author}`;
        
        modal.classList.remove('hidden');
        modal.dataset.currentPhotoId = photoId;
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('photo-modal');
        modal.classList.add('hidden');
        delete modal.dataset.currentPhotoId;
        
        // Restore body scroll
        document.body.style.overflow = '';
    }

    async shareCurrentPhoto() {
        const modal = document.getElementById('photo-modal');
        const photoId = modal.dataset.currentPhotoId;
        const photo = this.photos.find(p => p.id === photoId);
        
        if (!photo) return;
        
        try {
            // Use Farcaster SDK to compose a cast with the photo
            await sdk.actions.composeCast({
                text: `Check out this amazing photo: "${photo.title}" 🖼️\n\nShared via FrameTheGallery`,
                embeds: [photo.url]
            });
            
            this.showNotification('Photo shared to Farcaster!', 'success');
        } catch (error) {
            console.error('Failed to share photo:', error);
            
            // Fallback to Web Share API
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: `FrameTheGallery - ${photo.title}`,
                        text: `Check out this amazing photo: "${photo.title}"`,
                        url: window.location.href
                    });
                } catch (shareError) {
                    console.error('Web share failed:', shareError);
                    this.copyToClipboard(window.location.href);
                }
            } else {
                this.copyToClipboard(window.location.href);
            }
        }
    }

    downloadCurrentPhoto() {
        const modal = document.getElementById('photo-modal');
        const photoId = modal.dataset.currentPhotoId;
        const photo = this.photos.find(p => p.id === photoId);
        
        if (!photo) return;
        
        const link = document.createElement('a');
        link.href = photo.url;
        link.download = `${photo.title}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('Photo download started!', 'success');
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Link copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy link', 'error');
        });
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '1001',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });
        
        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.background = '#10b981';
                break;
            case 'error':
                notification.style.background = '#ef4444';
                break;
            default:
                notification.style.background = '#667eea';
        }
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Portfolio-specific methods
    renderPortfolios() {
        const portfolioGrid = document.getElementById('portfolio-grid');
        const emptyState = document.getElementById('empty-state');
        
        if (this.portfolios.length === 0) {
            portfolioGrid.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }
        
        emptyState.classList.add('hidden');
        
        // Sort portfolios
        const sortedPortfolios = [...this.portfolios].sort((a, b) => {
            switch (this.currentSort) {
                case 'oldest':
                    return new Date(a.date) - new Date(b.date);
                case 'name':
                    return a.title.localeCompare(b.title);
                case 'newest':
                default:
                    return new Date(b.date) - new Date(a.date);
            }
        });
        
        portfolioGrid.innerHTML = sortedPortfolios.map(portfolio => `
            <div class="portfolio-card" data-portfolio-id="${portfolio.id}">
                <img src="${portfolio.coverPhoto}" alt="${portfolio.title}" class="portfolio-cover" loading="lazy">
                <div class="portfolio-badge">${portfolio.photos.length} photos</div>
                <div class="portfolio-info">
                    <h3 class="portfolio-title">${portfolio.title}</h3>
                    <p class="portfolio-description">${portfolio.description}</p>
                    <div class="portfolio-meta">
                        <span class="portfolio-author">${portfolio.author}</span>
                        <span>${this.formatDate(portfolio.date)}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add click listeners to portfolio cards
        portfolioGrid.querySelectorAll('.portfolio-card').forEach(card => {
            card.addEventListener('click', () => {
                const portfolioId = card.dataset.portfolioId;
                this.openPortfolio(portfolioId);
            });
        });
    }

    openPortfolio(portfolioId) {
        const portfolio = this.portfolios.find(p => p.id === portfolioId);
        if (!portfolio) return;
        
        this.currentPortfolio = portfolio;
        
        // Hide portfolio grid, show portfolio detail
        document.getElementById('portfolio-grid').classList.add('hidden');
        document.getElementById('portfolio-detail').classList.remove('hidden');
        
        // Show back button
        document.getElementById('back-to-portfolios').classList.remove('hidden');
        document.getElementById('create-portfolio-btn').classList.add('hidden');
        
        // Update portfolio header
        document.getElementById('portfolio-detail-title').textContent = portfolio.title;
        document.getElementById('portfolio-detail-description').textContent = portfolio.description;
        document.getElementById('portfolio-detail-author').textContent = `👤 ${portfolio.author}`;
        document.getElementById('portfolio-detail-date').textContent = `📅 ${this.formatDate(portfolio.date)}`;
        document.getElementById('portfolio-photo-count').textContent = `📸 ${portfolio.photos.length} photos`;
        
        this.renderPortfolioPhotos();
    }

    showPortfolioGrid() {
        this.currentPortfolio = null;
        
        // Show portfolio grid, hide portfolio detail
        document.getElementById('portfolio-grid').classList.remove('hidden');
        document.getElementById('portfolio-detail').classList.add('hidden');
        
        // Hide back button
        document.getElementById('back-to-portfolios').classList.add('hidden');
        document.getElementById('create-portfolio-btn').classList.remove('hidden');
        
        this.renderPortfolios();
    }

    renderPortfolioPhotos() {
        if (!this.currentPortfolio) return;
        
        const photoGrid = document.getElementById('portfolio-photos');
        const photos = this.currentPortfolio.photos;
        
        // Sort photos
        const sortedPhotos = [...photos].sort((a, b) => {
            switch (this.currentSort) {
                case 'oldest':
                    return new Date(a.date) - new Date(b.date);
                case 'name':
                    return a.title.localeCompare(b.title);
                case 'newest':
                default:
                    return new Date(b.date) - new Date(a.date);
            }
        });
        
        photoGrid.innerHTML = sortedPhotos.map(photo => `
            <div class="photo-card" data-photo-id="${photo.id}">
                <img src="${photo.url}" alt="${photo.title}" class="photo-image" loading="lazy">
                <div class="photo-info">
                    <h3 class="photo-title">${photo.title}</h3>
                    <p class="photo-date">${this.formatDate(photo.date)}</p>
                </div>
            </div>
        `).join('');
        
        // Update grid class for view mode
        photoGrid.classList.toggle('list-view', this.currentView === 'list');
        
        // Add click listeners to photo cards
        photoGrid.querySelectorAll('.photo-card').forEach(card => {
            card.addEventListener('click', () => {
                const photoId = card.dataset.photoId;
                this.openPhotoModal(photoId);
            });
        });
    }

    openPhotoModal(photoId) {
        if (!this.currentPortfolio) return;
        
        const photo = this.currentPortfolio.photos.find(p => p.id === photoId);
        if (!photo) return;
        
        const modal = document.getElementById('photo-modal');
        const modalImage = document.getElementById('modal-image');
        const modalTitle = document.getElementById('modal-title');
        const modalDate = document.getElementById('modal-date');
        
        modalImage.src = photo.url;
        modalImage.alt = photo.title;
        modalTitle.textContent = photo.title;
        modalDate.textContent = `${this.formatDate(photo.date)} • ${this.currentPortfolio.title}`;
        
        modal.classList.remove('hidden');
        modal.dataset.currentPhotoId = photoId;
        modal.dataset.currentPortfolioId = this.currentPortfolio.id;
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    openPortfolioCreationModal() {
        const modal = document.getElementById('portfolio-creation-modal');
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Reset form
        document.getElementById('portfolio-form').reset();
        document.getElementById('photo-preview-grid').classList.add('hidden');
        document.getElementById('photo-preview-grid').innerHTML = '';
        this.selectedFiles = [];
    }

    closePortfolioCreationModal() {
        const modal = document.getElementById('portfolio-creation-modal');
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    setupPortfolioCreationModal() {
        const modal = document.getElementById('portfolio-creation-modal');
        const form = document.getElementById('portfolio-form');
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('portfolio-file-input');
        const previewGrid = document.getElementById('photo-preview-grid');
        
        this.selectedFiles = [];
        
        // Modal close handlers
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop') || e.target.classList.contains('modal-close')) {
                this.closePortfolioCreationModal();
            }
        });
        
        document.getElementById('cancel-portfolio').addEventListener('click', () => {
            this.closePortfolioCreationModal();
        });
        
        // Upload area handlers
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
        
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
            this.handlePortfolioFiles(e.dataTransfer.files);
        });
        
        fileInput.addEventListener('change', (e) => {
            this.handlePortfolioFiles(e.target.files);
        });
        
        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createPortfolio();
        });
    }

    handlePortfolioFiles(files) {
        const remainingSlots = this.maxPhotosPerPortfolio - this.selectedFiles.length;
        const filesToProcess = Array.from(files).slice(0, remainingSlots);
        
        if (files.length > remainingSlots) {
            this.showNotification(`Only ${remainingSlots} more photos can be added (max ${this.maxPhotosPerPortfolio} per portfolio)`, 'error');
        }
        
        filesToProcess.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const fileData = {
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        file: file,
                        title: file.name.replace(/\.[^/.]+$/, ""),
                        url: e.target.result,
                        date: new Date()
                    };
                    
                    this.selectedFiles.push(fileData);
                    this.updatePhotoPreview();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    updatePhotoPreview() {
        const previewGrid = document.getElementById('photo-preview-grid');
        
        if (this.selectedFiles.length === 0) {
            previewGrid.classList.add('hidden');
            return;
        }
        
        previewGrid.classList.remove('hidden');
        previewGrid.innerHTML = this.selectedFiles.map((file, index) => `
            <div class="photo-preview">
                <img src="${file.url}" alt="${file.title}">
                <button type="button" class="photo-preview-remove" data-index="${index}">&times;</button>
            </div>
        `).join('');
        
        // Add remove handlers
        previewGrid.querySelectorAll('.photo-preview-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                this.selectedFiles.splice(index, 1);
                this.updatePhotoPreview();
            });
        });
    }

    createPortfolio() {
        const title = document.getElementById('portfolio-title').value.trim();
        const description = document.getElementById('portfolio-description').value.trim();
        
        if (!title) {
            this.showNotification('Please enter a portfolio title', 'error');
            return;
        }
        
        if (this.selectedFiles.length === 0) {
            this.showNotification('Please add at least one photo', 'error');
            return;
        }
        
        const newPortfolio = {
            id: 'portfolio-' + Date.now(),
            title: title,
            description: description || 'A beautiful photo collection',
            coverPhoto: this.selectedFiles[0].url,
            author: this.currentUser?.displayName || this.currentUser?.username || 'You',
            date: new Date(),
            photos: this.selectedFiles.map(file => ({
                id: file.id,
                title: file.title,
                url: file.url,
                date: file.date
            }))
        };
        
        this.portfolios.unshift(newPortfolio);
        this.renderPortfolios();
        this.closePortfolioCreationModal();
        
        this.showNotification(`Portfolio "${title}" created successfully with ${this.selectedFiles.length} photos!`, 'success');
    }

    async shareCurrentPhoto() {
        const modal = document.getElementById('photo-modal');
        const photoId = modal.dataset.currentPhotoId;
        const portfolioId = modal.dataset.currentPortfolioId;
        
        const portfolio = this.portfolios.find(p => p.id === portfolioId);
        const photo = portfolio?.photos.find(p => p.id === photoId);
        
        if (!photo || !portfolio) return;
        
        try {
            // Use Farcaster SDK to compose a cast with the photo
            await sdk.actions.composeCast({
                text: `Check out this photo from my "${portfolio.title}" portfolio: "${photo.title}" 🖼️\n\nShared via FrameTheGallery`,
                embeds: [photo.url]
            });
            
            this.showNotification('Photo shared to Farcaster!', 'success');
        } catch (error) {
            console.error('Failed to share photo:', error);
            
            // Fallback to Web Share API
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: `FrameTheGallery - ${photo.title}`,
                        text: `Check out this photo from "${portfolio.title}": "${photo.title}"`,
                        url: window.location.href
                    });
                } catch (shareError) {
                    console.error('Web share failed:', shareError);
                    this.copyToClipboard(window.location.href);
                }
            } else {
                this.copyToClipboard(window.location.href);
            }
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FrameTheGallery();
});

// Handle Farcaster context changes
if (typeof sdk !== 'undefined') {
    sdk.on('contextChanged', (context) => {
        console.log('Farcaster context changed:', context);
        // Handle context changes if needed
    });
}
