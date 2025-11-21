export interface User {
    id: number
    email: string
    name: string
    organizationId: number
  }
  
  export interface Issue {
    id: number
    title: string
    description?: string
    status: 'TODO' | 'IN_PROGRESS' | 'DONE'
    priority: 'LOW' | 'MED' | 'HIGH'
    labels: string[]
    assigneeId?: number
    creatorId: number
    orgId: number
    createdAt: string
    updatedAt: string
    assignee?: User
    creator: User
    _count?: {
      comments: number
    }
  }
  
  export interface PaginationData {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  
  export interface IssuesResponse {
    issues: Issue[]
    pagination: PaginationData
  }
  
  export interface Comment {
    id: number
    content: string
    issueId: number
    authorId: number
    author: User
    createdAt: string
    updatedAt: string
  }
  
  export interface Activity {
    id: number
    issueId: number
    action: string
    field?: string
    oldValue?: string
    newValue?: string
    createdAt: string
  }