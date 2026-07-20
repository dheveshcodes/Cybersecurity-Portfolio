/**
 * Wallet connection + sign-in-with-Ethereum helper for the frontend.
 */
import { BrowserProvider } from 'ethers';
import client from './api';

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('No injected wallet found. Please install MetaMask.');
  }
  const provider = new BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  return { provider, signer, address };
}

/**
 * Performs the nonce-sign-verify login flow and stores the resulting JWT.
 */
export async function signIn() {
  const { signer, address } = await connectWallet();

  const { data } = await client.get(`/access/nonce/${address}`);
  const signature = await signer.signMessage(data.nonce);

  const loginRes = await client.post('/access/login', { address, signature });
  localStorage.setItem('dfms_token', loginRes.data.token);
  localStorage.setItem('dfms_address', address);

  return address;
}

export function signOut() {
  localStorage.removeItem('dfms_token');
  localStorage.removeItem('dfms_address');
}

export function getStoredAddress() {
  return localStorage.getItem('dfms_address');
}
