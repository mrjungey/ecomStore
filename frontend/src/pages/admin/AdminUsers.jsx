import { useEffect, useState } from "react" 
import api from "../../services/api" 

export default function AdminUsers() {
  const [users, setUsers] = useState([]) 
  const [loading, setLoading] = useState(true) 

  useEffect(() => {
    api.get("/admin/users").then((res) => setUsers(res.data.users)).catch(() => {}).finally(() => setLoading(false)) 
  }, []) 

  if (loading) return <p className="text-sm text-gray-400">Loading...</p> 

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">All Users</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">Email</th>
              <th className="py-2 pr-4 font-medium">Role</th>
              <th className="py-2 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b">
                <td className="py-2 pr-4">{u.name}</td>
                <td className="py-2 pr-4 text-gray-500">{u.email}</td>
                <td className="py-2 pr-4 capitalize">{u.role}</td>
                <td className="py-2 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) 
}
