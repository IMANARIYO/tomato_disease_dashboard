"use client";

import { useState, useEffect, useMemo } from "react";
import { userApi } from "@/lib/api/user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Mail,
  Calendar,
  Shield,
  User as UserIcon,
  Users,
  UserCheck,
  Crown,
  Sprout,
} from "lucide-react";
import { toast } from "react-hot-toast";
import type { User, Role } from "@/types";
import Link from "next/link";
import { AuthGuard } from "@/components/layout/auth-guard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCreateData, useUpdateAllDataById } from "@/hooks/apiHooks";
import { useAppContext } from "@/Config/AppProvider";

// Define roles enum for better type safety
enum UserRole {
  ADMIN = "ADMIN",
  AGRONOMIST = "AGRONOMIST",
  FARMER = "FARMER",
}

interface CreateUserForm {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  address?: string;
}

interface UserStats {
  total: number;
  admins: number;
  agronomists: number;
  farmers: number;
  recentUsers: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.FARMER);
  const [createForm, setCreateForm] = useState<CreateUserForm>({
    username: "",
    email: "",
    password: "",
    role: UserRole.FARMER,
    phone: "",
    address: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { profileData, profileLoading, profileError } = useAppContext();

  console.log("profileData in UsersPage:", profileData);

  const {
    mutate: createUserMutation,
    isPending: isCreating,
    error: createError,
  } = useCreateData("/auth/signup");

  const {
    mutate: updateUserRoleUserMutation,
    isPending: isUpdatingRole,
    error: updateRoleError,
  } = useUpdateAllDataById("auth/updateUserById");

  // Calculate user statistics
  const userStats = useMemo((): UserStats => {
    const total = users.length;
    const admins = users.filter((user) => user.role === "ADMIN").length;
    const agronomists = users.filter(
      (user) => user.role === "AGRONOMIST"
    ).length;
    const farmers = users.filter((user) => user.role === "FARMER").length;

    // Users created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = users.filter(
      (user) => new Date(user.createdAt) >= thirtyDaysAgo
    ).length;

    return {
      total,
      admins,
      agronomists,
      farmers,
      recentUsers,
    };
  }, [users]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userApi.getAll(1, 50);
      setUsers(response.data);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      createUserMutation(
        {
          username: createForm.username,
          email: createForm.email,
          password: createForm.password,
          role: createForm.role,
        },
        {
          onSuccess: (data) => {
            toast.success("User created successfully");
            setCreateForm({
              username: "",
              email: "",
              password: "",
              role: UserRole.FARMER,
            });
            setIsCreateDialogOpen(false);
            fetchUsers();
          },
          onError: (error: any) => {
            console.log("Error creating user:", error);
            toast.error(error.response?.data?.error || "Failed to create user");
          },
        }
      );
      fetchUsers();
    } catch (error) {
      toast.error("Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async () => {
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      updateUserRoleUserMutation(
        {
          id: editingUser.id,
          data: { role: selectedRole },
        },
        {
          onSuccess: (data) => {
            console.log("User role updated successfully:", data);
            toast.success("User role updated successfully");
            setIsRoleDialogOpen(false);
            fetchUsers();
          },
          onError: (error: any) => {
            console.error("Error updating user role:", error);
            toast.error(
              error.response?.data?.error || "Failed to update user role"
            );
          },
        }
      );
    } catch (error) {
      toast.error("Failed to update user role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      try {
        await userApi.delete(id);
        toast.success("User deleted successfully");
        fetchUsers();
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  const openRoleDialog = (user: User) => {
    setEditingUser(user);
    // setSelectedRole(user.role as UserRole);
    setIsRoleDialogOpen(true);
  };

  const openViewDialog = (user: User) => {
    setViewingUser(user);
    setIsViewDialogOpen(true);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return "destructive";
      case UserRole.AGRONOMIST:
        return "default";
      case UserRole.FARMER:
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Shield className="h-4 w-4" />;
      case UserRole.AGRONOMIST:
        return <UserIcon className="h-4 w-4" />;
      case UserRole.FARMER:
        return <UserIcon className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthGuard requiredRoles={["ADMIN"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">
              Manage system users and roles
            </p>
          </div>

          {/* Create User Button */}
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <UserPlus className="h-4 w-4 mr-2" />
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Create New User
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={createForm.username}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          username: e.target.value,
                        })
                      }
                      required
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={createForm.email}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, email: e.target.value })
                      }
                      required
                      placeholder="Enter email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, password: e.target.value })
                    }
                    required
                    placeholder="Enter password"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select
                      value={createForm.role}
                      onValueChange={(value) =>
                        setCreateForm({
                          ...createForm,
                          role: value as UserRole,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(UserRole).map((role) => (
                          <SelectItem key={role} value={role}>
                            <div className="flex items-center gap-2">
                              {getRoleIcon(role)}
                              {role}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={createForm.phone}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, phone: e.target.value })
                      }
                      placeholder="Enter phone number"
                    />
                  </div> */}
                </div>
                {/* <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={createForm.address}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, address: e.target.value })
                    }
                    placeholder="Enter address"
                    rows={3}
                  />
                </div> */}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create User"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* User Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.total}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Administrators
              </CardTitle>
              <Crown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {userStats.admins}
              </div>
              <p className="text-xs text-muted-foreground">Admin users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agronomists</CardTitle>
              <UserCheck className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {userStats.agronomists}
              </div>
              <p className="text-xs text-muted-foreground">Expert users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Farmers</CardTitle>
              <Sprout className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {userStats.farmers}
              </div>
              <p className="text-xs text-muted-foreground">Farming users</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                New Users (30 days)
              </CardTitle>
              <UserPlus className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {userStats.recentUsers}
              </div>
              <p className="text-xs text-muted-foreground">Recently joined</p>
            </CardContent>
          </Card> */}

          {/* <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Ratio</CardTitle>
              <Shield className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {userStats.total > 0
                  ? Math.round((userStats.admins / userStats.total) * 100)
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">Of total users</p>
            </CardContent>
          </Card> */}

          {/* <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <Calendar className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {userStats.total > 0
                  ? Math.round((userStats.recentUsers / userStats.total) * 100)
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">Monthly growth</p>
            </CardContent>
          </Card> */}
        </div>

        {/* Users Table */}
        <Card>
          {/* <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              View and manage all registered users ({users.length} total)
            </CardDescription>
          </CardHeader> */}
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={user.profilePicture || "/placeholder.svg"}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {user.username?.charAt(0).toUpperCase() ||
                              user.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.username || "N/A"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getRoleBadgeVariant(user.role)}
                        className="gap-1"
                      >
                        {getRoleIcon(user.role)}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openViewDialog(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openRoleDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        {user.id !== profileData?.data?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Role Change Dialog */}
        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Change User Role
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Current User</Label>
                <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={editingUser?.profilePicture || "/placeholder.svg"}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {editingUser?.username?.charAt(0).toUpperCase() ||
                        editingUser?.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {editingUser?.username || "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {editingUser?.email}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Current Role</Label>
                <Badge
                  variant={getRoleBadgeVariant(editingUser?.role || "")}
                  className="gap-1"
                >
                  {getRoleIcon(editingUser?.role || "")}
                  {editingUser?.role}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="newRole">New Role</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(value) => setSelectedRole(value as UserRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(UserRole).map((role) => (
                      <SelectItem key={role} value={role}>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(role)}
                          {role}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsRoleDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleRoleChange} disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Role"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View User Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                User Details
              </DialogTitle>
            </DialogHeader>
            {viewingUser && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={viewingUser.profilePicture || "/placeholder.svg"}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                      {viewingUser.username?.charAt(0).toUpperCase() ||
                        viewingUser.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {viewingUser.username || "N/A"}
                    </h3>
                    <p className="text-muted-foreground">{viewingUser.email}</p>
                    <Badge
                      variant={getRoleBadgeVariant(viewingUser.role)}
                      className="gap-1 mt-2"
                    >
                      {getRoleIcon(viewingUser.role)}
                      {viewingUser.role}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-sm font-medium">User ID</Label>
                    <p className="text-sm text-muted-foreground font-mono">
                      {viewingUser.id}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm text-muted-foreground">
                      {viewingUser.email}
                    </p>
                  </div>

                  {/* <div>
                    <Label className="text-sm font-medium">Phone</Label>
                    <p className="text-sm text-muted-foreground">
                      {viewingUser.phone || "N/A"}
                    </p>
                  </div> */}

                  {/* <div>
                    <Label className="text-sm font-medium">Address</Label>
                    <p className="text-sm text-muted-foreground">
                      {viewingUser.address || "N/A"}
                    </p>
                  </div> */}

                  <div>
                    <Label className="text-sm font-medium">Member Since</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(viewingUser.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Last Updated</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(viewingUser.updatedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsViewDialogOpen(false)}
                  >
                    Close
                  </Button>
                  {/* <Button asChild>
                    <Link href={`/dashboard/users/${viewingUser.id}`}>
                      View Full Profile
                    </Link>
                  </Button> */}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  );
}
