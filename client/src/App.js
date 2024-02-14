import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Blog from './components/Blog';
import CreatePost from './components/CreatePost';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/blogs' element={<Blog />} />
          <Route path='/blog/create' element={<CreatePost />} />
        </Routes>
      </BrowserRouter>

    </div>
  );
}

export default App;
