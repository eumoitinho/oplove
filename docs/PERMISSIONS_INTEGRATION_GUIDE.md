# Permission System Integration Guide

## Overview

The OpenLove permission system provides a unified way to handle browser permissions across all devices (desktop Mac/Linux/Windows, iOS, Android). It ensures proper permission requests and graceful handling when features require specific permissions.

## Architecture

### Core Components

1. **PermissionsService** (`lib/services/permissions-service.ts`)
   - Device detection and capability checking
   - Platform-specific permission handling
   - Permission state management

2. **usePermissions Hook** (`hooks/usePermissions.ts`)
   - React integration for permission management
   - Convenience hooks for specific permissions
   - Toast notifications and callbacks

3. **UI Components**
   - `PermissionRequest` - Modal for requesting permissions
   - `MediaUploadButton` - File upload with permission handling
   - `NotificationPermissionBanner` - Non-intrusive notification prompt

## Usage Examples

### 1. Camera Permission

```typescript
import { useCameraPermission } from '@/hooks/usePermissions'

function CameraCapture() {
  const { hasPermission, requestPermission, permissions } = useCameraPermission({
    showToast: true,
    onGranted: () => console.log('Camera access granted'),
    onDenied: () => console.log('Camera access denied')
  })
  
  const cameraPermission = permissions.get('camera')
  
  const handleCapture = async () => {
    if (!hasPermission('camera')) {
      const granted = await requestPermission('camera')
      if (!granted) return
    }
    
    // Proceed with camera capture
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    // ... use stream
  }
  
  return (
    <div>
      {cameraPermission?.status === 'denied' && (
        <Alert>Camera access denied. Check browser settings.</Alert>
      )}
      <Button onClick={handleCapture}>Take Photo</Button>
    </div>
  )
}
```

### 2. Microphone Permission

```typescript
import { useMicrophonePermission } from '@/hooks/usePermissions'

function AudioRecorder() {
  const { hasPermission, requestPermission } = useMicrophonePermission()
  
  const startRecording = async () => {
    if (!hasPermission('microphone')) {
      const granted = await requestPermission('microphone')
      if (!granted) {
        toast.error('Microphone permission required')
        return
      }
    }
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    // Start recording...
  }
}
```

### 3. Location Permission

```typescript
import { useLocationPermission } from '@/hooks/usePermissions'

function LocationPicker() {
  const { hasPermission, requestPermission, isAvailable } = useLocationPermission()
  
  const getCurrentLocation = async () => {
    if (!isAvailable('location')) {
      toast.error('Geolocation not supported')
      return
    }
    
    if (!hasPermission('location')) {
      const granted = await requestPermission('location')
      if (!granted) return
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        // Use coordinates...
      },
      (error) => console.error('Location error:', error)
    )
  }
}
```

### 4. Media Upload with Permissions

```typescript
import { MediaUploadButton } from '@/components/common/MediaUploadButton'

function PostCreator() {
  const handleFileSelect = (file: File) => {
    console.log('File selected:', file)
    // Process file...
  }
  
  return (
    <MediaUploadButton
      onFileSelect={handleFileSelect}
      accept="image/*,video/*"
      maxSize={10 * 1024 * 1024} // 10MB
      showCameraOption={true}
      variant="outline"
    >
      <Camera className="w-4 h-4 mr-2" />
      Add Photo/Video
    </MediaUploadButton>
  )
}
```

### 5. Notification Permission Banner

The notification banner is automatically included in the app and will:
- Show after 5 seconds on first visit
- Not show if user already granted/denied permission
- Remember dismissal state in localStorage

```typescript
// Already integrated in app/layout.tsx via Providers
// No additional setup needed
```

## Platform-Specific Behavior

### Desktop (Windows/Mac/Linux)
- Full Permissions API support
- Camera/microphone prompts show browser dialog
- Location uses browser's geolocation API
- Notifications follow browser settings

### iOS Safari
- Limited Permissions API support
- Camera/microphone only work in secure contexts (HTTPS)
- Must handle DeviceMotionEvent separately
- Push notifications require iOS 16.4+

### Android Chrome
- Full Permissions API support
- Can request persistent permissions
- Better integration with device settings
- Support for advanced features like background location

## Best Practices

1. **Always Check Availability First**
   ```typescript
   if (!isAvailable('camera')) {
     toast.error('Camera not available on this device')
     return
   }
   ```

2. **Request Permissions Just-in-Time**
   - Don't request on page load
   - Request when user interacts with feature
   - Explain why permission is needed

3. **Handle Denial Gracefully**
   ```typescript
   const { permissions } = usePermissions(['camera'])
   const cameraPermission = permissions.get('camera')
   
   if (cameraPermission?.status === 'denied') {
     return <PermissionDeniedMessage type="camera" />
   }
   ```

4. **Show Permission Status**
   ```typescript
   {!hasPermission('microphone') && (
     <Badge variant="warning">
       <MicOff className="w-3 h-3 mr-1" />
       Microphone not enabled
     </Badge>
   )}
   ```

5. **Use Toast Notifications**
   ```typescript
   const { requestPermission } = useCameraPermission({
     showToast: true, // Automatic success/error toasts
     toastMessages: {
       granted: 'Camera ready to use!',
       denied: 'Camera access needed for this feature'
     }
   })
   ```

## Testing Permissions

### Chrome DevTools
1. Open DevTools (F12)
2. Go to Application > Permissions
3. Change permission states for testing

### Reset Permissions
```javascript
// In browser console
navigator.permissions.query({ name: 'camera' }).then(p => console.log(p.state))
```

### Mobile Testing
- Use HTTPS (required for permissions)
- Test on real devices when possible
- Check iOS/Android specific behaviors

## Common Issues

### 1. Permission Denied Previously
```typescript
if (permission?.status === 'denied') {
  // Show instructions to change in browser settings
  return <BrowserSettingsInstructions type={permissionType} />
}
```

### 2. Feature Not Available
```typescript
const { capabilities } = usePermissions()
if (!capabilities?.hasCamera) {
  return <NoCameraMessage />
}
```

### 3. HTTPS Required
```typescript
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  return <HTTPSRequiredMessage />
}
```

## Migration Guide

### From Direct API Usage

Before:
```typescript
// Old approach
const stream = await navigator.mediaDevices.getUserMedia({ video: true })
```

After:
```typescript
// New approach with permissions
const { hasPermission, requestPermission } = useCameraPermission()

if (!hasPermission('camera')) {
  const granted = await requestPermission('camera')
  if (!granted) return
}

const stream = await navigator.mediaDevices.getUserMedia({ video: true })
```

### From Custom Permission Handling

Before:
```typescript
// Custom permission handling
try {
  const result = await navigator.permissions.query({ name: 'camera' })
  if (result.state === 'denied') {
    alert('Camera permission denied')
  }
} catch (error) {
  console.error('Permission error:', error)
}
```

After:
```typescript
// Unified permission system
const { permissions } = useCameraPermission({ showToast: true })
const cameraPermission = permissions.get('camera')

if (cameraPermission?.status === 'denied') {
  // Handled automatically with toast
}
```