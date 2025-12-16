"use client";

import { useEffect, useState } from "react";
import { getAdminUsers } from "@/lib/api-admin";
import { formatIDR } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { Eye } from "lucide-react";

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [filters, setFilters] = useState({
    search: "",
    tier_level: "all",
    is_active: "all",
    page: "1",
  });

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await getAdminUsers({
        search: filters.search || undefined,
        tier_level: filters.tier_level && filters.tier_level !== "all" ? parseInt(filters.tier_level) : undefined,
        is_active: filters.is_active && filters.is_active !== "all" ? filters.is_active === "true" : undefined,
        page: parseInt(filters.page),
        limit: 50,
      });
      if (response.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat users",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTierLabel = (tier: number) => {
    if (tier === 0) return "Free";
    if (tier === 1) return "Level 1";
    if (tier === 2) return "Level 2";
    if (tier === 3) return "Level 3";
    return `Tier ${tier}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">Kelola semua users</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Search username or email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: "1" })}
              className="max-w-sm"
            />
            <Select
              value={filters.tier_level || "all"}
              onValueChange={(value) => setFilters({ ...filters, tier_level: value === "all" ? undefined : value, page: "1" })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="0">Free</SelectItem>
                <SelectItem value="1">Level 1</SelectItem>
                <SelectItem value="2">Level 2</SelectItem>
                <SelectItem value="3">Level 3</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.is_active || "all"}
              onValueChange={(value) => setFilters({ ...filters, is_active: value === "all" ? undefined : value, page: "1" })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>
            {pagination && `Total: ${pagination.total} users`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p>Loading...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Tidak ada users</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Downlines</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getTierLabel(user.tier_level)}</Badge>
                      </TableCell>
                      <TableCell>
                        {user.is_active ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.wallet ? (
                          <div className="text-sm">
                            <div className="text-green-600">
                              {formatIDR(user.wallet.balance_available)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Locked: {formatIDR(
                                user.wallet.balance_deposit +
                                  user.wallet.balance_reward_task +
                                  user.wallet.balance_matching_lock
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{user._count?.downlines || 0}</TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString("id-ID")}
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/users/${user.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() => setFilters({ ...filters, page: (pagination.page - 1).toString() })}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() => setFilters({ ...filters, page: (pagination.page + 1).toString() })}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

