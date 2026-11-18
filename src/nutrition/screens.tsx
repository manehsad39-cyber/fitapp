// Phase 1 stubs. Replaced by the real Nutrition screens in Phase 2.

function Pending({ title }: { title: string }) {
  return (
    <div className="screen">
      <h1>{title}</h1>
      <p className="muted">Built in Phase 2.</p>
    </div>
  )
}

export const TodayScreen = () => <Pending title="Today" />
export const AddScreen = () => <Pending title="Add" />
export const StatsScreen = () => <Pending title="Stats" />
export const FoodsScreen = () => <Pending title="Foods" />
