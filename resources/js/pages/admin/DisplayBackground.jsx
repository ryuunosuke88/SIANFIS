import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, publicApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import {
  ArrowLeft, Upload, Trash2, Loader2, CheckCircle,
  AlertCircle, Image, RefreshCw, ImageOff,
} from 'lucide-react';

const DisplayBackground = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [currentUrl, setCurrentUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [preview, setPreview] = useState(null); // local blob preview before upload
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');

  useEffect(() => {
    fetchCurrent();
  }, []);

  const fetchCurrent = async () => {
    setLoading(true);
    try {
      const response = await publicApi.getDisplayBackground();
      setCurrentUrl(response.data.data.url || null);
    } catch (err) {
      console.error('Failed to fetch background:', err);
      showMessage('Gagal memuat background saat ini', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(null), 5000);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side checks
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      showMessage('Format tidak didukung. Gunakan JPG, PNG, atau WEBP.', 'error');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      showMessage('Ukuran file melebihi 3 MB.', 'error');
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files[0];
    if (!file) {
      showMessage('Pilih file terlebih dahulu', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const response = await adminApi.uploadBackground(formData);
      if (response.data.success) {
        setCurrentUrl(response.data.data.url);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        showMessage('Background berhasil diperbarui!', 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.errors?.image?.[0]
        || err.response?.data?.message
        || 'Gagal mengunggah background';
      showMessage(msg, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Hapus background? Form tiket akan menggunakan gradient default.')) return;

    setDeleting(true);
    try {
      await adminApi.deleteBackground();
      setCurrentUrl(null);
      setPreview(null);
      showMessage('Background dihapus', 'success');
    } catch (err) {
      showMessage('Gagal menghapus background', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const cancelPreview = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 p-4 md:p-8">
      <div className="mesh-gradient" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Background Form Tiket</h1>
            <p className="text-white/60">Atur gambar latar halaman pengambilan tiket</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </div>

        {/* Message Alert */}
        {message && (
          <Card
            variant="elevated"
            className={`mb-6 ${messageType === 'success' ? 'border-l-4 border-green-500 bg-green-500/10' : 'border-l-4 border-red-500 bg-red-500/10'}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {messageType === 'success'
                  ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  : <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                }
                <p className={messageType === 'success' ? 'text-green-400' : 'text-red-400'}>
                  {message}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Card */}
          <Card variant="elevated">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Upload className="w-4 h-4 text-primary" />
                </div>
                Unggah Background
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {/* Drop zone */}
              <div
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors hover:border-primary/50 hover:bg-primary/5"
                style={{ borderColor: preview ? '#FF00BB' : undefined }}
                onClick={() => fileInputRef.current?.click()}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl shadow-lg mx-auto"
                  />
                ) : (
                  <>
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
                      <Image className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-foreground font-semibold mb-1">Klik untuk memilih gambar</p>
                    <p className="text-sm text-muted-foreground">JPG, PNG, WEBP — Maks 3 MB</p>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Actions */}
              {preview ? (
                <div className="flex gap-3">
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1"
                    size="lg"
                  >
                    {uploading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Mengunggah...</>
                    ) : (
                      <><Upload className="w-4 h-4 mr-2" />Simpan Background</>
                    )}
                  </Button>
                  <Button variant="outline" onClick={cancelPreview} disabled={uploading}>
                    Batal
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Pilih File
                </Button>
              )}

              {/* Info */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-400 space-y-1">
                    <p className="font-semibold">Tips gambar terbaik:</p>
                    <ul className="list-disc ml-4 space-y-0.5">
                      <li>Resolusi minimum: 1280 × 720px</li>
                      <li>Rasio: landscape (16:9) untuk tampilan optimal</li>
                      <li>Gambar akan di-resize otomatis jika melebihi 1920px</li>
                      <li>Pilih foto yang tidak terlalu ramai agar teks terbaca</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card variant="elevated">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Image className="w-4 h-4 text-primary" />
                  </div>
                  Background Aktif
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={fetchCurrent}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {currentUrl ? (
                <>
                  {/* Current image preview */}
                  <div className="relative rounded-2xl overflow-hidden border border-border shadow-material-2" style={{ height: '280px' }}>
                    <img
                      src={currentUrl}
                      alt="Current Background"
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay preview */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,0,187,0.25) 100%)',
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="rounded-xl px-6 py-3 text-center text-sm font-semibold text-gray-800"
                        style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)' }}
                      >
                        Preview dengan overlay
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-sm text-green-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    Background aktif — ditampilkan di halaman pengambilan tiket
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    {deleting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Menghapus...</>
                    ) : (
                      <><Trash2 className="w-4 h-4 mr-2" />Hapus Background</>
                    )}
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                  <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center">
                    <ImageOff className="w-10 h-10 text-muted-foreground/50" />
                  </div>
                  <div>
                    <p className="font-semibold text-muted-foreground">Belum ada background</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Form tiket akan menampilkan gradient default FISIPOL
                    </p>
                  </div>
                  <div
                    className="w-full rounded-xl border border-border overflow-hidden"
                    style={{ height: '80px', background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,0,187,0.13) 100%)' }}
                  />
                  <p className="text-xs text-muted-foreground/50">Gradient default (jika tidak ada background)</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DisplayBackground;
