import { useState } from 'react';
import Header from '@/components/Header';
import VideoPlayer from '@/components/VideoPlayer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [activeSection, setActiveSection] = useState<'broadcasts' | 'news'>('broadcasts');

  const upcomingBroadcasts = [
    {
      id: 1,
      title: 'Кубок мира по биатлону - Мужской спринт',
      time: '15:00',
      date: '15 декабря',
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Лыжные гонки - Женская эстафета',
      time: '18:30',
      date: '15 декабря',
      status: 'upcoming'
    }
  ];

  const newsItems = [
    {
      id: 1,
      title: 'Российские биатлонисты завоевали золото на этапе Кубка мира',
      excerpt: 'Сборная России показала блестящий результат в смешанной эстафете, опередив команды Норвегии и Франции.',
      date: '14 декабря',
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=450&fit=crop'
    },
    {
      id: 2,
      title: 'Новый рекорд трассы установлен в лыжных гонках',
      excerpt: 'На дистанции 15 км классическим стилем был установлен рекорд трассы, который продержался более 5 лет.',
      date: '13 декабря',
      image: 'https://images.unsplash.com/photo-1483654363457-c8ebe6f35c6d?w=800&h=450&fit=crop'
    },
    {
      id: 3,
      title: 'Анонс: грядущий этап Кубка мира в Финляндии',
      excerpt: 'Следующий этап Кубка мира пройдет на легендарных трассах Лахти. Ожидаются напряженные борьба за лидерство.',
      date: '12 декабря',
      image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=450&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <Badge variant="destructive" className="text-sm font-semibold">LIVE</Badge>
            </div>
            <h2 className="text-2xl font-bold">Кубок мира - Биатлон 2024</h2>
          </div>
          <VideoPlayer 
            videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ" 
            title="Прямая трансляция: Женский индивидуальный спринт"
          />
        </section>

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
              {upcomingBroadcasts.map((broadcast) => (
                <Card key={broadcast.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-lg">{broadcast.title}</CardTitle>
                      <Badge variant="outline" className="shrink-0">
                        <Icon name="Clock" size={14} className="mr-1" />
                        {broadcast.time}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground">{broadcast.date}</p>
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
              {newsItems.map((news) => (
                <Card key={news.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={news.image} 
                      alt={news.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg leading-tight">{news.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">{news.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">{news.date}</p>
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
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Icon name="Play" size={24} className="text-primary" />
              <span className="font-bold">Freesport</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Freesport. Прямые трансляции лыжных гонок и биатлона
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
