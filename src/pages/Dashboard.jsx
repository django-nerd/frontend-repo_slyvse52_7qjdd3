import React, { useMemo, useEffect, useState } from 'react'
import { useData } from '../App'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, ScatterChart, Scatter } from 'recharts'

const colors = ['#10b981','#2563eb','#f59e0b','#ef4444','#8b5cf6','#14b8a6']

function Metrics() {
  const { filteredRows } = useData()
  const stats = useMemo(() => {
    const total = filteredRows.length
    const crops = new Set()
    let temp = 0, rain = 0, area = 0
    filteredRows.forEach(r => {
      if (r.crop) crops.add(String(r.crop).toLowerCase())
      temp += parseFloat(r.temperature || 0)
      rain += parseFloat(r.rainfall || 0)
      area += parseFloat(r.area || 0)
    })
    return {
      total,
      unique_crops: crops.size,
      avg_temp: total ? (temp/total).toFixed(2) : 0,
      avg_rain: total ? (rain/total).toFixed(2) : 0,
      total_area: area.toFixed(2)
    }
  }, [filteredRows])

  const cards = [
    { title: 'Total Records', value: stats.total, description: 'Fields/Farm records' },
    { title: 'Unique Crops', value: stats.unique_crops, description: 'Distinct crop types' },
    { title: 'Avg Temperature', value: stats.avg_temp + ' °C', description: 'Across filtered data' },
    { title: 'Avg Rainfall', value: stats.avg_rain + ' mm', description: 'Across filtered data' },
    { title: 'Total Area', value: stats.total_area + ' ha', description: 'Cultivated area' },
  ]

  return (
    <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((c,i) => (
        <div key={i} className="bg-white/80 backdrop-blur border rounded p-4">
          <div className="text-xs text-gray-500">{c.description}</div>
          <div className="text-sm font-semibold">{c.title}</div>
          <div className="text-2xl font-bold mt-2">{c.value}</div>
        </div>
      ))}
    </div>
  )
}

