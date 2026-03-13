import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../../products/context/ProductContext';
import './Admin.css';

const AdminAddProduct = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { products, addProduct, updateProduct } = useProducts();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        category: 'Electronics',
        price: '',
        image: 'https://placehold.co/400x400/1a1a1a/FFF?text=Product',
        description: '',
        brand: '',
        colors: '',
        bankOffers: '',
        upcomingSale: false,
        saleStartDate: '',
        saleEndDate: '',
        threeDModelUrl: '',
        specs: {}
    });

    useEffect(() => {
        if (isEditMode) {
            const product = products.find(p => p.id === parseInt(id));
            if (product) {
                setFormData({
                    ...product,
                    colors: product.colors ? product.colors.join(', ') : '',
                    bankOffers: product.bankOffers ? product.bankOffers.join(', ') : '',
                    saleStartDate: product.saleStartDate ? new Date(product.saleStartDate).toISOString().split('T')[0] : '',
                    saleEndDate: product.saleEndDate ? new Date(product.saleEndDate).toISOString().split('T')[0] : '',
                    threeDModelUrl: product.threeDModelUrl || ''
                });
            }
        }
    }, [id, isEditMode, products]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const productData = {
            ...formData,
            price: Number(formData.price),
            colors: formData.colors ? formData.colors.split(',').map(c => c.trim()).filter(Boolean) : [],
            bankOffers: formData.bankOffers ? formData.bankOffers.split(',').map(c => c.trim()).filter(Boolean) : [],
            onSale: formData.discount > 0,
            saleStartDate: formData.saleStartDate ? new Date(formData.saleStartDate) : undefined,
            saleEndDate: formData.saleEndDate ? new Date(formData.saleEndDate) : undefined,
        };

        if (isEditMode) {
            updateProduct(parseInt(id), productData);
            alert('Product updated successfully!');
        } else {
            addProduct(productData);
            alert('Product added successfully!');
        }
        navigate('/admin/products');
    };

    return (
        <div>
            <header className="admin-header">
                <h1>{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
            </header>

            <form className="admin-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Product Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Brand</label>
                    <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        placeholder="e.g. Apple, Samsung, Sony"
                    />
                </div>

                <div className="form-group">
                    <label>Category</label>
                    <select name="category" value={formData.category} onChange={handleChange}>
                        <option value="Electronics">Electronics</option>
                        <option value="Audio">Audio</option>
                        <option value="Computers">Computers</option>
                        <option value="Smartphones">Smartphones</option>
                        <option value="Gaming">Gaming</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Smart Home">Smart Home</option>
                        <option value="Cameras">Cameras</option>
                        <option value="Drones">Drones</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Available Colors</label>
                    <input
                        type="text"
                        name="colors"
                        value={formData.colors}
                        onChange={handleChange}
                        placeholder="Comma separated (e.g. Black, White, Red)"
                    />
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div className="form-group">
                        <label>Price (₹)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Discount (%)</label>
                        <input
                            type="number"
                            name="discount"
                            value={formData.discount || 0}
                            onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                        />
                    </div>
                </div>

                <div className="form-group" style={{ marginTop: '1rem', background: 'var(--bg-secondary)', padding: '15px', borderRadius: '8px' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', color: 'var(--primary)' }}>Sales & Discounts</h3>
                    
                    <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                name="upcomingSale"
                                checked={formData.upcomingSale}
                                onChange={handleChange}
                                style={{ width: 'auto' }}
                            />
                            Mark as Upcoming Sale (Wait for Sale Start Date)
                        </label>
                    </div>

                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div className="form-group">
                            <label>Sale Start Date</label>
                            <input
                                type="date"
                                name="saleStartDate"
                                value={formData.saleStartDate}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Sale End Date</label>
                            <input
                                type="date"
                                name="saleEndDate"
                                value={formData.saleEndDate}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Bank / Card Offers</label>
                        <input
                            type="text"
                            name="bankOffers"
                            value={formData.bankOffers}
                            onChange={handleChange}
                            placeholder="e.g. HDFC 10% Off, SBI 5% Cashback"
                        />
                    </div>
                </div>

                <div className="form-group image-input-group">
                    <label>Product Image</label>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            <input
                                type="text"
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                placeholder="https://example.com/image.jpg"
                            />
                            <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>
                                Paste a URL to a high-quality product image.
                            </p>
                        </div>
                        <div className="image-preview-container" style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '12px',
                            border: '2px dashed #444',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#1a1a1a'
                        }}>
                            {formData.image ? (
                                <img
                                    src={formData.image}
                                    alt="Preview"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => e.target.src = 'https://placehold.co/120x120/1a1a1a/FFF?text=Error'}
                                />
                            ) : (
                                <span style={{ fontSize: '0.7rem', color: '#666' }}>No Image</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label>3D Model URL (.glb or .gltf) [Optional]</label>
                    <input
                        type="text"
                        name="threeDModelUrl"
                        value={formData.threeDModelUrl || ''}
                        onChange={handleChange}
                        placeholder="https://example.com/model.glb"
                    />
                    <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>
                        Provide a link to a 3D model to enable AR/3D viewing on the product page.
                    </p>
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        style={{ minHeight: '120px' }}
                    ></textarea>
                </div>

                <button type="submit" className="btn btn-primary">
                    {isEditMode ? 'Update Product' : 'Add Product'}
                </button>
            </form>
        </div>
    );
};

export default AdminAddProduct;
