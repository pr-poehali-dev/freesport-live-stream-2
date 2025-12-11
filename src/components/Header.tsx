import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Icon name="Play" size={28} className="text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Freesport</h1>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#broadcasts">
            <Button variant="ghost" className="text-base font-medium">
              Трансляции
            </Button>
          </a>
          <a href="#news">
            <Button variant="ghost" className="text-base font-medium">
              Новости
            </Button>
          </a>
          <Link to="/admin">
            <Button variant="ghost" size="sm">
              <Icon name="Settings" size={18} className="mr-2" />
              Админ
            </Button>
          </Link>
        </nav>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Icon name="Menu" size={24} />
        </Button>
      </div>
    </header>
  );
};

export default Header;