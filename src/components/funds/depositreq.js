import React, { useEffect, useState } from 'react';
import { deposit } from '../../utils/axios';
import { FaTrash } from 'react-icons/fa';
import "./depreq.css";

function Depositreq({ userId }) {
    const [deposits, setDeposits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [rejectingId, setRejectingId] = useState(null); // for reject button loading

    const fetchDeposits = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await deposit.get(`/user/${userId}`);
            const data = Array.isArray(response.data) ? response.data : response.data ? [response.data] : [];

            setDeposits(data);

            if (data.length === 0) {
                setError('No deposit requests found.');
            }
        } catch (err) {
            console.error('Deposit fetch error:', err);
            if (err.response && err.response.status === 404) {
                setError('No deposit requests found.');
            } else {
                setError('Failed to fetch deposits. Please try again.');
            }
            setDeposits([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchDeposits();
        } else {
            setLoading(false);
            setError('No user ID provided');
        }
    }, [userId]);

    const handleDelete = async (depositId) => {
        try {
            setDeletingId(depositId);
            await deposit.delete(`/${depositId}`);
            await fetchDeposits();
        } catch (err) {
            console.error('Delete error:', err);
            setError('Failed to delete deposit request. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleReject = async (depositId) => {
        try {
            setRejectingId(depositId);
            await deposit.patch(`/${depositId}`, {
                status: 'rejected',
            });
            await fetchDeposits();
        } catch (err) {
            console.error('Reject error:', err);
            setError('Failed to reject deposit request. Please try again.');
        } finally {
            setRejectingId(null);
        }
    };

    if (loading) return <div>Loading deposit requests...</div>;

    return (
        <div className="deposit-requests-container">
            <h3>Deposit Requests</h3>
            {error && <div className="error-message">{error}</div>}

            {deposits.length > 0 ? (
                <ul className="deposit-list">
                    {deposits.map((deposit) => (
                        <li key={deposit._id} className="deposit-item">
                            <div className="deposit-info">
                                <p><strong>Amount:</strong> {deposit.amount}</p>
                                <p><strong>Trading Account ID:</strong> {deposit.tradingAccountId}</p>
                                <p><strong>Status:</strong> {deposit.status}</p>
                                <p><strong>Created At:</strong> {new Date(deposit.createdAt).toLocaleString()}</p>
                                {deposit.image && (
                                    <>
                                        <img src={deposit.image} alt="Deposit Proof" width={100} />
                                        <br />
                                        <a href={deposit.image} target="_blank" rel="noopener noreferrer">Preview</a>
                                    </>
                                )}
                            </div>
                            <div className="action-buttons">
                                <button
                                    className="delete-button"
                                    onClick={() => handleDelete(deposit._id)}
                                    disabled={deletingId === deposit._id}
                                >
                                    {deletingId === deposit._id ? 'Deleting...' : <FaTrash />}
                                </button>

                                <button
                                    className="reject-button"
                                    onClick={() => handleReject(deposit._id)}
                                    disabled={rejectingId === deposit._id || deposit.status === 'rejected'}
                                >
                                    {rejectingId === deposit._id ? 'Rejecting...' : 'Reject'}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                !error && <div>No deposit requests available.</div>
            )}
        </div>
    );
}

export default Depositreq;
