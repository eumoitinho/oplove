// Sistema de Ações de Post Responsivo para OpenLove
// Otimizado para telas de 360px

import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Send, Link } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PostActionsProps {
  postId: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  isSaved?: boolean;
}

export function PostActionsResponsive({ 
  postId, 
  likes, 
  comments, 
  isLiked = false,
  isSaved = false 
}: PostActionsProps) {
  const [localLiked, setLocalLiked] = useState(isLiked);
  const [localLikes, setLocalLikes] = useState(likes);
  const [localSaved, setLocalSaved] = useState(isSaved);

  const handleLike = () => {
    setLocalLiked(!localLiked);
    setLocalLikes(localLiked ? localLikes - 1 : localLikes + 1);
    // API call aqui
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Post do OpenLove',
          url: `https://openlove.com/post/${postId}`
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback para copiar link
      navigator.clipboard.writeText(`https://openlove.com/post/${postId}`);
    }
  };

  return (
    <div className="flex items-center justify-between pt-3 -mx-2 xs:mx-0">
      {/* Ações Principais - Sempre Visíveis */}
      <div className="flex items-center flex-1">
        {/* Like */}
        <ActionButton
          icon={Heart}
          label="Curtir"
          count={localLikes}
          active={localLiked}
          onClick={handleLike}
          className="flex-1"
        />

        {/* Comentar */}
        <ActionButton
          icon={MessageCircle}
          label="Comentar"
          count={comments}
          onClick={() => {/* Navigate to comments */}}
          className="flex-1"
        />

        {/* Compartilhar - Sem label no mobile */}
        <button
          onClick={handleShare}
          className={cn(
            "flex items-center justify-center",
            "min-w-[44px] min-h-[44px] p-2",
            "hover:bg-gray-800/50 rounded-full transition-colors",
            "flex-1 xs:flex-initial"
          )}
          aria-label="Compartilhar"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Menu Mais Opções */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex items-center justify-center",
              "min-w-[44px] min-h-[44px] p-2",
              "hover:bg-gray-800/50 rounded-full transition-colors"
            )}
            aria-label="Mais opções"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-56"
          sideOffset={5}
        >
          {/* Salvar */}
          <DropdownMenuItem onClick={() => setLocalSaved(!localSaved)}>
            <Bookmark className={cn(
              "w-4 h-4 mr-3",
              localSaved && "fill-current"
            )} />
            {localSaved ? 'Remover dos salvos' : 'Salvar'}
          </DropdownMenuItem>

          {/* Enviar via Direct */}
          <DropdownMenuItem>
            <Send className="w-4 h-4 mr-3" />
            Enviar via Direct
          </DropdownMenuItem>

          {/* Copiar Link */}
          <DropdownMenuItem onClick={() => {
            navigator.clipboard.writeText(`https://openlove.com/post/${postId}`);
          }}>
            <Link className="w-4 h-4 mr-3" />
            Copiar link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Componente de Botão de Ação Reutilizável
interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  count?: number;
  active?: boolean;
  onClick: () => void;
  className?: string;
}

function ActionButton({ 
  icon: Icon, 
  label, 
  count, 
  active = false, 
  onClick,
  className 
}: ActionButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    onClick();
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "group flex items-center justify-center xs:justify-start",
        "min-w-[44px] min-h-[44px] p-2",
        "hover:bg-gray-800/50 rounded-full transition-colors",
        "relative overflow-hidden",
        className
      )}
      aria-label={`${label} ${count || ''}`}
    >
      <div className="flex items-center space-x-1.5">
        <Icon 
          className={cn(
            "w-5 h-5 transition-all",
            active && "text-red-500 fill-current",
            isAnimating && "scale-125"
          )} 
        />
        
        {/* Contador - Sempre visível se houver */}
        {count !== undefined && count > 0 && (
          <span className={cn(
            "text-xs xs:text-sm",
            "min-w-[1rem] text-center",
            active && "text-red-500"
          )}>
            {formatCount(count)}
          </span>
        )}
        
        {/* Label - Só no desktop */}
        <span className="hidden sm:inline text-sm">
          {label}
        </span>
      </div>
    </button>
  );
}

// Função helper para formatar contadores
function formatCount(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 10000) return `${(count / 1000).toFixed(1)}k`;
  if (count < 1000000) return `${Math.floor(count / 1000)}k`;
  return `${(count / 1000000).toFixed(1)}M`;
}

// Versão com Bottom Sheet para Mobile
export function PostActionsWithBottomSheet({ postId, likes, comments }: PostActionsProps) {
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  return (
    <>
      <div className="flex items-center justify-around pt-3 border-t border-gray-800 -mx-4 px-4">
        <ActionIcon icon={Heart} onClick={() => {}} />
        <ActionIcon icon={MessageCircle} onClick={() => {}} />
        <ActionIcon icon={Share2} onClick={() => {}} />
        <ActionIcon icon={MoreHorizontal} onClick={() => setShowBottomSheet(true)} />
      </div>

      {/* Bottom Sheet para ações adicionais */}
      <AnimatePresence>
        {showBottomSheet && (
          <BottomSheet onClose={() => setShowBottomSheet(false)}>
            <div className="p-4 space-y-1">
              <SheetAction icon={Bookmark} label="Salvar post" />
              <SheetAction icon={Send} label="Enviar via Direct" />
              <SheetAction icon={Link} label="Copiar link" />
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>
    </>
  );
}

// Componentes auxiliares
function ActionIcon({ icon: Icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center p-3 min-w-[64px]"
    >
      <Icon className="w-6 h-6" />
    </button>
  );
}

function SheetAction({ icon: Icon, label }) {
  return (
    <button className="flex items-center w-full p-4 hover:bg-gray-800 rounded-lg">
      <Icon className="w-5 h-5 mr-3" />
      <span>{label}</span>
    </button>
  );
}

function BottomSheet({ children, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="absolute bottom-0 left-0 right-0 bg-gray-900 rounded-t-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mt-3" />
        {children}
      </motion.div>
    </motion.div>
  );
}