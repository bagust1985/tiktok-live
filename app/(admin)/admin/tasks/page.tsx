"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminTasks, initializeTasks } from "@/lib/api-admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Edit, Play, CheckCircle2, XCircle } from "lucide-react";

export default function TasksPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await getAdminTasks();
      if (response.success) {
        setTasks(response.data || []);
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat tasks",
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

  const handleInitialize = async () => {
    if (!confirm("Apakah Anda yakin ingin meng-initialize 20 default tasks? Ini akan membuat tasks baru jika belum ada.")) {
      return;
    }

    setInitializing(true);
    try {
      const response = await initializeTasks();
      if (response.success) {
        toast({
          title: "Berhasil",
          description: "20 tasks berhasil di-initialize",
        });
        loadTasks();
      } else {
        toast({
          title: "Error",
          description: response.message || "Gagal initialize tasks",
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
      setInitializing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Task Management</h1>
          <p className="text-muted-foreground">
            Kelola 20 task yang dapat dikerjakan user setiap hari
          </p>
        </div>
        {tasks.length === 0 && (
          <Button onClick={handleInitialize} disabled={initializing}>
            {initializing ? "Initializing..." : "Initialize 20 Tasks"}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task List</CardTitle>
          <CardDescription>
            Edit task untuk mengubah link atau detail task
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Belum ada task. Initialize tasks terlebih dahulu.</p>
              <Button onClick={handleInitialize} disabled={initializing}>
                {initializing ? "Initializing..." : "Initialize 20 Tasks"}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sequence</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Target URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">#{task.sequence}</TableCell>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {task.target_url.length > 50
                          ? `${task.target_url.substring(0, 50)}...`
                          : task.target_url}
                      </code>
                    </TableCell>
                    <TableCell>
                      {task.is_active ? (
                        <Badge variant="success" className="flex items-center gap-1 w-fit">
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                          <XCircle className="h-3 w-3" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/tasks/${task.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

