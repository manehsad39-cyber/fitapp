import { useEffect, useState } from 'react'
import { useSettings } from '../db/settings'
import { useActiveWorkout } from './data'
import { restTimer, useRestEndsAt } from './restTimer'

/** Rest timer bar (shown while a rest is running) and the screen wake lock during an active workout. */
export default function GymEffects() {
  const active = useActiveWorkout()
  useWakeLock(!!active)
  return <RestTimerBar />
}

function RestTimerBar() {
  const endsAt = useRestEndsAt()
  const s = useSettings()
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!endsAt) return
    const t = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(t)
  }, [endsAt])

  const remaining = endsAt ? Math.ceil((endsAt - now) / 1000) : 0

  useEffect(() => {
    if (endsAt && remaining <= 0) {
      // Vibrate only if the rest ended just now (not when reopening the app much later).
      if (Date.now() - endsAt < 3000) navigator.vibrate?.([300, 150, 300])
      restTimer.skip()
    }
  }, [endsAt, remaining])

  if (!endsAt || remaining <= 0 || !s?.restTimerEnabled) return null
  const m = Math.floor(remaining / 60)
  const sec = String(remaining % 60).padStart(2, '0')

  return (
    <div className="rest-bar" role="timer" aria-live="off">
      <span className="rest-label">Rest</span>
      <span className="rest-time">
        {m}:{sec}
      </span>
      <button className="btn" onClick={() => restTimer.add(30)}>
        +30 s
      </button>
      <button className="btn" onClick={() => restTimer.skip()}>
        Skip
      </button>
    </div>
  )
}

/** Keeps the screen on while `on` is true, where the Wake Lock API is supported. */
function useWakeLock(on: boolean) {
  useEffect(() => {
    if (!on || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let cancelled = false
    const acquire = async () => {
      try {
        if (document.visibilityState === 'visible' && !cancelled) lock = await navigator.wakeLock.request('screen')
      } catch {
        // Denied (e.g. battery saver): nothing to do.
      }
    }
    // The lock is released when the app goes to the background; take it again on return.
    const onVisible = () => document.visibilityState === 'visible' && acquire()
    acquire()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      lock?.release().catch(() => {})
    }
  }, [on])
}
