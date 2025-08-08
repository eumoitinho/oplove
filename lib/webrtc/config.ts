/**
 * WebRTC Configuration for OpenLove
 * Optimized for mobile compatibility, especially iOS Safari
 */

export interface IceServer {
  urls: string | string[]
  username?: string
  credential?: string
  credentialType?: 'password' | 'oauth'
}

/**
 * Get STUN/TURN servers configuration
 * Uses multiple servers for redundancy and better NAT traversal
 */
export function getIceServers(): IceServer[] {
  const servers: IceServer[] = [
    // Google's public STUN servers
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ]

  // Add TURN servers if configured (required for most mobile networks)
  if (process.env.NEXT_PUBLIC_TURN_SERVER_URL) {
    servers.push({
      urls: process.env.NEXT_PUBLIC_TURN_SERVER_URL,
      username: process.env.NEXT_PUBLIC_TURN_USERNAME || '',
      credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL || '',
      credentialType: 'password'
    })
  }

  // Fallback to free TURN servers (less reliable but better than nothing)
  servers.push(
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    }
  )

  return servers
}

/**
 * Get RTCPeerConnection configuration
 * Optimized for mobile and cross-browser compatibility
 */
export function getRTCConfiguration(): RTCConfiguration {
  return {
    iceServers: getIceServers(),
    iceTransportPolicy: 'all', // Use both STUN and TURN
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
    iceCandidatePoolSize: 10, // Pre-gather candidates for faster connection
  }
}

/**
 * Get media constraints for different scenarios
 */
export const MediaConstraints = {
  // Audio call constraints
  audioOnly: {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 48000,
    },
    video: false
  },

  // Video call constraints (adaptive for mobile)
  videoCall: {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 48000,
    },
    video: {
      width: { min: 320, ideal: 640, max: 1280 },
      height: { min: 240, ideal: 480, max: 720 },
      frameRate: { ideal: 30, max: 30 },
      facingMode: 'user', // Front camera on mobile
    }
  },

  // Screen sharing constraints
  screenShare: {
    video: {
      displaySurface: 'browser',
      logicalSurface: true,
      cursor: 'always',
      width: { max: 1920 },
      height: { max: 1080 },
      frameRate: { max: 30 }
    },
    audio: false
  }
}

/**
 * Check if WebRTC is supported in the current browser
 */
export function isWebRTCSupported(): boolean {
  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    window.RTCPeerConnection
  )
}

/**
 * Check if we're on iOS Safari (requires special handling)
 */
export function isIOSSafari(): boolean {
  const ua = navigator.userAgent.toLowerCase()
  const isIOS = /iphone|ipad|ipod/.test(ua)
  const isSafari = /safari/.test(ua) && !/chrome/.test(ua)
  return isIOS && isSafari
}

/**
 * Get optimal SDP settings for mobile
 */
export function optimizeSDP(sdp: string): string {
  // Prefer VP8 for better mobile compatibility
  let optimizedSDP = sdp.replace(/m=video ([0-9]+) RTP\/SAVPF ([0-9 ]*)/g, (match, port, codecs) => {
    const codecArray = codecs.split(' ')
    // Prefer VP8 (usually 96) over VP9 or H264
    const vp8Index = codecArray.indexOf('96')
    if (vp8Index > 0) {
      codecArray.splice(vp8Index, 1)
      codecArray.unshift('96')
    }
    return `m=video ${port} RTP/SAVPF ${codecArray.join(' ')}`
  })

  // Set lower bitrate for mobile
  if (isMobile()) {
    optimizedSDP = optimizedSDP.replace(/b=AS:([0-9]+)/g, 'b=AS:500')
  }

  return optimizedSDP
}

/**
 * Check if running on mobile device
 */
export function isMobile(): boolean {
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    navigator.userAgent.toLowerCase()
  )
}

/**
 * Connection state monitor with automatic reconnection
 */
export class ConnectionMonitor {
  private pc: RTCPeerConnection
  private onReconnect: () => void
  private reconnectTimer?: NodeJS.Timeout
  private maxReconnectAttempts = 3
  private reconnectAttempts = 0

  constructor(peerConnection: RTCPeerConnection, onReconnect: () => void) {
    this.pc = peerConnection
    this.onReconnect = onReconnect
    this.startMonitoring()
  }

  private startMonitoring() {
    this.pc.addEventListener('connectionstatechange', () => {
      console.log('Connection state:', this.pc.connectionState)

      switch (this.pc.connectionState) {
        case 'disconnected':
        case 'failed':
          this.handleDisconnection()
          break
        case 'connected':
          this.handleConnection()
          break
      }
    })

    // Monitor ICE connection state as well
    this.pc.addEventListener('iceconnectionstatechange', () => {
      console.log('ICE connection state:', this.pc.iceConnectionState)

      if (this.pc.iceConnectionState === 'failed') {
        this.handleDisconnection()
      }
    })
  }

  private handleDisconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      console.log(`Attempting reconnection (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`)
      
      this.reconnectTimer = setTimeout(() => {
        this.reconnectAttempts++
        this.onReconnect()
      }, 2000 * Math.pow(2, this.reconnectAttempts)) // Exponential backoff
    }
  }

  private handleConnection() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
    this.reconnectAttempts = 0
  }

  public destroy() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
    }
  }
}

/**
 * Bandwidth management for mobile networks
 */
export async function setBandwidthLimit(
  pc: RTCPeerConnection,
  audioBandwidth: number = 50, // kbps
  videoBandwidth: number = 500 // kbps
) {
  const senders = pc.getSenders()
  
  for (const sender of senders) {
    const params = sender.getParameters()
    
    if (!params.encodings || params.encodings.length === 0) {
      params.encodings = [{}]
    }

    if (sender.track?.kind === 'audio') {
      params.encodings[0].maxBitrate = audioBandwidth * 1000
    } else if (sender.track?.kind === 'video') {
      params.encodings[0].maxBitrate = videoBandwidth * 1000
      
      // Also set resolution constraints for mobile
      if (isMobile()) {
        params.encodings[0].scaleResolutionDownBy = 2
      }
    }

    await sender.setParameters(params)
  }
}

/**
 * Error recovery strategies
 */
export const ErrorRecovery = {
  // Handle getUserMedia errors
  async handleMediaError(error: Error): Promise<MediaStream | null> {
    console.error('Media error:', error)

    if (error.name === 'NotAllowedError') {
      throw new Error('Permissão de câmera/microfone negada. Por favor, permita o acesso nas configurações.')
    }

    if (error.name === 'NotFoundError') {
      throw new Error('Nenhuma câmera ou microfone encontrado.')
    }

    if (error.name === 'OverconstrainedError') {
      // Try with reduced constraints
      console.log('Trying with reduced constraints...')
      try {
        return await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { facingMode: 'user' }
        })
      } catch (fallbackError) {
        // Try audio only
        console.log('Trying audio only...')
        return await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      }
    }

    throw error
  },

  // Handle connection errors
  handleConnectionError(error: Error): void {
    console.error('Connection error:', error)
    
    // Implement retry logic or fallback
    if (error.message.includes('ICE')) {
      console.log('ICE gathering failed, check TURN server configuration')
    }
  }
}