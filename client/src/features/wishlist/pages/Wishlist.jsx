import { useState, useMemo } from 'react';
import { useWishlist } from '../../wishlist/context/WishlistContext';
import ProductCard from '../../products/components/ProductCard';
import { Link } from 'react-router-dom';
import { FaHeart, FaSearch } from 'react-icons/fa';
import '../../products/pages/Shop.css'; // Reusing shop grid styles

const Wishlist = () => {
    const { wishlist } = useWishlist();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredWishlist = useMemo(() => {
        if (!searchTerm.trim()) return wishlist;
        return wishlist.filter(product => 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [wishlist, searchTerm]);

    return (
        <div className="wishlist-page container" style={{ padding: '2rem 0', minHeight: '60vh' }}>
            <div className="shop-header" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <FaHeart style={{ color: '#ff4757', fontSize: '2rem' }} />
                    <h2 className="section-title" style={{ margin: 0 }}>My Wishlist</h2>
                </div>
                
                {wishlist.length > 0 && (
                    <div style={{ position: 'relative', minWidth: '250px' }}>
                        <input 
                            type="text" 
                            placeholder="Search wishlist..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 15px 10px 40px',
                                borderRadius: '25px',
                                border: '1px solid var(--border-medium)',
                                background: 'var(--bg-card)',
                                color: 'var(--text-light)',
                                outline: 'none'
                            }}
                        />
                        <FaSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-gray)' }} />
                    </div>
                )}
            </div>

            {wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                    <p style={{ color: 'var(--text-gray)', fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                        Your wishlist is empty.
                    </p>
                    <Link to="/shop" className="btn btn-primary">Go Shopping</Link>
                </div>
            ) : (
                <div className="product-grid">
                    {filteredWishlist.length > 0 ? (
                        filteredWishlist.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-gray)' }}>
                            No items in your wishlist match "{searchTerm}".
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
