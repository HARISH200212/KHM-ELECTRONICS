import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import io from 'socket.io-client';
import Layout from './shared/components/layout/Layout';
import Home from './features/home/pages/Home';
import Shop from './features/products/pages/Shop';
import ProductDetails from './features/products/pages/ProductDetails';
import Cart from './features/cart/pages/Cart';
import Checkout from './features/cart/pages/Checkout';
import Settings from './features/profile/pages/Settings';
import Login from './features/auth/pages/Login';
import Profile from './features/profile/pages/Profile';
import Orders from './features/orders/pages/Orders';
import Wishlist from './features/wishlist/pages/Wishlist';
import AboutUs from './features/content/pages/AboutUs';
import Contact from './features/content/pages/Contact';
import OrderConfirmation from './features/orders/pages/OrderConfirmation';

// Admin Pages
import AdminLayout from './features/admin/pages/AdminLayout';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import AdminProducts from './features/admin/pages/AdminProducts';
import AdminAddProduct from './features/admin/pages/AdminAddProduct';
import AdminOrders from './features/admin/pages/AdminOrders';
import AdminOrderDetails from './features/admin/pages/AdminOrderDetails';
import AdminCustomers from './features/admin/pages/AdminCustomers';
import AdminCustomerDetails from './features/admin/pages/AdminCustomerDetails';

import AuthGuard from './shared/components/routing/AuthGuard';
import AdminPrivateRoute from './features/admin/components/AdminPrivateRoute';
import RoamingLogo from './shared/components/ui/RoamingLogo';
import { API_BASE_URL } from './shared/constants/api';

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io(API_BASE_URL);

    socket.on('new_product_push', (data) => {
      toast.custom((t) => (
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--primary)', 
          padding: '16px', borderRadius: '8px', display: 'flex', gap: '16px', 
          cursor: 'pointer', maxWidth: '400px', boxShadow: 'var(--shadow-olive)'
        }} onClick={() => {
          toast.dismiss(t.id);
          navigate(`/product/${data.productId}`);
        }}>
          {data.image && <img src={data.image} alt={data.title} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />}
          <div>
            <h4 style={{ margin: '0 0 5px 0', color: 'var(--primary)', fontSize: '1rem' }}>🔔 {data.title}</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)' }}>{data.message}</p>
          </div>
        </div>
      ), { duration: 6000, position: 'bottom-right' });
    });

    socket.on('promo_push', (data) => {
      toast.custom((t) => (
        <div style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', border: '1px solid #ff00cc', 
          padding: '16px', borderRadius: '8px', display: 'flex', gap: '16px', 
          cursor: 'pointer', maxWidth: '400px', boxShadow: '0 5px 15px rgba(255, 0, 204, 0.3)'
        }} onClick={() => {
          toast.dismiss(t.id);
          navigate(`/product/${data.productId}`);
        }}>
          {data.image && <img src={data.image} alt={data.title} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />}
          <div>
            <h4 style={{ margin: '0 0 5px 0', color: '#ff00cc', fontSize: '1.1rem', fontWeight: 'bold' }}>🔥 {data.title}</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'white' }}>{data.message}</p>
          </div>
        </div>
      ), { duration: 8000, position: 'top-right' });
    });

    return () => socket.disconnect();
  }, [navigate]);

  return (
    <>
      <Routes >
        <Route path="/login" element={<Login />} />

        {/* Storefront Routes - Protected by default */}
        <Route element={<AuthGuard />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="about" element={<AboutUs />} />
            <Route path="contact" element={<Contact />} />
            <Route path="product/:id" element={<ProductDetails />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="orders" element={<Orders />} />
            <Route path="track-order" element={<Navigate to="/orders" replace />} />
            <Route path="wishlist" element={<Wishlist />} />
          </Route>
        </Route>

        {/* Publically accessible pages that still use the layout */}
        <Route path="/" element={<Layout />}>
          <Route path="order-confirmation" element={<OrderConfirmation />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminPrivateRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/add" element={<AdminAddProduct />} />
            <Route path="products/edit/:id" element={<AdminAddProduct />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetails />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="customers/:email" element={<AdminCustomerDetails />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes >
      <RoamingLogo />
    </>
  );
}

export default App;
