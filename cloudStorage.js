// Cloud Storage Service for Vercel Blob + KV
class CloudStorageService {
    constructor() {
        this.baseUrl = window.location.origin;
    }

    // Upload image to Vercel Blob
    async uploadImage(file, userId) {
        try {
            console.log('🌐 Uploading image to cloud:', file.name);
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', userId);

            const response = await fetch('/api/upload-image', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Upload failed');
            }

            const result = await response.json();
            console.log('✅ Image uploaded successfully:', result);
            
            return {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                src: result.url,
                name: file.name,
                size: file.size,
                type: file.type,
                cloudUrl: result.url,
                uploadedAt: result.uploadedAt
            };

        } catch (error) {
            console.error('❌ Image upload failed:', error);
            throw error;
        }
    }

    // Process and upload multiple images
    async uploadImages(files, userId, onProgress = null) {
        const results = [];
        const total = files.length;

        for (let i = 0; i < files.length; i++) {
            try {
                if (onProgress) onProgress(i, total, files[i].name);
                const result = await this.uploadImage(files[i], userId);
                results.push(result);
            } catch (error) {
                console.error(`Failed to upload ${files[i].name}:`, error);
                // Continue with other files, but log the error
                results.push({
                    error: true,
                    name: files[i].name,
                    message: error.message
                });
            }
        }

        if (onProgress) onProgress(total, total, 'Complete');
        return results;
    }

    // Save portfolios to Vercel KV
    async savePortfolios(portfolios, userId) {
        try {
            console.log('🌐 Saving portfolios to cloud:', portfolios.length);
            
            const response = await fetch('/api/portfolios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    portfolios: portfolios
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Save failed');
            }

            const result = await response.json();
            console.log('✅ Portfolios saved successfully:', result);
            return result;

        } catch (error) {
            console.error('❌ Portfolio save failed:', error);
            throw error;
        }
    }

    // Load portfolios from Vercel KV
    async loadPortfolios(userId) {
        try {
            console.log('🌐 Loading portfolios from cloud for user:', userId);
            
            const response = await fetch(`/api/portfolios?userId=${encodeURIComponent(userId)}`);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Load failed');
            }

            const result = await response.json();
            console.log('✅ Portfolios loaded successfully:', result);
            return result.portfolios || [];

        } catch (error) {
            console.error('❌ Portfolio load failed:', error);
            // Return empty array on failure - don't crash the app
            return [];
        }
    }

    // Delete specific portfolio
    async deletePortfolio(portfolioId, userId) {
        try {
            console.log('🌐 Deleting portfolio from cloud:', portfolioId);
            
            const response = await fetch(`/api/portfolios?userId=${encodeURIComponent(userId)}&portfolioId=${encodeURIComponent(portfolioId)}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Delete failed');
            }

            const result = await response.json();
            console.log('✅ Portfolio deleted successfully:', result);
            return result;

        } catch (error) {
            console.error('❌ Portfolio delete failed:', error);
            throw error;
        }
    }

    // Get public portfolio for sharing
    async getPublicPortfolio(userId, portfolioId) {
        try {
            console.log('🌐 Loading public portfolio:', `${userId}/${portfolioId}`);
            
            const response = await fetch(`/api/portfolio/${encodeURIComponent(userId)}/${encodeURIComponent(portfolioId)}`);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Portfolio not found');
            }

            const result = await response.json();
            console.log('✅ Public portfolio loaded:', result);
            return result.portfolio;

        } catch (error) {
            console.error('❌ Public portfolio load failed:', error);
            throw error;
        }
    }

    // Generate public sharing URL
    getShareUrl(userId, portfolioId) {
        return `${this.baseUrl}/portfolio/${userId}/${portfolioId}`;
    }

    // Test cloud connectivity
    async testConnection() {
        try {
            const response = await fetch('/api/portfolios?userId=test');
            return response.ok;
        } catch {
            return false;
        }
    }
}

// Export as ES module and also make globally available
export default CloudStorageService;
window.CloudStorageService = CloudStorageService;