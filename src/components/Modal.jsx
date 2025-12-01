import React from 'react';
export default function Modal({ open, onClose, children, width = 'max-w-xl' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={`bg-white rounded-lg shadow-lg w-full ${width} overflow-auto`}> 
        <div className="p-4">
          {children}
        </div>
        <div className="absolute top-3 right-3">
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">✕</button>
        </div>
      </div>
    </div>
  );
}
