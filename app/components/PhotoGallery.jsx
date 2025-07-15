'use client'

import { useState } from 'react'
import { X, Download, Share2, Eye, Heart, Sparkles } from 'lucide-react'

export default function PhotoGallery({ photos }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const openLightbox = (photo) => {
    setSelectedPhoto(photo)
    setIsLightboxOpen(true)
  }

  const closeLightbox = () => {
    setIsLightboxOpen(false)
    setSelectedPhoto(null)
  }

  const navigatePhoto = (direction) => {
    if (!selectedPhoto) return
    
    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id)
    let newIndex
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % photos.length
    } else {
      newIndex = currentIndex === 0 ? photos.length - 1 : currentIndex - 1
    }
    
    setSelectedPhoto(photos[newIndex])
  }

  const downloadPhoto = (photo) => {
    const link = document.createElement('a')
    link.href = photo.url
    link.download = photo.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const sharePhoto = async (photo) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this photo',
          text: `Photo: ${photo.name}`,
          url: photo.url
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(photo.url)
      alert('Image link copied to clipboard')
    }
  }

  if (photos.length === 0) {
    return null
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-light text-leica-900 mb-3 tracking-tight">
            Portfolio Gallery
          </h2>
          <p className="text-leica-600 font-light">
            Click any image to view in detail
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="group relative aspect-square bg-leica-50 border border-leica-200 overflow-hidden 
                       cursor-pointer hover-lift shadow-sm hover:shadow-md transition-all duration-200"
              onClick={() => openLightbox(photo)}
            >
              <img
                src={photo.url}
                alt={photo.name}
                className="w-full h-full object-cover transition-transform duration-200 
                         group-hover:scale-105"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 
                            transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-all 
                              duration-200 transform scale-90 group-hover:scale-100">
                  <div className="p-4 bg-white shadow-sm">
                    <Eye size={24} className="text-leica-700" />
                  </div>
                </div>
              </div>

              {/* Photo number */}
              <div className="absolute top-3 left-3 bg-leica-800/90 text-white text-xs 
                            px-3 py-1 font-medium tracking-wide">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 p-3 bg-leica-800/80 hover:bg-leica-800 
                       text-white transition-all shadow-sm"
            >
              <X size={20} />
            </button>

            {/* Navigation buttons */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => navigatePhoto('prev')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 
                           bg-leica-800/80 hover:bg-leica-800 text-white 
                           transition-all shadow-sm"
                >
                  ←
                </button>
                <button
                  onClick={() => navigatePhoto('next')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 
                           bg-leica-800/80 hover:bg-leica-800 text-white 
                           transition-all shadow-sm"
                >
                  →
                </button>
              </>
            )}

            {/* Image */}
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.name}
              className="max-w-full max-h-full object-contain rounded-lg"
            />

            {/* Photo info and actions */}
            <div className="absolute bottom-4 left-4 right-4 bg-leica-900/90 
                          p-4 text-white border border-leica-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium truncate tracking-wide" title={selectedPhoto.name}>
                    {selectedPhoto.name}
                  </h3>
                  <p className="text-sm text-leica-300 font-light">
                    {photos.findIndex(p => p.id === selectedPhoto.id) + 1} of {photos.length}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => downloadPhoto(selectedPhoto)}
                    className="p-2 hover:bg-leica-700 transition-all"
                    title="Download image"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => sharePhoto(selectedPhoto)}
                    className="p-2 hover:bg-leica-700 transition-all"
                    title="Share image"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
