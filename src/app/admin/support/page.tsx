"use client";

import { useCallback, useEffect, useState } from "react";

interface TicketMessage {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  sender?: { id: string; name: string | null; role: string; uniqueId: string };
}

interface Ticket {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
  userId: string;
  user: { id: string; name: string | null; email: string; uniqueId: string };
  messages: TicketMessage[];
  _count: { messages: number };
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "closed">("open");
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const fetchTickets = useCallback(async () => {
    const query = filter === "all" ? "" : `?status=${filter}`;
    const res = await fetch(`/api/support/tickets${query}`);
    const data = await res.json();
    setTickets(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const openTicket = async (ticket: Ticket) => {
    setSelected(ticket);
    const res = await fetch(`/api/support/tickets/${ticket.id}/messages`);
    const data = await res.json();
    setMessages(Array.isArray(data) ? data : []);
  };

  const sendReply = async () => {
    if (!selected || !reply.trim()) return;
    setSending(true);
    const res = await fetch(`/api/support/tickets/${selected.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: reply }),
    });
    setSending(false);
    if (res.ok) {
      const message = await res.json();
      setMessages((prev) => [...prev, message]);
      setReply("");
    }
  };

  const toggleStatus = async () => {
    if (!selected) return;
    const status = selected.status === "open" ? "closed" : "open";
    const res = await fetch(`/api/support/tickets/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setSelected({ ...selected, status });
      fetchTickets();
    }
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
        <h1 className="text-3xl font-bold">خدمة العملاء</h1>
        <div className="flex gap-2">
          {(["open", "closed", "all"] as const).map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-4 py-2 rounded-lg text-sm ${
                filter === value ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {value === "open" ? "مفتوحة" : value === "closed" ? "مغلقة" : "الكل"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-3 lg:col-span-1">
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => openTicket(ticket)}
              className={`w-full text-right bg-white rounded-2xl shadow p-4 hover:shadow-md transition ${
                selected?.id === ticket.id ? "ring-2 ring-indigo-500" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold">{ticket.subject}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    ticket.status === "open"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {ticket.status === "open" ? "مفتوحة" : "مغلقة"}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {ticket.user.name || ticket.user.email} • #{ticket.user.uniqueId}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {ticket._count.messages} رسالة •{" "}
                {new Date(ticket.createdAt).toLocaleDateString("ar")}
              </p>
            </button>
          ))}

          {tickets.length === 0 && (
            <div className="text-center py-16 text-gray-500">لا توجد تذاكر</div>
          )}
        </div>

        <div className="lg:col-span-2">
          {!selected ? (
            <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
              اختر تذكرة لعرض المحادثة
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow p-6 flex flex-col h-[70vh]">
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <div>
                  <h2 className="text-xl font-bold">{selected.subject}</h2>
                  <p className="text-sm text-gray-500">
                    {selected.user.name || selected.user.email} • #{selected.user.uniqueId}
                  </p>
                </div>
                <button
                  onClick={toggleStatus}
                  className="px-4 py-2 rounded-lg text-sm bg-gray-200 hover:bg-gray-300"
                >
                  {selected.status === "open" ? "إغلاق التذكرة" : "إعادة الفتح"}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3">
                {messages.map((message) => {
                  const fromAgent =
                    message.sender?.role === "admin" || message.sender?.role === "superadmin";
                  return (
                    <div
                      key={message.id}
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        fromAgent
                          ? "bg-indigo-50 text-indigo-900 ms-auto"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {message.sender?.name || (fromAgent ? "الدعم" : "العميل")} •{" "}
                        {new Date(message.createdAt).toLocaleString("ar")}
                      </p>
                    </div>
                  );
                })}
                {messages.length === 0 && (
                  <p className="text-center text-gray-400 py-8">لا توجد رسائل بعد</p>
                )}
              </div>

              {selected.status === "open" && (
                <div className="flex gap-2 pt-4 border-t mt-4">
                  <input
                    type="text"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendReply()}
                    placeholder="اكتب ردك..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={sendReply}
                    disabled={sending || !reply.trim()}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50"
                  >
                    إرسال
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
