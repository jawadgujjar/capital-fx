import React, { useEffect, useState } from 'react';
import { depdraw } from '../../utils/axios';  // Axios instance for depdraw

function Transhistory({ userId }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await depdraw.get(`/${userId}`);
                console.log(response.data, "Transaction History");

                const data = Array.isArray(response.data) ? response.data : [response.data];
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
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {transactions.map((transaction, index) => {
                    const isDeposit = Boolean(transaction.deposit);
                    const amount = transaction.deposit || transaction.withdraw;
                    const type = isDeposit ? 'Deposit' : 'Withdraw';
                    const color = isDeposit ? 'green' : 'red';

                    return (
                        <li key={index} style={{ marginBottom: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>
                            <p style={{ color, fontWeight: 'bold' }}>
                                {type} of ${amount}
                            </p>
                            <p><strong>Amount:</strong> ${amount}</p>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default Transhistory;
