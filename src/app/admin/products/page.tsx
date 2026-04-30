"use client";

import { useState, useEffect } from "react";

interface Product {
  id: string;
  name: string;
  nameEn: string | null;
  nameFr: string | null;
  description: string;
  descriptionEn: string | null;
  descriptionFr: string | null;
  price: number;
  image: string | null;
  category: string;
  type: string;
  deliveryContent: string | null;
  countries: string | null;
  isActive: boolean;
  stock: number;
}

const emptyProduct = {
  name: "", nameEn: "", nameFr: "",
  description: "", descriptionEn: "", descriptionFr: "",
  price: 0, image: "", category: "", type: "product",
  deliveryContent: "", countries: "", isActive: true, stock: -1,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchProducts = () => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        setProducts(Array.isArray(d) ? d : []);
        setLoading(false);
      });
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const body = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      countries: form.countries || null,
      image: form.image || null,
      deliveryContent: form.deliveryContent || null,
      nameEn: form.nameEn || null,
      nameFr: form.nameFr || null,
      descriptionEn: form.descriptionEn || null,
      descriptionFr: form.descriptionFr || null,
    };

    try {
      const url = editingId ? `/api/products/${editingId}` : "/api/products";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyProduct);
        fetchProducts();
      } else {
        const data = await res.json();
        setError(data.error || "حدث خطأ أثناء حفظ المنتج");
      }
    } catch {
      setError("حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.");
    }
    setSaving(false);
  };

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      nameEn: product.nameEn || "",
      nameFr: product.nameFr || "",
      description: product.description,
      descriptionEn: product.descriptionEn || "",
      descriptionFr: product.descriptionFr || "",
      price: product.price,
      image: product.image || "",
      category: product.category,
      type: product.type,
      deliveryContent: product.deliveryContent || "",
      countries: product.countries || "",
      isActive: product.isActive,
      stock: product.stock,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    fetchProducts();
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
        <h1 className="text-3xl font-bold">المنتجات</h1>
        <button
          onClick={() => {
            setForm(emptyProduct);
            setEditingId(null);
            setShowForm(!showForm);
          }}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
        >
          {showForm ? "إلغاء" : "إضافة منتج +"}
        </button>
      </div>

      {/* Product Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 mb-8 space-y-4">
          <h2 className="text-xl font-bold">{editingId ? "تعديل المنتج" : "إضافة منتج جديد"}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="اسم المنتج (عربي)" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <FormField label="اسم المنتج (إنجليزي)" value={form.nameEn} onChange={(v) => setForm({ ...form, nameEn: v })} />
            <FormField label="اسم المنتج (فرنسي)" value={form.nameFr} onChange={(v) => setForm({ ...form, nameFr: v })} />
            <FormField label="السعر (بالدولار)" value={form.price} onChange={(v) => setForm({ ...form, price: Number(v) })} type="number" required />
            <FormField label="التصنيف" value={form.category} onChange={(v) => setForm({ ...form, category: v })} required />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">النوع</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="product">منتج</option>
                <option value="service">خدمة</option>
              </select>
            </div>
            <FormField label="رابط الصورة" value={form.image} onChange={(v) => setForm({ ...form, image: v })} />
            <FormField
              label="المخزون (-1 = غير محدود)"
              value={form.stock}
              onChange={(v) => setForm({ ...form, stock: Number(v) })}
              type="number"
            />
            <FormField
              label="الدول المستهدفة (فاصلة بين الأكواد)"
              value={form.countries}
              onChange={(v) => setForm({ ...form, countries: v })}
              placeholder="SA,AE,EG أو اتركه فارغاً للكل"
            />
          </div>

          <FormField label="وصف المنتج (عربي)" value={form.description} onChange={(v) => setForm({ ...form, description: v })} textarea required />
          <FormField label="وصف المنتج (إنجليزي)" value={form.descriptionEn} onChange={(v) => setForm({ ...form, descriptionEn: v })} textarea />
          <FormField label="وصف المنتج (فرنسي)" value={form.descriptionFr} onChange={(v) => setForm({ ...form, descriptionFr: v })} textarea />
          <FormField label="المحتوى الرقمي للتسليم" value={form.deliveryContent} onChange={(v) => setForm({ ...form, deliveryContent: v })} textarea />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4"
            />
            <label className="text-sm font-medium">مفعل</label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {saving ? "جاري الحفظ..." : editingId ? "تحديث" : "إضافة"}
          </button>
        </form>
      )}

      {/* Products List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-12">لا توجد منتجات. أضف منتجاً جديداً للبدء.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-right py-3 px-4">المنتج</th>
                  <th className="text-right py-3 px-4">النوع</th>
                  <th className="text-right py-3 px-4">السعر</th>
                  <th className="text-right py-3 px-4">المخزون</th>
                  <th className="text-right py-3 px-4">الحالة</th>
                  <th className="text-right py-3 px-4">الدول</th>
                  <th className="text-right py-3 px-4">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.category}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.type === "service" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                      }`}>
                        {product.type === "service" ? "خدمة" : "منتج"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold">${product.price}</td>
                    <td className="py-3 px-4">{product.stock === -1 ? "∞" : product.stock}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        product.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {product.isActive ? "مفعل" : "معطل"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs">{product.countries || "الكل"}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-xs"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800 font-medium text-xs"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  textarea = false,
  placeholder = "",
}: {
  label: string;
  value: string | number;
  onChange: (val: string) => void;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  placeholder?: string;
}) {
  const className = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          rows={3}
          className={className}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={className}
          placeholder={placeholder}
          step={type === "number" ? "0.01" : undefined}
        />
      )}
    </div>
  );
}
