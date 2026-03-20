"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminCharities() {
  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // 🔹 Fetch
  const fetchCharities = async () => {
    const { data } = await supabase
      .from("charities")
      .select("*")
      .order("created_at", { ascending: false });

    setCharities(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCharities();
  }, []);

  // 🔹 Create / Update
  const handleSave = async () => {
    if (!name) return alert("Name required");

    if (editingId) {
      await supabase
        .from("charities")
        .update({ name, description })
        .eq("id", editingId);
    } else {
      await supabase.from("charities").insert({
        name,
        description,
      });
    }

    resetForm();
    fetchCharities();
  };

  // 🔹 Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this charity?")) return;

    await supabase.from("charities").delete().eq("id", id);
    fetchCharities();
  };

  // 🔹 Edit
  const handleEdit = (c: any) => {
    setName(c.name);
    setDescription(c.description || "");
    setEditingId(c.id);
  };

  // 🔹 Reset
  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingId(null);
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="p-10 max-w-4xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        Manage Charities
      </h1>

      {/* 🔥 FORM */}
      <div className="border p-6 rounded-xl mb-10">
        <h2 className="text-lg mb-4">
          {editingId ? "Edit Charity" : "Add Charity"}
        </h2>

        <input
          type="text"
          placeholder="Charity Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full mb-3"
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 w-full mb-3"
        />

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            {editingId ? "Update" : "Create"}
          </button>

          {editingId && (
            <button
              onClick={resetForm}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* 🔥 LIST */}
      <div>
        <h2 className="text-lg mb-4">All Charities</h2>

        {charities.length === 0 && (
          <p className="text-gray-500">No charities yet</p>
        )}

        {charities.map((c) => (
          <div
            key={c.id}
            className="border p-4 mb-4 rounded flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm text-gray-500">
                {c.description}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(c)}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(c.id)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}