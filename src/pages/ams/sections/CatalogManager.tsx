import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useUpsertCatalog, useDeleteCatalog } from "@/hooks/useAMS";
import { useAuth } from "@/hooks/useAuth";

interface Field {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select";
  options?: string[];
  required?: boolean;
}

interface Props {
  title: string;
  description?: string;
  table: string;
  cacheKey: string;
  items: any[];
  isLoading?: boolean;
  fields: Field[];
  displayBadges?: (item: any) => { label: string; tone?: string }[];
}

export default function CatalogManager({ title, description, table, cacheKey, items, isLoading, fields, displayBadges }: Props) {
  const { isBossOwner, isCEO } = useAuth();
  const canEdit = isBossOwner || isCEO;
  const upsert = useUpsertCatalog(table, cacheKey);
  const del = useDeleteCatalog(table, cacheKey);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  const openNew = () => { setEditing(null); setForm({ is_active: true }); setOpen(true); };
  const openEdit = (it: any) => { setEditing(it); setForm({ ...it }); setOpen(true); };
  const save = async () => {
    const payload: any = { ...form };
    fields.forEach((f) => { if (f.type === "number" && payload[f.key] != null) payload[f.key] = Number(payload[f.key]); });
    if (editing?.id) payload.id = editing.id;
    await upsert.mutateAsync(payload);
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
        {canEdit && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew}><Plus className="h-4 w-4 mr-1" />New</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{editing ? "Edit" : "Create"} {title}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                {fields.map((f) => (
                  <div key={f.key}>
                    <label className="text-sm font-medium">{f.label}</label>
                    {f.type === "textarea" ? (
                      <Textarea value={form[f.key] || ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                    ) : f.type === "select" ? (
                      <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form[f.key] || ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}>
                        <option value="">Select…</option>
                        {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <Input type={f.type === "number" ? "number" : "text"} value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                    )}
                  </div>
                ))}
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button onClick={save} disabled={upsert.isPending}>Save</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : items?.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No items yet.</CardContent></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items?.map((it) => (
            <Card key={it.id} className={!it.is_active ? "opacity-50" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{it.name || it.title || `#${it.id?.slice(0, 6)}`}</span>
                  {canEdit && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(it)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => del.mutate(it.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {it.description && <p className="text-xs text-muted-foreground">{it.description}</p>}
                <div className="flex flex-wrap gap-1">
                  {displayBadges?.(it).map((b, i) => <Badge key={i} variant="secondary">{b.label}</Badge>)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
