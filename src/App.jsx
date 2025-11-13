import React, { useMemo, useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import './index.css'
import { Upload } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import UploadPage from './pages/Upload'
import MapPage from './pages/Map'
import ReportsPage from './pages/Reports'

// Global Data Context
const DataContext = createContext(null)
export const useData = () => useContext(DataContext)

function Navbar() {
  const navigate = useNavigate()
  return (
    <div className="w-full bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-green-600 text-white grid place-content-center font-bold">PA</div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">Panchayat Agricultural Dashboard</h1>
            <p className="text-xs text-gray-500 -mt-0.5">Monitor crops, climate and groundwater</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Link to="/" className="px-3 py-1.5 rounded hover:bg-gray-100">Dashboard</Link>
          <Link to="/map" className="px-3 py-1.5 rounded hover:bg-gray-100">Map</Link>
          <Link to="/reports" className="px-3 py-1.5 rounded hover:bg-gray-100">Reports</Link>
          <button onClick={() => navigate('/upload')} className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md">
            <Upload size={16} /> Upload CSV
          </button>
        </div>
      </div>
    </div>
  )
}

function Sidebar({ filters, setFilters, villages, crops, seasons, onReset, onExport }) {
  return (
    <aside className="w-72 bg-white/70 backdrop-blur border-r border-gray-200 p-4 space-y-4 hidden lg:block">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Filters</h3>
        <label className="text-xs text-gray-600">Village</label>
        <select value={filters.village || ''} onChange={e => setFilters(f => ({...f, village: e.target.value || null}))} className="w-full mt-1 border rounded px-2 py-1.5">
          <option value="">All</option>
          {villages.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-600">Crop</label>
        <select value={filters.crop || ''} onChange={e => setFilters(f => ({...f, crop: e.target.value || null}))} className="w-full mt-1 border rounded px-2 py-1.5">
          <option value="">All</option>
          {crops.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-600">Season</label>
        <select value={filters.season || ''} onChange={e => setFilters(f => ({...f, season: e.target.value || null}))} className="w-full mt-1 border rounded px-2 py-1.5">
          <option value="">All</option>
          {seasons.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        <button onClick={onReset} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded">Reset</button>
        <button onClick={onExport} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded">Export CSV</button>
      </div>
      <div className="text-xs text-gray-500">Upload data to get started. Supports village, crop, area, temperature, rainfall, soil, season and optional lat/long.</div>
    </aside>
  )
}

function MetricsCard({ title, value, description, icon }) {
  const Icon = icon || (() => null)
  return (
    <div className="bg-white/80 backdrop-blur border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500">{description}</p>
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          <div className="text-2xl font-bold mt-2">{value}</div>
        </div>
        <Icon className="text-gray-400" />
      </div>
    </div>
  )
}

function DataProvider({ children }) {
  const [rows, setRows] = useState([])
  const [filters, setFilters] = useState({ village: null, crop: null, season: null })
  const [summary, setSummary] = useState({ rows: 0, columns: [] })

  const villages = useMemo(() => Array.from(new Set(rows.map(r => (r.village || '').toString()))).filter(Boolean), [rows])
  const crops = useMemo(() => Array.from(new Set(rows.map(r => (r.crop || '').toString()))).filter(Boolean), [rows])
  const seasons = useMemo(() => Array.from(new Set(rows.map(r => (r.season || '').toString()))).filter(Boolean), [rows])

  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      const v = filters.village ? (r.village || '').toLowerCase() === filters.village.toLowerCase() : true
      const c = filters.crop ? (r.crop || '').toLowerCase() === filters.crop.toLowerCase() : true
      const s = filters.season ? (r.season || '').toLowerCase() === filters.season.toLowerCase() : true
      return v && c && s
    })
  }, [rows, filters])

  const value = {
    rows, setRows, filters, setFilters, summary, setSummary,
    villages, crops, seasons, filteredRows
  }
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

function Layout() {
  const { filters, setFilters, villages, crops, seasons, filteredRows } = useData()

  const handleReset = () => setFilters({ village: null, crop: null, season: null })
  const handleExport = () => {
    const headers = Object.keys(filteredRows[0] || {})
    const csv = [headers.join(','), ...filteredRows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'filtered_data.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navbar />
      <div className="max-w-7xl mx-auto flex">
        <Sidebar filters={filters} setFilters={setFilters} villages={villages} crops={crops} seasons={seasons} onReset={handleReset} onExport={handleExport} />
        <main className="flex-1 p-4 lg:p-6">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <Layout />
      </DataProvider>
    </BrowserRouter>
  )
}

export default App
