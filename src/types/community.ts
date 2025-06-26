// Community-related type definitions for the Peña Bética Escocesa platform

export interface RSVPEntry {
  id: string;
  name: string;
  email: string;
  attendees: number;
  message?: string;
  dietaryRequirements?: string;
  whatsappInterest: boolean;
  matchDate: string;
  submittedAt: string;
}

export interface RSVPData {
  currentMatch: {
    opponent: string;
    date: string;
    competition: string;
    venue?: string;
  };
  entries: RSVPEntry[];
  totalAttendees: number;
}

export interface MerchandiseItem {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: 'clothing' | 'accessories' | 'collectibles';
  sizes?: string[];
  colors?: string[];
  inStock: boolean;
  featured: boolean;
}

export interface MerchandiseOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: {
    itemId: string;
    quantity: number;
    size?: string;
    color?: string;
  }[];
  totalAmount: number;
  message?: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  shippingAddress?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

// Photo submission and gallery types
export interface PhotoSubmission {
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

export interface ContactFormSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: 'general' | 'rsvp' | 'merchandise' | 'photo' | 'whatsapp' | 'feedback';
  subject: string;
  message: string;
  submittedAt: string;
  status: 'new' | 'read' | 'responded' | 'closed';
  responseMessage?: string;
  respondedAt?: string;
}

export interface ContactStats {
  totalSubmissions: number;
  responseRate: number;
  averageResponseTime: number; // in hours
  submissionsByType: Record<string, number>;
  recentSubmissions: ContactFormSubmission[];
}

export interface CommunityStats {
  totalMembers: number;
  activeMembers: number;
  totalRSVPs: number;
  averageAttendance: number;
  totalOrders: number;
  totalPhotos: number;
  monthlyGrowth: number;
}

// Form validation interfaces
export interface RSVPFormData {
  name: string;
  email: string;
  attendees: number;
  message?: string;
  dietaryRequirements?: string;
  whatsappInterest: boolean;
}

export interface MerchandiseOrderFormData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: {
    itemId: string;
    quantity: number;
    size?: string;
    color?: string;
  }[];
  message?: string;
  shippingAddress?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export interface PhotoSubmissionFormData {
  submitterName: string;
  submitterEmail: string;
  image: File;
  caption?: string;
  tags: string[];
  merchandiseVisible: string[];
  matchDate?: string;
  location?: string;
}

export interface ContactFormData {
  type: 'general' | 'rsvp' | 'merchandise' | 'photo' | 'whatsapp';
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// API Response types
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface RSVPResponse extends APIResponse {
  totalAttendees?: number;
  confirmedCount?: number;
  currentMatch?: {
    opponent: string;
    date: string;
    competition: string;
  };
}

export interface MerchandiseResponse extends APIResponse {
  items?: MerchandiseItem[];
  totalItems?: number;
  categories?: string[];
}

export interface PhotoGalleryResponse extends APIResponse {
  photos?: PhotoSubmission[];
  totalPhotos?: number;
  tags?: string[];
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  totalPrice: number;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    contactMethod: 'email' | 'whatsapp';
  };
  orderDetails: {
    size?: string;
    message: string;
  };
  isPreOrder: boolean;
  status: 'pending' | 'confirmed' | 'fulfilled' | 'cancelled';
  timestamp: string;
  fulfillmentDate?: string;
}
