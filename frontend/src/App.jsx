/**
 * App — top-level component wiring together wallet sign-in and the core
 * DFMS features: upload, file list, ZK proof verification, and permissions.
 */
import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import ProofVerifier from './components/ProofVerifier';
import PermissionsManager from './components/PermissionsManager';
import { signIn, signOut, getStoredAddress } from './services/web3';
import './styles/App.css';

export default function App() {
  const [address, setAddress] = useState(getStoredAddress());
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setAddress(getStoredAddress());
  }, []);

  async function handleSignIn() {
    setError('');
    try {
      const addr = await signIn();
      setAddress(addr);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleSignOut() {
    signOut();
    setAddress(null);
  }

  function handleUploaded(fileData) {
    setFiles((prev) => [...prev, fileData]);
  }

  return (
    <div className="app">
      <header>
        <h1>DFMS — Decentralised File Management System</h1>
        <p className="subtitle">IPFS storage + blockchain ownership + zero-knowledge access control</p>
        {address ? (
          <div className="wallet-status">
            <span>{address.slice(0, 6)}…{address.slice(-4)}</span>
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
        ) : (
          <button onClick={handleSignIn}>Connect Wallet</button>
        )}
        {error && <p className="error">{error}</p>}
      </header>

      {address ? (
        <main>
          <FileUpload onUploaded={handleUploaded} />
          <FileList files={files} />
          <ProofVerifier />
          <PermissionsManager />
        </main>
      ) : (
        <p className="hint">Connect your wallet to upload, verify, and manage files.</p>
      )}
    </div>
  );
}
