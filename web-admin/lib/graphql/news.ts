import { gql } from '@apollo/client';

// Fragments
export const NEWS_FRAGMENT = gql`
  fragment NewsFields on News {
    id
    campusId
    title
    content
    summary
    category
    priority
    imageUrl
    attachmentUrls
    targetAudience
    isPublished
    publishedAt
    expiresAt
    createdAt
    updatedAt
    isRead
    authorName
  }
`;

// Queries
export const GET_NEWS = gql`
  ${NEWS_FRAGMENT}
  query GetNews($tenantId: String!, $filter: String, $studentId: String) {
    news(tenantId: $tenantId, filter: $filter, studentId: $studentId) {
      ...NewsFields
    }
  }
`;

export const GET_NEWS_ITEM = gql`
  ${NEWS_FRAGMENT}
  query GetNewsItem($id: String!, $tenantId: String!) {
    newsItem(id: $id, tenantId: $tenantId) {
      ...NewsFields
    }
  }
`;

export const GET_UNREAD_NEWS_COUNT = gql`
  query GetUnreadNewsCount($tenantId: String!) {
    unreadNewsCount(tenantId: $tenantId)
  }
`;

// Mutations
export const CREATE_NEWS = gql`
  ${NEWS_FRAGMENT}
  mutation CreateNews($tenantId: String!, $input: CreateNewsInput!) {
    createNews(tenantId: $tenantId, input: $input) {
      ...NewsFields
    }
  }
`;

export const UPDATE_NEWS = gql`
  ${NEWS_FRAGMENT}
  mutation UpdateNews($id: String!, $tenantId: String!, $input: UpdateNewsInput!) {
    updateNews(id: $id, tenantId: $tenantId, input: $input) {
      ...NewsFields
    }
  }
`;

export const DELETE_NEWS = gql`
  mutation DeleteNews($id: String!, $tenantId: String!) {
    deleteNews(id: $id, tenantId: $tenantId)
  }
`;

export const MARK_NEWS_AS_READ = gql`
  mutation MarkNewsAsRead($newsId: String!, $tenantId: String!) {
    markNewsAsRead(newsId: $newsId, tenantId: $tenantId)
  }
`;

// Types
export interface News {
  id: string;
  campusId: string;
  title: string;
  content: string;
  summary?: string;
  category?: string;
  priority: string;
  imageUrl?: string;
  attachmentUrls?: string[];
  targetAudience: string;
  isPublished: boolean;
  publishedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isRead?: boolean;
  authorName?: string;
}

export interface CreateNewsInput {
  campusId: string;
  title: string;
  content: string;
  summary?: string;
  category?: string;
  priority?: string;
  imageUrl?: string;
  attachmentUrls?: string[];
  targetAudience?: string;
  isPublished?: boolean;
  publishedAt?: Date;
  expiresAt?: Date;
}

export interface UpdateNewsInput {
  title?: string;
  content?: string;
  summary?: string;
  category?: string;
  priority?: string;
  imageUrl?: string;
  attachmentUrls?: string[];
  targetAudience?: string;
  isPublished?: boolean;
  publishedAt?: Date;
  expiresAt?: Date;
}