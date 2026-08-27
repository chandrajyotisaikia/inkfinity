'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck, ShieldCheck, Wallet, Boxes, MessageSquare, LogOut, Search,
  Check, X, FileText, TrendingUp, TrendingDown, Plus, Menu, AlertTriangle, Send, Sparkles, ClipboardCheck
} from 'lucide-react';

// ========== INITIAL MOCK DATA ==========
const INITIAL_BOOKINGS = [
  { id: 1, name: 'Ananya Sharma', style: 'Fine Line', date: '2026-08-28', time: '2:00 PM', deposit: 2000, status: 'pending' },
  { id: 2, name: 'Rohit Verma', style: 'Blackwork', date: '2026-08-29', time: '11:00 AM', deposit: 2000, status: 'approved' },
];

const INITIAL_ARTISTS = [
  { id: 1, name: 'Avinish Deka', role: 'Lead Artist', split: 60, revenue: 52000 },
  { id: 2, name: 'Rimi Roy', role: 'Senior Artist', split: 55, revenue: 31000 },
];

const INITIAL_INVENTORY = [
  { id: 1, item: 'Numbing Cream', stock: 3, threshold: 8, unit: 'tubes' },
  { id: 2, item: 'Stencil Paper', stock: 14, threshold: 20, unit: 'sheets' },
  { id: 3, item: 'Needles — Liner', stock: 22, threshold: 15, unit: 'packs' },
];

const MOCK_WAIVERS = [
  { id: 1, name: 'Ananya Sharma', signedAt: '2026-08-14 09:12 AM', status: 'complete' },
  { id: 2, name: 'Rohit Verma', signedAt: '2026-08-13 06:40 PM', status: 'complete' },
];

const MOCK_MARKETING = [
  { id: 1, name: 'Meera Iyer', type: '14-day', style: 'Fine Line', date: '2026-08-13', sent: false },
  { id: 2, name: 'Vikram Singh', type: '6-month', style: 'Traditional', date: '2026-02-20', sent: false },
];

