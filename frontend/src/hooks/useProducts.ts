import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Product, Pagination, ApiResponse } from '../types';

export interface ProductFilters {
  page?: number;
  limit?: number;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  rating?: number;
  search?: string;
  sortBy?: 'price' | 'rating' | 'name' | 'newest';
  order?: 'asc' | 'desc';
}

interface ProductListResult {
  products: Product[];
  pagination: Pagination;
}

export const useProducts = (filters: ProductFilters = {}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.brandId) params.append('brandId', filters.brandId);
      if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.inStock) params.append('inStock', 'true');
      if (filters.isFeatured) params.append('isFeatured', 'true');
      if (filters.rating) params.append('rating', filters.rating.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.order) params.append('order', filters.order);

      const response = await api.get<ApiResponse<ProductListResult>>(`/products?${params.toString()}`);
      return response.data.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useFeaturedProducts = (limit = 8) => {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: async () => {
      const response = await api.get<ApiResponse<ProductListResult>>(`/products?isFeatured=true&limit=${limit}`);
      return response.data.data.products;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<any>>('/categories');
      return (response.data.data as any)?.categories || response.data.data || [];
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useBrands = () => {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<any>>('/brands');
      return (response.data.data as any)?.brands || response.data.data || [];
    },
    staleTime: 1000 * 60 * 10,
  });
};
