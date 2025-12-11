import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import VideoPlayer from '@/components/VideoPlayer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [liveBroadcast, setLiveBroadcast] = useState<any>(null);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [selectedBroadcast, setSelectedBroadcast] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [broadcastsRes, newsRes] = await Promise.all([
        fetch('https://functions.poehali.dev/cb454292-1eb9-4e4c-bfad-cbb5cb1be664'),
        fetch('https://functions.poehali.dev/85778fcb-8560-48d6-9905-7e93224f8844'),
      ]);
      const broadcastsData = await broadcastsRes.json();
      const newsData = await newsRes.json();
      
      const allBroadcasts = broadcastsData.broadcasts || [];
      const live = allBroadcasts.find((b: any) => b.is_live);
      setLiveBroadcast(live);
      setBroadcasts(allBroadcasts.filter((b: any) => !b.is_live));
      setNews(newsData.news || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {liveBroadcast && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <Badge variant="destructive" className="text-sm font-semibold">LIVE</Badge>
              </div>
              <h2 className="text-2xl font-bold">{liveBroadcast.title}</h2>
            </div>
            <VideoPlayer 
              videoUrl={liveBroadcast.video_url} 
              title={liveBroadcast.title}
            />
          </section>
        )}

        <section id="broadcasts" className="mb-16">
          <h3 className="text-2xl font-bold mb-6">Предстоящие трансляции</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {broadcasts.map((broadcast) => (
              <Card 
                key={broadcast.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedBroadcast(broadcast)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg">{broadcast.title}</CardTitle>
                    <Badge variant="outline" className="shrink-0">
                      <Icon name="Clock" size={14} className="mr-1" />
                      {broadcast.scheduled_time?.substring(0, 5)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{broadcast.scheduled_date}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="news">
          <h3 className="text-2xl font-bold mb-6">Последние новости</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {item.image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={item.image_url} 
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg leading-tight">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">{item.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{item.published_date}</p>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedNews(item)}>
                      Читать →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {selectedBroadcast && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedBroadcast(null)}>
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-2xl">{selectedBroadcast.title}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedBroadcast(null)}>
                    <Icon name="X" size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Icon name="Calendar" size={18} />
                    <span>{selectedBroadcast.scheduled_date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Clock" size={18} />
                    <span>{selectedBroadcast.scheduled_time}</span>
                  </div>
                </div>
                {selectedBroadcast.description && (
                  <p className="text-lg leading-relaxed">{selectedBroadcast.description}</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {selectedNews && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedNews(null)}>
            <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-2xl">{selectedNews.title}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedNews(null)}>
                    <Icon name="X" size={20} />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">{selectedNews.published_date}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedNews.image_url && (
                  <img 
                    src={selectedNews.image_url} 
                    alt={selectedNews.title}
                    className="w-full rounded-lg"
                  />
                )}
                <p className="text-lg leading-relaxed whitespace-pre-line">{selectedNews.content}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <footer className="border-t mt-16 py-8 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-center gap-2">
            <Icon name="Play" size={24} className="text-primary" />
            <span className="font-bold">Freesport</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;