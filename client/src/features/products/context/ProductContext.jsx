import { createContext, useState, useContext, useEffect } from 'react';
import { products as initialProducts } from '../../../data/products';
import { API_BASE_URL } from '../../../shared/constants/api';

const ProductContext = createContext();

export const useProducts = () => useContext(ProductContext);

const API_URL = `${API_BASE_URL}/api`;

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch products from backend on mount
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API_URL}/products`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setProducts(data);
            // Save to localStorage as cache
            localStorage.setItem('kh_products', JSON.stringify(data));
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(err.message);
            // Fallback to cached data or initial products
            const cached = localStorage.getItem('kh_products');
            setProducts(cached ? JSON.parse(cached) : initialProducts);
        } finally {
            setLoading(false);
        }
    };

    const addProduct = async (product) => {
        try {
            const response = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
            const newProduct = await response.json();
            setProducts(prev => [...prev, newProduct]);
            return newProduct;
        } catch (err) {
            console.error('Error adding product:', err);
            // Fallback to local add
            const localProduct = { ...product, id: Date.now() };
            setProducts(prev => [...prev, localProduct]);
            return localProduct;
        }
    };

    const updateProduct = async (id, updatedProduct) => {
        try {
            const response = await fetch(`${API_URL}/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedProduct)
            });
            const updated = await response.json();
            setProducts(prev => prev.map(p => p.id === id ? updated : p));
        } catch (err) {
            console.error('Error updating product:', err);
            // Fallback to local update
            setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedProduct } : p));
        }
    };

    const deleteProduct = async (id) => {
        try {
            await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error('Error deleting product:', err);
            // Fallback to local delete
            setProducts(prev => prev.filter(p => p.id !== id));
        }
    };

    // Helper to reset to default
    const resetProducts = () => {
        setProducts(initialProducts);
        localStorage.setItem('kh_products', JSON.stringify(initialProducts));
    };

    return (
        <ProductContext.Provider value={{
            products,
            loading,
            error,
            addProduct,
            updateProduct,
            deleteProduct,
            resetProducts,
            refreshProducts: fetchProducts
        }}>
            {children}
        </ProductContext.Provider>
    );
};
