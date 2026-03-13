import './AboutUs.css';

const AboutUs = () => {
    return (
        <div className="about-page">
            <div className="about-hero">
                <div className="container">
                    <h1 className="about-title">About KH Electronics</h1>
                    <p className="about-subtitle">Your Premier Destination for Gaming & Electronics</p>
                </div>
            </div>

            <div className="container about-content">
                <section className="about-section">
                    <div className="glass about-card">
                        <h2>ðŸŽ® Our Mission</h2>
                        <p>
                            At KH Electronics, we're passionate about bringing the latest and greatest in gaming technology and electronics to enthusiasts worldwide. Our mission is to provide top-tier products that enhance your gaming experience and daily tech needs.
                        </p>
                    </div>

                    <div className="glass about-card">
                        <h2>âš¡ What We Offer</h2>
                        <p>
                            From cutting-edge gaming peripherals to premium audio equipment and smart devices, we curate only the best products. Every item in our catalog is selected for quality, performance, and innovation.
                        </p>
                        <ul className="features-list">
                            <li>ðŸŽ§ Premium Gaming Headsets & Audio</li>
                            <li>âŒ¨ï¸ Mechanical Keyboards & Mice</li>
                            <li>ðŸ“± Latest Smart Devices & Gadgets</li>
                            <li>ðŸ–¥ï¸ High-Performance Accessories</li>
                        </ul>
                    </div>

                    <div className="glass about-card">
                        <h2>ðŸ† Why Choose Us</h2>
                        <div className="why-grid">
                            <div className="why-item">
                                <span className="why-icon">âœ“</span>
                                <div>
                                    <h3>Quality Assured</h3>
                                    <p>Only authentic, high-quality products</p>
                                </div>
                            </div>
                            <div className="why-item">
                                <span className="why-icon">âœ“</span>
                                <div>
                                    <h3>Fast Shipping</h3>
                                    <p>Quick delivery to your doorstep</p>
                                </div>
                            </div>
                            <div className="why-item">
                                <span className="why-icon">âœ“</span>
                                <div>
                                    <h3>Expert Support</h3>
                                    <p>24/7 customer service team</p>
                                </div>
                            </div>
                            <div className="why-item">
                                <span className="why-icon">âœ“</span>
                                <div>
                                    <h3>Best Prices</h3>
                                    <p>Competitive pricing guaranteed</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass about-card">
                        <h2>ðŸ’¡ Our Story</h2>
                        <p>
                            Founded by gaming enthusiasts for gaming enthusiasts, KH Electronics started with a simple vision: to create a one-stop shop for premium gaming gear and electronics. What began as a small operation has grown into a trusted name in the industry, serving thousands of satisfied customers.
                        </p>
                        <p>
                            We believe that everyone deserves access to high-quality tech that enhances their digital lifestyle. That's why we're committed to offering not just products, but complete solutions for gamers, professionals, and tech lovers alike.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AboutUs;
