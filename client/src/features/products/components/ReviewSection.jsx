import { useState, useEffect } from 'react';
import { FaStar, FaUserCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../../../shared/constants/api';

const ReviewSection = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/reviews/${productId}`);
                if (response.ok) {
                    const data = await response.json();
                    setReviews(data);
                }
            } catch (error) {
                console.error("Failed to fetch reviews:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [productId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newReview.comment.trim()) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/reviews/${productId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rating: newReview.rating,
                    comment: newReview.comment,
                    user: 'Guest' // In a real app, this would be the logged in user
                })
            });

            if (response.ok) {
                const review = await response.json();
                setReviews([review, ...reviews]);
                setNewReview({ rating: 5, comment: '' });
                toast.success('Review submitted successfully!');
            } else {
                toast.error('Failed to submit review');
            }
        } catch (error) {
            console.error("Error submitting review:", error);
            toast.error('An error occurred');
        }
    };

    return (
        <div className="review-section">
            <h2 className="section-title">Customer Reviews</h2>

            <div className="reviews-grid">
                <div className="write-review">
                    <h3>Write a Review</h3>
                    <form onSubmit={handleSubmit} className="review-form">
                        <div className="rating-input">
                            <label>Rating:</label>
                            <div className="star-select">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <FaStar
                                        key={star}
                                        className={star <= newReview.rating ? 'star-active' : 'star-muted'}
                                        onClick={() => setNewReview({ ...newReview, rating: star })}
                                        style={{ cursor: 'pointer', fontSize: '1.5rem', color: star <= newReview.rating ? 'var(--primary)' : 'var(--text-dim)' }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="form-group">
                            <textarea
                                placeholder="Share your experience..."
                                value={newReview.comment}
                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                required
                                rows="4"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Submit Review</button>
                    </form>
                </div>

                <div className="reviews-list">
                    {reviews.map(review => (
                        <div key={review.id} className="review-card">
                            <div className="review-header">
                                <div className="reviewer-info">
                                    <FaUserCircle className="user-icon" />
                                    <span className="reviewer-name">{review.user}</span>
                                </div>
                                <span className="review-date">{new Date(review.createdAt || review.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>
                            <div className="review-rating">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar 
                                        key={i} 
                                        className={i < review.rating ? 'star-active' : 'star-muted'} 
                                        style={{ color: i < review.rating ? 'var(--primary)' : 'var(--text-dim)' }}
                                    />
                                ))}
                            </div>
                            <p className="review-text">{review.comment}</p>
                        </div>
                    ))}
                    {loading ? (
                        <p>Loading reviews...</p>
                    ) : reviews.length === 0 ? (
                        <p className="no-reviews">No reviews yet. Be the first to review!</p>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default ReviewSection;
