import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface PhotoSubmission {
  id: string;
  name: string;
  email: string;
  caption: string;
  merchandiseItems: string[];
  location: string;
  matchDate: string;
  imageUrl: string;
  approved: boolean;
  featured: boolean;
  timestamp: string;
  moderatedAt?: string;
  moderatedBy?: string;
}

const photosFile = path.join(process.cwd(), 'data', 'photos.json');
const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'photos');

async function getPhotos(): Promise<PhotoSubmission[]> {
  try {
    await fs.access(photosFile);
    const data = await fs.readFile(photosFile, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function savePhotos(photos: PhotoSubmission[]): Promise<void> {
  await fs.mkdir(path.dirname(photosFile), { recursive: true });
  await fs.writeFile(photosFile, JSON.stringify(photos, null, 2));
}

export async function GET(request: NextRequest) {
  try {
    const photos = await getPhotos();
    const { searchParams } = new URL(request.url);
    const approved = searchParams.get('approved');
    const featured = searchParams.get('featured');

    let filteredPhotos = photos;

    if (approved === 'true') {
      filteredPhotos = filteredPhotos.filter(photo => photo.approved);
    } else if (approved === 'false') {
      filteredPhotos = filteredPhotos.filter(photo => !photo.approved);
    }

    if (featured === 'true') {
      filteredPhotos = filteredPhotos.filter(photo => photo.featured);
    }

    // Sort by timestamp, newest first
    filteredPhotos.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json(filteredPhotos);
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json(
      { error: 'Error al obtener las fotos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No se encontró ningún archivo' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'El archivo debe ser una imagen' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const extension = path.extname(file.name) || '.jpg';
    const filename = `photo_${timestamp}${extension}`;
    const filepath = path.join(uploadsDir, filename);

    // Save the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(filepath, buffer);

    // Create photo submission record
    const photos = await getPhotos();
    const newPhoto: PhotoSubmission = {
      id: timestamp.toString(),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      caption: formData.get('caption') as string || '',
      merchandiseItems: JSON.parse(formData.get('merchandiseItems') as string || '[]'),
      location: formData.get('location') as string || '',
      matchDate: formData.get('matchDate') as string || '',
      imageUrl: `/uploads/photos/${filename}`,
      approved: false, // Requires moderation
      featured: false,
      timestamp: formData.get('timestamp') as string || new Date().toISOString()
    };

    photos.push(newPhoto);
    await savePhotos(photos);

    console.log('New photo submission:', {
      id: newPhoto.id,
      name: newPhoto.name,
      merchandiseItems: newPhoto.merchandiseItems,
      filename
    });

    return NextResponse.json(
      { 
        message: 'Foto subida correctamente',
        id: newPhoto.id 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json(
      { error: 'Error al subir la foto' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updateData = await request.json();
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('id');

    if (!photoId) {
      return NextResponse.json(
        { error: 'ID de foto requerido' },
        { status: 400 }
      );
    }

    const photos = await getPhotos();
    const photoIndex = photos.findIndex(photo => photo.id === photoId);

    if (photoIndex === -1) {
      return NextResponse.json(
        { error: 'Foto no encontrada' },
        { status: 404 }
      );
    }

    // Update allowed fields
    const updatedPhoto = { ...photos[photoIndex] };
    
    if (updateData.approved !== undefined) {
      updatedPhoto.approved = updateData.approved;
      updatedPhoto.moderatedAt = new Date().toISOString();
      updatedPhoto.moderatedBy = updateData.moderatedBy ?? 'admin';
    }
    
    if (updateData.featured !== undefined) {
      updatedPhoto.featured = updateData.featured;
    }

    photos[photoIndex] = updatedPhoto;
    await savePhotos(photos);

    console.log('Photo updated:', {
      id: updatedPhoto.id,
      approved: updatedPhoto.approved,
      featured: updatedPhoto.featured
    });

    return NextResponse.json(updatedPhoto);
  } catch (error) {
    console.error('Error updating photo:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la foto' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('id');

    if (!photoId) {
      return NextResponse.json(
        { error: 'ID de foto requerido' },
        { status: 400 }
      );
    }

    const photos = await getPhotos();
    const photoIndex = photos.findIndex(photo => photo.id === photoId);

    if (photoIndex === -1) {
      return NextResponse.json(
        { error: 'Foto no encontrada' },
        { status: 404 }
      );
    }

    const deletedPhoto = photos.splice(photoIndex, 1)[0];
    
    // Try to delete the file
    try {
      const fullPath = path.join(process.cwd(), 'public', deletedPhoto.imageUrl);
      await fs.unlink(fullPath);
    } catch (fileError) {
      console.warn('Could not delete photo file:', fileError);
    }

    await savePhotos(photos);

    console.log('Photo deleted:', {
      id: deletedPhoto.id,
      name: deletedPhoto.name
    });

    return NextResponse.json({ message: 'Foto eliminada correctamente' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la foto' },
      { status: 500 }
    );
  }
}
