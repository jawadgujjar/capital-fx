import React, { useEffect, useState } from 'react';
import { depdraw } from '../../utils/axios';  // Assuming you have the axios instance setup for 'depdraw'

function Transhistory({ userId }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                // Fetch both deposit and withdrawal data by passing userId to depdraw API
                const response = await depdraw.get(`/${userId}`);
                console.log(response.data, "Transaction History");

                // Check if data is an array or object and format it accordingly
                const data = Array.isArray(response.data) ? response.data : [response.data];

                // Set transactions to state
                setTransactions(data);
            } catch (err) {
                setError('Failed to fetch transaction history');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchTransactions();
        }
    }, [userId]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (transactions.length === 0) return <div>No transactions available.</div>;

    return (
        <div>
            <h3>Transaction History</h3>
            <ul>
                {transactions.map((transaction, index) => (
                    <li key={index}>
                        <p>
                            <strong>
                                {transaction.deposit ? 'Deposit' : 'Withdraw'} of ${transaction.deposit || transaction.withdraw}
                            </strong>
                        </p>
                        <p><strong>Amount:</strong> {transaction.amount}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Transhistory;
