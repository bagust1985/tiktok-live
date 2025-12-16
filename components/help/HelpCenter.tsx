"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getPublicContacts } from "@/lib/api";

interface ContactCenter {
  id: number;
  title: string;
  number: string;
  type: string;
  sequence: number;
  is_active: boolean;
}

function formatWhatsAppNumber(raw: string): string {
  let n = raw.trim();
  if (n.startsWith("+")) n = n.slice(1);
  if (n.startsWith("0")) {
    n = "62" + n.slice(1);
  } else if (!n.startsWith("62")) {
    n = "62" + n;
  }
  // keep digits only
  n = n.replace(/\D/g, "");
  return n;
}

function buildContactUrl(contact: ContactCenter): string {
  if (contact.type === "WHATSAPP") {
    const normalized = formatWhatsAppNumber(contact.number);
    return `https://wa.me/${normalized}`;
  }
  // TELEGRAM
  const value = contact.number.trim();
  if (value.startsWith("@")) {
    return `https://t.me/${value.slice(1)}`;
  }
  // assume username or phone
  return `https://t.me/${value}`;
}

export default function HelpCenter() {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<ContactCenter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicContacts()
      .then((res) => {
        if (res.success) {
          setContacts(res.data || []);
        }
      })
      .catch((err) => {
        console.error("Failed to load contacts", err);
        toast({
          title: "Error",
          description: "Gagal memuat kontak CS",
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Help Center</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Memuat kontak CS...</p>
        ) : contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada kontak CS yang aktif.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {contacts.map((c) => {
              const url = buildContactUrl(c);
              const isWhatsApp = c.type === "WHATSAPP";
              const Icon = isWhatsApp ? MessageCircle : Send;
              return (
                <div
                  key={c.id}
                  className="rounded-lg border p-3 flex flex-col justify-between gap-3"
                >
                  <div>
                    <p className="font-semibold">{c.title}</p>
                    <p className="text-sm text-muted-foreground break-all">
                      {c.number}
                    </p>
                    <p className="mt-1 text-xs uppercase text-primary">
                      {isWhatsApp ? "WhatsApp" : "Telegram"}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <Button asChild size="sm" className="gap-2">
                      <a href={url} target="_blank" rel="noreferrer">
                        <Icon className="h-4 w-4" />
                        Hubungi
                      </a>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


