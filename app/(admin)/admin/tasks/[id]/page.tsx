"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAdminTask, updateAdminTask, uploadTaskIcon } from "@/lib/api-admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Upload, X } from "lucide-react";
import Image from "next/image";

export default function TaskEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [iconPreview, setIconPreview] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target_url: "",
    icon_url: "",
    is_active: true,
  });

  const loadTask = useCallback(async () => {
    setLoading(true);
    try {
      const response: any = await getAdminTask(parseInt(params.id as string));
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan",
        variant: "destructive",
      });
      router.back();
    } finally {
      setLoading(false);
    }
  }, [params.id, toast, router]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        target_url: task.target_url || "",
        icon_url: task.icon_url || "",
        is_active: task.is_active !== undefined ? task.is_active : true,
      });
      // Set icon preview from existing icon_url
      if (task.icon_url) {
        const iconUrl = task.icon_url.startsWith('http') 
          ? task.icon_url 
          : `${process.env.NEXT_PUBLIC_API_URL}${task.icon_url}`;
        setIconPreview(iconUrl);
      }
    }
  }, [task]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "File harus berupa gambar",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Ukuran file maksimal 2MB",
        variant: "destructive",
      });
      return;
    }

    // Read file and convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setIconPreview(base64String);
      
      // Upload immediately
      await handleUploadIcon(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadIcon = async (base64String: string) => {
    setUploading(true);
    try {
      const response: any = await uploadTaskIcon(parseInt(params.id as string), base64String);
      if (response.success) {
        toast({
          title: "Berhasil",
          description: "Icon berhasil diupload",
        });
        // Update form data with new icon URL
        setFormData({ ...formData, icon_url: response.data.icon_url });
        // Reload task to get updated data
        await loadTask();
      } else {
        toast({
          title: "Gagal",
          description: response.message || "Gagal upload icon",
          variant: "destructive",
        });
        setIconPreview(""); // Reset preview on error
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat upload icon",
        variant: "destructive",
      });
      setIconPreview(""); // Reset preview on error
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveIcon = async () => {
    setIconPreview("");
    setFormData({ ...formData, icon_url: "" });
    
    // Update task to remove icon
    setSaving(true);
    try {
      const response: any = await updateAdminTask(parseInt(params.id as string), { icon_url: "" });
      if (response.success) {
        toast({
          title: "Berhasil",
          description: "Icon berhasil dihapus",
        });
        await loadTask();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal menghapus icon",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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
      const response: any = await updateAdminTask(parseInt(params.id as string), formData);
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
    } catch (error: any) {
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
            <Label>Task Icon (Opsional)</Label>
            
            {/* Icon Preview */}
            {iconPreview && (
              <div className="relative w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted">
                <Image
                  src={iconPreview}
                  alt="Icon preview"
                  width={96}
                  height={96}
                  className="object-contain"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6"
                  onClick={handleRemoveIcon}
                  disabled={uploading || saving}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || saving}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Uploading..." : iconPreview ? "Ganti Icon" : "Upload Icon"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            
            <p className="text-xs text-muted-foreground">
              Upload icon task (PNG, JPG, max 2MB, 128x128px recommended)
            </p>
            
            {/* Icon URL field (read-only, for reference) */}
            {formData.icon_url && (
              <div className="space-y-1">
                <Label htmlFor="icon_url" className="text-xs">Icon URL</Label>
                <Input
                  id="icon_url"
                  value={formData.icon_url}
                  readOnly
                  className="text-xs"
                />
              </div>
            )}
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

