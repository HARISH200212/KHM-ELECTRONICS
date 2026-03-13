import { Link } from 'react-router-dom';
import { useCart } from '../../cart/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import './Cart.css';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();

    if (cartItems.length === 0) {
        return (
            <motion.div
                className="cart-page container empty-cart"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <h2>Your Cart is Empty</h2>
                <p>Looks like you haven't added anything yet.</p>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <div className="cart-page container">
            <motion.h2
                className="section-title"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                Your Cart
            </motion.h2>

            <div className="cart-grid">
                <div className="cart-items">
                    <AnimatePresence>
                        {cartItems.map(item => (
                            <motion.div
                                key={item.id}
                                className="cart-item"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                layout
                            >
                                <div className="cart-item-img">
                                    <img src={item.image} alt={item.name} />
                                </div>
                                <div className="cart-item-info">
                                    <h3>{item.name}</h3>
                                    <p className="cart-item-price">₹{item.price.toLocaleString('en-IN')}</p>
                                </div>
                                <div className="cart-item-actions">
                                    <div className="quantity-selector small">
                                        <motion.button whileTap={{ scale: 0.8 }} onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</motion.button>
                                        <span>{item.quantity}</span>
                                        <motion.button whileTap={{ scale: 0.8 }} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</motion.button>
                                    </div>
                                    <motion.button
                                        className="remove-btn"
                                        onClick={() => removeFromCart(item.id)}
                                        whileHover={{ color: '#ef4444' }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        Remove
                                    </motion.button>
                                </div>
                                <div className="cart-item-total">
                                    Total: <span className="highlight">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <motion.div
                    className="cart-summary"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <h3>Order Summary</h3>
                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="summary-row">
                        <span>Shipping</span>
                        <span>Free</span>
                    </div>
                    <div className="summary-total">
                        <span>Total</span>
                        <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link to="/checkout" className="btn btn-primary checkout-btn">Proceed to Checkout</Link>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default Cart;
