import React, { useEffect, useState } from 'react';
import { withdraw } from '../../utils/axios';

function Withdrawreq({ userId }) {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWithdrawals = async () => {
            try {
                setLoading(true);
                setError(null); // Reset error before each request

                const response = await withdraw.get(`/user/${userId}`);
                console.log('Withdrawal data:', response.data);

                // Handle different response formats
                let data = [];
                if (Array.isArray(response.data)) {
                    data = response.data;
                } else if (response.data && typeof response.data === 'object') {
                    data = [response.data];
                }

                setWithdrawals(data);

                if (data.length === 0) {
                    setError('No withdrawal requests found');
                }
            } catch (err) {
                console.error('Withdrawal fetch error:', err);
                setError('Failed to fetch withdrawals. Please try again later.');
                setWithdrawals([]); // Clear previous data on error
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchWithdrawals();
        } else {
            setError('User ID is required');
            setLoading(false);
        }
    }, [userId]);

    // Display loading state
    if (loading) return <div>Loading withdrawal requests...</div>;

    return (
        <div>
            <h3>Withdrawal Requests</h3>

            {/* Show error message if exists, but only if no data to display */}
            {error && withdrawals.length === 0 && (
                <div className="error-message">{error}</div>
            )}

            {/* Show withdrawals if available */}
            {withdrawals.length > 0 ? (
                <ul>
                    {withdrawals.map((withdrawal, index) => (
                        <li key={index}>
                            <p><strong>Amount:</strong> {withdrawal.amount}</p>
                            <p><strong>Account Name:</strong> {withdrawal.accountName}</p>
                            <p><strong>Account Number:</strong> {withdrawal.accountNumber}</p>
                            <p><strong>Trading Account ID:</strong> {withdrawal.tradingAccountId}</p>
                            <p><strong>Created At:</strong> {new Date(withdrawal.createdAt).toLocaleString()}</p>
                            <p><strong>Status:</strong> {withdrawal.status || 'Pending'}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                /* Only show "no withdrawals" message if there's no error */
                !error && <div>No withdrawal requests available.</div>
            )}
        </div>
    );
}

export default Withdrawreq;