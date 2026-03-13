import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './HeroSlider.css';

const slides = [
    {
        id: 1,
        title: "The Sound of Perfection",
        subtitle: "Experience spatial audio like never before with our new Pro series.",
        cta: "Explore Pro Series",
        link: "/shop",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop"
    },
    {
        id: 2,
        title: "Future on Your Wrist",
        subtitle: "The all-new Watch GT4 with advanced health tracking and 2-week battery life.",
        cta: "Pre-order Now",
        link: "/shop",
        image: "https://images.unsplash.com/photo-1544117518-2b49c71e3984?q=80&w=2070&auto=format&fit=crop"
    },
    {
        id: 3,
        title: "Ultra Performance",
        subtitle: "Designed for creators. Powered by the latest architecture.",
        cta: "Shop Laptops",
        link: "/shop",
        image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=2032&auto=format&fit=crop"
    }
];

const HeroSlider = () => {
    const [current, setCurrent] = useState(0);

    const nextSlide = () => {
        setCurrent(current === slides.length - 1 ? 0 : current + 1);
    };

    const prevSlide = () => {
        setCurrent(current === 0 ? slides.length - 1 : current - 1);
    };

    useEffect(() => {
        const interval = setInterval(nextSlide, 5000); // Auto slide every 5s
        return () => clearInterval(interval);
    }, [current]);

    return (
        <div className="hero-slider">
            <button className="slider-btn prev" onClick={prevSlide}><FaChevronLeft /></button>
            <button className="slider-btn next" onClick={nextSlide}><FaChevronRight /></button>

            <div className="slides-container" style={{ transform: `translateX(-${current * 100}%)` }}>
                {slides.map((slide) => (
                    <div
                        className="slide"
                        key={slide.id}
                        style={{ backgroundImage: `url(${slide.image})` }}
                    >
                        <div className="slide-overlay"></div>
                        <div className="hologram-overlay"></div>
                        <div className="slide-content">
                            <h2 className="slide-title">{slide.title}</h2>
                            <p className="slide-subtitle">{slide.subtitle}</p>
                            <Link to={slide.link} className="slide-cta">{slide.cta}</Link>
                        </div>
                    </div>
                ))}
            </div>

            <div className="slider-dots">
                {slides.map((_, idx) => (
                    <div
                        key={idx}
                        className={`dot ${idx === current ? 'active' : ''}`}
                        onClick={() => setCurrent(idx)}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroSlider;
