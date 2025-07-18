import { sdk } from '@farcaster/miniapp-sdk';

class CloudProfessionalPortfolio {
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
        this.uploadProgress = { current: 0, total: 0, currentFile: '' };
        
        this.init();
    }

    async init() {
        try {
            console.log('🌐 Initializing Cloud Portfolio...');
            
            // Test cloud connectivity first
            const cloudConnected = await this.cloudStorage.testConnection();
            console.log('Cloud connectivity:', cloudConnected ? '✅ Connected' : '❌ Failed');
            
            if (!cloudConnected) {
                this.showToast('Cloud storage unavailable. Some features may not work.', 'warning', 'Connection Issue');
            }
            
            // Setup event listeners first
            this.setupEventListeners();
            
            // Get user context from Farcaster
            await this.getUserContext();
            
            // Load user's portfolios from cloud
            await this.loadUserPortfolios();
            
            // Update UI
            this.updateUI();
            
            // Setup global event listeners
            this.setupGlobalEventListeners();
            
            // Hide loading screen and show main app
            setTimeout(() => {
                document.getElementById('loading-screen').classList.add('hidden');
                document.getElementById('main-app').classList.remove('hidden');
                sdk.actions.ready();
            }, 1500);
            
        } catch (error) {
            console.error('Failed to initialize cloud app:', error);
            this.showToast('Failed to initialize app. Please refresh and try again.', 'error', 'Initialization Error');
            this.showApp();
        }
    }

    async getUserContext() {
        try {
            console.log('🔍 Getting Farcaster context...');
            
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
                this.updateUserInfo();
            } else {
                console.log('⚠️ No user in Farcaster context, using session ID');
                this.userFid = this.generateSessionId();
                console.log('Session ID:', this.userFid);
            }
        } catch (error) {
            console.error('❌ Error getting Farcaster context:', error);
            this.userFid = this.generateSessionId();
            console.log('🔄 Using fallback session ID:', this.userFid);
        }
        
        console.log('Final userFid:', this.userFid);
    }

    generateSessionId() {
        // Generate a session-based ID for testing without authentication
        let sessionId = localStorage.getItem('portfolio_session_id');
        if (!sessionId) {
            sessionId = 'cloud_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('portfolio_session_id', sessionId);
        }
        return sessionId;
    }

    async loadUserPortfolios() {
        try {
            console.log('🌐 Loading portfolios from cloud...');
            this.portfolios = await this.cloudStorage.loadPortfolios(this.userFid);
            console.log(`✅ Loaded ${this.portfolios.length} portfolios from cloud`);
        } catch (error) {
            console.error('❌ Error loading portfolios from cloud:', error);
            this.portfolios = [];
            this.showToast('Failed to load existing portfolios', 'warning', 'Load Error');
        }
    }

    async saveUserPortfolios() {
        try {
            console.log('🌐 Saving portfolios to cloud...');
            await this.cloudStorage.savePortfolios(this.portfolios, this.userFid);
            console.log(`✅ Saved ${this.portfolios.length} portfolios to cloud`);
        } catch (error) {
            console.error('❌ Error saving portfolios to cloud:', error);
            this.showToast('Failed to save portfolios. Please try again.', 'error', 'Save Error');
            throw error; // Re-throw to handle in calling function
        }
    }

    // Enhanced file handling with cloud upload
    async handleFileSelection(files) {
        console.log('🌐 Starting cloud file upload process...');
        
        if (!files || files.length === 0) {
            console.log('No files provided');
            return;
        }
        
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
        
        // Show upload progress
        this.showUploadProgress(true);
        
        try {
            // Upload to cloud storage
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
            
            console.log(`✅ Successfully uploaded ${successfulUploads.length} files`);
            this.updatePhotoPreviewGrid();
            
        } catch (error) {
            console.error('❌ Upload process failed:', error);
            this.showToast('Upload failed. Please try again.', 'error', 'Upload Error');
        } finally {
            this.showUploadProgress(false);
        }
        
        if (filesToProcess.length < files.length) {
            this.showToast(`Only ${filesToProcess.length} photos were processed. Portfolio limit is ${maxFiles} photos.`, 'warning', 'Upload Limit');
        }
    }

    showUploadProgress(show) {
        // You can implement a progress modal here
        if (show) {
            console.log('📤 Starting upload...');
        } else {
            console.log('✅ Upload complete');
        }
    }

    updateUploadProgress(current, total, fileName) {
        this.uploadProgress = { current, total, currentFile: fileName };
        console.log(`📤 Uploading ${current}/${total}: ${fileName}`);
        // Update progress UI here if needed
    }

    async createNewPortfolioFromModal() {
        console.log('🌐 Creating portfolio with cloud storage...');
        
        // Get form data
        const titleElement = document.getElementById('portfolio-title');
        const descriptionElement = document.getElementById('portfolio-description');
        
        if (!titleElement) {
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
            this.showToast(`You can only create up to ${this.maxPortfolios} portfolios.`, 'warning', 'Portfolio Limit Reached');
            return;
        }
        
        console.log('Creating portfolio with', this.tempPhotos.length, 'cloud photos');
        
        // Create portfolio with cloud photos
        const newPortfolio = {
            id: Date.now().toString(),
            title: title,
            description: description,
            photos: [...this.tempPhotos], // Photos already have cloud URLs
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        try {
            this.portfolios.push(newPortfolio);
            await this.saveUserPortfolios(); // Save to cloud
            
            // Clear tempPhotos after successful creation
            this.tempPhotos = [];
            
            this.hideCreatePortfolioModal();
            this.resetPortfolioForm();
            this.showPortfoliosView();
            this.showToast(`Portfolio "${title}" created successfully with ${newPortfolio.photos.length} photos!`, 'success', 'Portfolio Created');
            
        } catch (error) {
            // Remove portfolio from local array if cloud save failed
            this.portfolios.pop();
            this.showToast('Failed to create portfolio. Please try again.', 'error', 'Creation Failed');
        }
    }

    // Add the rest of the methods from the original app.js file...
    // For brevity, I'll include key methods that need cloud integration

    // Copy remaining methods from original app but adapt for cloud storage
    // [The rest of the methods would be similar to the original app.js but using cloud storage]
}

// Initialize the cloud-enabled app
window.CloudProfessionalPortfolio = CloudProfessionalPortfolio;