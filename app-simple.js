// Simple, working photo upload implementation
class SimplePortfolioApp {
    constructor() {
        this.portfolios = [];
        this.init();
    }
    
    init() {
        // Load existing portfolios
        this.loadPortfolios();
        
        // Setup create portfolio button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'create-portfolio-btn') {
                e.preventDefault();
                this.createPortfolio();
            }
        });
        
        // Setup file input
        document.addEventListener('change', (e) => {
            if (e.target.id === 'modal-file-input') {
                this.previewFiles(e.target.files);
            }
        });
        
        this.updateUI();
    }
    
    previewFiles(files) {
        const grid = document.getElementById('photo-preview-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        grid.style.display = files.length > 0 ? 'grid' : 'none';
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const div = document.createElement('div');
                div.className = 'photo-preview-item';
                div.innerHTML = `<img src="${e.target.result}" alt="${file.name}" style="width: 100px; height: 100px; object-fit: cover;">`;
                grid.appendChild(div);
            };
            
            reader.readAsDataURL(file);
        }
    }
    
    createPortfolio() {
        console.log('=== SIMPLE CREATE PORTFOLIO ===');
        
        const title = document.getElementById('portfolio-title').value.trim();
        const description = document.getElementById('portfolio-description').value.trim();
        const fileInput = document.getElementById('modal-file-input');
        
        if (!title) {
            alert('Please enter a portfolio title');
            return;
        }
        
        if (!fileInput.files || fileInput.files.length === 0) {
            alert('Please select at least one photo');
            return;
        }
        
        const files = fileInput.files;
        const photos = [];
        let processed = 0;
        
        console.log('Processing', files.length, 'files');
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            
            reader.onload = (e) => {
                photos.push({
                    id: Date.now() + i,
                    src: e.target.result,
                    name: file.name,
                    size: file.size,
                    type: file.type
                });
                
                processed++;
                
                if (processed === files.length) {
                    // All files processed, create portfolio
                    const portfolio = {
                        id: Date.now().toString(),
                        title: title,
                        description: description,
                        photos: photos,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    
                    console.log('Portfolio created:', portfolio);
                    console.log('Photos in portfolio:', portfolio.photos.length);
                    
                    this.portfolios.push(portfolio);
                    this.savePortfolios();
                    this.closeModal();
                    this.updateUI();
                    
                    alert(`Portfolio "${title}" created with ${photos.length} photos!`);
                }
            };
            
            reader.readAsDataURL(file);
        }
    }
    
    loadPortfolios() {
        try {
            const stored = localStorage.getItem('portfolios');
            this.portfolios = stored ? JSON.parse(stored) : [];
            console.log('Loaded portfolios:', this.portfolios.length);
        } catch (e) {
            console.error('Error loading portfolios:', e);
            this.portfolios = [];
        }
    }
    
    savePortfolios() {
        try {
            localStorage.setItem('portfolios', JSON.stringify(this.portfolios));
            console.log('Saved portfolios:', this.portfolios.length);
        } catch (e) {
            console.error('Error saving portfolios:', e);
        }
    }
    
    closeModal() {
        const modal = document.getElementById('portfolio-creation-modal');
        if (modal) {
            modal.classList.remove('active');
            
            // Reset form
            document.getElementById('portfolio-title').value = '';
            document.getElementById('portfolio-description').value = '';
            document.getElementById('modal-file-input').value = '';
            
            const grid = document.getElementById('photo-preview-grid');
            if (grid) {
                grid.innerHTML = '';
                grid.style.display = 'none';
            }
        }
    }
    
    updateUI() {
        // Update portfolio count
        const count = document.querySelector('.portfolio-meta');
        if (count) {
            const totalPhotos = this.portfolios.reduce((sum, p) => sum + p.photos.length, 0);
            count.innerHTML = `<span>${this.portfolios.length} of 10 portfolios</span><span>•</span><span>${totalPhotos} total photos</span>`;
        }
        
        // Update portfolio grid
        const grid = document.getElementById('portfolio-grid-section');
        if (grid) {
            if (this.portfolios.length === 0) {
                grid.innerHTML = '<div class="empty-state">No portfolios yet. Create your first portfolio!</div>';
            } else {
                grid.innerHTML = this.portfolios.map(p => this.renderPortfolioCard(p)).join('');
            }
        }
    }
    
    renderPortfolioCard(portfolio) {
        const coverPhoto = portfolio.photos[0];
        return `
            <div class="portfolio-card">
                <div class="portfolio-cover">
                    ${coverPhoto ? 
                        `<img src="${coverPhoto.src}" alt="${portfolio.title}" loading="lazy">` :
                        `<div class="portfolio-placeholder">📸</div>`
                    }
                </div>
                <div class="portfolio-info">
                    <h3>${portfolio.title}</h3>
                    <p>${portfolio.description || 'No description'}</p>
                    <div class="portfolio-meta">
                        <span>${portfolio.photos.length} photos</span>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.simpleApp = new SimplePortfolioApp();
});