// ========== MAIN COMPONENT ==========
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // STATE MANAGEMENT (The CRM Brain)
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [artists, setArtists] = useState(INITIAL_ARTISTS);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [marketing, setMarketing] = useState(MOCK_MARKETING);
  
  // Financial State
  const [financials, setFinancials] = useState({
    revenue: 85000,
    expenses: 12000,
  });

  // Modal States
  const [checkInModal, setCheckInModal] = useState({ open: false, booking: null });
  const [approveModal, setApproveModal] = useState({ open: false, booking: null });
  const [enrollModal, setEnrollModal] = useState(false);

  // ========== LOGIC HANDLERS ==========

  // 1. Commission Split Logic
  const handleApprovePayment = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const artistId = parseInt(formData.get('artistId'));
    const customSplit = parseInt(formData.get('split'));
    
    const deposit = approveModal.booking.deposit; // Rs 2000
    const artistCut = deposit * (customSplit / 100);

    // Add to Artist Revenue
    setArtists(prev => prev.map(a => 
      a.id === artistId ? { ...a, revenue: a.revenue + artistCut } : a
    ));

    // Update Booking Status
    setBookings(prev => prev.map(b => 
      b.id === approveModal.booking.id ? { ...b, status: 'approved' } : b
    ));

    // Deduct Artist Cut from Studio Net Profit (Expenses)
    setFinancials(prev => ({
      ...prev,
      expenses: prev.expenses + artistCut
    }));

    setApproveModal({ open: false, booking: null });
  };

  // 2. Check-In & Inventory Deduction Logic
  const handleCheckIn = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Deduct Inventory Mathematically
    setInventory(prev => prev.map(item => {
      const usedQty = parseInt(formData.get(`item_${item.id}`) || 0);
      return { ...item, stock: Math.max(0, item.stock - usedQty) };
    }));

    // Mark Booking Complete
    setBookings(prev => prev.map(b => 
      b.id === checkInModal.booking.id ? { ...b, status: 'completed' } : b
    ));

    setCheckInModal({ open: false, booking: null });
  };

  // 3. Artist Enrollment
  const handleEnrollArtist = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newArtist = {
      id: artists.length + 1,
      name: formData.get('name'),
      role: formData.get('role'),
      split: parseInt(formData.get('split')),
      revenue: 0
    };
    setArtists([...artists, newArtist]);
    setEnrollModal(false);
  };

  // 4. Trigger SMS
  const handleTriggerSMS = (id) => {
    setMarketing(prev => prev.map(m => m.id === id ? { ...m, sent: true } : m));
  };

  // ========== SUB-RENDERERS ==========
  const lowStock = inventory.filter(i => i.stock <= i.threshold);
  const netProfit = financials.revenue - financials.expenses;

  return (
    <div className="min-h-screen bg-ink-black text-white flex">
      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-ink-panel border-r border-line transition-all duration-300 flex flex-col fixed h-screen z-30`}>
        <div className="p-4 border-b border-line flex justify-between items-center">
          {sidebarOpen && <h1 className="font-serif text-xl text-gold">Inkfinity</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white">
            <Menu size={20} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'bookings', icon: CalendarCheck, label: 'Bookings' },
            { id: 'vault', icon: ShieldCheck, label: 'Legal Vault' },
            { id: 'financials', icon: Wallet, label: 'Financials' },
            { id: 'inventory', icon: Boxes, label: 'Inventory' },
            { id: 'marketing', icon: MessageSquare, label: 'Marketing' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === tab.id ? 'bg-gold/10 text-gold border border-gold/30' : 'text-gray-400 hover:bg-white/5'}`}>
              <tab.icon size={18} />
              {sidebarOpen && <span>{tab.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} p-8 transition-all duration-300`}>
        
        {/* TAB 1: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-3xl font-serif text-white">Bookings Management</h2>
            <div className="bg-ink-panel rounded-xl border border-line overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-gray-400">
                  <tr>
                    <th className="p-4">Client</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td className="p-4">{b.name} <span className="block text-xs text-gray-500">{b.style}</span></td>
                      <td className="p-4">{b.date} at {b.time}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs border ${b.status === 'approved' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' : b.status === 'completed' ? 'bg-blue-900/30 text-blue-400 border-blue-500/30' : 'bg-amber-900/30 text-amber-400 border-amber-500/30'}`}>
                          {b.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {b.status === 'pending' && (
                          <button onClick={() => setApproveModal({ open: true, booking: b })} className="px-3 py-1 bg-gold/10 text-gold border border-gold/30 rounded hover:bg-gold hover:text-black transition-colors text-xs">
                            Approve Deposit
                          </button>
                        )}
                        {b.status === 'approved' && (
                          <button onClick={() => setCheckInModal({ open: true, booking: b })} className="px-3 py-1 bg-white/5 text-white border border-line rounded hover:border-gold transition-colors text-xs flex items-center gap-1 inline-flex">
                            <ClipboardCheck size={14} /> Check-In
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: FINANCIALS */}
        {activeTab === 'financials' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-serif text-white">Financials & Payroll</h2>
              <button onClick={() => setEnrollModal(true)} className="px-4 py-2 bg-gold text-black rounded-lg text-sm font-medium flex items-center gap-2">
                <Plus size={16} /> Enroll Artist
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-ink-panel p-6 rounded-xl border border-line"><p className="text-gray-400 text-sm mb-2">Total Revenue</p><p className="text-3xl font-serif text-emerald-400">₹{financials.revenue.toLocaleString()}</p></div>
              <div className="bg-ink-panel p-6 rounded-xl border border-line"><p className="text-gray-400 text-sm mb-2">Studio Expenses / Payouts</p><p className="text-3xl font-serif text-red-400">₹{financials.expenses.toLocaleString()}</p></div>
              <div className="bg-ink-panel p-6 rounded-xl border border-gold/50 shadow-gold"><p className="text-gold text-sm mb-2">Net Studio Profit</p><p className="text-3xl font-serif text-gold">₹{netProfit.toLocaleString()}</p></div>
            </div>

            <div className="bg-ink-panel rounded-xl border border-line overflow-hidden mt-8">
              <div className="p-4 border-b border-line"><h3 className="font-medium text-white">Artist Roster & Pending Payouts</h3></div>
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-gray-400"><tr><th className="p-4">Artist</th><th className="p-4">Base Split</th><th className="p-4 text-right">Pending Payout</th></tr></thead>
                <tbody className="divide-y divide-line">
                  {artists.map(a => (
                    <tr key={a.id}><td className="p-4">{a.name} <span className="text-xs text-gray-500 block">{a.role}</span></td><td className="p-4">{a.split}%</td><td className="p-4 text-right text-gold">₹{a.revenue.toLocaleString()}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: INVENTORY */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-3xl font-serif text-white">Inventory Tracker</h2>
            
            {lowStock.length > 0 && (
              <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-start gap-3">
                <AlertTriangle className="text-red-500" />
                <div><h4 className="text-red-500 font-medium">Low Stock Alert</h4><p className="text-sm text-red-400/80">Reorder needed for: {lowStock.map(i => i.item).join(', ')}</p></div>
              </div>
            )}

            <div className="bg-ink-panel rounded-xl border border-line overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-gray-400"><tr><th className="p-4">Item</th><th className="p-4">Current Stock</th><th className="p-4">Status</th></tr></thead>
                <tbody className="divide-y divide-line">
                  {inventory.map(i => (
                    <tr key={i.id}><td className="p-4">{i.item}</td><td className="p-4">{i.stock} {i.unit}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs ${i.stock <= i.threshold ? 'bg-red-900/30 text-red-500' : 'bg-emerald-900/30 text-emerald-400'}`}>
                          {i.stock <= i.threshold ? 'Low Stock' : 'Healthy'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TABS FOR VAULT AND MARKETING OMITTED FOR BREVITY BUT CAN BE ADDED SIMILARLY */}
        {(activeTab === 'vault' || activeTab === 'marketing') && (
           <div className="flex h-64 items-center justify-center text-gray-500 border border-line border-dashed rounded-xl">
              <p>Module active. Awaiting data integration...</p>
           </div>
        )}

      </main>

      {/* ========== MODALS ========== */}
      
      {/* 1. Approve Payment Modal */}
      {approveModal.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-ink-panel border border-line rounded-xl w-full max-w-md p-6">
            <h3 className="text-xl font-serif text-gold mb-4">Approve ₹2,000 Deposit</h3>
            <p className="text-sm text-gray-400 mb-6">Client: {approveModal.booking.name}</p>
            <form onSubmit={handleApprovePayment} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Assign Artist</label>
                <select name="artistId" className="w-full bg-black border border-line rounded p-2 text-white" required>
                  {artists.map(a => <option key={a.id} value={a.id}>{a.name} ({a.split}% cut)</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Confirm Artist Split % (Override if needed)</label>
                <input type="number" name="split" defaultValue="60" max="100" className="w-full bg-black border border-line rounded p-2 text-white" required />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setApproveModal({ open: false })} className="flex-1 py-2 border border-line rounded text-white hover:bg-white/5">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-gold text-black font-medium rounded hover:bg-gold/90">Process Split</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Client Check-In Modal (Inventory Logic) */}
      {checkInModal.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-ink-panel border border-line rounded-xl w-full max-w-md p-6">
            <h3 className="text-xl font-serif text-white mb-2">Check-In Client</h3>
            <p className="text-sm text-gold mb-6">{checkInModal.booking.name} — Record Inventory Usage</p>
            <form onSubmit={handleCheckIn} className="space-y-4">
              {inventory.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <label className="text-sm text-gray-300">{item.item} ({item.unit})</label>
                  <input type="number" name={`item_${item.id}`} min="0" defaultValue="0" className="w-20 bg-black border border-line rounded p-1 text-white text-center" />
                </div>
              ))}
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setCheckInModal({ open: false })} className="flex-1 py-2 border border-line rounded text-white hover:bg-white/5">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-white text-black font-medium rounded hover:bg-gray-200">Complete Check-In</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Enroll Artist Modal */}
      {enrollModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-ink-panel border border-line rounded-xl w-full max-w-md p-6">
            <h3 className="text-xl font-serif text-gold mb-6">Enroll New Artist</h3>
            <form onSubmit={handleEnrollArtist} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Full Name</label>
                <input type="text" name="name" className="w-full bg-black border border-line rounded p-2 text-white" required />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Studio Role</label>
                <input type="text" name="role" placeholder="e.g., Guest Artist" className="w-full bg-black border border-line rounded p-2 text-white" required />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Revenue Split %</label>
                <input type="number" name="split" max="100" className="w-full bg-black border border-line rounded p-2 text-white" required />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEnrollModal(false)} className="flex-1 py-2 border border-line rounded text-white hover:bg-white/5">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-gold text-black font-medium rounded hover:bg-gold/90">Add to Roster</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
    
