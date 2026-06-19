import { useRef, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import './App.css'
import Header from './assets/components/Header'
import Readme from './assets/components/Readme'
import Background from './assets/components/Background'
import { useHeaderSpace } from './assets/utils/useHeaderSpace'

// Matches the fade-out duration in Readme.css, so the route only
// changes once the closing animation has actually finished.
const README_CLOSE_DURATION_MS = 300

function App() {
  const headerRef = useRef(null)
  useHeaderSpace(headerRef)
  const navigate = useNavigate()
  const [isClosingReadme, setIsClosingReadme] = useState(false)

  const closeReadme = () => {
    setIsClosingReadme(true)
    setTimeout(() => {
      navigate('/')
      setIsClosingReadme(false)
    }, README_CLOSE_DURATION_MS)
  }

  return (
    <>
      <Background />
      <Header ref={headerRef} onCloseReadme={closeReadme} />
      <Routes>
        <Route path="/" element={null} />
        <Route path="/readme" element={<Readme isClosing={isClosingReadme} />} />
      </Routes>
    </>
  )
}

export default App
