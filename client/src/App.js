import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Blog from './components/Blog';
import CreatePost from './components/CreatePost';
import Login from './auth/Login';
import Register from './auth/Register';
import NavbarTest from './components/Nav';
import Chat from './components/Chat';
import VerifyEmail from './auth/verifyEmail';
import EmailSuccessVerified from './auth/verificationSuccess';

function App() {

  // const userId = localStorage.getItem('userId');

  return (
    <div className="App">
      <BrowserRouter>
        <NavbarTest />
        {/* <Notification userId={userId} /> */}
        <Routes>
          <Route path='/blogs' element={<Blog />} />
          <Route path='/blog/create' element={<CreatePost />} />
          <Route path='/auth/login' element={< Login />} />
          <Route path='/auth/register' element={<Register />} />
          <Route path='/chat' element={<Chat />} />
          <Route path='/verify-email' element={<VerifyEmail />} />
          <Route path='/verification-success' element={<EmailSuccessVerified />} />

        </Routes>
      </BrowserRouter>

    </div>
  );
}

export default App;
