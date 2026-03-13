import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiRotateCw,
    FiMaximize2,
    FiMinimize2,
    FiZoomIn,
    FiZoomOut,
    FiPlay,
    FiPause,
    FiX,
    FiInfo,
    FiCheck
} from 'react-icons/fi';
import SciFiHUD from '../../../shared/components/ui/SciFiHUD';
import './ProductViewer360.css';

const ProductViewer360 = ({ product, isOpen, onClose }) => {
    const [rotation, setRotation] = useState(0);
    const [isAutoRotating, setIsAutoRotating] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activeFeature, setActiveFeature] = useState(0);

    const containerRef = useRef(null);
    const dragStartX = useRef(0);
    const lastRotation = useRef(0);
    const autoRotateRef = useRef(null);

    // Feature highlights based on rotation angle
    const featureAngles = [
        { angle: 0, title: 'Front View', icon: <FiInfo /> },
        { angle: 90, title: 'Side Profile', icon: <FiCheck /> },
        { angle: 180, title: 'Back Design', icon: <FiInfo /> },
        { angle: 270, title: 'Other Side', icon: <FiCheck /> }
    ];

    // Update active feature based on rotation
    useEffect(() => {
        const normalizedRotation = ((rotation % 360) + 360) % 360;
        if (normalizedRotation >= 315 || normalizedRotation < 45) {
            setActiveFeature(0);
        } else if (normalizedRotation >= 45 && normalizedRotation < 135) {
            setActiveFeature(1);
        } else if (normalizedRotation >= 135 && normalizedRotation < 225) {
            setActiveFeature(2);
        } else {
            setActiveFeature(3);
        }
    }, [rotation]);

    // Auto-rotate effect
    useEffect(() => {
        if (isAutoRotating) {
            autoRotateRef.current = setInterval(() => {
                setRotation(prev => prev + 0.5);
            }, 16);
        }
        return () => clearInterval(autoRotateRef.current);
    }, [isAutoRotating]);

    // Mouse/Touch drag handlers
    const handleDragStart = (e) => {
        setIsDragging(true);
        setIsAutoRotating(false);
        dragStartX.current = e.clientX || e.touches?.[0]?.clientX || 0;
        lastRotation.current = rotation;
    };

    const handleDragMove = (e) => {
        if (!isDragging) return;
        const currentX = e.clientX || e.touches?.[0]?.clientX || 0;
        const deltaX = currentX - dragStartX.current;
        setRotation(lastRotation.current + deltaX * 0.5);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.6));

    const toggleFullscreen = () => setIsFullscreen(!isFullscreen);
    const toggleAutoRotate = () => setIsAutoRotating(!isAutoRotating);

    // Create product specs array for display
    const productSpecs = product?.specs ? Object.entries(product.specs) : [];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                className={`viewer360-overlay ${isFullscreen ? 'fullscreen' : ''}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <motion.div
                    className="viewer360-container"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25 }}
                >
                    {/* Close Button */}
                    <button className="viewer360-close" onClick={onClose}>
                        <FiX />
                    </button>

                    {/* Header */}
                    <div className="viewer360-header">
                        <div className="viewer360-title">
                            <span className="viewer360-badge">360Â°</span>
                            <h3>{product?.name}</h3>
                        </div>
                        <div className="viewer360-rotation-indicator">
                            <FiRotateCw className={isAutoRotating ? 'spinning' : ''} />
                            <span>{Math.round(((rotation % 360) + 360) % 360)}Â°</span>
                        </div>
                    </div>

                    <div className="viewer360-content">
                        {/* Main Viewer */}
                        <div
                            className="viewer360-stage"
                            ref={containerRef}
                            onMouseDown={handleDragStart}
                            onMouseMove={handleDragMove}
                            onMouseUp={handleDragEnd}
                            onMouseLeave={handleDragEnd}
                            onTouchStart={handleDragStart}
                            onTouchMove={handleDragMove}
                            onTouchEnd={handleDragEnd}
                        >
                            <SciFiHUD />
                            {product?.spritesheet ? (
                                <div
                                    className="viewer360-spritesheet"
                                    style={{
                                        backgroundImage: `url(${product.spritesheet})`,
                                        backgroundPosition: `0 ${-(Math.floor(((rotation % 360) + 360) % 360 / (360 / (product.frameCount || 1))) * 100)}%`,
                                        backgroundSize: `100% ${(product.frameCount || 1) * 100}%`,
                                        transform: `scale(${zoom})`,
                                        cursor: isDragging ? 'grabbing' : 'grab'
                                    }}
                                />
                            ) : (
                                <motion.div
                                    className="viewer360-product"
                                    style={{
                                        transform: `perspective(1000px) rotateY(${rotation}deg) scale(${zoom})`,
                                        cursor: isDragging ? 'grabbing' : 'grab'
                                    }}
                                    animate={{
                                        rotateY: rotation,
                                        scale: zoom
                                    }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                >
                                    <img
                                        src={product?.image}
                                        alt={product?.name}
                                        draggable="false"
                                    />

                                    {/* Reflection Effect */}
                                    <div className="viewer360-reflection">
                                        <img
                                            src={product?.image}
                                            alt=""
                                            draggable="false"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* Drag Hint */}
                            <div className="viewer360-hint">
                                <FiRotateCw />
                                <span>Drag to rotate</span>
                            </div>

                            {/* Controls */}
                            <div className="viewer360-controls">
                                <button
                                    className={`control-btn ${isAutoRotating ? 'active' : ''}`}
                                    onClick={toggleAutoRotate}
                                    title={isAutoRotating ? 'Pause' : 'Auto Rotate'}
                                >
                                    {isAutoRotating ? <FiPause /> : <FiPlay />}
                                </button>
                                <button
                                    className="control-btn"
                                    onClick={handleZoomIn}
                                    title="Zoom In"
                                    disabled={zoom >= 2}
                                >
                                    <FiZoomIn />
                                </button>
                                <button
                                    className="control-btn"
                                    onClick={handleZoomOut}
                                    title="Zoom Out"
                                    disabled={zoom <= 0.6}
                                >
                                    <FiZoomOut />
                                </button>
                                <button
                                    className="control-btn"
                                    onClick={toggleFullscreen}
                                    title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                                >
                                    {isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
                                </button>
                            </div>
                        </div>

                        {/* Features Side Panel */}
                        <div className="viewer360-features">
                            <div className="features-header">
                                <h4>Product Features</h4>
                                <p className="features-subtitle">Explore as you rotate</p>
                            </div>

                            {/* View Indicators */}
                            <div className="view-indicators">
                                {featureAngles.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        className={`view-indicator ${activeFeature === index ? 'active' : ''}`}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => setRotation(feature.angle)}
                                    >
                                        <div className="indicator-icon">{feature.icon}</div>
                                        <span>{feature.title}</span>
                                        <span className="indicator-angle">{feature.angle}Â°</span>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Specifications */}
                            <div className="features-specs">
                                <h5>Specifications</h5>
                                <ul className="specs-list">
                                    {productSpecs.map(([key, value], index) => (
                                        <motion.li
                                            key={key}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 + index * 0.05 }}
                                        >
                                            <span className="spec-label">{key}</span>
                                            <span className="spec-value">{value}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            {/* Price Badge */}
                            <motion.div
                                className="features-price"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <span className="price-label">Price</span>
                                <span className="price-value">₹{product?.price?.toLocaleString('en-IN')}</span>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ProductViewer360;
