import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import GymEffects from '../gym/GymEffects'
import { applyTheme, loadMode, MODE_HOME, modeFromPath, saveMode, type Mode } from './mode'

const NAV: Record<Mode, { to: string; label: string }[]> = {
  nutrition: [
    { to: '/n/today', label: 'Today' },
    { to: '/n/add', label: 'Add' },
    { to: '/n/stats', label: 'Stats' },
    { to: '/n/foods', label: 'Foods' },
  ],
  gym: [
    { to: '/g/workout', label: 'Workout' },
    { to: '/g/history', label: 'History' },
    { to: '/g/exercises', label: 'Exercises' },
    { to: '/g/routines', label: 'Routines' },
  ],
}

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const pathMode = modeFromPath(location.pathname)
  const [storedMode, setStoredMode] = useState<Mode>(loadMode)
  const mode = pathMode ?? storedMode

  useEffect(() => {
    if (pathMode && pathMode !== storedMode) {
      saveMode(pathMode)
      setStoredMode(pathMode)
    }
  }, [pathMode, storedMode])

  useEffect(() => applyTheme(mode), [mode])

  function switchTo(next: Mode) {
    saveMode(next)
    setStoredMode(next)
    navigate(MODE_HOME[next])
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="mode-switch" role="tablist" aria-label="Mode">
          {(['nutrition', 'gym'] as const).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              className={mode === m ? 'active' : ''}
              onClick={() => switchTo(m)}
            >
              {m === 'nutrition' ? 'Nutrition' : 'Gym'}
            </button>
          ))}
        </div>
        <Link to="/settings" className="icon-btn" aria-label="Settings">
          <GearIcon />
        </Link>
      </header>

      <main className="content">
        <Outlet />
      </main>

      <GymEffects />

      <nav className="bottomnav">
        {NAV[mode].map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

function GearIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}
