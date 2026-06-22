import React from "react";
import { Auth } from "../services/auth";
import { DataStore } from "../services/dataStore";

export default function Settings() {
  const user = Auth.currentUser();
  const [json, setJson] = React.useState(JSON.stringify(DataStore.state, null, 2));

  function handleExport() {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agilepilot-data.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        DataStore.state = parsed;
        DataStore.save();
        setJson(JSON.stringify(parsed, null, 2));
        alert("Imported");
      } catch {
        alert("Invalid JSON");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h2 className="text-lg font-bold">Settings</h2>
      <div className="bg-white/[0.03] border border-white/[0.06] p-3 rounded">
        <div className="mb-2 text-sm text-white/40">Signed in as</div>
        <div className="font-medium">{user?.name}</div>
        <div className="text-xs text-white/40">{user?.email}</div>
      </div>

      <div className="bg-white/[0.03] border border-white/[0.06] p-3 rounded space-y-2">
        <h3 className="font-semibold">Data</h3>
        <textarea className="w-full h-36 p-2 bg-white/[0.02] border rounded text-xs" value={json} onChange={(e) => setJson(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={handleExport} className="px-3 py-1 bg-purple-600 rounded">Export</button>
          <label className="px-3 py-1 bg-white/[0.03] rounded cursor-pointer">
            Import
            <input type="file" accept="application/json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
}