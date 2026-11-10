'use client'

import React, { useRef, useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, RotateCcw, Check, X, Upload, RefreshCw, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelfieCameraProps {
  onCapture: (imageDataUrl: string) => void
  onCancel: () => void
}

export function SelfieCamera({ onCapture, onCancel }: SelfieCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }, [stream])

  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera is not supported in this browser environment.')
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err: unknown) {
      const errorObj = err as { name?: string; message?: string }
      if (errorObj?.name === 'NotAllowedError' || errorObj?.name === 'PermissionDeniedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings, or upload a photo instead.')
      } else if (errorObj?.name === 'NotFoundError' || errorObj?.name === 'DevicesNotFoundError') {
        setError('No camera detected on this device. You can upload a photo instead.')
      } else {
        setError(errorObj?.message || 'Unable to access camera. Please check your permissions or upload a photo.')
      }
      console.error('Camera error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [startCamera, stopCamera])

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setCapturedImage(imageDataUrl)
        stopCamera()
      }
    }
  }, [stopCamera])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedImage(event.target.result as string)
          stopCamera()
          setError(null)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const retake = useCallback(() => {
    setCapturedImage(null)
    startCamera()
  }, [startCamera])

  const confirmPhoto = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage)
    }
  }, [capturedImage, onCapture])

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Hidden file input for photo upload fallback */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      <div className="relative w-full max-w-md aspect-[4/3] bg-muted rounded-lg overflow-hidden">
        {isLoading && !capturedImage && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-muted/95 z-10">
            <AlertCircle className="w-10 h-10 text-destructive mb-2" />
            <p className="text-destructive font-medium text-sm mb-1">{error}</p>
            <p className="text-xs text-muted-foreground mb-4">
              Click the camera/lock icon in your browser address bar to allow permissions, or upload a photo directly.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={startCamera}>
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Try Again
              </Button>
              <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-3.5 h-3.5 mr-1" />
                Upload Photo
              </Button>
            </div>
          </div>
        )}

        {!capturedImage ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() => setIsLoading(false)}
            className={cn(
              "w-full h-full object-cover scale-x-[-1]",
              (isLoading || !!error) && "opacity-0"
            )}
          />
        ) : (
          <img
            src={capturedImage || "/placeholder.svg"}
            alt="Captured selfie"
            className="w-full h-full object-cover scale-x-[-1]"
          />
        )}

        {/* Face guide overlay */}
        {!capturedImage && !error && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-60 border-2 border-dashed border-primary/50 rounded-full" />
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      <p className="text-sm text-muted-foreground text-center max-w-md">
        {capturedImage 
          ? "Review your photo. Make sure your face is clearly visible."
          : "Position your face within the guide and take a photo for verification, or upload a photo."
        }
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        {!capturedImage ? (
          <>
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Photo
            </Button>
            <Button onClick={capturePhoto} disabled={isLoading || !!error}>
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={retake}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake
            </Button>
            <Button onClick={confirmPhoto}>
              <Check className="w-4 h-4 mr-2" />
              Confirm
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
