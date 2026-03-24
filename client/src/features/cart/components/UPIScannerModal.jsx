import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQrcode, FaTimes } from 'react-icons/fa';
import './UPIScannerModal.css';

const UPIScannerModal = ({ isVisible, amount, onClose, onPaymentComplete }) => {
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
    const transactionId = React.useMemo(() => `ELECTRO_${Math.floor(100000 + Math.random() * 900000)}`, [isVisible]);

    useEffect(() => {
        if (!isVisible) return;
        setTimeLeft(300); // Reset timer when modal opens

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onClose?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isVisible, onClose]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="upi-modal-overlay">
                    <motion.div
                        className="upi-modal"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    >
                        <button className="close-modal" onClick={onClose}><FaTimes /></button>

                        <div className="upi-modal-header">
                            <div className="qr-icon-wrap">
                                <FaQrcode />
                            </div>
                            <h3>Scan & Pay</h3>
                            <p>Transaction ID: #{transactionId}</p>
                        </div>

                        <div className="qr-container">
                            {/* Standard UPI Deep Link: upi://pay?pa=VPA&pn=NAME&am=AMOUNT&cu=CURRENCY&tn=NOTE&tr=TXNID */}
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=7339627727@oksbi&pn=ElectroStore&am=${amount.toFixed(2)}&cu=INR&tn=Order_Payment&tr=${transactionId}`)}`}
                                alt="UPI QR Code"
                            />
                            <div className="qr-overlay">
                                <span>Scan with any UPI App</span>
                            </div>
                        </div>

                        <div className="modal-info">
                            <div className="amount-display">
                                <span>Amount to Pay</span>
                                <strong>₹{amount?.toLocaleString('en-IN')}</strong>
                            </div>

                            <div className="timer-display">
                                <span>Link expires in</span>
                                <strong className={timeLeft < 60 ? 'red' : ''}>{formatTime(timeLeft)}</strong>
                            </div>
                        </div>

                        <div className="instructions">
                            <ol>
                                <li>Open any UPI App (PhonePe, Google Pay, Paytm, etc.)</li>
                                <li>Scan the QR code shown above</li>
                                <li>Enter your UPI PIN to complete payment in your app</li>
                                <li>Return here and confirm after payment is successful</li>
                            </ol>
                        </div>

                        <button className="btn btn-confirm" onClick={onPaymentComplete}>
                            I Have Completed Payment
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UPIScannerModal;
