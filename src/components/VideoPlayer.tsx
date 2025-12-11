import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
}

const VideoPlayer = ({ videoUrl, title }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

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
    return url;
  };

  return (
    <div className="relative w-full bg-secondary rounded-lg overflow-hidden shadow-xl">
      <div className="relative aspect-video bg-black">
        {isPlaying ? (
          <iframe
            src={getEmbedUrl(videoUrl)}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
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
