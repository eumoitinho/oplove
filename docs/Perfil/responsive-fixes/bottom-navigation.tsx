// Sistema de Navegação Bottom Unificado para OpenLove
// Compatível com iOS Safe Areas e telas de 360px

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Search, Plus, Bell, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

export function BottomNavigation() {
  const pathname = usePathname();
  
  const navItems: NavItem[] = [
    { icon: Home, label: 'Início', href: '/' },
    { icon: Search, label: 'Buscar', href: '/search' },
    { icon: Plus, label: 'Criar', href: '/compose' },
    { icon: Bell, label: 'Notif.', href: '/notifications', badge: 3 },
    { icon: MessageCircle, label: 'Chat', href: '/messages', badge: 12 }
  ];

  return (
    <>
      {/* Spacer para evitar que conteúdo fique atrás da nav */}
      <div className="h-16 pb-safe md:hidden" />
      
      {/* Bottom Navigation - Mobile Only */}
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 md:hidden",
        "bg-gray-900/95 backdrop-blur-lg",
        "border-t border-gray-800",
        "pb-safe" // Safe area para iOS
      )}>
        <div className="grid grid-cols-5 items-center">
          {navItems.map((item, index) => (
            <NavButton
              key={item.href}
              item={item}
              isActive={pathname === item.href}
              isCenter={index === 2}
            />
          ))}
        </div>
      </nav>
    </>
  );
}

interface NavButtonProps {
  item: NavItem;
  isActive: boolean;
  isCenter?: boolean;
}

function NavButton({ item, isActive, isCenter = false }: NavButtonProps) {
  const { icon: Icon, label, href, badge } = item;

  if (isCenter) {
    return (
      <Link
        href={href}
        className="relative flex items-center justify-center py-2"
      >
        <motion.div
          whileTap={{ scale: 0.9 }}
          className={cn(
            "relative flex items-center justify-center",
            "w-12 h-12 rounded-full",
            "bg-gradient-to-r from-purple-600 to-pink-600",
            "shadow-lg"
          )}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "relative flex flex-col items-center justify-center",
        "py-2 min-h-[56px]",
        "transition-colors",
        isActive && "text-purple-500"
      )}
    >
      {/* Ícone com Badge */}
      <div className="relative">
        <Icon className={cn(
          "w-6 h-6 transition-all",
          isActive && "scale-110"
        )} />
        
        {/* Badge de Notificação */}
        {badge && badge > 0 && (
          <span className={cn(
            "absolute -top-1 -right-1",
            "min-w-[18px] h-[18px]",
            "flex items-center justify-center",
            "bg-red-500 text-white",
            "text-[10px] font-bold",
            "rounded-full px-1"
          )}>
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>

      {/* Label - Muito pequeno no mobile */}
      <span className={cn(
        "text-[10px] mt-1",
        "transition-opacity",
        isActive ? "opacity-100" : "opacity-70"
      )}>
        {label}
      </span>

      {/* Indicador de Ativo */}
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full"
        />
      )}
    </Link>
  );
}

// Versão Alternativa com Gesture Support
export function BottomNavigationWithGestures() {
  const pathname = usePathname();
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const navItems = [
    { icon: Home, label: 'Início', href: '/' },
    { icon: Search, label: 'Buscar', href: '/search' },
    { icon: Plus, label: 'Criar', href: '/compose' },
    { icon: Bell, label: 'Alerts', href: '/notifications' },
    { icon: MessageCircle, label: 'Chat', href: '/messages' }
  ];

  // Detecta swipe horizontal para navegação
  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && selectedIndex < navItems.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    } else if (direction === 'right' && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 pb-safe md:hidden"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={(e, { offset, velocity }) => {
        if (Math.abs(velocity.x) > 500) {
          handleSwipe(velocity.x > 0 ? 'right' : 'left');
        }
      }}
    >
      <div className="relative h-16">
        {/* Background indicator */}
        <motion.div
          className="absolute bottom-0 h-full bg-gray-800/50"
          initial={false}
          animate={{
            x: `${selectedIndex * 20}%`,
            width: '20%'
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />

        {/* Nav Items */}
        <div className="relative grid grid-cols-5 h-full">
          {navItems.map((item, index) => (
            <GestureNavButton
              key={item.href}
              item={item}
              isActive={selectedIndex === index}
              onTap={() => setSelectedIndex(index)}
            />
          ))}
        </div>
      </div>
    </motion.nav>
  );
}

// Botão com suporte a gestos
function GestureNavButton({ item, isActive, onTap }) {
  const { icon: Icon, label } = item;
  
  return (
    <motion.button
      className="relative flex flex-col items-center justify-center"
      whileTap={{ scale: 0.9 }}
      onTap={onTap}
    >
      <Icon className={cn(
        "w-6 h-6 transition-all",
        isActive && "scale-110 text-purple-500"
      )} />
      
      <motion.span
        className="text-[10px] mt-1"
        initial={false}
        animate={{
          opacity: isActive ? 1 : 0.7,
          y: isActive ? 0 : 2
        }}
      >
        {label}
      </motion.span>
    </motion.button>
  );
}

// Hook para detectar iOS e adicionar classes necessárias
export function useIOSSafeArea() {
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      document.documentElement.style.setProperty(
        '--safe-area-inset-bottom',
        'env(safe-area-inset-bottom)'
      );
    }
  }, []);
}

// CSS necessário no global.css
/*
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.h-safe {
  height: calc(56px + env(safe-area-inset-bottom, 0));
}
*/