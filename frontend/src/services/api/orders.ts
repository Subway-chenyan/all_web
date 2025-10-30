import { apiRequest } from './index';
import { Order, Message, PaginatedResponse, PaginationParams } from '@/types';

export const ordersService = {
  // Get all orders with pagination
  getOrders: async (params?: PaginationParams & { status?: string; type?: 'buyer' | 'seller' }) => {
    const response = await apiRequest.get<PaginatedResponse<Order>>('/orders/', params);
    return response.data;
  },

  // Get single order by ID
  getOrder: async (id: number) => {
    const response = await apiRequest.get<Order>(`/orders/${id}/`);
    return response.data;
  },

  // Create new order
  createOrder: async (orderData: {
    service: number;
    package?: number;
    requirements: { requirement_id: number; value: any }[];
  }) => {
    const response = await apiRequest.post<Order>('/orders/', orderData);
    return response.data;
  },

  // Update order requirements
  updateOrderRequirements: async (id: number, requirements: { requirement_id: number; value: any }[]) => {
    const response = await apiRequest.put<Order>(`/orders/${id}/requirements/`, { requirements });
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (id: number, status: string, note?: string) => {
    const response = await apiRequest.put<Order>(`/orders/${id}/status/`, { status, note });
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id: number, reason: string) => {
    const response = await apiRequest.post<Order>(`/orders/${id}/cancel/`, { reason });
    return response.data;
  },

  // Request revision
  requestRevision: async (id: number, revisionRequest: {
    message: string;
    files?: File[];
  }) => {
    const formData = new FormData();
    formData.append('message', revisionRequest.message);
    revisionRequest.files?.forEach(file => {
      formData.append('files', file);
    });

    const response = await apiRequest.upload<Order>(`/orders/${id}/request-revision/`, formData);
    return response.data;
  },

  // Submit revision
  submitRevision: async (id: number, submission: {
    message: string;
    files: File[];
  }) => {
    const formData = new FormData();
    formData.append('message', submission.message);
    submission.files.forEach(file => {
      formData.append('files', file);
    });

    const response = await apiRequest.upload<Order>(`/orders/${id}/submit-revision/`, formData);
    return response.data;
  },

  // Mark order as complete
  completeOrder: async (id: number) => {
    const response = await apiRequest.post<Order>(`/orders/${id}/complete/`);
    return response.data;
  },

  // Accept delivery
  acceptDelivery: async (id: number) => {
    const response = await apiRequest.post<Order>(`/orders/${id}/accept-delivery/`);
    return response.data;
  },

  // Get order messages
  getOrderMessages: async (id: number, params?: PaginationParams) => {
    const response = await apiRequest.get<PaginatedResponse<Message>>(`/orders/${id}/messages/`, params);
    return response.data;
  },

  // Send order message
  sendOrderMessage: async (id: number, message: {
    content: string;
    attachments?: File[];
  }) => {
    const formData = new FormData();
    formData.append('content', message.content);
    message.attachments?.forEach(file => {
      formData.append('attachments', file);
    });

    const response = await apiRequest.upload<Message>(`/orders/${id}/messages/`, formData);
    return response.data;
  },

  // Mark messages as read
  markMessagesAsRead: async (orderId: number, messageIds?: number[]) => {
    const response = await apiRequest.post(`/orders/${orderId}/messages/mark-read/`, { message_ids: messageIds });
    return response.data;
  },

  // Get order attachments
  getOrderAttachments: async (id: number) => {
    const response = await apiRequest.get(`/orders/${id}/attachments/`);
    return response.data;
  },

  // Upload order attachment
  uploadOrderAttachment: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiRequest.upload(`/orders/${id}/attachments/`, formData);
    return response.data;
  },

  // Download order attachment
  downloadOrderAttachment: async (id: number, attachmentId: number) => {
    const response = await apiRequest.get(`/orders/${id}/attachments/${attachmentId}/download/`);
    return response.data;
  },

  // Get order statistics
  getOrderStats: async (params?: { period?: 'week' | 'month' | 'year' }) => {
    const response = await apiRequest.get('/orders/stats/', params);
    return response.data;
  },

  // Get order invoice
  getOrderInvoice: async (id: number) => {
    const response = await apiRequest.get(`/orders/${id}/invoice/`);
    return response.data;
  },

  // Dispute order
  disputeOrder: async (id: number, disputeData: {
    reason: string;
    description: string;
    evidence?: File[];
  }) => {
    const formData = new FormData();
    formData.append('reason', disputeData.reason);
    formData.append('description', disputeData.description);
    disputeData.evidence?.forEach(file => {
      formData.append('evidence', file);
    });

    const response = await apiRequest.upload(`/orders/${id}/dispute/`, formData);
    return response.data;
  },
};