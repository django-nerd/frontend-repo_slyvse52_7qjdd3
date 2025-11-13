import React, { useRef } from 'react'
import { toPng } from 'html-to-image'
import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import Dashboard from './Dashboard'

export default function ReportsPage() {
  const ref = useRef(null)

  const exportPNG = async () => {
    if (!ref.current) return
    const dataUrl = await toPng(ref.current)
    saveAs(dataUrl, 'dashboard.png')
  }

  const exportPDF = async () => {
    if (!ref.current) return
    const dataUrl = await toPng(ref.current)
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1200, 800] })
    pdf.addImage(dataUrl, 'PNG', 0, 0, 1200, 800)
    pdf.save('report.pdf')
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={exportPNG} className="bg-blue-600 text-white px-3 py-2 rounded">Export as PNG</button>
        <button onClick={exportPDF} className="bg-green-600 text-white px-3 py-2 rounded">Export as PDF</button>
      </div>
      <div ref={ref} className="space-y-6">
        <Dashboard />
      </div>
    </div>
  )
}
