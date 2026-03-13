import './LoadingScreen.css';

const LoadingScreen = () => {
    return (
        <div className="loading-screen">
            <div className="loading-content">
                <div className="logo-container">
                    <img src="/khm-logo.png" alt="KHM Logo" className="loading-logo" />
                    <div className="logo-glow"></div>
                </div>
                <div className="loading-spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                </div>
                <p className="loading-text">Loading<span className="dots"></span></p>
            </div>
        </div>
    );
};

export default LoadingScreen;
