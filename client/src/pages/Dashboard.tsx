import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {

  const token = localStorage.getItem('token')
  const [users, setUsers] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const result = await response.json()
        setUsers(result)
        navigate('/dashboard') // Navigate to dashboard after fetching users
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }
  }, [token, navigate])

  return (
    <div>
      <p>Dashboard</p>
    </div>
  )
}

export default Dashboard
