import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Camera,
  RotateCcw,
  RotateCw,
  Gauge,
  Video as VideoIcon,
  Sparkles,
} from 'lucide-react';
import { useNoteSyncStore } from '../store/useNoteSyncStore';

interface VideoPlayerProps {
  onCaptureScreenshot?: (dataUrl: string, timestamp: number, formattedTime: string) => void;
  seekTime?: number | null;
  onSeekHandled?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  onCaptureScreenshot,
  seekTime,
  onSeekHandled,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { activeVideo, updateVideoProgress, addScreenshot } = useNoteSyncStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [flashScreenshotAlert, setFlashScreenshotAlert] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Reset error when video changes
  useEffect(() => {
    setVideoError(null);
  }, [activeVideo]);

  // Sync seek requests from note card clicks
  useEffect(() => {
    if (seekTime !== undefined && seekTime !== null && videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      if (onSeekHandled) onSeekHandled();
    }
  }, [seekTime]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((err) => console.log('Playback interrupted', err));
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTime(cur);
      if (activeVideo) {
        updateVideoProgress(activeVideo.id, cur);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  // Screenshot Capture tool using HTML5 Canvas
  const captureScreenshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      try {
        const dataUrl = canvas.toDataURL('image/png');
        const formatted = formatTime(currentTime);

        const newSc = addScreenshot({
          timestamp: currentTime,
          formattedTime: formatted,
          dataUrl,
        });

        if (onCaptureScreenshot) {
          onCaptureScreenshot(dataUrl, currentTime, formatted);
        }

        setFlashScreenshotAlert(true);
        setTimeout(() => setFlashScreenshotAlert(false), 2000);
      } catch (e) {
        console.error('Failed to capture frame screenshot due to CORS or video state', e);
      }
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleVideoError = () => {
    setVideoError('The remote video link failed to load. This can happen if Google Storage is blocked on your network or due to CORS limitations. You can upload any local video file (MP4/WebM) via the sidebar "Upload Video" button to run it offline.');
  };

  if (!activeVideo) {
    return (
      <div className="aspect-video bg-zinc-900 rounded-2xl flex flex-col items-center justify-center text-zinc-500 border border-zinc-800 p-6 space-y-3">
        <VideoIcon className="w-10 h-10 stroke-1 text-zinc-600" />
        <p className="text-xs">No video loaded. Select or upload a video to start taking notes.</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black border border-zinc-200 dark:border-zinc-800 shadow-md group transition-all">
      {/* Video Container */}
      <div className="relative aspect-video bg-black flex items-center justify-center">
        {videoError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-zinc-950 text-zinc-400 z-10 space-y-3">
            <VideoIcon className="w-10 h-10 stroke-1 text-red-400" />
            <p className="text-xs font-semibold text-zinc-200">Video Loading Failed</p>
            <p className="text-[11px] text-zinc-500 max-w-sm leading-relaxed">
              {videoError}
            </p>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={activeVideo.url}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onError={handleVideoError}
            onClick={togglePlay}
            crossOrigin="anonymous"
            className="w-full h-full object-contain cursor-pointer"
          />
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Screenshot Captured Flash Toast */}
        {flashScreenshotAlert && (
          <div className="absolute top-4 right-4 bg-zinc-900/90 text-white text-xs px-3 py-1.5 rounded-lg border border-zinc-700 backdrop-blur-md flex items-center space-x-2 animate-bounce z-20">
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>Frame Screenshot Saved!</span>
          </div>
        )}
      </div>

      {/* Custom Control Bar (Notion Clean Aesthetic) */}
      <div className="p-3 bg-zinc-950 text-white space-y-2 border-t border-zinc-800">
        {/* Timeline Bar */}
        <div className="flex items-center space-x-2 text-[11px] font-mono text-zinc-400">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-zinc-800 accent-indigo-500 rounded-lg cursor-pointer hover:h-2 transition-all"
          />
          <span>{formatTime(duration)}</span>
        </div>

        {/* Action Controls Row */}
        <div className="flex items-center justify-between pt-1">
          {/* Left: Playback & Skip */}
          <div className="flex items-center space-x-2">
            <button
              onClick={togglePlay}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-all"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={() => skipTime(-10)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
              title="Rewind 10s"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => skipTime(10)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
              title="Forward 10s"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Volume */}
            <div className="flex items-center space-x-1 pl-2 border-l border-zinc-800">
              <button
                onClick={toggleMute}
                className="p-1 text-zinc-400 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-zinc-800 accent-zinc-400 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Right: Screenshot, Speed, Fullscreen */}
          <div className="flex items-center space-x-2">
            {/* Capture Frame Button */}
            <button
              onClick={captureScreenshot}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-xs font-medium transition-all"
              title="Capture Video Frame Screenshot"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Capture Frame</span>
            </button>

            {/* Playback Speed Select */}
            <div className="relative group/speed">
              <button className="flex items-center space-x-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-md text-xs font-mono text-zinc-300">
                <Gauge className="w-3 h-3 text-zinc-400" />
                <span>{playbackSpeed}x</span>
              </button>
              <div className="absolute right-0 bottom-full mb-1 hidden group-hover/speed:flex flex-col bg-zinc-900 border border-zinc-800 rounded-lg p-1 space-y-1 shadow-lg z-30">
                {[0.5, 1, 1.25, 1.5, 2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => handleSpeedChange(spd)}
                    className={`px-2.5 py-1 text-[11px] rounded text-left font-mono transition-colors ${
                      playbackSpeed === spd
                        ? 'bg-indigo-600 text-white'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
              title="Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
