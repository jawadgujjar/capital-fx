import React, { useEffect, useState } from 'react';
import { withdraw } from '../../utils/axios';
import { FaTrash } from 'react-icons/fa';
import './withdrawreq.css'; // Create this CSS file for styling

function Withdrawreq({ userId }) {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [rejectingId, setRejectingId] = useState(null); // For reject button loading

    const fetchWithdrawals = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await withdraw.get(`/user/${userId}`);
            console.log('Withdrawal data:', response.data);

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
            if (err.response && err.response.status === 404) {
                setError('No withdrawal requests found');
            } else {
                setError('Failed to fetch withdrawals. Please try again later.');
            }
            setWithdrawals([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchWithdrawals();
        } else {
            setError('User ID is required');
            setLoading(false);
        }
    }, [userId]);

    const handleDelete = async (withdrawalId) => {
        try {
            setDeletingId(withdrawalId);
            await withdraw.delete(`/${withdrawalId}`);
            await fetchWithdrawals(); // Refresh the list after deletion
        } catch (err) {
            console.error('Delete error:', err);
            setError('Failed to delete withdrawal request. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleReject = async (withdrawalId) => {
        try {
            setRejectingId(withdrawalId);
            await withdraw.patch(`/${withdrawalId}`, {
                status: 'rejected',
            });
            await fetchWithdrawals(); // Refresh the list after rejection
        } catch (err) {
            console.error('Reject error:', err);
            setError('Failed to reject withdrawal request. Please try again.');
        } finally {
            setRejectingId(null);
        }
    };

    if (loading) return <div>Loading withdrawal requests...</div>;

    return (
        <div className="withdraw-requests-container">
            <h3>Withdrawal Requests</h3>

            {error && withdrawals.length === 0 && (
                <div className="error-message">{error}</div>
            )}

            {withdrawals.length > 0 ? (
                <ul className="withdraw-list">
                    {withdrawals.map((withdrawal) => (
                        <li key={withdrawal._id} className="withdraw-item">
                            <div className="withdraw-info">
                                <p><strong>Amount:</strong> {withdrawal.amount}</p>
                                <p><strong>Account Name:</strong> {withdrawal.accountName}</p>
                                <p><strong>Account Number:</strong> {withdrawal.accountNumber}</p>
                                <p><strong>Trading Account ID:</strong> {withdrawal.tradingAccountId}</p>
                                <p><strong>Created At:</strong> {new Date(withdrawal.createdAt).toLocaleString()}</p>
                                <p><strong>Status:</strong> {withdrawal.status || 'Pending'}</p>
                            </div>
                            <div className="action-buttons">
                                <button
                                    className="delete-button"
                                    onClick={() => handleDelete(withdrawal._id)}
                                    disabled={deletingId === withdrawal._id}
                                >
                                    {deletingId === withdrawal._id ? 'Deleting...' : <FaTrash />}
                                </button>

                                <button
                                    className="reject-button"
                                    onClick={() => handleReject(withdrawal._id)}
                                    disabled={rejectingId === withdrawal._id || withdrawal.status === 'rejected'}
                                >
                                    {rejectingId === withdrawal._id ? 'Rejecting...' : 'Reject'}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                !error && <div>No withdrawal requests available.</div>
            )}
        </div>
    );
}

export default Withdrawreq;
