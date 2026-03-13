import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMicrophone, FaStop, FaTerminal } from 'react-icons/fa';
import './VoiceSearch.css';

const VoiceSearch = ({ onResult, onClose }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState(null);

    const recognition = window.SpeechRecognition || window.webkitSpeechRecognition
        ? new (window.SpeechRecognition || window.webkitSpeechRecognition)()
        : null;

    useEffect(() => {
        if (!recognition) {
            setError('Speech recognition not supported in this browser.');
            return;
        }

        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.onresult = (event) => {
            const currentTranscript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');

            setTranscript(currentTranscript);

            if (event.results[0].isFinal) {
                stopListening();
                onResult(currentTranscript);
            }
        };

        recognition.onerror = (event) => {
            setError('ACCESS DENIED: ' + event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        return () => {
            recognition.stop();
        };
    }, [onResult]);

    const startListening = () => {
        if (recognition) {
            setTranscript('');
            recognition.start();
        }
    };

    const stopListening = () => {
        if (recognition) {
            recognition.stop();
            setIsListening(false);
        }
    };

    return (
        <div className="voice-search-overlay">
            <div className="voice-search-content glass">
                <div className="terminal-header">
                    <div className="header-left">
                        <FaTerminal className="terminal-icon" />
                        <span>SYSTEM_VOICE_CAPTURE.EXE</span>
                    </div>
                    <button className="close-voice" onClick={onClose} aria-label="Close">
                        <FaTimes />
                    </button>
                </div>

                <div className="voice-status">
                    {isListening ? (
                        <span className="status-listening">LISTENING_FOR_INPUT...</span>
                    ) : (transcript ? (
                        <span className="status-final">PROCESSING_QUERY...</span>
                    ) : (
                        <span className="status-ready">READY_FOR_VOICE_COMM</span>
                    ))}
                </div>

                <div className="waveform-container">
                    <AnimatePresence>
                        {isListening && (
                            <div className="waveform">
                                {[...Array(20)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="waveform-bar"
                                        animate={{
                                            height: [10, Math.random() * 60 + 20, 10],
                                        }}
                                        transition={{
                                            duration: 0.5,
                                            repeat: Infinity,
                                            delay: i * 0.05,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="transcript-display">
                    <span className="prompt">{"> "}</span>
                    <span className="text">{transcript || "____"}</span>
                    <span className="cursor">_</span>
                </div>

                {error && <div className="voice-error">{error}</div>}

                <div className="voice-controls">
                    {!isListening ? (
                        <motion.button
                            className="voice-btn start"
                            onClick={startListening}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaMicrophone /> INITIATE_CAPTURE
                        </motion.button>
                    ) : (
                        <motion.button
                            className="voice-btn stop"
                            onClick={stopListening}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaStop /> TERMINATE_SESSION
                        </motion.button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoiceSearch;
