import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Product, Review, ApiResponse } from '../types';

export const useProduct = (identifier?: string) => {
  return useQuery({
    queryKey: ['product', identifier],
    queryFn: async () => {
      if (!identifier) throw new Error('No product identifier provided');
      const response = await api.get<ApiResponse<{ product: Product }>>(`/products/${identifier}`);
      return response.data.data.product;
    },
    enabled: !!identifier,
  });
};

export const useAddReview = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewData: { rating: number; title: string; comment: string }) => {
      const response = await api.post<ApiResponse<Review>>(`/products/${productId}/reviews`, reviewData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
    },
  });
};

export const useRelatedProducts = (categoryId?: string, currentProductId?: string) => {
  return useQuery({
    queryKey: ['products', 'related', categoryId, currentProductId],
    queryFn: async () => {
      if (!categoryId) return [];
      const response = await api.get<ApiResponse<{ products: Product[] }>>(
        `/products?categoryId=${categoryId}&limit=5`
      );
      return response.data.data.products.filter((p) => p.id !== currentProductId).slice(0, 4);
    },
    enabled: !!categoryId,
  });
};
