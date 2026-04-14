import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, publicApi } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Monitor, Video, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Volume2, VolumeX } from 'lucide-react';

const FISIPOL_PINK = '#FF00BB';

const DisplayControl = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [displayMode, setDisplayMode] = useState('queue');
  const [externalVideoUrl, setExternalVideoUrl] = useState('');
  const [videoSound, setVideoSound] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await publicApi.getDisplaySettings();
      if (response.data.success) {
        setDisplayMode(response.data.data.display_mode);
        setExternalVideoUrl(response.data.data.external_video_url || '');
        setVideoSound(response.data.data.video_sound || false);
      }
    } catch (error) {
      console.error('Failed to fetch display settings:', error);
      setMessage({ type: 'error', text: 'Gagal memuat pengaturan display' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const response = await adminApi.updateDisplaySettings({
        display_mode: displayMode,
        external_video_url: externalVideoUrl,
        video_sound: videoSound,
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Pengaturan display berhasil disimpan' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Failed to update display settings:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Gagal menyimpan pengaturan display'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: FISIPOL_PINK }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Display Control</h1>
            <p className="text-gray-600">Kontrol mode tampilan display antrian</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {/* Display Mode Settings */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" style={{ color: FISIPOL_PINK }} />
              Mode Tampilan Display
            </CardTitle>
            <CardDescription>
              Pilih mode tampilan untuk halaman display antrian
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Display Mode Radio Buttons */}
            <div className="space-y-4">
              <Label className="text-base font-semibold text-gray-700">Display Mode</Label>

              <div className="space-y-3">
                {/* Queue Mode */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    displayMode === 'queue'
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="displayMode"
                    value="queue"
                    checked={displayMode === 'queue'}
                    onChange={(e) => setDisplayMode(e.target.value)}
                    className="mt-1"
                    style={{ accentColor: FISIPOL_PINK }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Monitor className="w-5 h-5" style={{ color: FISIPOL_PINK }} />
                      <span className="font-semibold text-gray-900">Queue Mode</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Tampilkan UI antrian normal (nomor antrian, loket, statistik, video banner)
                    </p>
                  </div>
                </label>

                {/* Video Mode */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    displayMode === 'video'
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="displayMode"
                    value="video"
                    checked={displayMode === 'video'}
                    onChange={(e) => setDisplayMode(e.target.value)}
                    className="mt-1"
                    style={{ accentColor: FISIPOL_PINK }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Video className="w-5 h-5" style={{ color: FISIPOL_PINK }} />
                      <span className="font-semibold text-gray-900">Video Mode (Idle)</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Sembunyikan UI antrian, tampilkan video YouTube fullscreen
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* YouTube Video URL */}
            <div className="space-y-2">
              <Label htmlFor="videoUrl" className="text-base font-semibold text-gray-700">
                YouTube Video URL
              </Label>
              <Input
                id="videoUrl"
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={externalVideoUrl}
                onChange={(e) => setExternalVideoUrl(e.target.value)}
                className="text-base"
              />
              <p className="text-sm text-gray-500">
                URL video YouTube yang akan ditampilkan saat mode Video aktif
              </p>
            </div>

            {/* Video Sound Control */}
            <div className="space-y-2">
              <Label className="text-base font-semibold text-gray-700">
                Video Sound
              </Label>

              <div className="space-y-3">
                {/* Mute Video */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    !videoSound
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="videoSound"
                    value="false"
                    checked={!videoSound}
                    onChange={() => setVideoSound(false)}
                    className="mt-1"
                    style={{ accentColor: FISIPOL_PINK }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <VolumeX className="w-5 h-5" style={{ color: FISIPOL_PINK }} />
                      <span className="font-semibold text-gray-900">Mute Video</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Video akan diputar tanpa suara (default)
                    </p>
                  </div>
                </label>

                {/* Enable Sound */}
                <label
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    videoSound
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="videoSound"
                    value="true"
                    checked={videoSound}
                    onChange={() => setVideoSound(true)}
                    className="mt-1"
                    style={{ accentColor: FISIPOL_PINK }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Volume2 className="w-5 h-5" style={{ color: FISIPOL_PINK }} />
                      <span className="font-semibold text-gray-900">Enable Sound</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Video akan diputar dengan suara
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="text-white px-8 py-2 rounded-xl font-semibold hover:scale-105 transition-all"
                style={{ background: `linear-gradient(135deg, ${FISIPOL_PINK} 0%, #CC0099 100%)` }}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Pengaturan'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 space-y-1">
                <p className="font-semibold">Informasi:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Display page akan update otomatis tanpa reload</li>
                  <li>Mode Queue: tampilkan antrian normal seperti biasa</li>
                  <li>Mode Video: sembunyikan semua UI antrian, tampilkan video fullscreen</li>
                  <li>Switching dilakukan manual oleh admin, tidak otomatis</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DisplayControl;
