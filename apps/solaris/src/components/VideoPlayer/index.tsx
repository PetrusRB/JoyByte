"use client"
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react';
import { cn } from '@/libs/utils';

interface VideoPlayerProps {
  src: string;
  title?: string;
  width?: number | string;
  height?: number | string;
  autoPlay?: boolean;
  playing?: boolean;
  loop?: boolean;
  className?: string;
}

interface QualityOption {
  label: string;
  value: string;
  src: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = React.memo(({ src, title, loop, autoPlay }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedQuality, setSelectedQuality] = useState('1080p');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Memoized quality options to prevent unnecessary re-creation
  const qualityOptions = useMemo<QualityOption[]>(
    () => [
      { label: '4K', value: '4k', src },
      { label: '1080p', value: '1080p', src },
      { label: '720p', value: '720p', src },
      { label: '480p', value: '480p', src },
    ],
    [src]
  );

  // Memoized event handlers
  const handleLoadStart = useCallback(() => setIsLoading(true), []);
  const handleCanPlay = useCallback(() => setIsLoading(false), []);
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  }, []);
  const handleDurationChange = useCallback(() => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  }, []);
  const handleVolumeChange = useCallback(() => {
    if (videoRef.current) {
      setVolume(videoRef.current.volume);
      setIsMuted(videoRef.current.muted);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [handleLoadStart, handleCanPlay, handleTimeUpdate, handleDurationChange, handleVolumeChange]);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(() => {}); // Handle play promise rejection
      setIsPlaying(true);
    }
  }, [isPlaying]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [togglePlayPause]);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressBar = progressRef.current;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const handleVolumeSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;

    video.volume = newVolume;
    video.muted = newVolume === 0;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, []);

  const skipBackward = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, video.currentTime - 10);
  }, []);

  const skipForward = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(duration, video.currentTime + 10);
  }, [duration]);

  const formatTime = useCallback((time: number): string => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    return hours > 0
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      : `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    if (isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  const handleMouseMove = useCallback(() => showControlsTemporarily(), [showControlsTemporarily]);
  const handleMouseLeave = useCallback(() => {
    if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current);
    if (isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => setShowControls(false), 1000);
    }
  }, [isPlaying]);
  const handleVideoClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    togglePlayPause();
  }, [togglePlayPause]);

  // Memoized progress calculation
  const progress = useMemo(() => (duration > 0 ? (currentTime / duration) * 100 : 0), [currentTime, duration]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full bg-black rounded-lg overflow-hidden shadow-2xl group",
        isFullscreen ? "h-screen" : "aspect-video max-w-4xl mx-auto"
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover cursor-pointer"
        src={src}
        autoPlay={autoPlay}
        loop={loop}
        preload="metadata"
        onClick={handleVideoClick}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
          <div className="w-12 h-12 border-4 border-orange-300/30 border-t-orange-400 rounded-full animate-spin"></div>
        </div>
      )}

      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm pointer-events-none">
          <button
            onClick={handleVideoClick}
            className="bg-orange-400/90 hover:bg-orange-400 rounded-full p-6 transition-all duration-300 hover:scale-110 shadow-2xl pointer-events-auto"
          >
            <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
          </button>
        </div>
      )}

      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 pointer-events-none",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center pointer-events-auto">
          <h3 className="text-white font-semibold text-lg truncate pr-4">{title}</h3>
          <div className="relative">
            <button
              onClick={() => setShowQualityMenu(!showQualityMenu)}
              className="bg-black/50 hover:bg-orange-500/20 text-white text-sm px-3 py-1 rounded-lg transition-colors border border-orange-400/20"
            >
              {selectedQuality}
            </button>
            {showQualityMenu && (
              <div className="absolute top-full right-0 mt-2 bg-black/90 backdrop-blur-sm rounded-lg overflow-hidden shadow-xl z-10 border border-orange-400/20">
                {qualityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSelectedQuality(option.label);
                      setShowQualityMenu(false);
                    }}
                    className={cn(
                      "block w-full text-left px-4 py-2 text-sm text-white hover:bg-orange-500/20 transition-colors",
                      selectedQuality === option.label && "bg-orange-500/10"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
          <div
            ref={progressRef}
            className="relative w-full h-2 bg-white/20 rounded-full mb-4 cursor-pointer group/progress"
            onClick={handleProgressClick}
          >
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity duration-200"
              style={{ left: `${progress}%`, transform: 'translateX(-50%) translateY(-50%)' }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={skipBackward}
                className="text-white hover:text-orange-400 transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={togglePlayPause}
                className="text-white hover:text-orange-400 transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                {isPlaying ? <Pause className="w-6 h-6" fill="currentColor" /> : <Play className="w-6 h-6" fill="currentColor" />}
              </button>
              <button
                onClick={skipForward}
                className="text-white hover:text-orange-400 transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                <SkipForward className="w-5 h-5" />
              </button>
              <div
                className="flex items-center space-x-2"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-orange-400 transition-colors p-2 hover:bg-white/10 rounded-full"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <div className={cn(
                  "overflow-hidden transition-all duration-300",
                  showVolumeSlider ? "w-20" : "w-0"
                )}>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeSliderChange}
                    className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-4
                      [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:border-2
                      [&::-webkit-slider-thumb]:border-orange-400
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-white
                      [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-webkit-slider-thumb]:shadow-lg
                      [&::-webkit-slider-thumb]:transition-all
                      [&::-webkit-slider-thumb]:duration-200
                      [&::-webkit-slider-thumb]:hover:bg-orange-50
                      [&::-webkit-slider-thumb]:hover:scale-110
                      [&::-webkit-slider-thumb]:hover:shadow-orange-400/40
                      [&::-moz-range-thumb]:w-4
                      [&::-moz-range-thumb]:h-4
                      [&::-moz-range-thumb]:border-2
                      [&::-moz-range-thumb]:border-orange-400
                      [&::-moz-range-thumb]:rounded-full
                      [&::-moz-range-thumb]:bg-white
                      [&::-moz-range-thumb]:cursor-pointer
                      [&::-moz-range-thumb]:shadow-lg
                      [&::-moz-range-thumb]:transition-all
                      [&::-moz-range-thumb]:hover:bg-orange-50
                      [&::-moz-range-thumb]:hover:scale-110
                      md:[&::-webkit-slider-thumb]:w-5
                      md:[&::-webkit-slider-thumb]:h-5
                      md:[&::-moz-range-thumb]:w-5
                      md:[&::-moz-range-thumb]:h-5"
                    style={{ background: `linear-gradient(to right, #fb923c 0%, #fbbf24 100%)` }}
                  />
                </div>
              </div>
              <div className="text-white text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-orange-400 transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default VideoPlayer;
