import Macui from "./components/ui/Macui"

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/MacBook12.jpg)' }}>
      <nav className="flex justify-between items-center px-8 py-4 bg-black/30 backdrop-blur-md text-white">
        <div className="text-2xl font-bold">Agent-ia</div>
        <ul className="flex gap-6 list-none m-0 p-0">
          <li><a href="#inicio" className="text-gray-300 no-underline hover:text-white transition-colors">Inicio</a></li>
          <li><a href="#servicios" className="text-gray-300 no-underline hover:text-white transition-colors">Servicios</a></li>
          <li><a href="#contacto" className="text-gray-300 no-underline hover:text-white transition-colors">Contacto</a></li>
        </ul>
      </nav>

      <main className="flex-1">
        <Macui></Macui>
      </main>

      <footer className="text-gray-300 text-center py-4 text-sm">
        <b>&copy; 2026 Agent-ia ft Abrajam. Versión Beta</b>
      </footer>
    </div>
  )
}

export default App
