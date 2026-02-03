import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { FileText, Download, Upload, File, Lock } from 'lucide-react';
import { BaseButton } from './BaseButton';
import { useNotificationStore } from '../store/notificationStore';

const DocumentVault = ({ propertyId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { showNotification } = useNotificationStore();

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/properties/documents/');
      let data = res.data.results || res.data;
      if (propertyId) {
        data = data.filter(d => d.property === parseInt(propertyId));
      }
      setDocuments(data);
    } catch (err) {
      console.error(err);
      showNotification('Failed to load documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    formData.append('category', 'other');
    if (propertyId) formData.append('property', propertyId);

    try {
      await api.post('/properties/documents/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showNotification('Document uploaded securely', 'success');
      fetchDocuments();
    } catch (err) {
      showNotification('Upload failed', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const downloadDoc = async (doc) => {
    try {
      const response = await api.get(`/properties/documents/${doc.id}/download/`, {
          responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.file.split('/').pop());
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      showNotification('Download failed', 'error');
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [propertyId]);

  return (
    <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-surface-100 flex justify-between items-center bg-surface-50/50">
        <div>
          <h3 className="text-lg font-bold text-surface-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-600" />
              Document Vault
          </h3>
          <p className="text-xs text-surface-500 font-medium">Secure storage for legal agreements</p>
        </div>
        <div>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} />
          <BaseButton size="sm" loading={uploading} onClick={() => fileInputRef.current.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Upload
          </BaseButton>
        </div>
      </div>
      
      {loading ? (
        <div className="p-8 flex justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full" />
        </div>
      ) : documents.length === 0 ? (
        <div className="p-12 text-center text-surface-400">
            <FileText className="w-6 h-6 mx-auto mb-2 opacity-20" />
            <p className="text-xs">No documents in vault.</p>
        </div>
      ) : (
        <div className="divide-y divide-surface-100">
            {documents.map(doc => (
                <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-surface-50 transition-colors group">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <File className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-surface-900">{doc.title}</div>
                            <div className="text-[10px] uppercase tracking-wider font-bold text-surface-400">{doc.category}</div>
                        </div>
                    </div>
                    <button onClick={() => downloadDoc(doc)} className="p-2 text-surface-400 hover:text-brand-600 opacity-0 group-hover:opacity-100 transition-all">
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default DocumentVault;