// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'antd/dist/reset.css'
import './index.css'
import Main from './Main.tsx'

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
      <Main/>
  // </StrictMode>,
)
