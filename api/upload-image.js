/**
 * FrameTheGallery API - Image Upload Endpoint
 * 
 * Handles image uploads to Vercel Blob storage using proper Vercel serverless function format.
 */

import { put } from '@vercel/blob';
import formidable from 'formidable';
import { readFileSync } from 'fs';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse multipart form data
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(request);
    
    const file = files.file?.[0];
    const userId = fields.userId?.[0] || 'anonymous';

    if (!file) {
      return response.status(400).json({ error: 'No file provided' });
    }

    // Read file data
    const fileBuffer = readFileSync(file.filepath);
    
    // Generate unique filename with user namespacing
    const timestamp = Date.now();
    const originalName = file.originalFilename?.replace(/[^a-zA-Z0-9.-]/g, '_') || 'image';
    const filename = `${userId}/${timestamp}_${originalName}`;

    // Upload to Vercel Blob
    const blob = await put(filename, fileBuffer, {
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