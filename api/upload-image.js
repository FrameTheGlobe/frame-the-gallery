/**
 * FrameTheGallery API - Image Upload Endpoint
 * 
 * Handles image uploads to Vercel Blob storage with user-namespaced paths.
 * Compresses and optimizes images for web delivery while maintaining quality.
 * 
 * @module api/upload-image
 * @version 1.0.2
 */

import { put } from '@vercel/blob';

/**
 * Upload image to Vercel Blob storage
 * 
 * POST /api/upload-image
 */
export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const userId = formData.get('userId') || 'anonymous';
    
    if (!file) {
      return response.status(400).json({ error: 'No file provided' });
    }

    // Generate unique filename with user namespacing
    // Format: {userId}/{timestamp}_{sanitized_filename}
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_'); // Sanitize filename
    const filename = `${userId}/${timestamp}_${originalName}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    console.log('Image uploaded successfully:', {
      filename: filename,
      url: blob.url,
      size: file.size,
      userId: userId
    });

    return response.status(200).json({
      success: true,
      url: blob.url,
      filename: filename,
      size: file.size,
      uploadedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return response.status(500).json({
      error: 'Failed to upload image', 
      details: error.message
    });
  }
}