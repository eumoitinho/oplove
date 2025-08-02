"use client"

import { useState, forwardRef } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
  quality?: number
  sizes?: string
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onClick?: () => void
  onLoad?: () => void
  onError?: () => void
  style?: React.CSSProperties
}

export const OptimizedImage = forwardRef<HTMLDivElement, OptimizedImageProps>(
  ({
    src,
    alt,
    width,
    height,
    fill = false,
    className,
    priority = false,
    quality = 95,
    sizes,
    placeholder = 'empty',
    blurDataURL,
    onClick,
    onLoad,
    onError,
    style
  }, ref) => {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    const handleLoad = () => {
      setIsLoading(false)
      onLoad?.()
    }

    const handleError = () => {
      setIsLoading(false)
      setHasError(true)
      onError?.()
    }

    const containerProps = {
      ref,
      className: cn(
        "relative overflow-hidden",
        onClick && "cursor-pointer hover:opacity-95 transition-opacity",
        className
      ),
      onClick,
      style: fill ? { ...style, position: 'relative' as const } : style
    }

    if (hasError) {
      return (
        <div {...containerProps}>
          <div className="flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600">
            <span className="text-sm">Erro ao carregar imagem</span>
          </div>
        </div>
      )
    }

    return (
      <div {...containerProps}>
        {isLoading && (
          <Skeleton className="absolute inset-0 w-full h-full bg-gray-200 dark:bg-gray-700" />
        )}
        
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          fill={fill}
          priority={priority}
          quality={quality}
          sizes={sizes}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            fill ? "object-cover" : ""
          )}
          style={fill ? undefined : { width: '100%', height: 'auto' }}
        />
      </div>
    )
  }
)

OptimizedImage.displayName = 'OptimizedImage'