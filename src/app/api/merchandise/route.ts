import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { writeFile, readFile, mkdir } from 'fs/promises';
import type { MerchandiseItem } from '@/types/community';

interface MerchandiseData {
  items: MerchandiseItem[];
  categories: string[];
  totalItems: number;
}

const dataPath = join(process.cwd(), 'data', 'merchandise.json');

// Helper function to ensure data directory exists
async function ensureDataDirectory() {
  try {
    const dataDir = join(process.cwd(), 'data');
    await mkdir(dataDir, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
    // Directory might already exist, ignore error
  }
}

// Helper function to read merchandise data
async function readMerchandiseData(): Promise<MerchandiseData> {
  try {
    const fileContent = await readFile(dataPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading merchandise data:', error);
    // If file doesn't exist, return default structure with sample items
    return {
      items: [
        {
          id: 'merch_001',
          name: 'Bufanda Peña Bética Escocesa',
          description: 'Bufanda oficial de la peña con los colores del Betis y el logo de Escocia. Perfecta para los partidos en el Polwarth Tavern.',
          price: 15.99,
          images: ['/images/merch/bufanda-1.jpg', '/images/merch/bufanda-2.jpg'],
          category: 'accessories',
          sizes: [],
          colors: ['Verde y Blanco'],
          inStock: true,
          featured: true
        },
        {
          id: 'merch_002',
          name: 'Camiseta "No busques más que no hay"',
          description: 'Camiseta con el lema oficial de la peña. Diseño exclusivo con los colores béticos.',
          price: 22.50,
          images: ['/images/merch/camiseta-1.jpg'],
          category: 'clothing',
          sizes: ['S', 'M', 'L', 'XL', 'XXL'],
          colors: ['Verde', 'Blanco'],
          inStock: true,
          featured: true
        },
        {
          id: 'merch_003',
          name: 'Llavero Betis-Escocia',
          description: 'Llavero metálico con el escudo del Betis y la bandera de Escocia.',
          price: 5.99,
          images: ['/images/merch/llavero-1.jpg'],
          category: 'accessories',
          sizes: [],
          colors: ['Metálico'],
          inStock: true,
          featured: false
        },
        {
          id: 'merch_004',
          name: 'Parche Bordado Peña',
          description: 'Parche bordado de alta calidad para coser en chaquetas, mochilas o camisetas.',
          price: 8.99,
          images: ['/images/merch/parche-1.jpg'],
          category: 'accessories',
          sizes: ['8cm x 6cm'],
          colors: ['Verde y Blanco'],
          inStock: true,
          featured: false
        },
        {
          id: 'merch_005',
          name: 'Gorra "Béticos en Escocia"',
          description: 'Gorra ajustable con visera, perfecta para mostrar tu pasión bética.',
          price: 18.99,
          images: ['/images/merch/gorra-1.jpg'],
          category: 'clothing',
          sizes: ['Ajustable'],
          colors: ['Verde', 'Blanco', 'Negro'],
          inStock: false,
          featured: false
        },
        {
          id: 'merch_006',
          name: 'Pin Coleccionable Polwarth',
          description: 'Pin metálico conmemorativo del Polwarth Tavern, nuestro hogar en Edimburgo.',
          price: 4.50,
          images: ['/images/merch/pin-1.jpg'],
          category: 'collectibles',
          sizes: [],
          colors: ['Dorado'],
          inStock: true,
          featured: true
        }
      ],
      categories: ['clothing', 'accessories', 'collectibles'],
      totalItems: 6
    };
  }
}

// Helper function to write merchandise data
async function writeMerchandiseData(data: MerchandiseData): Promise<void> {
  await ensureDataDirectory();
  await writeFile(dataPath, JSON.stringify(data, null, 2), 'utf-8');
}

// GET - Retrieve merchandise items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';
    const inStock = searchParams.get('inStock') !== 'false'; // Default to true

    const data = await readMerchandiseData();
    
    let filteredItems = data.items;

    // Apply filters
    if (category && category !== 'all') {
      filteredItems = filteredItems.filter(item => item.category === category);
    }
    
    if (featured) {
      filteredItems = filteredItems.filter(item => item.featured);
    }
    
    if (inStock) {
      filteredItems = filteredItems.filter(item => item.inStock);
    }

    return NextResponse.json({
      success: true,
      items: filteredItems,
      categories: data.categories,
      totalItems: filteredItems.length
    });
  } catch (error) {
    console.error('Error reading merchandise data:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Error al cargar los productos de la tienda';
    
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'ENOENT') {
        errorMessage = 'No se encontraron productos en la tienda';
      } else if (error.code === 'EACCES') {
        errorMessage = 'Error de permisos al acceder a los productos';
      }
    } else if (error instanceof SyntaxError) {
      errorMessage = 'Error en el formato de los datos de productos';
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}

// POST - Add new merchandise item (admin function)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, images, category, sizes, colors, inStock, featured } = body;

    // Validation
    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Nombre, descripción, precio y categoría son obligatorios' 
        },
        { status: 400 }
      );
    }

    if (price <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'El precio debe ser mayor que 0' 
        },
        { status: 400 }
      );
    }

    const validCategories = ['clothing', 'accessories', 'collectibles'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Categoría no válida' 
        },
        { status: 400 }
      );
    }

    // Read current data
    const data = await readMerchandiseData();

    // Create new item
    const newItem: MerchandiseItem = {
      id: `merch_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      images: images || [],
      category,
      sizes: sizes || [],
      colors: colors || [],
      inStock: Boolean(inStock),
      featured: Boolean(featured)
    };

    // Add to items
    data.items.push(newItem);
    data.totalItems = data.items.length;

    // Update categories if new
    if (!data.categories.includes(category)) {
      data.categories.push(category);
    }

    // Save updated data
    await writeMerchandiseData(data);

    console.log(`New merchandise item added: ${name} (${category}) - £${price}`);

    return NextResponse.json({
      success: true,
      message: 'Producto añadido correctamente',
      item: newItem
    });

  } catch (error) {
    console.error('Error adding merchandise item:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Error interno al añadir el producto';
    
    if (error instanceof SyntaxError) {
      errorMessage = 'Los datos del producto no son válidos';
    } else if (error && typeof error === 'object' && 'code' in error && (error.code === 'ENOENT' || error.code === 'EACCES')) {
      errorMessage = 'Error de almacenamiento. Inténtalo de nuevo.';
    } else if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.includes('space')) {
      errorMessage = 'Error de espacio de almacenamiento. Contacta al administrador.';
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}

// PUT - Update merchandise item (admin function)
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');

    if (!itemId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID del producto requerido' 
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data = await readMerchandiseData();
    
    // Find item
    const itemIndex = data.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Producto no encontrado' 
        },
        { status: 404 }
      );
    }

    // Update item
    data.items[itemIndex] = { ...data.items[itemIndex], ...body };
    
    await writeMerchandiseData(data);

    return NextResponse.json({
      success: true,
      message: 'Producto actualizado correctamente',
      item: data.items[itemIndex]
    });

  } catch (error) {
    console.error('Error updating merchandise item:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Error al actualizar el producto';
    
    if (error instanceof SyntaxError) {
      errorMessage = 'Los datos de actualización no son válidos';
    } else if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'ENOENT') {
        errorMessage = 'No se encontraron los datos del producto';
      } else if (error.code === 'EACCES') {
        errorMessage = 'Error de permisos al actualizar el producto';
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove merchandise item (admin function)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');

    if (!itemId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID del producto requerido' 
        },
        { status: 400 }
      );
    }

    const data = await readMerchandiseData();
    
    // Find and remove item
    const initialLength = data.items.length;
    data.items = data.items.filter(item => item.id !== itemId);

    if (data.items.length === initialLength) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Producto no encontrado' 
        },
        { status: 404 }
      );
    }

    data.totalItems = data.items.length;
    await writeMerchandiseData(data);

    return NextResponse.json({
      success: true,
      message: 'Producto eliminado correctamente'
    });

  } catch (error) {
    console.error('Error deleting merchandise item:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Error al eliminar el producto';
    
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'ENOENT') {
        errorMessage = 'No se encontraron los datos del producto a eliminar';
      } else if (error.code === 'EACCES') {
        errorMessage = 'Error de permisos al eliminar el producto';
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}
