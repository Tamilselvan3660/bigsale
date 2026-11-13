import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import SearchPage from './pages/SearchPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CheckoutPage from './pages/CheckoutPage';
import ComparisonPage from './pages/ComparisonPage';
import CompatibilityPage from './pages/CompatibilityPage';
import WarrantyPage from './pages/WarrantyPage';
import TrackingPage from './pages/TrackingPage';
import RewardsPage from './pages/RewardsPage';
import SupportPage from './pages/SupportPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import RenewPage from './pages/RenewPage';
import VisualSearchPage from './pages/VisualSearchPage';
import SetupBuilderPage from './pages/SetupBuilderPage';
import EnergyCalculatorPage from './pages/EnergyCalculatorPage';
import TrustCenterPage from './pages/TrustCenterPage';

import ComparisonFloatingBar from './components/ui/ComparisonFloatingBar';
import ChatAssistant from './components/ui/ChatAssistant';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 mins
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/products" element={<ShopPage />} />
              <Route path="/product/:slug" element={<ProductDetailPage />} />
              <Route path="/product/:identifier" element={<ProductDetailPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/compare" element={<ComparisonPage />} />
              <Route path="/compatibility" element={<CompatibilityPage />} />
              <Route path="/warranty" element={<WarrantyPage />} />
              <Route path="/track" element={<TrackingPage />} />
              <Route path="/rewards" element={<RewardsPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
              <Route path="/renew" element={<RenewPage />} />
              <Route path="/visual-search" element={<VisualSearchPage />} />
              <Route path="/builder" element={<SetupBuilderPage />} />
              <Route path="/energy" element={<EnergyCalculatorPage />} />
              <Route path="/trust-center" element={<TrustCenterPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <ComparisonFloatingBar />
          <ChatAssistant />
        </div>
        <Toaster position="bottom-right" />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
