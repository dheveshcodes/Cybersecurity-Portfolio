/**
 * FileUpload — lets a signed-in user select and upload a file, which is
 * pinned to IPFS and registered on-chain via the backend API.
 */
import React, { useState } from 'react';
import { uploadFile } from '../services/api';

export default function FileUpload({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleUpload() {
    if (!file) return;
    setStatus('uploading');
    setError('');
    try {
      const data = await uploadFile(file);
      setResult(data);
      setStatus('done');
      onUploaded && onUploaded(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setStatus('error');
    }
  }

  return (
    <div className="card">
      <h3>Upload a File</h3>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} disabled={!file || status === 'uploading'}>
        {status === 'uploading' ? 'Uploading…' : 'Upload to IPFS'}
      </button>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="result">
          <p><strong>CID:</strong> {result.cid}</p>
          <p><strong>Size:</strong> {result.size} bytes</p>
          <p><strong>Tx Hash:</strong> {result.txHash}</p>
          <a href={result.gatewayUrl} target="_blank" rel="noreferrer">View on IPFS Gateway</a>
        </div>
      )}
    </div>
  );
}
