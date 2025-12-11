import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';

interface Broadcast {
  id?: number;
  title: string;
  video_url: string;
  is_live: boolean;
  scheduled_time: string;
  scheduled_date: string;
}

interface NewsItem {
  id?: number;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  published_date: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [editingBroadcast, setEditingBroadcast] = useState<Broadcast | null>(null);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsAuthenticated(true);
      loadData();
    }
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('admin_token', data.token);
        setIsAuthenticated(true);
        loadData();
        toast({ title: 'Успешно', description: 'Добро пожаловать в админ-панель' });
      } else {
        toast({ title: 'Ошибка', description: 'Неверный пароль', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось войти', variant: 'destructive' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    navigate('/');
  };

  const handleChangePassword = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.changePassword, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      });
      const data = await response.json();
      
      if (data.success) {
        toast({ title: 'Успешно', description: 'Пароль изменен' });
        setShowPasswordChange(false);
        setOldPassword('');
        setNewPassword('');
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось изменить пароль', variant: 'destructive' });
    }
  };

  const loadData = async () => {
    try {
      const [broadcastsRes, newsRes] = await Promise.all([
        fetch(API_ENDPOINTS.broadcasts),
        fetch(API_ENDPOINTS.news),
      ]);
      const broadcastsData = await broadcastsRes.json();
      const newsData = await newsRes.json();
      
      setBroadcasts(broadcastsData.broadcasts || []);
      setNews(newsData.news || []);
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить данные', variant: 'destructive' });
    }
  };

  const saveBroadcast = async (broadcast: Broadcast) => {
    try {
      const method = broadcast.id ? 'PUT' : 'POST';
      const response = await fetch(API_ENDPOINTS.broadcasts, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(broadcast),
      });
      const data = await response.json();
      
      if (data.success) {
        toast({ title: 'Успешно', description: 'Трансляция сохранена' });
        setEditingBroadcast(null);
        loadData();
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось сохранить', variant: 'destructive' });
    }
  };

  const deleteBroadcast = async (id: number) => {
    try {
      await fetch(API_ENDPOINTS.broadcasts, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      toast({ title: 'Успешно', description: 'Трансляция удалена' });
      loadData();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить', variant: 'destructive' });
    }
  };

  const saveNews = async (newsItem: NewsItem) => {
    try {
      const method = newsItem.id ? 'PUT' : 'POST';
      const response = await fetch(API_ENDPOINTS.news, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newsItem),
      });
      const data = await response.json();
      
      if (data.success) {
        toast({ title: 'Успешно', description: 'Новость сохранена' });
        setEditingNews(null);
        loadData();
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось сохранить', variant: 'destructive' });
    }
  };

  const deleteNews = async (id: number) => {
    try {
      await fetch(API_ENDPOINTS.news, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      toast({ title: 'Успешно', description: 'Новость удалена' });
      loadData();
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить', variant: 'destructive' });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Вход в админ-панель</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Введите пароль"
                />
              </div>
              <Button onClick={handleLogin} className="w-full">
                Войти
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold">Админ-панель Freesport</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPasswordChange(!showPasswordChange)}>
              <Icon name="Key" size={18} className="mr-2" />
              Сменить пароль
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              <Icon name="Home" size={18} className="mr-2" />
              На сайт
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <Icon name="LogOut" size={18} className="mr-2" />
              Выход
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {showPasswordChange && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Изменить пароль</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 max-w-md">
                <div>
                  <Label>Текущий пароль</Label>
                  <Input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Новый пароль (минимум 6 символов)</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleChangePassword}>Сохранить</Button>
                  <Button variant="outline" onClick={() => setShowPasswordChange(false)}>
                    Отмена
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="broadcasts" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="broadcasts">Трансляции</TabsTrigger>
            <TabsTrigger value="news">Новости</TabsTrigger>
          </TabsList>

          <TabsContent value="broadcasts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {editingBroadcast?.id ? 'Редактировать трансляцию' : 'Новая трансляция'}
                  </CardTitle>
                  {!editingBroadcast && (
                    <Button
                      onClick={() =>
                        setEditingBroadcast({
                          title: '',
                          video_url: '',
                          is_live: false,
                          scheduled_time: '',
                          scheduled_date: '',
                        })
                      }
                    >
                      <Icon name="Plus" size={18} className="mr-2" />
                      Добавить
                    </Button>
                  )}
                </div>
              </CardHeader>
              {editingBroadcast && (
                <CardContent>
                  <div className="grid gap-4">
                    <div>
                      <Label>Название</Label>
                      <Input
                        value={editingBroadcast.title}
                        onChange={(e) =>
                          setEditingBroadcast({ ...editingBroadcast, title: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>URL видео (YouTube/Vimeo)</Label>
                      <Input
                        value={editingBroadcast.video_url}
                        onChange={(e) =>
                          setEditingBroadcast({ ...editingBroadcast, video_url: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={editingBroadcast.is_live}
                        onCheckedChange={(checked) =>
                          setEditingBroadcast({ ...editingBroadcast, is_live: checked })
                        }
                      />
                      <Label>Трансляция идет сейчас (LIVE)</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Дата</Label>
                        <Input
                          type="date"
                          value={editingBroadcast.scheduled_date}
                          onChange={(e) =>
                            setEditingBroadcast({
                              ...editingBroadcast,
                              scheduled_date: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Время</Label>
                        <Input
                          type="time"
                          value={editingBroadcast.scheduled_time}
                          onChange={(e) =>
                            setEditingBroadcast({
                              ...editingBroadcast,
                              scheduled_time: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => saveBroadcast(editingBroadcast)}>Сохранить</Button>
                      <Button variant="outline" onClick={() => setEditingBroadcast(null)}>
                        Отмена
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            <div className="grid gap-4">
              {broadcasts.map((broadcast) => (
                <Card key={broadcast.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{broadcast.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{broadcast.video_url}</p>
                        <div className="flex gap-4 text-sm">
                          {broadcast.is_live && (
                            <span className="text-red-500 font-semibold">🔴 LIVE</span>
                          )}
                          <span>
                            {broadcast.scheduled_date} в {broadcast.scheduled_time}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingBroadcast(broadcast)}
                        >
                          <Icon name="Pencil" size={16} />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => broadcast.id && deleteBroadcast(broadcast.id)}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="news" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{editingNews?.id ? 'Редактировать новость' : 'Новая новость'}</CardTitle>
                  {!editingNews && (
                    <Button
                      onClick={() =>
                        setEditingNews({
                          title: '',
                          excerpt: '',
                          content: '',
                          image_url: '',
                          published_date: new Date().toISOString().split('T')[0],
                        })
                      }
                    >
                      <Icon name="Plus" size={18} className="mr-2" />
                      Добавить
                    </Button>
                  )}
                </div>
              </CardHeader>
              {editingNews && (
                <CardContent>
                  <div className="grid gap-4">
                    <div>
                      <Label>Заголовок</Label>
                      <Input
                        value={editingNews.title}
                        onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Краткое описание</Label>
                      <Textarea
                        value={editingNews.excerpt}
                        onChange={(e) =>
                          setEditingNews({ ...editingNews, excerpt: e.target.value })
                        }
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Полный текст</Label>
                      <Textarea
                        value={editingNews.content}
                        onChange={(e) =>
                          setEditingNews({ ...editingNews, content: e.target.value })
                        }
                        rows={6}
                      />
                    </div>
                    <div>
                      <Label>URL изображения</Label>
                      <Input
                        value={editingNews.image_url}
                        onChange={(e) =>
                          setEditingNews({ ...editingNews, image_url: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Дата публикации</Label>
                      <Input
                        type="date"
                        value={editingNews.published_date}
                        onChange={(e) =>
                          setEditingNews({ ...editingNews, published_date: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => saveNews(editingNews)}>Сохранить</Button>
                      <Button variant="outline" onClick={() => setEditingNews(null)}>
                        Отмена
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            <div className="grid gap-4">
              {news.map((item) => (
                <Card key={item.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-32 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{item.excerpt}</p>
                        <p className="text-xs text-muted-foreground">{item.published_date}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingNews(item)}>
                          <Icon name="Pencil" size={16} />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => item.id && deleteNews(item.id)}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;