import React, { useState, useEffect } from 'react'

function App() {
  const [backendMessage, setBackendMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch data from backend
    fetch('http://localhost:3001/api/hello')
      .then(response => response.json())
      .then(data => {
        setBackendMessage(data.message)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching from backend:', error)
        setBackendMessage('Backend connection failed')
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Full-Stack App</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#" className="hover:text-blue-200 transition-colors">Home</a>
              <a href="#" className="hover:text-blue-200 transition-colors">About</a>
              <a href="#" className="hover:text-blue-200 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Hello World from Frontend
          </h1>
          
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Backend Connection
            </h2>
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <p className="text-lg text-gray-600">
                {backendMessage}
              </p>
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">React + Vite</h3>
              <p className="text-gray-600">Fast development with hot module replacement</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">TailwindCSS</h3>
              <p className="text-gray-600">Utility-first CSS framework for styling</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Express Backend</h3>
              <p className="text-gray-600">RESTful API with Node.js and Express</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App