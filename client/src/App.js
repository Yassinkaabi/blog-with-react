import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Blog from './components/Blog';
import CreatePost from './components/CreatePost';
import Login from './auth/Login';
import Register from './auth/Register';
import NavbarTest from './components/Nav';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <NavbarTest />
        <Routes>
          <Route path='/blogs' element={<Blog />} />
          <Route path='/blog/create' element={<CreatePost />} />
          <Route path='/auth/login' element={< Login />} />
          <Route path='/auth/register' element={<Register />} />
        </Routes>
      </BrowserRouter>

    </div>
  );
}

export default App;
