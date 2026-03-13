import { useState, useEffect } from 'react';
import './CountdownTimer.css';

const CountdownTimer = ({ endDate }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const difference = new Date(endDate) - new Date();

        if (difference <= 0) {
            return null;
        }

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
        };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [endDate]);

    if (!timeLeft) {
        return (
            <div className="countdown-timer expired">
                <span className="expired-text">SALE ENDED</span>
            </div>
        );
    }

    const formatNumber = (num) => String(num).padStart(2, '0');

    return (
        <div className="countdown-timer">
            <div className="timer-label">ENDS IN</div>
            <div className="timer-display">
                {timeLeft.days > 0 && (
                    <>
                        <div className="timer-unit">
                            <span className="timer-value">{formatNumber(timeLeft.days)}</span>
                            <span className="timer-text">D</span>
                        </div>
                        <span className="timer-separator">:</span>
                    </>
                )}
                <div className="timer-unit">
                    <span className="timer-value">{formatNumber(timeLeft.hours)}</span>
                    <span className="timer-text">H</span>
                </div>
                <span className="timer-separator">:</span>
                <div className="timer-unit">
                    <span className="timer-value">{formatNumber(timeLeft.minutes)}</span>
                    <span className="timer-text">M</span>
                </div>
                <span className="timer-separator">:</span>
                <div className="timer-unit">
                    <span className="timer-value">{formatNumber(timeLeft.seconds)}</span>
                    <span className="timer-text">S</span>
                </div>
            </div>
        </div>
    );
};

export default CountdownTimer;
