// Community-related type definitions for the Peña Bética Escocesa platform

export interface RSVPEntry {
  id: string;
  name: string;
  email: string;
  attendees: number;
  message?: string;
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

export interface ContactFormSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: 'general' | 'rsvp' | 'whatsapp' | 'feedback' | 'photo';
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
  monthlyGrowth: number;
}

// Form validation interfaces
export interface RSVPFormData {
  name: string;
  email: string;
  attendees: number;
  message?: string;
  whatsappInterest: boolean;
}

export interface ContactFormData {
  type: 'general' | 'rsvp' | 'whatsapp' | 'photo';
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


