"use client";

import { DEFAULT_CONTACTS } from "@/lib/content-defaults";
import { useContentKey } from "@/components/admin/content-context";
import { Card, PageHeader, TextField } from "@/components/admin/ui";

type Contacts = typeof DEFAULT_CONTACTS;

function urlError(v: string): string | null {
  if (!v.trim()) return null;
  try {
    const u = new URL(v.trim());
    return u.protocol === "https:" || u.protocol === "http:" ? null : "Посилання має починатися з https://";
  } catch {
    return "Посилання має починатися з https://";
  }
}

export default function ContactsPage() {
  const [stored, setContacts] = useContentKey<Contacts>("contacts", DEFAULT_CONTACTS);
  const contacts = { ...DEFAULT_CONTACTS, ...stored };
  const update = (patch: Partial<Contacts>) => setContacts({ ...contacts, ...patch });

  return (
    <>
      <PageHeader
        title="Контакти"
        description="Блок «Швидкий звʼязок» на сторінці «Контакти» і прямі посилання, які бачить клієнтка, якщо заявку не вдалося надіслати."
        siteHref="/uk/contacts"
      />
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <Card title="Telegram" className="space-y-4">
          <TextField
            label="Нікнейм"
            value={contacts.telegram_handle}
            onChange={(telegram_handle) => update({ telegram_handle })}
            placeholder="@ellen_rouge"
            hint="Показується як підпис посилання"
          />
          <TextField
            label="Посилання"
            type="url"
            inputMode="url"
            value={contacts.telegram_url}
            onChange={(telegram_url) => update({ telegram_url })}
            placeholder="https://t.me/…"
            error={urlError(contacts.telegram_url)}
          />
        </Card>
        <Card title="WhatsApp" className="space-y-4">
          <TextField
            label="Посилання"
            type="url"
            inputMode="url"
            value={contacts.whatsapp_url}
            onChange={(whatsapp_url) => update({ whatsapp_url })}
            placeholder="https://wa.me/380…"
            hint="Формат: https://wa.me/ і номер без «+» і пробілів"
            error={urlError(contacts.whatsapp_url)}
          />
        </Card>
        <Card title="Instagram" className="space-y-4">
          <TextField
            label="Нікнейм"
            value={contacts.instagram_handle}
            onChange={(instagram_handle) => update({ instagram_handle })}
            placeholder="@ellen_soul_taro"
          />
          <TextField
            label="Посилання"
            type="url"
            inputMode="url"
            value={contacts.instagram_url}
            onChange={(instagram_url) => update({ instagram_url })}
            placeholder="https://instagram.com/…"
            error={urlError(contacts.instagram_url)}
          />
        </Card>
      </div>
    </>
  );
}
