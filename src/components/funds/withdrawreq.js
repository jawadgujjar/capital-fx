import React, { useEffect, useState } from 'react';
import { withdraw } from '../../utils/axios';

function Withdrawreq({ userId }) {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWithdrawals = async () => {
            try {
                // Hit the withdraw API endpoint and send userId
                const response = await withdraw.get(`/user/${userId}`);
                console.log(response.data, "jwdsduh");

                // Check if the data is an array, if it's an object, convert to array
                const data = Array.isArray(response.data) ? response.data : [response.data];

                setWithdrawals(data); // Store the withdrawal data
            } catch (err) {
                setError('Failed to fetch withdrawal requests');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchWithdrawals();
        }
    }, [userId]);

    // Loading, error handling and empty data states
    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (withdrawals.length === 0) return <div>No withdrawals available.</div>;

    return (
        <div>
            <h3>Withdrawal Requests</h3>
            <ul>
                {withdrawals.map((withdrawal, index) => (
                    <li key={index}>
                        <p><strong>Amount:</strong> {withdrawal.amount}</p>
                        <p><strong>Account Name:</strong> {withdrawal.accountName}</p>
                        <p><strong>Account Number:</strong> {withdrawal.accountNumber}</p>
                        <p><strong>Trading Account ID:</strong> {withdrawal.tradingAccountId}</p>
                        <p><strong>Created At:</strong> {new Date(withdrawal.createdAt).toLocaleString()}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Withdrawreq;
