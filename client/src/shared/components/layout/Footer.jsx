import { Link } from 'react-router-dom';
import './Footer.css';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="electro-footer">
            {/* Yellow Support Bar */}
            <div className="support-bar">
                <div className="container nav-container">
                    <div className="support-item">
                        <span className="support-icon">📞</span>
                        <div className="support-text">
                            <strong>+19-9600882484</strong>
                            <span>24/7 Support for free shopping and consultancy</span>
                        </div>
                    </div>
                    <form className="support-newsletter">
                        <input type="email" placeholder="Enter your email" />
                        <button type="submit">Sign Up</button>
                    </form>
                </div>
            </div>

            <div className="container footer-main">
                <div className="footer-grid">
                    <div className="footer-col">
                        <h3 className="footer-logo-electro">KHM ELECTRONICS</h3>
                        <p className="footer-contact">
                            Got Questions? Call us 24/7!<br />
                            <strong>+19-9600882484</strong><br/>
                            <a href="mailto:mohamedirfan6604@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>mohamedirfan6604@gmail.com</a>
                        </p>
                        <p className="footer-address" style={{ marginTop: '10px' }}>
                            Polur Road, Bus Stand Opposite, Tiruvannamalai,<br/>
                            Tamil Nadu 606601<br/><br/>
                            <strong>GSTIN:</strong> 33AJYPI3741V1ZB
                        </p>
                    </div>


                    <div className="footer-col">
                        <h4>Customer Care</h4>
                        <ul>
                            <li><Link to="/profile">My Account</Link></li>
                            <li><Link to="/orders">Track your Order</Link></li>
                            <li><Link to="/wishlist">Wishlist</Link></li>
                            <li><Link to="/contact">Customer Service</Link></li>
                            <li><Link to="/contact">Returns/Exchange</Link></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="footer-bottom-electro">
                <div className="container nav-container">
                    <p>© Electro - All Rights Reserved</p>
                    <div className="payment-icons">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg" alt="Mastercard" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
