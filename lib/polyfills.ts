// Browser Polyfills and Compatibility Fixes

// NOTE: Some polyfill imports are temporarily disabled due to installation issues
// The following packages need to be installed when the build environment is fixed:
// - smoothscroll-polyfill
// - intersection-observer  
// - @juggle/resize-observer
// - abortcontroller-polyfill
// These polyfills provide compatibility for older browsers but are not critical for modern browsers

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

// 1. Smooth Scroll Polyfill for Safari and older browsers
// Temporarily disabled due to installation issues
// if (isBrowser && !('scrollBehavior' in document.documentElement.style)) {
//   import('smoothscroll-polyfill').then(module => {
//     module.polyfill()
//   })
// }

// 2. IntersectionObserver Polyfill for older browsers
// Temporarily disabled due to installation issues
// if (isBrowser && !window.IntersectionObserver) {
//   import('intersection-observer')
// }

// 3. ResizeObserver Polyfill
// Temporarily disabled due to installation issues
// if (isBrowser && !window.ResizeObserver) {
//   import('@juggle/resize-observer').then(module => {
//     window.ResizeObserver = module.ResizeObserver
//   })
// }

// 4. Object.fromEntries polyfill for older browsers
if (!Object.fromEntries) {
  Object.fromEntries = function<T = any>(entries: Iterable<readonly [PropertyKey, T]>): { [k: string]: T } {
    const obj: { [k: string]: T } = {}
    for (const [key, value] of entries) {
      obj[String(key)] = value
    }
    return obj
  }
}

// 5. Array.prototype.flat polyfill
if (!Array.prototype.flat) {
  Array.prototype.flat = function(depth = 1) {
    return depth > 0
      ? this.reduce((acc, val) => {
          if (Array.isArray(val)) {
            return acc.concat(val.flat(depth - 1))
          }
          return acc.concat(val)
        }, [])
      : this.slice()
  }
}

// 6. Promise.allSettled polyfill
if (!Promise.allSettled) {
  Promise.allSettled = function(promises) {
    return Promise.all(
      promises.map(p =>
        Promise.resolve(p).then(
          value => ({ status: 'fulfilled', value }),
          reason => ({ status: 'rejected', reason })
        )
      )
    )
  }
}

// 7. String.prototype.replaceAll polyfill
if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function(search: string | RegExp, replace: string) {
    if (search instanceof RegExp) {
      if (!search.global) {
        throw new TypeError('String.prototype.replaceAll called with a non-global RegExp')
      }
      return this.replace(search, replace)
    }
    return this.split(search).join(replace)
  }
}

// 8. Crypto.randomUUID polyfill
if (isBrowser && !crypto.randomUUID) {
  crypto.randomUUID = function(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }
}

// 9. Custom Event polyfill for IE11
if (isBrowser && typeof window.CustomEvent !== 'function') {
  function CustomEvent(event: string, params: any) {
    params = params || { bubbles: false, cancelable: false, detail: null }
    const evt = document.createEvent('CustomEvent')
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail)
    return evt
  }
  window.CustomEvent = CustomEvent as any
}

// 10. Fetch AbortController polyfill
// Temporarily disabled due to installation issues
// if (isBrowser && !window.AbortController) {
//   import('abortcontroller-polyfill/dist/polyfill-patch-fetch')
// }

