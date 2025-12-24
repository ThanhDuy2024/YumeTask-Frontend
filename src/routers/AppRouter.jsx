import { MainLayout } from '@/layouts/MainLayouts'
import { LoginPage } from '@/pages/auth/LoginPage'
import { Otp } from '@/pages/auth/OtpPage'
import { ProfilePage } from '@/pages/auth/ProfilePage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { TaskPage } from '@/pages/task/TaskPage'
import { PrivateRoute } from '@/PrivateRoute'
import { Route, Routes, Navigate} from 'react-router-dom'
export const AppRouter = () => {
  return (
    <>
      <Routes>
        <Route path='/' element={<Navigate to="/login" replace />} />
        <Route path='/login' index element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/otp' element={<Otp/>} />
        <Route element={<MainLayout/>}>
          <Route path='/task' element={
            <PrivateRoute>
              <TaskPage />
            </PrivateRoute>
          }/>
          <Route path='/profile' element={<ProfilePage/>}/>
        </Route>
        <Route path='/test' element={<PrivateRoute/>}/>
      </Routes>
    </>
  )
}