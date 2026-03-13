import { useEffect, useState } from 'react';
import { FiMaximize, FiMinimize } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ProductModelViewer = ({ modelUrl, productName }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        // Dynamically inject the @google/model-viewer script if it doesn't exist
        if (!document.querySelector('script[src*="model-viewer"]')) {
            const script = document.createElement('script');
            script.type = 'module';
            script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
            document.head.appendChild(script);
        }
    }, []);

    if (!modelUrl) return null;

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const viewerStyle = isFullscreen ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        background: 'var(--bg-dark)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    } : {
        width: '100%',
        height: '400px',
        position: 'relative',
        background: 'var(--bg-secondary)',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid var(--border-medium)'
    };

    return (
        <div style={viewerStyle}>
            {/* The model-viewer component built by Google */}
            <model-viewer
                src={modelUrl}
                alt={`A 3D model of ${productName}`}
                auto-rotate
                camera-controls
                shadow-intensity="1"
                environment-image="neutral"
                exposure="1.2"
                style={{ width: '100%', height: '100%' }}
                interaction-prompt="hover"
            >
                <button slot="ar-button" style={{ 
                    backgroundColor: 'white', 
                    borderRadius: '4px', 
                    border: 'none', 
                    position: 'absolute', 
                    top: '16px', 
                    right: '16px', 
                    padding: '8px' 
                }}>
                    👋 Activate AR
                </button>
            </model-viewer>

            <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleFullscreen}
                style={{
                    position: 'absolute',
                    bottom: '15px',
                    right: '15px',
                    background: 'var(--primary-gradient)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    zIndex: 10
                }}
            >
                {isFullscreen ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
            </motion.button>
        </div>
    );
};

export default ProductModelViewer;
