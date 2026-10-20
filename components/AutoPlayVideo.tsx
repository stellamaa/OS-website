'use client'

import { useEffect, useRef, type VideoHTMLAttributes } from 'react'

type AutoPlayVideoProps = Omit<
  VideoHTMLAttributes<HTMLVideoElement>,
  'autoPlay' | 'muted' | 'playsInline' | 'controls'
> & {
  /** Re-attempt play when this changes (e.g. slide becomes active) */
  playKey?: string | number
}

/**
 * Muted looping video that autoplays on Safari/iOS.
 * Safari often ignores React's muted/autoPlay unless the DOM properties
 * are set and play() is called explicitly.
 */
export default function AutoPlayVideo({
  playKey,
  onLoadedMetadata,
  ...props
}: AutoPlayVideoProps) {
  const ref = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return

    video.defaultMuted = true
    video.muted = true
    video.playsInline = true
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')

    const tryPlay = () => {
      video.muted = true
      const playAttempt = video.play()
      if (playAttempt !== undefined) {
        playAttempt.catch(() => {
          // Autoplay may still be blocked (e.g. Low Power Mode); ignore.
        })
      }
    }

    tryPlay()
    video.addEventListener('loadeddata', tryPlay)
    video.addEventListener('canplay', tryPlay)
    document.addEventListener('visibilitychange', tryPlay)

    return () => {
      video.removeEventListener('loadeddata', tryPlay)
      video.removeEventListener('canplay', tryPlay)
      document.removeEventListener('visibilitychange', tryPlay)
    }
  }, [playKey, props.src])

  return (
    <video
      ref={ref}
      {...props}
      autoPlay
      muted
      loop
      playsInline
      controls={false}
      disablePictureInPicture
      preload={props.preload ?? 'auto'}
      onLoadedMetadata={onLoadedMetadata}
    />
  )
}
