import { useProducts } from '../../products/context/ProductContext';
import { Link, useSearchParams } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaCheckSquare } from 'react-icons/fa';
import { useState } from 'react';
import './Admin.css';

const AdminProducts = () => {
    const { products, deleteProduct, updateProduct, refreshProducts } = useProducts();
    const [searchParams] = useSearchParams();
    const stockFilter = searchParams.get('stock');
    const categoryFilter = searchParams.get('category');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [bulkDiscount, setBulkDiscount] = useState('');
    const [isApplying, setIsApplying] = useState(false);

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            deleteProduct(id);
        }
    };

    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedProducts(products.map(p => p.id));
        } else {
            setSelectedProducts([]);
        }
    };

    const toggleSelect = (id) => {
        setSelectedProducts(prev => 
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const handleBulkDiscount = async () => {
        if (!bulkDiscount || isNaN(bulkDiscount)) {
            alert("Please enter a valid discount percentage.");
            return;
        }
        
        if (selectedProducts.length === 0) {
            alert("Please select at least one product.");
            return;
        }

        const discountVal = Number(bulkDiscount);
        setIsApplying(true);
        
        try {
            for (const id of selectedProducts) {
                const product = products.find(p => p.id === id);
                if (product) {
                    const original = product.originalPrice || product.price;
                    const newPrice = Math.round(original - (original * (discountVal / 100)));

                    await updateProduct(id, { 
                        originalPrice: original,
                        price: newPrice,
                        discount: discountVal,
                        onSale: discountVal > 0
                    });
                }
            }
            alert(`Successfully applied a ${discountVal}% discount to ${selectedProducts.length} product(s)!`);
            setSelectedProducts([]);
            setBulkDiscount('');
            
            // Refresh to ensure all states are perfectly synced
            if (refreshProducts) refreshProducts(); 
        } catch (err) {
            console.error("Bulk discount error", err);
            alert("An error occurred while applying discounts.");
        } finally {
            setIsApplying(false);
        }
    };

    const filteredProducts = products.filter((product) => {
        if (stockFilter === 'low' && (product.stock || 0) > 5) return false;
        if (stockFilter === 'live' && (product.stock || 0) <= 0) return false;
        if (categoryFilter && (product.category || '').toLowerCase() !== categoryFilter.toLowerCase()) return false;
        return true;
    });

    return (
        <div>
            <header className="admin-header">
                <h1>Products</h1>
                <Link to="/admin/products/add" className="btn btn-primary">
                    <FaPlus /> Add Product
                </Link>
            </header>

            {(stockFilter || categoryFilter) && (
                <p style={{ marginBottom: '12px', color: 'var(--admin-text-muted)' }}>
                    Active filter: {stockFilter ? `stock=${stockFilter}` : ''} {categoryFilter ? `category=${categoryFilter}` : ''}
                </p>
            )}

            {/* Bulk Action Bar */}
            <div className="bulk-actions-bar" style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'var(--bg-secondary)', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--border-medium)' }}>
                <span style={{ fontWeight: 'bold' }}>Bulk Actions:</span>
                <span style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>{selectedProducts.length} Selected</span>
                
                <input 
                    type="number" 
                    placeholder="Discount %" 
                    value={bulkDiscount}
                    onChange={(e) => setBulkDiscount(e.target.value)}
                    style={{ padding: '8px 15px', borderRadius: '4px', border: '1px solid var(--border-olive)', background: 'var(--bg-card)', color: 'var(--text-light)', width: '120px' }}
                    min="0"
                    max="100"
                />
                <button 
                    onClick={handleBulkDiscount}
                    disabled={isApplying || selectedProducts.length === 0}
                    style={{ padding: '8px 15px', borderRadius: '4px', background: 'var(--primary-gradient)', color: '#000', fontWeight: 'bold', border: 'none', cursor: (isApplying || selectedProducts.length === 0) ? 'not-allowed' : 'pointer', opacity: (isApplying || selectedProducts.length === 0) ? 0.5 : 1 }}
                >
                    {isApplying ? 'Applying...' : 'Apply Discount'}
                </button>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th style={{ width: '40px', textAlign: 'center' }}>
                            <input 
                                type="checkbox" 
                                checked={selectedProducts.length === products.length && products.length > 0} 
                                onChange={toggleSelectAll} 
                            />
                        </th>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts.map(product => (
                        <tr key={product.id} style={{ background: selectedProducts.includes(product.id) ? 'rgba(74, 222, 128, 0.05)' : 'transparent' }}>
                            <td style={{ textAlign: 'center' }}>
                                <input 
                                    type="checkbox" 
                                    checked={selectedProducts.includes(product.id)}
                                    onChange={() => toggleSelect(product.id)}
                                />
                            </td>
                            <td>
                                <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                            </td>
                            <td>{product.name}</td>
                            <td>{product.category}</td>
                            <td>₹{product.price.toLocaleString('en-IN')}</td>
                            <td>
                                <span style={{ background: 'rgba(72, 187, 120, 0.1)', color: '#48bb78', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>Live</span>
                            </td>
                            <td style={{ display: 'flex' }}>
                                <Link to={`/admin/products/edit/${product.id}`} className="action-btn edit">
                                    <FaEdit />
                                </Link>
                                <button onClick={() => handleDelete(product.id)} className="action-btn delete">
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminProducts;
