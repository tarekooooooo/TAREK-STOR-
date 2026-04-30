"use client";

import { useState, useEffect } from "react";

interface SettingItem {
  key: string;
  value: string;
  label: string | null;
  group: string | null;
}

const groupLabels: Record<string, { label: string; icon: string }> = {
  payment_gateways: { label: "بوابات الدفع", icon: "💳" },
  user_management: { label: "إدارة المستخدمين", icon: "👥" },
  wallet_redeem: { label: "المحفظة والأكواد", icon: "💰" },
  storefront: { label: "المتجر والمنتجات", icon: "🏪" },
  tournaments: { label: "البطولات", icon: "🏆" },
  api_merchant: { label: "المطورين والتجار", icon: "🔧" },
  notifications: { label: "التواصل والإشعارات", icon: "🔔" },
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, SettingItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings", { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleToggle = async (key: string, currentValue: string) => {
    const isBool = currentValue === "true" || currentValue === "false";
    if (!isBool) return;

    const newValue = currentValue === "true" ? "false" : "true";
    setSaving(key);

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: newValue }),
    });

    if (res.ok) {
      setSettings((prev) => {
        const updated = { ...prev };
        for (const group in updated) {
          updated[group] = updated[group].map((s) =>
            s.key === key ? { ...s, value: newValue } : s
          );
        }
        return updated;
      });
    }
    setSaving(null);
  };

  const handleValueChange = async (key: string, newValue: string) => {
    setSaving(key);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: newValue }),
    });

    if (res.ok) {
      setSettings((prev) => {
        const updated = { ...prev };
        for (const group in updated) {
          updated[group] = updated[group].map((s) =>
            s.key === key ? { ...s, value: newValue } : s
          );
        }
        return updated;
      });
    }
    setSaving(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">إعدادات النظام</h1>
        <span className="text-sm text-gray-500">
          {Object.values(settings).flat().length} إعداد
        </span>
      </div>

      <div className="space-y-6">
        {Object.entries(settings).map(([group, items]) => {
          const groupInfo = groupLabels[group] || { label: group, icon: "⚙️" };
          return (
            <div key={group} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span>{groupInfo.icon}</span>
                  {groupInfo.label}
                </h2>
              </div>
              <div className="divide-y">
                {items.map((setting) => {
                  const isBool = setting.value === "true" || setting.value === "false";
                  const isOn = setting.value === "true";
                  const isNumeric = !isBool && !isNaN(Number(setting.value));

                  return (
                    <div
                      key={setting.key}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{setting.label || setting.key}</p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{setting.key}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {saving === setting.key && (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-500"></div>
                        )}
                        {isBool ? (
                          <button
                            onClick={() => handleToggle(setting.key, setting.value)}
                            disabled={saving === setting.key}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              isOn ? "bg-indigo-600" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                isOn ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                        ) : isNumeric ? (
                          <input
                            type="number"
                            value={setting.value}
                            onChange={(e) => handleValueChange(setting.key, e.target.value)}
                            className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-center"
                          />
                        ) : (
                          <input
                            type="text"
                            value={setting.value}
                            onChange={(e) => handleValueChange(setting.key, e.target.value)}
                            className="w-40 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
