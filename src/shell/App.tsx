import { HashRouter, Navigate, Route, Routes } from 'react-router'
import Layout from './Layout'
import SettingsScreen from './SettingsScreen'
import { loadMode, MODE_HOME } from './mode'
import TodayScreen from '../nutrition/TodayScreen'
import MealEditScreen from '../nutrition/MealEditScreen'
import AddScreen from '../nutrition/AddScreen'
import StatsScreen from '../nutrition/StatsScreen'
import FoodsScreen from '../nutrition/FoodsScreen'
import FoodEditScreen from '../nutrition/FoodEditScreen'
import SavedMealEditScreen from '../nutrition/SavedMealEditScreen'
import WorkoutScreen from '../gym/WorkoutScreen'
import HistoryScreen from '../gym/HistoryScreen'
import WorkoutSummaryScreen from '../gym/WorkoutSummaryScreen'
import ExercisesScreen from '../gym/ExercisesScreen'
import ExerciseProgressScreen from '../gym/ExerciseProgressScreen'
import ExerciseEditScreen from '../gym/ExerciseEditScreen'
import RoutinesScreen from '../gym/RoutinesScreen'
import RoutineEditScreen from '../gym/RoutineEditScreen'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/n/today" element={<TodayScreen />} />
          <Route path="/n/add" element={<AddScreen />} />
          <Route path="/n/stats" element={<StatsScreen />} />
          <Route path="/n/foods" element={<FoodsScreen />} />
          <Route path="/n/today/meal/:id" element={<MealEditScreen />} />
          <Route path="/n/foods/food/:id" element={<FoodEditScreen />} />
          <Route path="/n/foods/saved/:id" element={<SavedMealEditScreen />} />
          <Route path="/g/workout" element={<WorkoutScreen />} />
          <Route path="/g/history" element={<HistoryScreen />} />
          <Route path="/g/exercises" element={<ExercisesScreen />} />
          <Route path="/g/routines" element={<RoutinesScreen />} />
          <Route path="/g/history/:id" element={<WorkoutSummaryScreen />} />
          <Route path="/g/exercises/:id" element={<ExerciseProgressScreen />} />
          <Route path="/g/exercises/edit/:id" element={<ExerciseEditScreen />} />
          <Route path="/g/routines/:id" element={<RoutineEditScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="*" element={<Navigate to={MODE_HOME[loadMode()]} replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
