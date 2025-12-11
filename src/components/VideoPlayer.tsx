import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
}

const VideoPlayer = ({ videoUrl, title }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const isKickVideo = videoUrl.includes('kick.com');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPlaying || !isKickVideo) return;

    const hideOverlays = () => {
      if (containerRef.current) {
        const iframes = containerRef.current.querySelectorAll('iframe');
        iframes.forEach(iframe => {
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
              const style = iframeDoc.createElement('style');
              style.textContent = `
                div[class*="overlay"],
                div[class*="popup"],
                div[class*="banner"],
                a[href*="kick.com"]:not([href*="player"]),
                button[class*="watch"],
                [class*="live-now"],
                [class*="channel-info"] {
                  display: none !important;
                  visibility: hidden !important;
                  opacity: 0 !important;
                  pointer-events: none !important;
                }
              `;
              iframeDoc.head?.appendChild(style);
            }
          } catch (e) {
            // Cross-origin iframe, can't access
          }
        });
      }
    };

    const timer = setInterval(hideOverlays, 500);
    hideOverlays();

    return () => clearInterval(timer);
  }, [isPlaying, isKickVideo]);

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

  return (
    <div ref={containerRef} className="relative w-full bg-secondary rounded-lg overflow-hidden shadow-xl">
      <div className="relative aspect-video bg-black">
        {isPlaying ? (
          <>

          <iframe
            src={getEmbedUrl(videoUrl)}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ colorScheme: 'normal' }}
          />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary/90 to-secondary">
            <Button 
              size="lg" 
              className="rounded-full w-20 h-20 hover:scale-110 transition-transform"
              onClick={() => setIsPlaying(true)}
            >
              <Icon name="Play" size={32} className="ml-1" />
            </Button>
          </div>
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