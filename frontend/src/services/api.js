/**
 * Thin axios wrapper for talking to the DFMS backend API.
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const client = axios.create({ baseURL: API_BASE_URL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('dfms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await client.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function downloadFile(cid) {
  const { data } = await client.get(`/files/${cid}`, { responseType: 'blob' });
  return data;
}

export async function getFileMetadata(cid) {
  const { data } = await client.get(`/files/${cid}/metadata`);
  return data;
}

export async function generateProof(ownerSecret, commitment) {
  const { data } = await client.post('/proofs/generate', { ownerSecret, commitment });
  return data;
}

export async function verifyProof(proof, publicSignals) {
  const { data } = await client.post('/proofs/verify', { proof, publicSignals });
  return data;
}

export async function grantAccess(cid, grantee) {
  const { data } = await client.post('/access/grant', { cid, grantee });
  return data;
}

export async function revokeAccess(cid, grantee) {
  const { data } = await client.post('/access/revoke', { cid, grantee });
  return data;
}

export default client;
