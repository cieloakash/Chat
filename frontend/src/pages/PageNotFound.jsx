import React from 'react'
import { Link } from 'react-router-dom'

const PageNotFound = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center  p-6">
      <h1 className="text-4xl font-bold text-red-500">404</h1>
      <p className="text-lg text-gray-700 mt-2">Oops! Page not found.</p>
      <Link to="/" className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
        Go Home
      </Link>
    </div>
  )
}

export default PageNotFound