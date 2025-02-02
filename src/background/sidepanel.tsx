import React from 'react'
import MainPage from './MainPage'
import Navbar from './Navbar'
import MusicUnderstanding from './MusicUnderstanding'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const SidePanel = () => {
  return (
    <div className="h-screen bg-gray-100">
      <Router>
        {/* <Navbar /> */}
        <Routes>
          <Route path="/*" element={<MusicUnderstanding />} />
          <Route path="/main" element={<MainPage />} />
        </Routes>
      </Router>
    </div>
  )
}

export default SidePanel