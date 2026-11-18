// Phase 1 stubs. Replaced by the real Gym screens in Phase 3.

function Pending({ title }: { title: string }) {
  return (
    <div className="screen">
      <h1>{title}</h1>
      <p className="muted">Built in Phase 3.</p>
    </div>
  )
}

export const WorkoutScreen = () => <Pending title="Workout" />
export const HistoryScreen = () => <Pending title="History" />
export const ExercisesScreen = () => <Pending title="Exercises" />
export const RoutinesScreen = () => <Pending title="Routines" />
