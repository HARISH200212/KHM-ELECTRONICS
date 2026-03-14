import { createContext, useState, useContext, useEffect } from 'react';
import { generateInvoiceNumber } from '../../../shared/utils/InvoiceGenerator';
import { API_BASE_URL } from '../../../shared/constants/api';

import { generateMockOrderHistory } from '../mockData';

const OrderContext = createContext();

export const useOrders = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
    const [orders, setOrders] = useState([]);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/orders`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (err) {
            console.error('Failed to fetch real-time orders:', err);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const addOrder = async (order) => {
        try {
            const invoiceNumber = generateInvoiceNumber();
            const orderPayload = {
                ...order,
                id: `ORD-${Date.now()}`,
                date: new Date().toISOString(),
                status: 'Pending',
                invoiceNumber: invoiceNumber,
                invoiceGeneratedAt: new Date().toISOString()
            };

            const response = await fetch(`${API_BASE_URL}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(orderPayload)
            });

            if (response.ok) {
                const newOrder = await response.json();
                setOrders(prev => [newOrder, ...prev]);
                return newOrder.id; // Return DB ID for confirmation
            }
        } catch (err) {
            console.error('Failed to add order to DB:', err);
        }
    };

    const updateOrderStatus = async (id, status, reason = null) => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status, cancellationReason: reason } : o));
        
        // Find the full order object
        const orderToUpdate = orders.find(o => o.id === id) || {};
        
        try {
            await fetch(`${API_BASE_URL}/api/orders/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ 
                    status, 
                    reason, // Pass the reason to the backend
                    customer: orderToUpdate.customer,
                    order: orderToUpdate
                })
            });
        } catch (err) {
            console.error('Failed to notify backend of status update:', err);
        }
    };


    const seedMockData = () => {
        const mockHistory = generateMockOrderHistory();
        setOrders(mockHistory);
        localStorage.setItem('kh_orders', JSON.stringify(mockHistory));
    };

    const clearOrders = () => {
        setOrders([]);
        localStorage.removeItem('kh_orders');
    };

    return (
        <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, clearOrders, seedMockData, refreshOrders: fetchOrders }}>
            {children}
        </OrderContext.Provider>
    );
};
