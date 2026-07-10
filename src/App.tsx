import { useState, useEffect } from 'react'
import './App.css'

const slides = [
  { id: 1, title: 'Slide 1', color: '#646cff' },
  { id: 2, title: 'Slide 2', color: '#535bf2' },
  { id: 3, title: 'Slide 3', color: '#747bff' },
]

function App() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="logo">App_agent</div>
        <ul className="nav-links">
          <li><a href="#inicio">Inicio</a></li>
          <li><a href="#servicios">Servicios</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ul>
      </nav>

      <main className="main">
        <section className="carousel">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className={`slide ${i === current ? 'active' : ''}`}
              style={{ backgroundColor: slide.color }}
            >
              <h2>{slide.title}</h2>
            </div>
          ))}
          <div className="carousel-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === current ? 'active' : ''}`}
                onClick={() => setCurrent(i)}
              />
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>&copy; 2026 MiApp. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

export default App
