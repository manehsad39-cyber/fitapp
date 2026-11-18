import { HashRouter, Navigate, Route, Routes } from 'react-router'
import Layout from './Layout'
import SettingsScreen from './SettingsScreen'
import { loadMode, MODE_HOME } from './mode'
import { AddScreen, FoodsScreen, StatsScreen, TodayScreen } from '../nutrition/screens'
import { ExercisesScreen, HistoryScreen, RoutinesScreen, WorkoutScreen } from '../gym/screens'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/n/today" element={<TodayScreen />} />
          <Route path="/n/add" element={<AddScreen />} />
          <Route path="/n/stats" element={<StatsScreen />} />
          <Route path="/n/foods" element={<FoodsScreen />} />
          <Route path="/g/workout" element={<WorkoutScreen />} />
          <Route path="/g/history" element={<HistoryScreen />} />
          <Route path="/g/exercises" element={<ExercisesScreen />} />
          <Route path="/g/routines" element={<RoutinesScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="*" element={<Navigate to={MODE_HOME[loadMode()]} replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
