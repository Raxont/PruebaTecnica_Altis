export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
  organizationId: number;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    name: string;
    organizationId: number;
  };
  token: string;
}

export interface CreateIssueDTO {
  title: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority?: 'LOW' | 'MED' | 'HIGH';
  assigneeId?: number;
  labels?: string[];
}

export interface UpdateIssueDTO {
  title?: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority?: 'LOW' | 'MED' | 'HIGH';
  assigneeId?: number | null;
  labels?: string[];
}

export interface IssueFilters {
  status?: string;
  priority?: string;
  assigneeId?: number;
  search?: string;
  page?: number;
  limit?: number;
}