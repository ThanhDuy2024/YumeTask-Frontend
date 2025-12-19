import './App.css'
import { AppRouter } from './routers/AppRouter'
import { Toaster } from "sonner";
function App() {
  return (
    <>
      <AppRouter/>
      <Toaster richColors closeButton /> m 
    </>
  )
}
export default App
