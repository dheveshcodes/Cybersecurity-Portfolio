/**
 * PermissionsManager — lets a file owner grant or revoke access to other
 * wallet addresses for a specific CID.
 */
import React, { useState } from 'react';
import { grantAccess, revokeAccess } from '../services/api';

export default function PermissionsManager() {
  const [cid, setCid] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleGrant() {
    setError('');
    try {
      const data = await grantAccess(cid, address);
      setMessage(`Access granted. Tx: ${data.txHash}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  }

  async function handleRevoke() {
    setError('');
    try {
      const data = await revokeAccess(cid, address);
      setMessage(`Access revoked. Tx: ${data.txHash}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  }

  return (
    <div className="card">
      <h3>Manage File Permissions</h3>
      <input type="text" placeholder="File CID" value={cid} onChange={(e) => setCid(e.target.value)} />
      <input
        type="text"
        placeholder="Wallet address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <div className="actions">
        <button onClick={handleGrant}>Grant Access</button>
        <button onClick={handleRevoke}>Revoke Access</button>
      </div>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
