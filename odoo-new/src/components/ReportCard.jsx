import React from 'react'

export default function ReportCard({ report, onExport }) {
  const getReportIcon = (type) => {
    switch (type) {
      case 'revenue': return '💰'
      case 'utilization': return '📊'
      case 'products': return '📦'
      case 'customers': return '👥'
      case 'returns': return '↩️'
      default: return '📈'
    }
  }

  const getReportColor = (type) => {
    switch (type) {
      case 'revenue': return 'text-green-400'
      case 'utilization': return 'text-blue-400'
      case 'products': return 'text-purple-400'
      case 'customers': return 'text-orange-400'
      case 'returns': return 'text-red-400'
      default: return 'text-white'
    }
  }

  return (
    <div className="card p-5 hover:scale-[1.02] transition-transform duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`text-2xl ${getReportColor(report.type)}`}>
            {getReportIcon(report.type)}
          </div>
          <div>
            <h3 className="text-white font-semibold">{report.title}</h3>
            <p className="text-sm text-ink-muted">{report.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {report.trend && (
            <span className={`text-xs px-2 py-1 rounded-full ${report.trend.includes('+') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              {report.trend}
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          {report.metrics.map((metric, index) => (
            <div key={index} className="text-center p-3 rounded-lg bg-white/5">
              <div className="text-2xl font-bold text-white">{metric.value}</div>
              <div className="text-xs text-ink-muted">{metric.label}</div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-border/30">
          <div className="text-xs text-ink-muted">
            Last updated: {report.lastUpdated}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onExport(report.id, 'pdf')}
              className="btn btn-outline text-xs px-2 py-1"
            >
              PDF
            </button>
            <button 
              onClick={() => onExport(report.id, 'xlsx')}
              className="btn btn-outline text-xs px-2 py-1"
            >
              XLSX
            </button>
            <button 
              onClick={() => onExport(report.id, 'csv')}
              className="btn btn-outline text-xs px-2 py-1"
            >
              CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
