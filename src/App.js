import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Sider from './components/sider/sider'; // Sider component remains the same
import './App.css'; // Assuming you have a CSS file for global styles

function App() {
  return (
    <Router>
      <div>
        <Sider />
      </div>
    </Router>
  );
}

export default App;
