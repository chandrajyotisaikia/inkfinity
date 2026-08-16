'use client'
import React, { useState } from 'react'
import {
  LayoutDashboard,
  CalendarCheck,
  ShieldCheck,
  Wallet,
  Boxes,
  Megaphone,
  LogOut,
  Search,
  Check,
  X,
  FileText,
  TrendingUp,
  TrendingDown,
  Plus,
  Menu,
  AlertTriangle,
  MessageSquareText,
  Sparkles,
  Send,
} from 'lucide-react'

// -- mock data (realistic)
const MOCK_BOOKINGS = [
  { id: 1, name: 'Ananya Sharma', style: 'Fine Line', date: '2026-08-18', time: '2:00 PM', deposit: 2000, status: 'pending' },
  { id: 2, name: 'Rohit Verma', style: 'Blackwork', date: '2026-08-19', time: '11:00 AM', deposit: 2000, status: 'approved' },
  { id: 3, name: 'Priya Nair', style: 'Realism', date: '2026-08-19', time: '4:30 PM', deposit: 2000, status: 'approved' },
  { id: 4, name: 'Karan Malhotra', style: 'Geometric', date: '2026-08-20', time: '1:00 PM', deposit: 2000, status: 'pending' },
  { id: 5, name: 'Sneha Reddy', style: 'Japanese', date: '2026-08-21', time: '3:00 PM', deposit: 2000, status: 'approved' },
]

const MOCK_WAIVERS = [
  { id: 1, name: 'Ananya Sharma', signedAt: '2026-08-14 09:12 AM', status: 'complete' },
  { id: 2, name: 'Rohit Verma', signedAt: '2026-08-13 06:40 PM', status: 'complete' },
  { id: 3, name: 'Priya Nair', signedAt: '2026-08-13 02:05 PM', status: 'complete' },
]

const MOCK_ARTISTS = [
  { id: 1, name: 'Avinish Deka', role: 'Lead Artist', split: 60, revenue: 52000 },
  { id: 2, name: 'Rimi Patel', role: 'Junior Artist', split: 40, revenue: 21000 },
  { id: 3, name: 'Deep Shah', role: 'Junior Artist', split: 40, revenue: 12000 },
]

const MOCK_INVENTORY = [
  { id: 1, item: 'Numbing Cream', unit: 'tubes', stock: 3, threshold: 8, burnRate: '2/week' },
  { id: 2, item: 'Stencil Paper', unit: 'sheets', stock: 14, threshold: 20, burnRate: '6/week' },
  { id: 3, item: 'Needles — Liner (RL)', unit: 'packs', stock: 22, threshold: 15, burnRate: '5/week' },
]

const MOCK_HEALED_QUEUE = [
  { id: 1, name: 'Meera Iyer', style: 'Fine Line', sessionDate: '2026-08-01', smsSent: false },
  { id: 2, name: 'Arjun Rao', style: 'Blackwork', sessionDate: '2026-08-01', smsSent: false },
]

