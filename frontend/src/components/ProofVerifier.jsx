/**
 * ProofVerifier — lets a user generate a zero-knowledge ownership proof
 * from a secret + commitment, then verify it, without ever transmitting
 * the raw secret to any party other than the local proof generator.
 */
import React, { useState } from 'react';
import { generateProof, verifyProof } from '../services/api';

export default function ProofVerifier() {
  const [ownerSecret, setOwnerSecret] = useState('');
  const [commitment, setCommitment] = useState('');
  const [proofData, setProofData] = useState(null);
  const [verification, setVerification] = useState(null);
  const [error, setError] = useState('');

  async function handleGenerate() {
    setError('');
    try {
      const data = await generateProof(ownerSecret, commitment);
      setProofData(data);
      setVerification(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  }

  async function handleVerify() {
    if (!proofData) return;
    setError('');
    try {
      const data = await verifyProof(proofData.proof, proofData.publicSignals);
      setVerification(data.valid);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  }

  return (
    <div className="card">
      <h3>Prove File Ownership (Zero-Knowledge)</h3>
      <p className="hint">
        Your secret never leaves this proof — only a mathematical proof that
        you know it is shared.
      </p>
      <input
        type="password"
        placeholder="Owner secret"
        value={ownerSecret}
        onChange={(e) => setOwnerSecret(e.target.value)}
      />
      <input
        type="text"
        placeholder="Public commitment"
        value={commitment}
        onChange={(e) => setCommitment(e.target.value)}
      />
      <div className="actions">
        <button onClick={handleGenerate}>Generate Proof</button>
        <button onClick={handleVerify} disabled={!proofData}>Verify Proof</button>
      </div>

      {error && <p className="error">{error}</p>}
      {verification !== null && (
        <p className={verification ? 'success' : 'error'}>
          {verification ? '✅ Proof is valid' : '❌ Proof is invalid'}
        </p>
      )}
    </div>
  );
}
