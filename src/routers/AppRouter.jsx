import { MainLayout } from '@/layouts/MainLayouts'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ProfilePage } from '@/pages/auth/ProfilePage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { TaskPage } from '@/pages/task/TaskPage'
import { PrivateRoute } from '@/PrivateRoute'
import { Route, Routes } from 'react-router-dom'
export const AppRouter = () => {
  return (
    <>
      <Routes>
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route element={<MainLayout/>}>
          <Route path='/task' element={
              <TaskPage />
          }/>
          <Route path='/profile' element={<ProfilePage/>}/>
        </Route>
        <Route path='/test' element={<PrivateRoute/>}/>
      </Routes>
    </>
  )
}