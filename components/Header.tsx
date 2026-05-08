import Link from 'next/link';
import { ShoppingBag, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <ShoppingBag className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">RafaStore</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground">
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
