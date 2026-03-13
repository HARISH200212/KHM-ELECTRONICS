import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './features/auth/context/AuthContext'
import { CartProvider } from './features/cart/context/CartContext'
import { ProductProvider } from './features/products/context/ProductContext'
import { OrderProvider } from './features/orders/context/OrderContext'
import { WishlistProvider } from './features/wishlist/context/WishlistContext'
import { Toaster } from 'react-hot-toast'
import './styles/index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <OrderProvider>
              <WishlistProvider>
                <Toaster position="bottom-right" />
                <App />
              </WishlistProvider>
            </OrderProvider>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
