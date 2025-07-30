// Utilitários de Responsividade para OpenLove
// Helpers e hooks para telas de 360px

import { useState, useEffect, useCallback } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';

// Breakpoints customizados para OpenLove
export const breakpoints = {
  xxs: 320,    // Ultra pequeno
  xs: 360,     // Pequeno (target)
  sm: 640,     // Tablet pequeno
  md: 768,     // Tablet
  lg: 1024,    // Desktop
  xl: 1280,    // Desktop grande
  '2xl': 1536  // Ultra wide
} as const;

// Hook para detectar tamanho de tela atual
export function useScreenSize() {
  const [screenSize, setScreenSize] = useState<keyof typeof breakpoints>('lg');
  
  useEffect(() => {
    const getScreenSize = (): keyof typeof breakpoints => {
      const width = window.innerWidth;
      
      if (width < breakpoints.xxs) return 'xxs';
      if (width < breakpoints.xs) return 'xs';
      if (width < breakpoints.sm) return 'sm';
      if (width < breakpoints.md) return 'md';
      if (width < breakpoints.lg) return 'lg';
      if (width < breakpoints.xl) return 'xl';
      return '2xl';
    };
    
    const handleResize = () => {
      setScreenSize(getScreenSize());
    };
    
    // Set inicial
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return {
    screenSize,
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    isMobile: screenSize === 'xxs' || screenSize === 'xs',
    isTablet: screenSize === 'sm' || screenSize === 'md',
    isDesktop: screenSize === 'lg' || screenSize === 'xl' || screenSize === '2xl',
    is360OrLess: typeof window !== 'undefined' ? window.innerWidth <= 360 : false
  };
}

// Hook para valores responsivos
export function useResponsiveValue<T>(values: Partial<Record<keyof typeof breakpoints, T>>) {
  const { screenSize } = useScreenSize();
  
  const getValue = useCallback(() => {
    // Ordem dos breakpoints
    const sizes: (keyof typeof breakpoints)[] = ['xxs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = sizes.indexOf(screenSize);
    
    // Procura o valor mais próximo disponível
    for (let i = currentIndex; i >= 0; i--) {
      const size = sizes[i];
      if (values[size] !== undefined) {
        return values[size];
      }
    }
    
    // Fallback para o primeiro valor disponível
    return Object.values(values)[0];
  }, [screenSize, values]);
  
  return getValue();
}

// Hook para detectar dispositivos touch
export function useTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  
  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      );
    };
    
    checkTouch();
  }, []);
  
  return isTouch;
}

// Hook para safe areas (iOS)
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });
  
  useEffect(() => {
    const computeSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      
      setSafeArea({
        top: parseInt(computedStyle.getPropertyValue('--sat') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--sal') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--sar') || '0')
      });
    };
    
    computeSafeArea();
    window.addEventListener('resize', computeSafeArea);
    
    return () => window.removeEventListener('resize', computeSafeArea);
  }, []);
  
  return safeArea;
}

// Classe helper para construir classes responsivas
export class ResponsiveClassBuilder {
  private classes: string[] = [];
  
  add(className: string): this {
    this.classes.push(className);
    return this;
  }
  
  addResponsive(
    base: string,
    responsive: Partial<Record<keyof typeof breakpoints, string>>
  ): this {
    // Adiciona classe base
    this.classes.push(base);
    
    // Adiciona classes responsivas
    Object.entries(responsive).forEach(([breakpoint, className]) => {
      if (className) {
        this.classes.push(`${breakpoint}:${className}`);
      }
    });
    
    return this;
  }
  
  padding(values: {
    base?: string;
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
  }): this {
    const { base = 'p-2', ...responsive } = values;
    return this.addResponsive(base, responsive);
  }
  
  margin(values: {
    base?: string;
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
  }): this {
    const { base = 'm-0', ...responsive } = values;
    return this.addResponsive(base, responsive);
  }
  
  build(): string {
    return this.classes.join(' ');
  }
}

// Função helper para criar classes responsivas
export function responsiveClass(
  base: string,
  variants: Partial<Record<keyof typeof breakpoints, string>>
): string {
  const classes = [base];
  
  Object.entries(variants).forEach(([breakpoint, className]) => {
    if (className) {
      classes.push(`${breakpoint}:${className}`);
    }
  });
  
  return classes.join(' ');
}

// Hook para detectar orientação
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  
  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    };
    
    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);
    
    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);
  
  return orientation;
}

// Constantes de tamanhos mínimos para touch
export const TOUCH_SIZES = {
  minimum: 44,      // iOS Human Interface Guidelines
  comfortable: 48,  // Material Design
  large: 56        // Tamanho grande para ações principais
} as const;

// Função para calcular tamanho de fonte responsivo
export function responsiveFontSize(
  baseSize: number,
  { min = 12, max = 24, unit = 'px' }: { min?: number; max?: number; unit?: string } = {}
): string {
  const vw = `${((baseSize - min) / (1920 - 360)) * 100}vw`;
  return `clamp(${min}${unit}, ${vw}, ${max}${unit})`;
}

// Hook para detectar se deve usar animações reduzidas
export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return reducedMotion;
}

// Componente helper para Container Responsivo
export interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: keyof typeof breakpoints | 'full';
  padding?: boolean;
}

export function ResponsiveContainer({ 
  children, 
  className = '', 
  maxWidth = 'xl',
  padding = true 
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    xxs: 'max-w-[320px]',
    xs: 'max-w-[360px]',
    sm: 'max-w-[640px]',
    md: 'max-w-[768px]',
    lg: 'max-w-[1024px]',
    xl: 'max-w-[1280px]',
    '2xl': 'max-w-[1536px]',
    full: 'max-w-full'
  };
  
  const builder = new ResponsiveClassBuilder()
    .add('w-full mx-auto')
    .add(maxWidthClasses[maxWidth]);
    
  if (padding) {
    builder.padding({
      base: 'px-2',
      xs: 'px-3',
      sm: 'px-4',
      md: 'px-6',
      lg: 'px-8'
    });
  }
  
  if (className) {
    builder.add(className);
  }
  
  return (
    <div className={builder.build()}>
      {children}
    </div>
  );
}