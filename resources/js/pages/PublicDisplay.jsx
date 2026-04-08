import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicApi } from '@/services/api';
import { Users, Clock, RefreshCw, ArrowLeft, LogOut, WifiOff, Maximize, Minimize, Video, MapPin, Volume2 } from 'lucide-react';
import { initSpeechEngine, enqueueSpeech, unlockAudioSystem } from '@/lib/speechEngine';

const FISIPOL_PINK = '#FF00BB';

const PublicDisplay = () => {
  const navigate = useNavigate();
  const [displayData, setDisplayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [youtubePlaylistUrl, setYoutubePlaylistUrl] = useState(null);
  const [showUnlockScreen, setShowUnlockScreen] = useState(true);

  const lastQueueId = useRef(null);
  const pollingIntervalRef = useRef(null);
  const speechInitialized = useRef(false);

  const isAdmin = localStorage.getItem('admin_token');

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const handleUnlockAudio = async () => {
    console.log('[Display] User clicked to unlock audio');
    const success = await unlockAudioSystem();

    if (success) {
      setShowUnlockScreen(false);
      window.dispatchEvent(new Event('audioUnlocked'));
    } else {
      console.error('[Display] Failed to unlock audio, please try again');
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!speechInitialized.current) {
      console.log('[Display] Initializing speech system...');
      initSpeechEngine();
      speechInitialized.current = true;
    }
  }, []);

  const fetchAppSettings = async () => {
    try {
      const response = await publicApi.getAppSettings();
      if (response.data.success && response.data.data.youtube_playlist_url) {
        setYoutubePlaylistUrl(response.data.data.youtube_playlist_url);
        console.log('[Display] YouTube playlist loaded');
      }
    } catch (err) {
      console.error('[Display] Failed to fetch app settings:', err);
    }
  };

  const fetchDisplayData = async () => {
    try {
      setError(null);
      const response = await publicApi.getDisplayData();
      const data = response.data.data;

      if (data.current && data.current.queue_id) {
        if (data.current.queue_id !== lastQueueId.current) {
          console.log('[Display] Queue changed from', lastQueueId.current, 'to', data.current.queue_id);

          lastQueueId.current = data.current.queue_id;

          enqueueSpeech({
            number: data.current.queue_number,
            counter: data.current.counter_number,
            counterName: data.current.counter_name,
            service: data.current.service_name
          });
        }
      }

      setDisplayData(data);
    } catch (err) {
      console.error('[Display] Failed to fetch display data:', err);
      setError('Gagal mengambil data dari server. Pastikan server berjalan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[Display] Starting display page...');

    fetchAppSettings();
    fetchDisplayData();

    pollingIntervalRef.current = setInterval(() => {
      fetchDisplayData();
    }, 2000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        console.log('[Display] Polling stopped');
      }
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const extractPlaylistId = (url) => {
    if (!url) return null;
    const match = url.match(/[?&]list=([^&]+)/);
    return match ? match[1] : null;
  };

  const playlistId = extractPlaylistId(youtubePlaylistUrl);
  const youtubeEmbedUrl = playlistId
    ? `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&mute=1&loop=1&controls=0&modestbranding=1&rel=0&playsinline=1`
    : null;

  if (loading) {
    return (
      <div
        className="h-screen flex flex-col items-center justify-center gap-6 relative"
        style={{ background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 0, 187, 0.12) 100%)' }}
      >
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,0,187,0.06) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative z-10 flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 rounded-full" style={{ borderColor: 'rgba(255,0,187,0.2)' }} />
            <div className="w-20 h-20 border-4 border-t-transparent rounded-full animate-spin absolute top-0 left-0" style={{ borderColor: FISIPOL_PINK }} />
          </div>
          <p className="text-gray-600 text-xl font-semibold">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error && !displayData) {
    return (
      <div
        className="h-screen flex items-center justify-center p-4 relative"
        style={{ background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 0, 187, 0.12) 100%)' }}
      >
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,0,187,0.06) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative z-10 text-center max-w-md">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 mb-6">
            <WifiOff className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Koneksi Gagal</h2>
          <p className="text-gray-500 mb-8">{error}</p>
          <button
            onClick={fetchDisplayData}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-white transition-all hover:scale-105 shadow-lg"
            style={{ background: `linear-gradient(135deg, ${FISIPOL_PINK} 0%, #CC0099 100%)` }}
          >
            <RefreshCw className="w-5 h-5" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const { current, stats } = displayData || {};

  return (
    <div
      className="h-screen text-gray-900 relative overflow-hidden flex flex-col"
      style={{ background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 0, 187, 0.12) 100%)' }}
    >
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,0,187,0.05) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      {/* FISIPOL pink soft blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ background: 'rgba(255, 0, 187, 0.07)' }} />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" style={{ background: 'rgba(255, 0, 187, 0.07)' }} />

      {/* Audio Unlock Screen */}
      {showUnlockScreen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{
            background: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="text-center animate-fade-in">
            <div
              className="inline-flex items-center justify-center w-32 h-32 rounded-full mb-8 animate-pulse"
              style={{ background: 'rgba(255, 0, 187, 0.2)' }}
            >
              <Volume2 className="w-16 h-16" style={{ color: FISIPOL_PINK }} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              Sistem Antrian SIANFIS
            </h1>
            <p className="text-xl text-white/70 mb-8 max-w-md mx-auto">
              Klik tombol di bawah untuk mengaktifkan pengumuman suara antrian
            </p>
            <button
              onClick={handleUnlockAudio}
              className="inline-flex items-center gap-4 px-12 py-6 text-white rounded-2xl font-bold text-2xl hover:scale-105 transition-all shadow-2xl"
              style={{ background: `linear-gradient(135deg, ${FISIPOL_PINK} 0%, #CC0099 100%)` }}
            >
              <Volume2 className="w-8 h-8" />
              Aktifkan Suara
            </button>
            <p className="text-sm text-white/40 mt-6">
              Diperlukan sekali saat pertama membuka display
            </p>
          </div>
        </div>
      )}

      <div className="relative z-10 p-4 md:p-6 flex flex-col h-full">
        {/* Header */}
        <header className="flex justify-between items-center mb-4 animate-fade-in flex-shrink-0">
          <div className="flex items-center gap-4">
            <img src="/assets/LOGO_UMA.png" alt="Logo" className="h-10 md:h-12 object-contain drop-shadow" />
            <img src="/assets/unggul.png" alt="Logo" className="h-10 md:h-12 object-contain drop-shadow" />
            {/* FISIPOL accent bar */}
            <div className="hidden md:block h-10 w-1 rounded-full ml-1" style={{ background: FISIPOL_PINK }} />
            <span className="hidden md:block text-sm font-bold tracking-wider" style={{ color: FISIPOL_PINK }}>
              FISIPOL UMA
            </span>
          </div>
          <div className="text-right">
            <p className="text-2xl md:text-3xl font-mono font-black tracking-wider text-gray-800">
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
            <p className="text-gray-500 text-sm md:text-base">
              {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </header>

        {/* Main Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
          {/* Left: Video/YouTube panel */}
          <div className="lg:col-span-2 animate-slide-up min-h-0">
            <div className="bg-white/70 rounded-2xl h-full flex flex-col justify-center items-center border shadow-xl overflow-hidden relative" style={{ borderColor: 'rgba(255,0,187,0.15)' }}>
              {youtubeEmbedUrl ? (
                <iframe
                  src={youtubeEmbedUrl}
                  className="absolute inset-0 w-full h-full"
                  style={{
                    pointerEvents: 'none',
                    border: 'none',
                  }}
                  allow="autoplay"
                  title="YouTube Playlist Background"
                />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(255,0,187,0.05) 0%, rgba(255,0,187,0.12) 100%)' }}
                >
                  <div className="text-center animate-fade-in p-8">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4" style={{ background: 'rgba(255,0,187,0.08)' }}>
                      <Video className="w-12 h-12" style={{ color: 'rgba(255,0,187,0.3)' }} />
                    </div>
                    <p className="text-lg text-gray-400">Background Display</p>
                    <p className="text-sm text-gray-300 mt-2">Set YouTube Playlist di pengaturan</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Queue info panel */}
          <div className="flex flex-col gap-3 min-h-0">
            {/* Queue number card */}
            <div
              className="bg-white rounded-xl p-4 shadow-lg animate-slide-up flex-shrink-0 border"
              style={{ borderColor: 'rgba(255,0,187,0.15)' }}
            >
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-700">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,0,187,0.1)' }}>
                  <MapPin className="w-4 h-4" style={{ color: FISIPOL_PINK }} />
                </div>
                Nomor Antrian Dipanggil
              </h3>

              {current ? (
                <div className="text-center animate-scale-in">
                  <div className="queue-display relative mb-3">
                    <div className="absolute inset-0 blur-2xl rounded-full" style={{ background: 'rgba(255,0,187,0.12)' }} />
                    <p
                      className="text-[48px] md:text-[64px] font-black leading-none relative drop-shadow"
                      style={{ color: FISIPOL_PINK }}
                    >
                      {current.queue_number}
                    </p>
                  </div>

                  <div
                    className="rounded-xl px-6 py-3 shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${FISIPOL_PINK} 0%, #CC0099 100%)` }}
                  >
                    <p className="text-sm text-white/80 mb-1 font-medium">SILAKAN MENUJU</p>
                    <p className="text-2xl md:text-3xl font-black text-white">
                      LOKET {current.counter_number}
                    </p>
                  </div>

                  <p className="mt-3 text-sm text-gray-600 font-medium">
                    {current.service_name}
                  </p>
                </div>
              ) : (
                <div className="text-center animate-fade-in py-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-2" style={{ background: 'rgba(255,0,187,0.06)' }}>
                    <Clock className="w-8 h-8" style={{ color: 'rgba(255,0,187,0.25)' }} />
                  </div>
                  <p className="text-3xl font-black text-gray-200 mb-2">---</p>
                  <p className="text-sm text-gray-400">Menunggu panggilan</p>
                </div>
              )}
            </div>

            {/* Stats card */}
            <div
              className="bg-white rounded-xl p-3 shadow-lg border animate-slide-up flex-shrink-0"
              style={{ borderColor: 'rgba(255,0,187,0.15)' }}
            >
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-gray-700">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Users className="w-4 h-4 text-gray-500" />
                </div>
                Statistik Hari Ini
              </h3>
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-amber-50 rounded-lg p-2 text-center border border-amber-200">
                  <p className="text-xl md:text-2xl font-bold text-amber-600">{stats?.waiting || 0}</p>
                  <p className="text-xs text-gray-500">Menunggu</p>
                </div>
                <div className="bg-green-50 rounded-lg p-2 text-center border border-green-200">
                  <p className="text-xl md:text-2xl font-bold text-green-600">{stats?.done || 0}</p>
                  <p className="text-xs text-gray-500">Selesai</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-200">
                  <p className="text-xl md:text-2xl font-bold text-blue-600">{stats?.called || 0}</p>
                  <p className="text-xs text-gray-500">Dipanggil</p>
                </div>
                <div className="rounded-lg p-2 text-center border" style={{ background: 'rgba(255,0,187,0.05)', borderColor: 'rgba(255,0,187,0.2)' }}>
                  <p className="text-xl md:text-2xl font-bold" style={{ color: FISIPOL_PINK }}>{stats?.total || 0}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
            </div>

            {/* Controls card */}
            <div
              className="bg-white rounded-xl p-3 shadow-lg border animate-slide-up flex-shrink-0"
              style={{ borderColor: 'rgba(255,0,187,0.15)' }}
            >
              <h3 className="text-sm font-semibold mb-2 text-gray-700">Kontrol</h3>
              <div className="flex gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 font-medium text-sm w-full justify-center border border-gray-200"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  {isFullscreen ? 'Keluar Fullscreen' : 'Fullscreen'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Marquee ticker */}
        <div
          className="mt-3 rounded-lg py-2 px-4 overflow-hidden border animate-fade-in flex-shrink-0"
          style={{ background: 'rgba(255,0,187,0.04)', borderColor: 'rgba(255,0,187,0.12)' }}
        >
          <div className="animate-marquee whitespace-nowrap">
            <span className="text-gray-500 text-sm">
              • Harap menunggu dengan tertib • Nomor antrian akan dipanggil secara berurutan •
              Pastikan Anda berada di area tunggu • Terima kasih atas kesabaran Anda •
              SIANFIS - Sistem Informasi Antrian Fisipol •
            </span>
          </div>
        </div>

        <footer className="mt-2 text-center text-gray-400 text-xs flex-shrink-0">
          <p>Sistem Antrian Digital © 2026 • SIANFIS - Sistem Informasi Antrian Fisipol</p>
        </footer>
      </div>

      {/* Admin floating buttons */}
      {isAdmin && !isFullscreen && (
        <div className="fixed bottom-4 left-4 z-50 flex gap-2 animate-slide-up">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium text-sm shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm shadow-lg"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default PublicDisplay;
