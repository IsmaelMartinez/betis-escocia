import { createApiHandler } from '@/lib/apiUtils';
import { join } from 'path';
import { writeFile, readFile, mkdir } from 'fs/promises';
import type { MerchandiseItem } from '@/types/community';
import { 
  merchandiseQuerySchema, 
  createMerchandiseSchema, 
  updateMerchandiseSchema, 
  merchandiseIdSchema 
} from '@/lib/schemas/merchandise';

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

export const GET = createApiHandler({
  auth: 'none',
  handler: async (_, context) => {
    const { searchParams } = new URL(context.request.url);
    const queryParams = merchandiseQuerySchema.parse({
      category: searchParams.get('category'),
      featured: searchParams.get('featured'),
      inStock: searchParams.get('inStock')
    });
    const { category, featured, inStock } = queryParams;

    const merchandiseData = await readMerchandiseData();
    let filteredItems = merchandiseData.items;

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

    return {
      success: true,
      items: filteredItems,
      categories: merchandiseData.categories,
      totalItems: filteredItems.length
    };
  }
});

export const POST = createApiHandler({
  auth: 'none', // Should be admin later
  schema: createMerchandiseSchema,
  handler: async (validatedData, context) => {
    // Read current data
    const merchandiseData = await readMerchandiseData();

    // Create new item
    const newItem: MerchandiseItem = {
      id: `merch_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      name: validatedData.name,
      description: validatedData.description,
      price: validatedData.price,
      images: validatedData.images,
      category: validatedData.category,
      sizes: validatedData.sizes,
      colors: validatedData.colors,
      inStock: validatedData.inStock,
      featured: validatedData.featured
    };

    // Add to items
    merchandiseData.items.push(newItem);
    merchandiseData.totalItems = merchandiseData.items.length;

    // Update categories if new
    if (!merchandiseData.categories.includes(validatedData.category)) {
      merchandiseData.categories.push(validatedData.category);
    }

    // Save updated data
    await writeMerchandiseData(merchandiseData);

    return {
      success: true,
      message: 'Producto añadido correctamente',
      data: newItem
    };
  }
});

export const PUT = createApiHandler({
  auth: 'none', // Should be admin later
  schema: updateMerchandiseSchema,
  handler: async (validatedData, context) => {
    const { searchParams } = new URL(context.request.url);
    const { id: itemId } = merchandiseIdSchema.parse({ id: searchParams.get('id') });

    const merchandiseData = await readMerchandiseData();
    
    // Find item
    const itemIndex = merchandiseData.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      throw new Error('Producto no encontrado');
    }

    // Update item
    merchandiseData.items[itemIndex] = { ...merchandiseData.items[itemIndex], ...validatedData };
    
    await writeMerchandiseData(merchandiseData);

    return {
      success: true,
      message: 'Producto actualizado correctamente',
      data: merchandiseData.items[itemIndex]
    };
  }
});

export const DELETE = createApiHandler({
  auth: 'none', // Should be admin later
  handler: async (_, context) => {
    const { searchParams } = new URL(context.request.url);
    const { id: itemId } = merchandiseIdSchema.parse({ id: searchParams.get('id') });

    const merchandiseData = await readMerchandiseData();
    
    // Find and remove item
    const initialLength = merchandiseData.items.length;
    merchandiseData.items = merchandiseData.items.filter(item => item.id !== itemId);

    if (merchandiseData.items.length === initialLength) {
      throw new Error('Producto no encontrado');
    }

    merchandiseData.totalItems = merchandiseData.items.length;
    await writeMerchandiseData(merchandiseData);

    return {
      success: true,
      message: 'Producto eliminado correctamente'
    };
  }
});
