import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Order, ApiResponse } from '../types';

export const useMyOrders = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['my-orders', page, limit],
    queryFn: async () => {
      const response = await api.get<ApiResponse<{ orders: Order[]; pagination: any }>>(
        `/orders/my-orders?page=${page}&limit=${limit}`
      );
      return response.data.data;
    },
    enabled: !!localStorage.getItem('bigsale_token'),
  });
};

export const useOrder = (orderId?: string) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) throw new Error('No order ID provided');
      const response = await api.get<ApiResponse<{ order: Order }>>(`/orders/${orderId}`);
      return response.data.data.order;
    },
    enabled: !!orderId,
  });
};

export const usePlaceOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: {
      shippingAddressId: string;
      billingAddressId?: string;
      paymentMethod: string;
      customerNotes?: string;
    }) => {
      const response = await api.post<ApiResponse<{ order: Order }>>('/checkout/place-order', orderData);
      return response.data.data.order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason?: string }) => {
      const response = await api.post<ApiResponse<{ order: Order }>>(`/orders/${orderId}/cancel`, { reason });
      return response.data.data.order;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['order', vars.orderId] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    },
  });
};