// Browser-specific fixes
export const browserFixes = {
  // Safari date input fix
  fixSafariDateInput: () => {
    if (isBrowser && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
      const dateInputs = document.querySelectorAll('input[type="date"]')
      dateInputs.forEach(input => {
        input.addEventListener('blur', function(this: HTMLInputElement) {
          if (this.value && !this.value.includes('-')) {
            // Convert Safari's format to standard format
            const parts = this.value.split('/')
            if (parts.length === 3) {
              this.value = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`
            }
          }
        })
      })
    }
  },

  // iOS viewport height fix
  fixIOSViewportHeight: () => {
    if (isBrowser && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
      const setViewportHeight = () => {
        const vh = window.innerHeight * 0.01
        document.documentElement.style.setProperty('--vh', `${vh}px`)
      }
      
      setViewportHeight()
      window.addEventListener('resize', setViewportHeight)
      window.addEventListener('orientationchange', setViewportHeight)
    }
  },

  // Firefox smooth scroll fix
  fixFirefoxSmoothScroll: () => {
    if (isBrowser && navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
      document.documentElement.style.scrollBehavior = 'smooth'
    }
  },

  // Edge legacy fixes
  fixEdgeLegacy: () => {
    if (isBrowser && /Edge\/\d+/.test(navigator.userAgent) && !/Edg\//.test(navigator.userAgent)) {
      // Add specific Edge legacy fixes here
      document.documentElement.classList.add('edge-legacy')
    }
  },

  // Apply all fixes
  applyAll: () => {
    if (!isBrowser) return
    
    browserFixes.fixSafariDateInput()
    browserFixes.fixIOSViewportHeight()
    browserFixes.fixFirefoxSmoothScroll()
    browserFixes.fixEdgeLegacy()
  }
}

// CSS Feature Detection
export const cssSupport = {
  // Check for CSS Grid support
  grid: isBrowser && CSS.supports('display', 'grid'),
  
  // Check for CSS custom properties
  customProperties: isBrowser && CSS.supports('--test', '0'),
  
  // Check for backdrop filter
  backdropFilter: isBrowser && CSS.supports('backdrop-filter', 'blur(10px)'),
  
  // Check for gap property in flexbox
  flexGap: isBrowser && CSS.supports('gap', '10px'),
  
  // Check for aspect-ratio
  aspectRatio: isBrowser && CSS.supports('aspect-ratio', '16/9'),
  
  // Check for container queries
  containerQueries: isBrowser && CSS.supports('container-type', 'inline-size'),
}

// Utility functions for cross-browser compatibility
export const crossBrowserUtils = {
  // Get scroll position cross-browser
  getScrollPosition: () => {
    if (!isBrowser) return { x: 0, y: 0 }
    return {
      x: window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0,
      y: window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
    }
  },

  // Get viewport dimensions
  getViewportDimensions: () => {
    if (!isBrowser) return { width: 0, height: 0 }
    return {
      width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
      height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    }
  },

  // Request animation frame with fallback
  requestAnimationFrame: (callback: FrameRequestCallback) => {
    if (!isBrowser) return 0
    
    const raf = window.requestAnimationFrame ||
      (window as any).webkitRequestAnimationFrame ||
      (window as any).mozRequestAnimationFrame ||
      (window as any).msRequestAnimationFrame ||
      ((cb: FrameRequestCallback) => setTimeout(cb, 16))
    
    return raf(callback)
  },

  // Cancel animation frame with fallback
  cancelAnimationFrame: (id: number) => {
    if (!isBrowser) return
    
    const caf = window.cancelAnimationFrame ||
      (window as any).webkitCancelAnimationFrame ||
      (window as any).mozCancelAnimationFrame ||
      (window as any).msCancelAnimationFrame ||
      clearTimeout
    
    caf(id)
  },

  // Full screen API with vendor prefixes
  requestFullscreen: (element: HTMLElement) => {
    if (!isBrowser) return Promise.reject()
    
    const requestFS = element.requestFullscreen ||
      (element as any).webkitRequestFullscreen ||
      (element as any).mozRequestFullScreen ||
      (element as any).msRequestFullscreen
    
    if (requestFS) {
      return requestFS.call(element)
    }
    
    return Promise.reject(new Error('Fullscreen not supported'))
  },

  // Exit fullscreen with vendor prefixes
  exitFullscreen: () => {
    if (!isBrowser) return Promise.reject()
    
    const exitFS = document.exitFullscreen ||
      (document as any).webkitExitFullscreen ||
      (document as any).mozCancelFullScreen ||
      (document as any).msExitFullscreen
    
    if (exitFS) {
      return exitFS.call(document)
    }
    
    return Promise.reject(new Error('Exit fullscreen not supported'))
  },

  // Get vendor prefix for CSS property
  getVendorPrefix: (property: string): string => {
    if (!isBrowser) return property
    
    const styles = window.getComputedStyle(document.documentElement, '')
    const pre = (Array.prototype.slice
      .call(styles)
      .join('')
      .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
    )[1]
    
    return pre ? `-${pre}-${property}` : property
  }
}

// Initialize polyfills and fixes when the module is imported
if (isBrowser) {
  // Apply browser fixes on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      browserFixes.applyAll()
    })
  } else {
    browserFixes.applyAll()
  }
}

export default {
  browserFixes,
  cssSupport,
  crossBrowserUtils
}