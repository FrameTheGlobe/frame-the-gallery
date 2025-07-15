'use client'

import { useState, useEffect } from 'react'
import { Camera, Palette, Share2, Trash2, Sparkles, Heart, RotateCcw } from 'lucide-react'
import PhotoUpload from './components/PhotoUpload'
import PhotoGallery from './components/PhotoGallery'
import Logo from './components/Logo'

export default function Home() {
  const [photos, setPhotos] = useState([])
  const [activeTab, setActiveTab] = useState('upload')

  // Load photos from localStorage on component mount
  useEffect(() => {
    const savedPhotos = localStorage.getItem('portfolio-photos')
    if (savedPhotos) {
      try {
        const parsedPhotos = JSON.parse(savedPhotos)
        setPhotos(parsedPhotos)
      } catch (error) {
        console.error('Error loading saved photos:', error)
      }
    }
  }, [])

  // Save photos to localStorage whenever photos change
  useEffect(() => {
    if (photos.length > 0) {
      localStorage.setItem('portfolio-photos', JSON.stringify(photos))
    }
  }, [photos])

  const clearAllPhotos = () => {
    if (window.confirm('Start fresh with a new collection? Your current photos will be cleared.')) {
      // Revoke all object URLs to prevent memory leaks
      photos.forEach(photo => {
        if (photo.url) {
          URL.revokeObjectURL(photo.url)
        }
      })
      setPhotos([])
      localStorage.removeItem('portfolio-photos')
    }
  }

  const sharePortfolio = async () => {
    const portfolioUrl = window.location.href
    
    if (navigator.share) {
      navigator.share({
        title: 'FrameTheGallery - My Visual Story',
        text: 'Check out my photo gallery on FrameTheGallery! 🖼️✨',
        url: window.location.href
      })
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('📋 Gallery link copied! Share your visual story! ✨')
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-leica-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Logo size={36} />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b border-leica-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-light text-leica-900 mb-6 tracking-tight">
              Professional Gallery
            </h1>
            <p className="text-xl text-leica-600 mb-8 max-w-3xl mx-auto font-light leading-relaxed">
              Curate and showcase your finest work with precision. 
              A sophisticated platform designed for the discerning photographer.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="bg-leica-50/50 border-b border-leica-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-6">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center space-x-3 px-6 py-3 font-medium transition-all ${
                activeTab === 'upload'
                  ? 'bg-leica-800 text-white border-b-2 border-accent-500'
                  : 'text-leica-600 hover:text-leica-800 hover:bg-leica-100/50'
              }`}
            >
              <Camera size={18} />
              <span className="tracking-wide">UPLOAD</span>
            </button>
            
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center space-x-3 px-6 py-3 font-medium transition-all ${
                activeTab === 'gallery'
                  ? 'bg-leica-800 text-white border-b-2 border-accent-500'
                  : 'text-leica-600 hover:text-leica-800 hover:bg-leica-100/50'
              }`}
            >
              <Palette size={18} />
              <span className="tracking-wide">GALLERY ({photos.length})</span>
            </button>
            
            {photos.length > 0 && (
              <div className="ml-auto flex items-center space-x-3">
                <button
                  onClick={sharePortfolio}
                  className="flex items-center space-x-2 px-4 py-2 bg-accent-500 text-white hover:bg-accent-600 transition-all"
                >
                  <Share2 size={16} />
                  <span className="text-sm font-medium tracking-wide">SHARE</span>
                </button>
                
                <button
                  onClick={clearAllPhotos}
                  className="flex items-center space-x-2 px-4 py-2 bg-leica-200 text-leica-700 hover:bg-leica-300 transition-all"
                >
                  <RotateCcw size={16} />
                  <span className="text-sm font-medium tracking-wide">RESET</span>
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'upload' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-light text-leica-900 mb-4 tracking-tight">
                Curate Your Collection
              </h2>
              <p className="text-leica-600 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                Select up to 10 exceptional photographs to showcase in your professional portfolio.
              </p>
            </div>
            
            <PhotoUpload 
              photos={photos} 
              setPhotos={setPhotos} 
              maxPhotos={10} 
            />
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="space-y-8">
            {photos.length > 0 ? (
              <PhotoGallery photos={photos} />
            ) : (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-leica-100 border border-leica-200 flex items-center justify-center mb-6">
                  <Camera size={32} className="text-leica-500" />
                </div>
                <h3 className="text-2xl font-light text-leica-900 mb-3 tracking-tight">
                  Portfolio Empty
                </h3>
                <p className="text-leica-600 mb-8 text-lg font-light max-w-md mx-auto">
                  Begin curating your professional collection
                </p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-8 py-3 bg-leica-800 text-white hover:bg-leica-900 transition-all font-medium tracking-wide"
                >
                  START CURATING
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-leica-900 border-t border-leica-800 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-leica-300 mb-2 font-medium tracking-wide">
              FRAMETHEGALLERY PROFESSIONAL
            </p>
            <p className="text-xs text-leica-500 tracking-wider">
              PRECISION • ELEGANCE • CRAFT
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
