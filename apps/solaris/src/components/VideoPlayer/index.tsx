import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react';
import { cn } from '@/libs/utils';

interface VideoPlayerProps {
  src: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = React.memo(({
  src,
  title,
  className,
  loop,
  autoPlay
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout>(null);
  const isDraggingRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized calculations
  const progress = useMemo(() => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  }, [currentTime, duration]);

  const bufferedProgress = useMemo(() => {
    return duration > 0 ? (buffered / duration) * 100 : 0;
  }, [buffered, duration]);

  // Format time helper
  const formatTime = useCallback((time: number): string => {
    if (!isFinite(time) || isNaN(time)) return '0:00';

    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);


  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current && !isDraggingRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video?.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      setBuffered(bufferedEnd);
    }
  }, []);

  const handleVolumeChange = useCallback(() => {
    if (videoRef.current) {
      setVolume(videoRef.current.volume);
      setIsMuted(videoRef.current.muted);
    }
  }, []);

  const handleError = useCallback(() => {
    setError('Erro ao carregar o vídeo');
  }, []);

  // Setup video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const events = [
      ['loadedmetadata', handleLoadedMetadata],
      ['timeupdate', handleTimeUpdate],
      ['progress', handleProgress],
      ['volumechange', handleVolumeChange],
      ['error', handleError],
    ] as const;

    events.forEach(([event, handler]) => {
      video.addEventListener(event, handler);
    });

    return () => {
      events.forEach(([event, handler]) => {
        video.removeEventListener(event, handler);
      });
    };
  }, [handleLoadedMetadata, handleTimeUpdate, handleProgress, handleVolumeChange, handleError]);

  // Play/Pause toggle
  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(console.warn);
      setIsPlaying(true);
    }
  }, [isPlaying]);

  // Progress bar interaction
  const handleProgressInteraction = useCallback((clientX: number) => {
    const progressBar = progressRef.current;
    const video = videoRef.current;
    if (!progressBar || !video || duration === 0) return;

    const rect = progressBar.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newTime = percent * duration;

    video.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    handleProgressInteraction(e.clientX);
  }, [handleProgressInteraction]);

  // Progress bar dragging
  const handleProgressMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    handleProgressInteraction(e.clientX);

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        handleProgressInteraction(e.clientX);
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [handleProgressInteraction]);

  // Touch support for progress bar
  const handleProgressTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    isDraggingRef.current = true;
    handleProgressInteraction(touch.clientX);

    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingRef.current && e.touches[0]) {
        handleProgressInteraction(e.touches[0].clientX);
      }
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  }, [handleProgressInteraction]);

  // Volume controls
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

  // Skip controls
  const skipBackward = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, video.currentTime - 10);
  }, []);

  const skipForward = useCallback(() => {
    const video = videoRef.current;
    if (!video || duration === 0) return;
    video.currentTime = Math.min(duration, video.currentTime + 10);
  }, [duration]);

  // Fullscreen
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
      console.warn('Fullscreen error:', error);
    }
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Controls visibility
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    if (isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  const handleMouseMove = useCallback(() => {
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  const handleMouseLeave = useCallback(() => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    if (isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 1000);
    }
  }, [isPlaying]);

  // Video click handler
  const handleVideoClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    togglePlayPause();
    showControlsTemporarily();
  }, [togglePlayPause, showControlsTemporarily]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target !== document.body) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForward();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [togglePlayPause, toggleFullscreen, skipBackward, skipForward]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden shadow-2xl group",
        isFullscreen ? "h-screen rounded-none" : "aspect-video max-w-full mx-auto",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover cursor-pointer"
        src={src}
        preload="metadata"
        autoPlay={autoPlay}
        loop={loop}
        playsInline
        onClick={handleVideoClick}
      />

      {/* Loading overlay */}
      {/* {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-500/20 to-yellow-500/20 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-orange-300/30 border-t-orange-400 rounded-full animate-spin"></div>
            <p className="text-white text-sm sm:text-base font-medium">Carregando vídeo...</p>
          </div>
        </div>
      )} */}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900/50 backdrop-blur-sm">
          <div className="text-center text-white p-4">
            <p className="text-lg font-semibold mb-2">Erro</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Play button overlay */}
      {!isPlaying && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={handleVideoClick}
            className="group/play bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 rounded-full p-4 sm:p-6 md:p-8 transition-all duration-300 hover:scale-110 shadow-2xl"
          >
            <Play className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 text-white ml-1" fill="currentColor" />
          </button>
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0",
          "pointer-events-none"
        )}
      >
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 md:p-6 pointer-events-auto">
          <h3 className="text-white font-semibold text-sm sm:text-lg md:text-xl truncate">{title}</h3>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 pointer-events-auto">
          {/* Progress bar */}
          <div className="mb-3 sm:mb-4">
            <div
              ref={progressRef}
              className="relative w-full h-1.5 sm:h-2 bg-white/20 rounded-full cursor-pointer group/progress"
              onClick={handleProgressClick}
              onMouseDown={handleProgressMouseDown}
              onTouchStart={handleProgressTouchStart}
            >
              {/* Buffered progress */}
              <div
                className="absolute top-0 left-0 h-full bg-white/30 rounded-full transition-all duration-200"
                style={{ width: `${bufferedProgress}%` }}
              />

              {/* Current progress */}
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />

              {/* Progress thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity duration-200 pointer-events-none"
                style={{ left: `${progress}%`, transform: 'translateX(-50%) translateY(-50%)' }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            {/* Left controls */}
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
              <button
                onClick={skipBackward}
                className="text-white hover:text-orange-400 transition-colors p-1.5 sm:p-2 hover:bg-white/10 rounded-full"
              >
                <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={togglePlayPause}
                className="text-white hover:text-orange-400 transition-colors p-1.5 sm:p-2 hover:bg-white/10 rounded-full"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" />
                ) : (
                  <Play className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" />
                )}
              </button>

              <button
                onClick={skipForward}
                className="text-white hover:text-orange-400 transition-colors p-1.5 sm:p-2 hover:bg-white/10 rounded-full"
              >
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Volume control */}
              <div
                className="flex items-center space-x-2"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-orange-400 transition-colors p-1.5 sm:p-2 hover:bg-white/10 rounded-full"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>

                <div className={cn(
                  "hidden sm:block overflow-hidden transition-all duration-300",
                  showVolumeSlider ? "w-16 md:w-20" : "w-0"
                )}>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeSliderChange}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-3
                      [&::-webkit-slider-thumb]:h-3
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-gradient-to-r
                      [&::-webkit-slider-thumb]:from-orange-400
                      [&::-webkit-slider-thumb]:to-yellow-500
                      [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-webkit-slider-thumb]:shadow-lg
                      [&::-webkit-slider-thumb]:transition-all
                      [&::-webkit-slider-thumb]:duration-200
                      [&::-webkit-slider-thumb]:hover:scale-110"
                  />
                </div>

                {/* Mobile volume display */}
                <span className="sm:hidden text-white text-xs font-mono">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>

              {/* Time display */}
              <div className="text-white text-xs sm:text-sm font-mono whitespace-nowrap">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-orange-400 transition-colors p-1.5 sm:p-2 hover:bg-white/10 rounded-full"
              >
                <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
