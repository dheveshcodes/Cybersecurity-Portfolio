/**
 * FileList — displays previously uploaded files (tracked client-side for
 * this demo) with buttons to download or inspect on-chain metadata.
 */
import React, { useState } from 'react';
import { downloadFile, getFileMetadata } from '../services/api';

export default function FileList({ files }) {
  const [metadata, setMetadata] = useState({});

  async function handleDownload(cid, name) {
    const blob = await downloadFile(cid);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name || cid;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  async function handleInspect(cid) {
    const data = await getFileMetadata(cid);
    setMetadata((prev) => ({ ...prev, [cid]: data }));
  }

  if (!files.length) return <p>No files uploaded yet.</p>;

  return (
    <div className="card">
      <h3>Your Files</h3>
      <ul className="file-list">
        {files.map((f) => (
          <li key={f.cid}>
            <span className="cid">{f.cid}</span>
            <div className="actions">
              <button onClick={() => handleDownload(f.cid)}>Download</button>
              <button onClick={() => handleInspect(f.cid)}>Inspect</button>
            </div>
            {metadata[f.cid] && (
              <pre className="metadata">{JSON.stringify(metadata[f.cid], null, 2)}</pre>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
