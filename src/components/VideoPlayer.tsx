import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
}

const BROADCASTS_API = 'https://functions.poehali.dev/cb454292-1eb9-4e4c-bfad-cbb5cb1be664';

const VideoPlayer = ({ videoUrl, title }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<any>(null);
  
  const isKickVideo = videoUrl.includes('kick.com');
  const isTwitchVideo = videoUrl.includes('twitch.tv');
  const useCustomPlayer = isKickVideo || isTwitchVideo;

  const getChannelAndPlatform = (url: string): { channel: string; platform: string } | null => {
    if (url.includes('kick.com')) {
      const pathParts = url.split('kick.com/')[1]?.split('?')[0];
      if (pathParts?.includes('/videos/')) {
        return null;
      }
      const channel = pathParts?.split('/')[0];
      return channel ? { channel, platform: 'kick' } : null;
    }
    if (url.includes('twitch.tv')) {
      const pathParts = url.split('twitch.tv/')[1]?.split('?')[0];
      if (pathParts?.includes('/videos/') || pathParts?.includes('videos/')) {
        return null;
      }
      const channel = pathParts?.split('/')[0];
      return channel ? { channel, platform: 'twitch' } : null;
    }
    return null;
  };

  const getParentDomain = () => {
    if (typeof window !== 'undefined') {
      return window.location.hostname;
    }
    return 'localhost';
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    }
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`;
    }
    if (url.includes('kick.com')) {
      const pathParts = url.split('kick.com/')[1]?.split('?')[0];
      
      if (pathParts?.includes('/videos/')) {
        const channelName = pathParts.split('/videos/')[0];
        const videoId = pathParts.split('/videos/')[1];
        return `https://kick.com/${channelName}/videos/${videoId}`;
      } else {
        const channelName = pathParts?.split('/')[0];
        return `https://player.kick.com/${channelName}?muted=false`;
      }
    }
    if (url.includes('twitch.tv')) {
      const pathParts = url.split('twitch.tv/')[1]?.split('?')[0];
      const parent = getParentDomain();
      
      if (pathParts?.includes('/videos/')) {
        const videoId = pathParts.split('/videos/')[1];
        return `https://player.twitch.tv/?video=v${videoId}&parent=${parent}&autoplay=true`;
      } else if (pathParts?.includes('videos/')) {
        const videoId = pathParts.split('videos/')[1];
        return `https://player.twitch.tv/?video=v${videoId}&parent=${parent}&autoplay=true`;
      } else {
        const channelName = pathParts?.split('/')[0];
        return `https://player.twitch.tv/?channel=${channelName}&parent=${parent}&autoplay=true&muted=false`;
      }
    }
    return url;
  };

  const fetchStreamUrl = async (): Promise<string | null> => {
    const channelInfo = getChannelAndPlatform(videoUrl);
    if (!channelInfo) return null;

    try {
      const response = await fetch(
        `${BROADCASTS_API}?action=get-stream&channel=${channelInfo.channel}&platform=${channelInfo.platform}`
      );
      
      if (!response.ok) {
        throw new Error('Stream not available');
      }

      const data = await response.json();
      return data.stream_url;
    } catch (err) {
      console.error('Failed to fetch stream URL:', err);
      return null;
    }
  };

  const initializePlayer = async () => {
    if (!videoRef.current || !useCustomPlayer) return;

    const streamUrl = await fetchStreamUrl();
    if (!streamUrl) {
      setError('Стрим сейчас недоступен');
      return;
    }

    if (playerRef.current) {
      playerRef.current.dispose();
    }

    const player = videojs(videoRef.current, {
      controls: true,
      autoplay: true,
      preload: 'auto',
      fluid: true,
      html5: {
        vhs: {
          overrideNative: true,
          withCredentials: false
        },
        nativeAudioTracks: false,
        nativeVideoTracks: false
      },
      sources: [{
        src: streamUrl,
        type: 'application/x-mpegURL'
      }]
    });

    playerRef.current = player;

    player.on('error', () => {
      setError('Ошибка загрузки стрима');
    });

    const updateInterval = setInterval(async () => {
      const newStreamUrl = await fetchStreamUrl();
      if (newStreamUrl && newStreamUrl !== streamUrl && player) {
        player.src({
          src: newStreamUrl,
          type: newStreamUrl.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'
        });
      }
    }, 30000);

    return () => {
      clearInterval(updateInterval);
      if (player) {
        player.dispose();
      }
    };
  };

  useEffect(() => {
    if (isPlaying && useCustomPlayer) {
      initializePlayer();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [isPlaying, videoUrl]);

  const handlePlay = () => {
    setIsPlaying(true);
    setError(null);
  };

  return (
    <div className="relative w-full bg-secondary rounded-lg overflow-hidden shadow-xl">
      <div className="relative aspect-video bg-black">
        {!isPlaying ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary/90 to-secondary">
            <Button 
              size="lg" 
              className="rounded-full w-20 h-20 hover:scale-110 transition-transform"
              onClick={handlePlay}
            >
              <Icon name="Play" size={32} className="ml-1" />
            </Button>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90">
            <div className="text-center text-white px-4">
              <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-red-500" />
              <p className="text-lg">{error}</p>
              <Button 
                className="mt-4"
                onClick={() => {
                  setError(null);
                  setIsPlaying(false);
                }}
              >
                Попробовать снова
              </Button>
            </div>
          </div>
        ) : useCustomPlayer ? (
          <div data-vjs-player className="w-full h-full">
            <video
              ref={videoRef}
              className="video-js vjs-default-skin vjs-big-play-centered w-full h-full"
            />
          </div>
        ) : (
          <iframe
            src={getEmbedUrl(videoUrl)}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ colorScheme: 'normal' }}
          />
        )}
      </div>
      {title && (
        <div className="p-4 bg-card">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;