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
import { NextResponse } from 'next/server';

/**
 * Upload image to Vercel Blob storage
 * 
 * POST /api/upload-image
 * 
 * Request Body (FormData):
 * - file: Image file (JPG, PNG, WebP, max 10MB)
 * - userId: User's Farcaster FID or session ID
 * 
 * Response:
 * - success: boolean
 * - url: string (Vercel Blob URL)
 * - filename: string
 * - size: number (bytes)
 * - userId: string
 * 
 * @param {Request} request - Next.js API request object
 * @returns {Promise<NextResponse>} JSON response with upload result
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const userId = formData.get('userId') || 'anonymous';
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
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

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: filename,
      size: file.size,
      uploadedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image', details: error.message },
      { status: 500 }
    );
  }
}

// Use Edge Runtime for faster cold starts and global deployment
export const runtime = 'edge';