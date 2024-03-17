import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Blog.css'

const Blog = () => {
    const [blogs, setBlogs] = useState([])
    const [deleteMsg, setDeleteMsg] = useState(false)
    const inputRef = useRef();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/blog/posts')
                if (response) {
                    setBlogs(response.data)
                }
            } catch (error) {
                console.error('Something went wrong!', error);
            }
        };
        fetchData();
    }, [])

    const DeletePost = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/blog/posts/${id}`)
            //fetch data aprés la suppression
            const response = await axios.get('http://localhost:5000/api/blog/posts');
            //afficher un message de succcée
            setDeleteMsg(true)
            //faire un scroll aprés le traitement avec "inputRef"
            inputRef.current.scrollIntoView({ behavior: 'smooth' });
            // Modifier le state avec nouvelle data
            setBlogs(response.data);

        } catch (error) {
            console.error('Something went wrong!', error);
        }
    };

    return (
        <div className='container' ref={inputRef}>
            <div className='flex'>
                <h1>Blog List</h1>
                <Link className='btn-primary' to='/blog/create'>Create post</Link>
            </div>
            {deleteMsg &&
                <div style={{ backgroundColor: '#34cd60', color: '#fff', padding: '10px', borderRadius: '5px' }}>
                    La post est supprimer avec succcée
                </div>
            }
            <div>
                {blogs.map((blog) => (

                    <div key={blog._id} className="list-group-item">
                        <div>
                            <h3>Title : {blog.title}</h3>
                            <p>Content : {blog.content}</p>
                            <p >Author : {blog.author}</p>
                            <p >Slug : {blog.slug}</p>
                            <p >Tags : {blog.tags}</p>
                            <button
                                onClick={() => DeletePost(blog._id)}
                                className='btn-danger'
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Blog