import { useState, useEffect } from 'react'
import './App.css'

export default function App() {
  const [currentFrame, setCurrentFrame] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="splash-container">
      <div className="splash-background" />
      
      <div className="splash-content">
        {currentFrame === 0 && (
          <div className="frame frame-1">
            <span className="logo-text">spacetransfers</span>
            <span className="rocket-icon">🧑‍🚀🚀</span>
          </div>
        )}
        
        {currentFrame === 1 && (
          <div className="frame frame-2">
          </div>
        )}
        
        {currentFrame === 2 && (
          <div className="frame frame-3">
            <h1 className="tagline">DTF Transfer that are out of this world</h1>
          </div>
        )}
      </div>
    </div>
  )
}
