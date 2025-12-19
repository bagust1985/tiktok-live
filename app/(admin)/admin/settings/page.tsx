"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getAdminBanks,
  createAdminBank,
  updateAdminBank,
  toggleAdminBank,
  deleteAdminBank,
  getAdminContacts,
  createAdminContact,
  updateAdminContact,
} from "@/lib/api-admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SuperAdminRoute from "@/components/admin/layout/SuperAdminRoute";

function AdminSettingsContent() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [banks, setBanks] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);

  const [newBank, setNewBank] = useState({
    bank_name: "",
    account_number: "",
    account_holder: "",
    is_active: true,
  });

  const [newContact, setNewContact] = useState({
    title: "",
    number: "",
    type: "WHATSAPP",
    sequence: 1,
    is_active: true,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [banksRes, contactsRes]: any[] = await Promise.all([
        getAdminBanks(),
        getAdminContacts(),
      ]);

      if (banksRes.success) {
        setBanks(banksRes.data || []);
      }
      if (contactsRes.success) {
        setContacts(contactsRes.data || []);
      }
    } catch (error) {
      console.error("Load settings error:", error);
      toast({
        title: "Error",
        description: "Gagal memuat pengaturan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateBank = async () => {
    if (!newBank.bank_name || !newBank.account_number || !newBank.account_holder) {
      toast({
        title: "Error",
        description: "Nama bank, nomor rekening, dan nama pemilik wajib diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      const res: any = await createAdminBank(newBank);
      if (res.success) {
        toast({
          title: "Berhasil",
          description: "Bank berhasil ditambahkan",
        });
        setNewBank({
          bank_name: "",
          account_number: "",
          account_holder: "",
          is_active: true,
        });
        loadData();
      } else {
        toast({
          title: "Gagal",
          description: res.message || "Gagal menambahkan bank",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menambahkan bank",
        variant: "destructive",
      });
    }
  };

  const handleToggleBank = async (id: number) => {
    try {
      const res: any = await toggleAdminBank(id);
      if (res.success) {
        loadData();
      } else {
        toast({
          title: "Gagal",
          description: res.message || "Gagal mengubah status bank",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengubah status bank",
        variant: "destructive",
      });
    }
  };

  const handleUpdateBankField = async (
    id: number,
    field: "bank_name" | "account_number" | "account_holder",
    value: string
  ) => {
    setBanks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
    try {
      await updateAdminBank(id, { [field]: value } as any);
    } catch (error) {
      // Silent error, already optimistic updated
    }
  };

  const handleDeleteBank = async (id: number) => {
    if (!confirm("Yakin ingin menghapus bank ini?")) return;
    try {
      const res: any = await deleteAdminBank(id);
      if (res.success) {
        toast({
          title: "Berhasil",
          description: "Bank berhasil dihapus",
        });
        loadData();
      } else {
        toast({
          title: "Gagal",
          description: res.message || "Gagal menghapus bank",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus bank",
        variant: "destructive",
      });
    }
  };

  const handleCreateContact = async () => {
    if (!newContact.title || !newContact.number) {
      toast({
        title: "Error",
        description: "Judul dan nomor/username wajib diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      const res: any = await createAdminContact(newContact);
      if (res.success) {
        toast({
          title: "Berhasil",
          description: "Kontak berhasil ditambahkan",
        });
        setNewContact({
          title: "",
          number: "",
          type: "WHATSAPP",
          sequence: 1,
          is_active: true,
        });
        loadData();
      } else {
        toast({
          title: "Gagal",
          description: res.message || "Gagal menambahkan kontak",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menambahkan kontak",
        variant: "destructive",
      });
    }
  };

  const handleUpdateContactField = async (
    id: number,
    field: "title" | "number" | "type" | "sequence" | "is_active",
    value: any
  ) => {
    setContacts((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      )
    );
    try {
      await updateAdminContact(id, { [field]: value } as any);
    } catch (error) {
      // Silent error
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">
          Kelola rekening bank perusahaan dan kontak CS yang tampil di sisi user
        </p>
      </div>

      <Tabs defaultValue="banks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="banks">Bank Perusahaan</TabsTrigger>
          <TabsTrigger value="contacts">Contact Center</TabsTrigger>
        </TabsList>

        {/* Bank Settings */}
        <TabsContent value="banks">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Daftar Bank</CardTitle>
                <CardDescription>
                  Atur rekening tujuan transfer yang ditampilkan ke user
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p>Loading...</p>
                ) : banks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Belum ada bank terdaftar.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {banks.map((bank) => (
                      <div
                        key={bank.id}
                        className="flex flex-col gap-2 rounded-lg border p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1 space-y-1">
                            <Input
                              value={bank.bank_name}
                              onChange={(e) =>
                                handleUpdateBankField(
                                  bank.id,
                                  "bank_name",
                                  e.target.value
                                )
                              }
                              placeholder="Nama Bank"
                            />
                            <Input
                              value={bank.account_number}
                              onChange={(e) =>
                                handleUpdateBankField(
                                  bank.id,
                                  "account_number",
                                  e.target.value
                                )
                              }
                              placeholder="Nomor Rekening"
                            />
                            <Input
                              value={bank.account_holder}
                              onChange={(e) =>
                                handleUpdateBankField(
                                  bank.id,
                                  "account_holder",
                                  e.target.value
                                )
                              }
                              placeholder="Nama Pemilik"
                            />
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={bank.is_active}
                                onCheckedChange={() =>
                                  handleToggleBank(bank.id)
                                }
                              />
                              <span className="text-xs text-muted-foreground">
                                {bank.is_active ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteBank(bank.id)}
                            >
                              Hapus
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tambah Bank Baru</CardTitle>
                <CardDescription>
                  Tambahkan rekening bank perusahaan yang baru
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nama Bank</Label>
                  <Input
                    value={newBank.bank_name}
                    onChange={(e) =>
                      setNewBank({ ...newBank, bank_name: e.target.value })
                    }
                    placeholder="BCA, MANDIRI, DANA, dll"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nomor Rekening</Label>
                  <Input
                    value={newBank.account_number}
                    onChange={(e) =>
                      setNewBank({
                        ...newBank,
                        account_number: e.target.value,
                      })
                    }
                    placeholder="1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nama Pemilik Rekening</Label>
                  <Input
                    value={newBank.account_holder}
                    onChange={(e) =>
                      setNewBank({
                        ...newBank,
                        account_holder: e.target.value,
                      })
                    }
                    placeholder="PT Tiktok Live&Like"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Switch
                      checked={newBank.is_active}
                      onCheckedChange={(v) =>
                        setNewBank({ ...newBank, is_active: v })
                      }
                    />
                    <span>Aktifkan</span>
                  </Label>
                </div>
                <Button onClick={handleCreateBank} className="w-full">
                  Simpan Bank
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contact Center Settings */}
        <TabsContent value="contacts">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Daftar Kontak</CardTitle>
                <CardDescription>
                  Atur nomor kontak CS yang tampil di Help Center user
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p>Loading...</p>
                ) : contacts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Belum ada kontak CS terdaftar.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="space-y-3 rounded-lg border p-3"
                      >
                        <div className="space-y-2">
                          <Label>Judul</Label>
                          <Input
                            value={contact.title || ""}
                            onChange={(e) =>
                              handleUpdateContactField(
                                contact.id,
                                "title",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Nomor / Username</Label>
                          <Input
                            value={contact.number || ""}
                            onChange={(e) =>
                              handleUpdateContactField(
                                contact.id,
                                "number",
                                e.target.value
                              )
                            }
                            placeholder="0812... atau @username"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tipe</Label>
                          <Select
                            value={contact.type || "WHATSAPP"}
                            onValueChange={(v) =>
                              handleUpdateContactField(contact.id, "type", v)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih tipe" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                              <SelectItem value="TELEGRAM">Telegram</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Urutan</Label>
                          <Input
                            type="number"
                            value={contact.sequence ?? 1}
                            onChange={(e) =>
                              handleUpdateContactField(
                                contact.id,
                                "sequence",
                                parseInt(e.target.value || "1", 10)
                              )
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <Switch
                              checked={contact.is_active}
                              onCheckedChange={(v) =>
                                handleUpdateContactField(
                                  contact.id,
                                  "is_active",
                                  v
                                )
                              }
                            />
                            <span>Aktif</span>
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tambah Kontak Baru</CardTitle>
                <CardDescription>
                  Tambahkan kontak CS yang baru
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Judul</Label>
                  <Input
                    value={newContact.title}
                    onChange={(e) =>
                      setNewContact({ ...newContact, title: e.target.value })
                    }
                    placeholder="CS Deposit, CS Task, dll"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nomor / Username</Label>
                  <Input
                    value={newContact.number}
                    onChange={(e) =>
                      setNewContact({ ...newContact, number: e.target.value })
                    }
                    placeholder="0812... atau @username"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipe</Label>
                  <Select
                    value={newContact.type}
                    onValueChange={(v) =>
                      setNewContact({ ...newContact, type: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                      <SelectItem value="TELEGRAM">Telegram</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Urutan</Label>
                  <Input
                    type="number"
                    value={newContact.sequence}
                    onChange={(e) =>
                      setNewContact({
                        ...newContact,
                        sequence: parseInt(e.target.value || "1", 10),
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Switch
                      checked={newContact.is_active}
                      onCheckedChange={(v) =>
                        setNewContact({ ...newContact, is_active: v })
                      }
                    />
                    <span>Aktifkan</span>
                  </Label>
                </div>
                <Button onClick={handleCreateContact} className="w-full">
                  Simpan Kontak
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <SuperAdminRoute>
      <AdminSettingsContent />
    </SuperAdminRoute>
  );
}


