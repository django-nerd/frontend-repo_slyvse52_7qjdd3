import React, { useState } from 'react'
import Papa from 'papaparse'
import { useData } from '../App'

export default function UploadPage() {
  const { setRows, setSummary } = useData()
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)

  const onFile = (file) => {
    setError(null)
    setInfo('Parsing...')
    if (!file || !file.name.endsWith('.csv')) {
      setError('Please upload a .csv file')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('File exceeds 50MB limit')
      return
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const raw = results.data || []
        const normalized = raw.map(r => {
          const o = {}
          Object.keys(r).forEach(k => {
            if (!k) return
            const key = k.trim().toLowerCase()
            o[key] = typeof r[k] === 'string' ? r[k].trim() : r[k]
          })
          return o
        })
        const required = ['village','crop','area','temperature','rainfall','soil','season']
        const missing = required.filter(k => !normalized.some(r => r.hasOwnProperty(k)))
        if (missing.length) setError('Missing fields: ' + missing.join(', '))
        setRows(normalized)
        setSummary({ rows: normalized.length, columns: Object.keys(normalized[0] || {}) })
        setInfo(`Parsed ${normalized.length} rows`)
      },
      error: (err) => {
        setError(err.message || 'Failed to parse CSV')
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto bg-white/80 border rounded p-6">
      <h2 className="text-xl font-semibold mb-2">Upload CSV</h2>
      <p className="text-sm text-gray-600 mb-4">Upload village-level agricultural data. Fields: village, crop, area, temperature, rainfall, soil, season, optional latitude, longitude.</p>
      <input type="file" accept=".csv" onChange={e => onFile(e.target.files?.[0])} />
      {error && <div className="mt-3 text-red-600 text-sm">{error}</div>}
      {info && <div className="mt-3 text-green-700 text-sm">{info}</div>}
    </div>
  )
}
