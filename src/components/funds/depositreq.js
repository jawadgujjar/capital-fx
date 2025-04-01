import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { deposit } from '../../utils/axios';

function Depositreq({ userId }) {
    const [deposits, setDeposits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDeposits = async () => {
            try {
                const response = await deposit.get(`/user/${userId}`);
                const data = Array.isArray(response.data) ? response.data : [response.data];
                setDeposits(data);
            } catch (err) {
                setError('Failed to fetch deposits');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchDeposits();
        }
    }, [userId]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (deposits.length === 0) return <div>No deposits available.</div>;

    return (
        <div>
            <h3>Deposit Requests</h3>
            <ul>
                {deposits.map((deposit, index) => (
                    <li key={index}>
                        <p><strong>Amount:</strong> {deposit.amount}</p>
                        <p><strong>Trading Account ID:</strong> {deposit.tradingAccountId}</p>
                        <p><strong>Created At:</strong> {new Date(deposit.createdAt).toLocaleString()}</p>
                        <img src={deposit.image} alt="Deposit Proof" width={100} />
                        <br />
                        <a href={deposit.image} target="_blank" rel="noopener noreferrer">Preview</a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Depositreq;