"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AdminCharities() {
  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  /* ================= FETCH ================= */
  const fetchCharities = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("charities")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) toast.error("Failed to load charities");
    else setCharities(data || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchCharities();
  }, []);

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!name.trim()) return toast.error("Charity name required");

    setSaving(true);

    try {
      if (editingId) {
        await supabase
          .from("charities")
          .update({
            name,
            description,
            image_url: imageUrl,
          })
          .eq("id", editingId);

        toast.success("Updated");
      } else {
        await supabase.from("charities").insert({
          name,
          description,
          image_url: imageUrl,
        });

        toast.success("Created");
      }

      resetForm();
      fetchCharities();
    } catch {
      toast.error("Failed");
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this charity?")) return;

    setDeletingId(id);

    try {
      await supabase.from("charities").delete().eq("id", id);
      toast.success("Deleted");
      fetchCharities();
    } catch {
      toast.error("Failed");
    } finally {
      setDeletingId(null);
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (c: any) => {
    setName(c.name);
    setDescription(c.description || "");
    setImageUrl(c.image_url || "");
    setEditingId(c.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setImageUrl("");
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="p-20 text-center text-muted-foreground">
        Loading charities...
      </div>
    );
  }

  return (
    <div className="section space-y-12">

      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-semibold">Charities</h1>
        <p className="text-muted-foreground">
          Manage impact-driven organizations
        </p>
      </div>

      {/* FORM */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-border bg-white/70 backdrop-blur-xl p-6 shadow-lg"
      >
        <h2 className="text-lg font-semibold mb-4">
          {editingId ? "Edit Charity" : "Add Charity"}
        </h2>

        <div className="grid md:grid-cols-2 gap-4">

          <input
            placeholder="Charity Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />

          <input
            placeholder="Image URL (Unsplash recommended)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="input"
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input md:col-span-2"
          />
        </div>

        {/* IMAGE PREVIEW */}
        {imageUrl && (
          <div className="mt-4 overflow-hidden rounded-2xl">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-52 object-cover"
            />
          </div>
        )}

        <div className="flex gap-3 mt-5">
          <button onClick={handleSave} className="btn-primary">
            {saving
              ? "Saving..."
              : editingId
              ? "Update"
              : "Create"}
          </button>

          {editingId && (
            <button onClick={resetForm} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </motion.div>

      {/* LIST */}
      <div>
        <h2 className="text-xl font-semibold mb-6">
          All Charities
        </h2>

        {charities.length === 0 && (
          <div className="text-center text-muted-foreground py-20">
            No charities yet — create your first one 🌱
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {charities.map((c) => (
            <motion.div
              key={c.id}
              whileHover={{ y: -6 }}
              className="group rounded-3xl border border-border bg-white shadow-sm overflow-hidden transition"
            >
              {/* IMAGE */}
              <div className="relative overflow-hidden">
                <img
                  src={
                    c.image_url ||
                    "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1200"
                  }
                  alt={c.name}
                  className="h-48 w-full object-cover group-hover:scale-105 transition"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>

              {/* CONTENT */}
              <div className="p-5 space-y-2">
                <h3 className="text-lg font-semibold">
                  {c.name}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-3">
                  {c.description || "No description"}
                </p>

                {/* ACTIONS */}
                <div className="flex gap-2 pt-3">
                  <button
                    onClick={() => handleEdit(c)}
                    className="btn-secondary text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={deletingId === c.id}
                    className="px-3 py-1 rounded-lg bg-red-500 text-white text-sm"
                  >
                    {deletingId === c.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

        </div>
      </div>
    </div>
  );
}