const TABS = [
  { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
  { id: 'vault', label: 'Legal Vault', icon: ShieldCheck },
  { id: 'financials', label: 'Financials & Payroll', icon: Wallet },
  { id: 'inventory', label: 'Inventory', icon: Boxes },
  { id: 'marketing', label: 'Marketing', icon: Megaphone },
]

function StatusBadge({ status }) {
  const classes = {
    approved: 'bg-green-500/10 text-green-400 border-green-500/30',
    pending: 'bg-yellow-900/10 text-gold border-gold/30',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
  }
  return <span className={`text-[11px] px-2.5 py-1 rounded-full border tracking-wide uppercase ${classes[status] || ''}`}>{status}</span>
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('bookings')
  const [bookings, setBookings] = useState(MOCK_BOOKINGS)
  const [waivers] = useState(MOCK_WAIVERS)
  const [artists] = useState(MOCK_ARTISTS)
  const [inventory, setInventory] = useState(MOCK_INVENTORY)
  const [healed, setHealed] = useState(MOCK_HEALED_QUEUE)

  const updateBooking = (id, status) => setBookings((s) => s.map(b => b.id === id ? {...b, status} : b))
  const adjustStock = (id, delta) => setInventory(prev => prev.map(i => i.id === id ? {...i, stock: Math.max(0, i.stock + delta)} : i))
  const triggerSms = (id) => setHealed(h => h.map(c => c.id === id ? {...c, smsSent: true} : c))
  const lowStockCount = inventory.filter(i => i.stock < i.threshold).length

  return (
    <div className="min-h-screen bg-black text-white flex">
      <aside className="w-64 bg-ink-charcoal border-r border-ink-line px-4 py-6 hidden lg:flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <LayoutDashboard size={18} className="text-gold" />
          <span className="font-serif text-lg">Ink<span className="text-gold">finity</span> CRM</span>
        </div>

        <nav className="flex-1 space-y-2">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center justify-between p-2 rounded ${activeTab === tab.id ? 'bg-gold/10 text-gold' : 'text-white/70 hover:bg-white/3'}`}>
              <span className="flex items-center gap-3"><tab.icon size={16} />{tab.label}</span>
              {tab.id === 'inventory' && lowStockCount > 0 && <span className="text-sm bg-red-600/20 px-2 rounded">{lowStockCount}</span>}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto">
        {activeTab === 'bookings' && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif text-2xl">Bookings</h2>
                <p className="text-white/40 text-sm">{bookings.length} total consultations</p>
              </div>
            </div>

            <div className="border border-ink-line rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="text-left text-white/40 text-xs uppercase">
                  <tr>
                    <th className="px-5 py-3">Client</th>
                    <th className="px-5 py-3">Style</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Deposit</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id} className="border-t border-ink-line hover:bg-white/[0.02]">
                      <td className="px-5 py-3">{b.name}</td>
                      <td className="px-5 py-3 text-white/60">{b.style}</td>
                      <td className="px-5 py-3 text-white/60">{b.date} · {b.time}</td>
                      <td className="px-5 py-3"><span className="text-[11px] px-2.5 py-1 rounded border border-green-500/30 bg-green-500/10 text-green-400">Deposit Paid: ₹{b.deposit.toLocaleString('en-IN')}</span></td>
                      <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                      <td className="px-5 py-3 text-right">
                        <div className="inline-flex gap-2">
                          <button onClick={() => updateBooking(b.id, 'approved')} className="p-1 rounded border border-ink-line hover:text-green-400"><Check size={14} /></button>
                          <button onClick={() => updateBooking(b.id, 'rejected')} className="p-1 rounded border border-ink-line hover:text-red-400"><X size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'vault' && (
          <section>
            <h2 className="font-serif text-2xl mb-2">Legal Vault</h2>
            <p className="text-white/40 text-sm mb-4">{waivers.length} signed digital waivers</p>

            <div className="border border-ink-line rounded-lg divide-y divide-ink-line">
              {waivers.map(w => (
                <div key={w.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm">{w.name}</p>
                    <p className="text-xs text-white/40">Signed {w.signedAt}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] px-2.5 py-1 rounded-full border bg-green-500/10 text-green-400">{w.status}</span>
                    <button className="text-xs text-white/70 border border-ink-line px-3 py-1 rounded hover:text-gold">View PDF</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'financials' && (
          <section>
            <h2 className="font-serif text-2xl mb-2">Financials & Payroll</h2>
            <p className="text-white/40 text-sm mb-4">Revenue, expenses & automated splits</p>

            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-ink-panel border border-ink-line rounded p-4">
                <p className="text-xs text-white/40">Total Revenue</p>
                <p className="text-2xl font-serif">₹85,000</p>
              </div>
              <div className="bg-ink-panel border border-ink-line rounded p-4">
                <p className="text-xs text-white/40">Monthly Expenses</p>
                <p className="text-2xl font-serif">₹12,000</p>
              </div>
              <div className="bg-ink-panel border border-gold/30 rounded p-4">
                <p className="text-xs text-gold">Net Profit</p>
                <p className="text-2xl font-serif text-gold">₹73,000</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-white/40 mb-2">Artist Roster — Automated Commission Splits</p>
              <div className="border border-ink-line rounded">
                <table className="w-full text-sm">
                  <thead className="text-white/40 text-xs uppercase">
                    <tr>
                      <th className="px-5 py-3">Artist</th>
                      <th className="px-5 py-3">Role</th>
                      <th className="px-5 py-3">Split</th>
                      <th className="px-5 py-3">Revenue</th>
                      <th className="px-5 py-3 text-right">Pending Payout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {artists.map(a => {
                      const payout = Math.round((a.revenue * a.split) / 100)
                      return (
                        <tr key={a.id} className="border-t border-ink-line">
                          <td className="px-5 py-3">{a.name}</td>
                          <td className="px-5 py-3 text-white/60">{a.role}</td>
                          <td className="px-5 py-3"><span className="text-[11px] px-2 py-1 rounded border border-gold/30 bg-gold/5 text-gold">{a.split}%</span></td>
                          <td className="px-5 py-3 text-white/60">₹{a.revenue.toLocaleString('en-IN')}</td>
                          <td className="px-5 py-3 text-right text-gold font-medium">₹{payout.toLocaleString('en-IN')}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </section>
        )}

        {activeTab === 'inventory' && (
          <section>
            <h2 className="font-serif text-2xl mb-2">Inventory — Burn Rate</h2>
            <p className="text-white/40 text-sm mb-4">Stock levels for critical consumables</p>

            {inventory.some(i => i.stock < i.threshold) && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="text-red-400" />
                  <div>
                    <p className="text-red-400 font-medium">Low Stock Alert — Reorder</p>
                    <p className="text-xs text-white/50">One or more items are below their reorder threshold.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="border border-ink-line rounded">
              <table className="w-full text-sm">
                <thead className="text-white/40 text-xs uppercase">
                  <tr>
                    <th className="px-5 py-3">Item</th>
                    <th className="px-5 py-3">Stock</th>
                    <th className="px-5 py-3">Burn Rate</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Adjust</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(i => {
                    const low = i.stock < i.threshold
                    return (
                      <tr key={i.id} className="border-t border-ink-line">
                        <td className="px-5 py-3">{i.item}</td>
                        <td className="px-5 py-3 text-white/60">{i.stock} {i.unit}</td>
                        <td className="px-5 py-3 text-white/50">{i.burnRate}</td>
                        <td className="px-5 py-3">{low ? <span className="text-xs bg-red-500/10 px-2 rounded text-red-400">Low Stock</span> : <span className="text-xs bg-green-500/10 px-2 rounded text-green-400">In Stock</span>}</td>
                        <td className="px-5 py-3 text-right">
                          <div className="inline-flex gap-2">
                            <button onClick={() => adjustStock(i.id, -1)} className="px-2 py-1 border rounded">−</button>
                            <button onClick={() => adjustStock(i.id, +1)} className="px-2 py-1 border rounded">+</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'marketing' && (
          <section>
            <h2 className="font-serif text-2xl mb-2">Marketing & Automation</h2>
            <p className="text-white/40 text-sm mb-4">Follow-ups and promos</p>

            <div className="mb-6">
              <div className="mb-2 text-xs text-white/40">Day-14 Follow-Up — Trigger review SMS</div>
              <div className="border border-ink-line rounded divide-y divide-ink-line">
                {healed.map(c => (
                  <div key={c.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm">{c.name}</p>
                      <p className="text-xs text-white/40">{c.style} · Session {c.sessionDate}</p>
                    </div>
                    {c.smsSent ? <span className="text-xs bg-green-500/10 px-2 rounded text-green-400">SMS Sent</span> : <button onClick={() => triggerSms(c.id)} className="text-xs px-3 py-1 border rounded text-gold">Trigger Day-14 SMS</button>}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 text-xs text-white/40">
                <div>Touch-Up Pipeline — 6-Month Promo</div>
                <button className="text-xs px-3 py-1 border rounded text-gold">Bulk-Send Touch-Up Promo</button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
