'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Heart, Sparkles } from 'lucide-react'

export default function PhotoUpload({ photos, setPhotos, maxPhotos = 10 }) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files)
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'))
    
    // Limit to maxPhotos total
    const remainingSlots = maxPhotos - photos.length
    const filesToAdd = imageFiles.slice(0, remainingSlots)
    
    // Create preview URLs for new files
    const newPhotos = filesToAdd.map(file => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }))
    
    setPhotos(prev => [...prev, ...newPhotos])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files)
  }

  const removePhoto = (photoId) => {
    setPhotos(prev => {
      const photoToRemove = prev.find(p => p.id === photoId)
      if (photoToRemove?.url) {
        URL.revokeObjectURL(photoToRemove.url)
      }
      return prev.filter(p => p.id !== photoId)
    })
  }

  const canAddMore = photos.length < maxPhotos

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Upload Area */}
      {canAddMore && (
        <div
          className={`
            relative border-2 border-dashed p-12 text-center cursor-pointer
            transition-all duration-200 hover:border-leica-400 hover:bg-leica-50/30
            ${isDragOver 
              ? 'border-leica-400 bg-leica-50 shadow-sm' 
              : 'border-leica-300 bg-white'
            }
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          <div className="flex flex-col items-center space-y-4">
            <div className={`
              p-6 transition-all duration-200
              ${isDragOver 
                ? 'bg-leica-800 text-white' 
                : 'bg-leica-100 text-leica-600'
              }
            `}>
              <Upload size={40} />
            </div>
            
            <div>
              <h3 className="text-xl font-light text-leica-900 mb-3 tracking-tight">
                Upload Images
              </h3>
              <p className="text-leica-600 mb-4 font-light">
                Select up to 10 exceptional photographs for your professional portfolio.
              </p>
              <p className="text-sm text-leica-500 font-medium">
                {photos.length}/{maxPhotos} images selected
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Photo Preview Grid */}
      {photos.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-light text-leica-900 tracking-tight">
              Selected Images ({photos.length}/{maxPhotos})
            </h3>
            {!canAddMore && (
              <span className="text-sm text-leica-700 bg-leica-100 px-4 py-2 border border-leica-200 font-medium tracking-wide">
                PORTFOLIO COMPLETE
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative group aspect-square bg-leica-50 border border-leica-200 overflow-hidden hover-lift shadow-sm hover:shadow-md"
              >
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                
                {/* Remove button */}
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-3 right-3 p-2 bg-leica-800 hover:bg-leica-900 text-white 
                           opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                  title="Remove image"
                >
                  <X size={16} />
                </button>
                
                {/* Photo info overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-leica-900/80 
                              p-3 opacity-0 group-hover:opacity-100 transition-all">
                  <p className="text-white text-xs truncate font-medium tracking-wide" title={photo.name}>
                    {photo.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && (
        <div className="text-center py-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
            <Heart size={28} className="text-purple-500" />
          </div>
          <h3 className="text-lg font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            🌟 Ready to share your story?
          </h3>
          <p className="text-gray-600 text-sm">
            Upload your first photo and let the community see your world! ✨
          </p>
        </div>
      )}
    </div>
  )
}
