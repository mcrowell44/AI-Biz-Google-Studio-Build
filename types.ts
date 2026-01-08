
export enum View {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  AGENT_BUILDER = 'AGENT_BUILDER',
  BUSINESS_SEARCH = 'BUSINESS_SEARCH',
  CALENDAR = 'CALENDAR',
  INTEGRATIONS = 'INTEGRATIONS'
}

export interface Agent {
  id: string;
  name: string;
  model: string;
  voice: string;
  status: 'active' | 'inactive';
  usage: number; // in minutes
  leads: number;
}

// Updated to reflect the focused output in BusinessSearch
export interface BusinessAnalysis {
  name: string;
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
  };
  hasWebsite: boolean;
  painPoints: string[];
  bestTimeCall: string;
  salesStrategy: string;
  priority: 'High' | 'Standard' | 'Unknown';
  priorityReason?: string;
}