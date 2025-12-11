import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import VideoPlayer from '@/components/VideoPlayer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [activeSection, setActiveSection] = useState<'broadcasts' | 'news'>('broadcasts');
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [liveBroadcast, setLiveBroadcast] = useState<any>(null);

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

        <div className="flex gap-4 mb-6 border-b">
          <Button
            variant={activeSection === 'broadcasts' ? 'default' : 'ghost'}
            className="rounded-b-none font-semibold"
            onClick={() => setActiveSection('broadcasts')}
          >
            <Icon name="Radio" size={20} className="mr-2" />
            Трансляции
          </Button>
          <Button
            variant={activeSection === 'news' ? 'default' : 'ghost'}
            className="rounded-b-none font-semibold"
            onClick={() => setActiveSection('news')}
          >
            <Icon name="Newspaper" size={20} className="mr-2" />
            Новости
          </Button>
        </div>

        {activeSection === 'broadcasts' && (
          <section>
            <h3 className="text-xl font-bold mb-6">Предстоящие трансляции</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {broadcasts.map((broadcast) => (
                <Card key={broadcast.id} className="hover:shadow-lg transition-shadow">
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
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground">{broadcast.scheduled_date}</p>
                      <Button variant="outline" size="sm">
                        <Icon name="Bell" size={16} className="mr-2" />
                        Напомнить
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {activeSection === 'news' && (
          <section>
            <h3 className="text-xl font-bold mb-6">Последние новости</h3>
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
                      <Button variant="ghost" size="sm">
                        Читать →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
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