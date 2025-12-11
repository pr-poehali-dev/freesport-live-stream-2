import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="Play" size={28} className="text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Freesport</h1>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Button variant="ghost" className="text-base font-medium">
            Трансляции
          </Button>
          <Button variant="ghost" className="text-base font-medium">
            Новости
          </Button>
        </nav>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Icon name="Menu" size={24} />
        </Button>
      </div>
    </header>
  );
};

export default Header;
