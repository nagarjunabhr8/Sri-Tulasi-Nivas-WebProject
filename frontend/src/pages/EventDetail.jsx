import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../utils/api';
import { useAuthStore } from '../store/authStore';

const EventDetail = () => {
  const { id } = useParams();
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuthStore();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${id}`);
      setEvent(response.data);
    } catch (err) {
      setError('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();

    if (!user) {
      setError('Please log in to contribute');
      return;
    }

    if (!stripe || !elements || !amount) {
      setError('Please fill in all fields');
      return;
    }

    setProcessing(true);

    try {
      // Create payment intent
      const intentResponse = await api.post('/payments/create-intent', null, {
        params: {
          userId: user.id,
          eventId: id,
          amount: parseFloat(amount),
        },
      });

      const { clientSecret } = intentResponse.data;

      // Confirm payment
      const cardElement = elements.getElement(CardElement);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: user.firstName },
        },
      });

      if (result.error) {
        setError(result.error.message);
      } else {
        setError('');
        setAmount('');
        alert('Thank you for your contribution!');
        fetchEvent();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="container"><p>Loading event...</p></div>;
  if (!event) return <div className="container"><p>Event not found</p></div>;

  const progress = (event.totalContributed / event.estimatedBudget) * 100;

  return (
    <div className="container event-detail">
      <h1>{event.title}</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="event-detail-content">
        <div className="event-info">
          <p><strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString()}</p>
          <p><strong>Location:</strong> {event.location}</p>
          <p><strong>Status:</strong> {event.status}</p>
          <p><strong>Description:</strong> {event.description}</p>

          <div className="progress-section">
            <h3>Fundraising Progress</h3>
            <div className="progress-bar">
              <div className="progress" style={{ width: `${Math.min(progress, 100)}%` }}></div>
            </div>
            <p>${event.totalContributed} raised of ${event.estimatedBudget}</p>
            <p>Contributors: {event.contributionCount}</p>
          </div>
        </div>

        {user && (
          <div className="contribution-form">
            <h3>Make a Contribution</h3>
            <form onSubmit={handleContribute}>
              <div className="form-group">
                <label htmlFor="amount">Amount ($)</label>
                <input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>

              <div className="form-group">
                <label>Card Details</label>
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                      },
                    },
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={processing || !stripe}
              >
                {processing ? 'Processing...' : 'Contribute Now'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetail;
