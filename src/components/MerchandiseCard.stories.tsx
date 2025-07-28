import type { Meta, StoryObj } from '@storybook/nextjs';
import MerchandiseCard from './MerchandiseCard';
import { MerchandiseItem } from '@/types/community';

const sampleItem: MerchandiseItem = {
  id: '1',
  name: 'Camiseta Oficial Betis 23/24',
  description: 'Camiseta de la primera equipación del Real Betis Balompié para la temporada 2023/2024.',
  price: 79.99,
  images: ['/images/merchandise/camiseta-betis.webp'],
  category: 'clothing',
  inStock: true,
  featured: false,
  sizes: ['S', 'M', 'L', 'XL'],
  colors: ['Verde', 'Blanco'],
};

const outOfStockItem: MerchandiseItem = {
  ...sampleItem,
  id: '2',
  name: 'Bufanda "Manquepierda" Edición Limitada',
  description: 'Bufanda exclusiva con el lema "Manquepierda", ideal para el invierno escocés.',
  price: 19.99,
  images: ['/images/merchandise/bufanda-manquepierda.webp'],
  category: 'accessories',
  inStock: false,
  featured: false,
  sizes: [],
  colors: [],
};

const featuredItem: MerchandiseItem = {
  ...sampleItem,
  id: '3',
  name: 'Gorra Betis Escocia',
  description: 'Gorra con el escudo de la peña, perfecta para el sol o la lluvia.',
  price: 24.99,
  images: ['/images/merchandise/gorra-betis-escocia.webp'],
  category: 'accessories',
  inStock: true,
  featured: true,
  sizes: ['Única'],
  colors: ['Verde', 'Negro'],
};

const multiImageItem: MerchandiseItem = {
  ...sampleItem,
  id: '4',
  name: 'Sudadera con Capucha Betis',
  description: 'Sudadera cómoda y cálida con el escudo del Betis, ideal para el día a día.',
  price: 49.99,
  images: [
    '/images/merchandise/sudadera-betis-1.webp',
    '/images/merchandise/sudadera-betis-2.webp',
    '/images/merchandise/sudadera-betis-3.webp',
  ],
  category: 'clothing',
  inStock: true,
  featured: false,
  sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  colors: ['Gris', 'Verde Oscuro'],
};

const meta: Meta<typeof MerchandiseCard> = {
  title: 'Components/MerchandiseCard',
  component: MerchandiseCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    item: {
      control: 'object',
      description: 'The merchandise item data',
    },
  },
};

export default meta;
type Story = StoryObj<typeof MerchandiseCard>;

export const Default: Story = {
  args: {
    item: sampleItem,
  },
};

export const OutOfStock: Story = {
  args: {
    item: outOfStockItem,
  },
};

export const FeaturedItem: Story = {
  args: {
    item: featuredItem,
  },
};

export const WithMultipleImagesAndOptions: Story = {
  args: {
    item: multiImageItem,
  },
};