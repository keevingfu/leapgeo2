// API Type Definitions for GEO Platform

export interface Project {
  id: string;
  name: string;
  industry: string;
  status: 'active' | 'inactive' | 'archived';
  total_prompts: number;
  citation_rate: number;
  content_published: number;
  platforms: string[];
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Prompt {
  id: number;
  project_id: string;
  text: string;
  intent: 'High-Intent' | 'Medium-Intent' | 'Low-Intent';
  priority: 'P0' | 'P1' | 'P2';
  score: number;
  citation_rate: number;
  status: 'active' | 'inactive';
  platforms: string[];
  created_date: string;
  updated_at?: string;
}

export interface Citation {
  id: number;
  project_id: string;
  prompt_id: number;
  platform: string;
  prompt: string;
  source: string;
  position: number;
  snippet: string;
  detected_at: string;
  url?: string;
}

export interface OverviewStats {
  total_projects: number;
  total_prompts: number;
  total_citations: number;
  avg_citation_rate: number;
  active_projects: number;
}

export interface KnowledgeGraphNode {
  id: string;
  type: 'Brand' | 'Product' | 'Feature' | 'Problem' | 'Scenario' | 'UserGroup';
  label: string;
  properties?: Record<string, any>;
}

export interface KnowledgeGraphRelationship {
  from: string;
  to: string;
  type: string;
  properties?: Record<string, any>;
}

export interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[];
  relationships: KnowledgeGraphRelationship[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

// API Error type
export interface ApiError {
  detail: string;
  status_code: number;
}
