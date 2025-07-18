import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const userId = formData.get('userId') || 'anonymous';
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
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

export const runtime = 'edge';