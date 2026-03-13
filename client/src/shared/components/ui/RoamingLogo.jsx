import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import './RoamingLogo.css';

const RoamingLogo = () => {
    const controls = useAnimation();
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getRandomPosition = () => ({
        x: Math.random() * (dimensions.width - 150),
        y: Math.random() * (dimensions.height - 150)
    });

    useEffect(() => {
        const startRoaming = async () => {
            while (true) {
                const pos = getRandomPosition();
                await controls.start({
                    x: pos.x,
                    y: pos.y,
                    transition: {
                        duration: Math.random() * 10 + 15, // Slow roaming
                        ease: "linear"
                    }
                });
            }
        };
        startRoaming();
    }, [controls, dimensions]);

    return (
        <div className="roaming-logo-container">
            <motion.div
                className="roaming-logo"
                initial={getRandomPosition()}
                animate={controls}
            >
                <img src="/khm-logo.png" alt="Roaming Logo" />
                <div className="logo-glow"></div>
            </motion.div>
        </div>
    );
};

export default RoamingLogo;
