"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAdminTask, updateAdminTask } from "@/lib/api-admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";

export default function TaskEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target_url: "",
    icon_url: "",
    is_active: true,
  });

  useEffect(() => {
    loadTask();
  }, [params.id]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        target_url: task.target_url || "",
        icon_url: task.icon_url || "",
        is_active: task.is_active !== undefined ? task.is_active : true,
      });
    }
  }, [task]);

  const loadTask = async () => {
    setLoading(true);
    try {
      const response = await getAdminTask(parseInt(params.id as string));
      if (response.success) {
        setTask(response.data);
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat task",
          variant: "destructive",
        });
        router.back();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan",
        variant: "destructive",
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.target_url) {
      toast({
        title: "Error",
        description: "Title dan Target URL wajib diisi",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await updateAdminTask(parseInt(params.id as string), formData);
      if (response.success) {
        toast({
          title: "Berhasil",
          description: "Task berhasil diupdate",
        });
        router.push("/admin/tasks");
      } else {
        toast({
          title: "Gagal",
          description: response.message || "Gagal update task",
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
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading...</p>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Task #{task.sequence}</h1>
          <p className="text-muted-foreground">Ubah detail dan link task</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
          <CardDescription>
            Edit informasi task yang akan ditampilkan ke user
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Nonton Video Viral"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Deskripsi task (opsional)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_url">Target URL *</Label>
            <Input
              id="target_url"
              value={formData.target_url}
              onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
              placeholder="tllapp://view/task/1 atau https://..."
            />
            <p className="text-xs text-muted-foreground">
              Deep link (tllapp://...) atau URL lengkap (https://...)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon_url">Icon URL</Label>
            <Input
              id="icon_url"
              value={formData.icon_url}
              onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
              placeholder="https://example.com/icon.png"
            />
            <p className="text-xs text-muted-foreground">
              URL untuk icon task (opsional)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: !!checked })
              }
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Task aktif (user dapat mengerjakan task ini)
            </Label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