function CropCharts() {
  const { filteredRows } = useData()
  const topData = useMemo(() => {
    const counts = {}
    filteredRows.forEach(r => {
      const c = (r.crop || '').toString()
      if (!c) return
      counts[c] = (counts[c]||0)+1
    })
    const arr = Object.entries(counts).map(([name, value]) => ({ name, value }))
    arr.sort((a,b)=>b.value-a.value)
    return arr.slice(0, 10)
  }, [filteredRows])

  const pieData = useMemo(() => topData.map(d => ({ name: d.name, value: d.value })), [topData])

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="bg-white/80 border rounded p-4">
        <div className="flex items-center justify-between mb-2"><h3 className="font-semibold">Top Crops by Count</h3><span className="text-xs text-gray-500">Bar chart</span></div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topData}>
              <XAxis dataKey="name" tick={{fontSize:12}} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white/80 border rounded p-4">
        <div className="flex items-center justify-between mb-2"><h3 className="font-semibold">Crop Distribution</h3><span className="text-xs text-gray-500">Pie chart</span></div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie dataKey="value" data={pieData} outerRadius={100} label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function ClimateCharts() {
  const { filteredRows } = useData()
  const villageRain = useMemo(() => {
    const g = {}
    filteredRows.forEach(r => {
      const v = (r.village||'')
      if (!v) return
      g[v] = g[v] || { village: v, rainfall: 0, count: 0, temperature: 0 }
      g[v].rainfall += parseFloat(r.rainfall||0)
      g[v].temperature += parseFloat(r.temperature||0)
      g[v].count += 1
    })
    return Object.values(g).map(o => ({ village: o.village, avg_rain: o.rainfall/o.count, avg_temp: o.temperature/o.count }))
  }, [filteredRows])

  const scatterData = useMemo(() => filteredRows.map(r => ({ x: parseFloat(r.rainfall||0), y: parseFloat(r.area||0) })), [filteredRows])

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="bg-white/80 border rounded p-4">
        <div className="flex items-center justify-between mb-2"><h3 className="font-semibold">Average Rainfall by Village</h3><span className="text-xs text-gray-500">Line chart</span></div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={villageRain}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="village" interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="avg_rain" stroke="#2563eb" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white/80 border rounded p-4">
        <div className="flex items-center justify-between mb-2"><h3 className="font-semibold">Temperature Pattern</h3><span className="text-xs text-gray-500">Line chart</span></div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={villageRain}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="village" interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="avg_temp" stroke="#ef4444" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white/80 border rounded p-4 lg:col-span-2">
        <div className="flex items-center justify-between mb-2"><h3 className="font-semibold">Rainfall vs Area</h3><span className="text-xs text-gray-500">Scatter plot</span></div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid />
              <XAxis type="number" dataKey="x" name="Rainfall (mm)" />
              <YAxis type="number" dataKey="y" name="Area (ha)" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={scatterData} fill="#10b981" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function DataTable() {
  const { filteredRows } = useData()
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 50

  const headers = ['village','crop','area','temperature','rainfall','soil','season']
  const view = useMemo(() => {
    let data = filteredRows
    if (query) {
      const q = query.toLowerCase()
      data = data.filter(r => headers.some(h => String(r[h]||'').toLowerCase().includes(q)))
    }
    return data.slice((page-1)*pageSize, page*pageSize)
  }, [filteredRows, query, page])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))

  return (
    <div className="bg-white/80 border rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Data Table</h3>
        <input placeholder="Search..." value={query} onChange={e=>{setPage(1); setQuery(e.target.value)}} className="border rounded px-2 py-1 text-sm" />
      </div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {headers.map(h=> <th key={h} className="text-left px-3 py-2 capitalize">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {view.map((r,i)=> (
              <tr key={i} className="odd:bg-white even:bg-gray-50">
                {headers.map(h=> <td key={h} className="px-3 py-2">{r[h]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-3 text-sm">
        <div>Page {page} of {totalPages}</div>
        <div className="space-x-2">
          <button className="px-3 py-1 bg-gray-100 rounded" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Prev</button>
          <button className="px-3 py-1 bg-gray-100 rounded" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>Next</button>
        </div>
      </div>
    </div>
  )
}

function Recommendations() {
  const { filteredRows, filters } = useData()
  const [recs, setRecs] = useState([])

  useEffect(() => {
    const sample = filteredRows[0] || {}
    const payload = {
      village: filters.village || sample.village || null,
      temperature: parseFloat(sample.temperature || 0) || 26,
      rainfall: parseFloat(sample.rainfall || 0) || 700,
      soil: sample.soil || 'loam'
    }
    const base = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
    fetch(`${base}/recommend`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)})
      .then(r=>r.json()).then(d=> setRecs(d.recommendations || [])).catch(()=> setRecs([]))
  }, [filteredRows, filters])

  return (
    <div className="bg-white/80 border rounded p-4">
      <div className="flex items-center justify-between mb-2"><h3 className="font-semibold">Recommended Crops</h3><span className="text-xs text-gray-500">AI-assisted rules</span></div>
      {recs.length === 0 ? (
        <div className="text-sm text-gray-500">Upload data to see recommendations.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {recs.map((r,i)=> (
            <div key={i} className="border rounded p-3 bg-white">
              <div className="font-semibold">{r.crop}</div>
              <ul className="list-disc ml-5 text-sm text-gray-600 mt-1">
                {r.reasons?.map((x,idx)=> <li key={idx}>{x}</li>)}
              </ul>
              {r.inputs && (
                <div className="mt-2 text-xs text-gray-500">
                  Fertilizer: {r.inputs.fertilizer} • Water: {r.inputs.water}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <Metrics />
      <CropCharts />
      <ClimateCharts />
      <Recommendations />
      <DataTable />
    </div>
  )
}
