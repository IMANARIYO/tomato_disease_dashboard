"use client"

import { useState, useEffect } from "react"
import { userApi } from "@/lib/api/user"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Edit, Trash2, Eye } from "lucide-react"
import { toast } from "react-hot-toast"
import type { User, Role } from "@/types"
import Link from "next/link"
import { AuthGuard } from "@/components/layout/auth-guard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role>(Role.FARMER)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await userApi.getAll(1, 50)
      setUsers(response.data)
    } catch (error) {
      toast.error("Failed to fetch users")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = async () => {
    if (!editingUser) return

    try {
      await userApi.changeRole(editingUser.id, { role: selectedRole })
      toast.success("User role updated successfully")
      setIsDialogOpen(false)
      setEditingUser(null)
      fetchUsers()
    } catch (error) {
      toast.error("Failed to update user role")
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await userApi.delete(id)
        toast.success("User deleted successfully")
        fetchUsers()
      } catch (error) {
        toast.error("Failed to delete user")
      }
    }
  }

  const openRoleDialog = (user: User) => {
    setEditingUser(user)
    setSelectedRole(user.role)
    setIsDialogOpen(true)
  }

  const getRoleBadgeVariant = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return "destructive"
      case Role.AGRONOMIST:
        return "default"
      case Role.FARMER:
        return "secondary"
      default:
        return "outline"
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <AuthGuard requiredRoles={["ADMIN"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">Manage system users and roles</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>View and manage all registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.profilePicture || "/placeholder.svg"} />
                          <AvatarFallback>{user.email.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.username || "N/A"}</div>
                          <div className="text-sm text-muted-foreground">{user.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/users/${user.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openRoleDialog(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change User Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>User</Label>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={editingUser?.profilePicture || "/placeholder.svg"} />
                    <AvatarFallback>{editingUser?.email.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{editingUser?.username || "N/A"}</div>
                    <div className="text-sm text-muted-foreground">{editingUser?.email}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">New Role</Label>
                <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as Role)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Role).map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRoleChange}>Update Role</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  )
}
