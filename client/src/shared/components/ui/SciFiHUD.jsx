import { motion } from 'framer-motion';
import './SciFiHUD.css';

const SciFiHUD = () => {
    return (
        <div className="sci-fi-hud">
            {/* Corners */}
            <div className="hud-corner top-left"></div>
            <div className="hud-corner top-right"></div>
            <div className="hud-corner bottom-left"></div>
            <div className="hud-corner bottom-right"></div>

            {/* Rotating Rings */}
            <motion.div
                className="hud-ring ring-outer"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
                <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.5" fill="none" strokeDasharray="10 5" />
                </svg>
            </motion.div>

            <motion.div
                className="hud-ring ring-middle"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            >
                <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="1 4" />
                </svg>
            </motion.div>

            <motion.div
                className="hud-ring ring-inner"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
                <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="0.5" fill="none" strokeDasharray="20 10" />
                </svg>
            </motion.div>

            {/* Target Reticle */}
            <div className="hud-data data-left">
                <div className="data-item">
                    <span className="label">SCANNING</span>
                    <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="value"
                    >
                        ACTIVE
                    </motion.span>
                </div>
                <div className="data-item">
                    <span className="label">OBJECT</span>
                    <span className="value">QUALIFIED</span>
                </div>
            </div>

            <div className="hud-data data-right">
                <div className="data-item">
                    <span className="label">SYNC</span>
                    <span className="value">100%</span>
                </div>
                <div className="data-item">
                    <span className="label">HUD</span>
                    <span className="value">v2.0</span>
                </div>
            </div>

            {/* Target Reticle */}
            <div className="hud-reticle">
                <div className="reticle-line vert"></div>
                <div className="reticle-line horiz"></div>
            </div>
        </div>
    );
};

export default SciFiHUD;
