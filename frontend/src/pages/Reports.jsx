import React from 'react'
import ReportCard from '../components/ReportCard'

function Reports() {
  const reports = [
    {
      id: 1,
      type: 'revenue',
      title: 'Revenue Analytics',
      description: 'Monthly revenue trends and projections',
      trend: '+18%',
      lastUpdated: '2024-03-14',
      metrics: [
        { label: 'This Month', value: '₹4.6L' },
        { label: 'Last Month', value: '₹3.9L' }
      ]
    },
    {
      id: 2,
      type: 'utilization',
      title: 'Equipment Utilization',
      description: 'Product usage and availability metrics',
      trend: '+5%',
      lastUpdated: '2024-03-14',
      metrics: [
        { label: 'Current', value: '84%' },
        { label: 'Average', value: '76%' }
      ]
    },
    {
      id: 3,
      type: 'products',
      title: 'Product Performance',
      description: 'Most and least rented products',
      trend: '+12%',
      lastUpdated: '2024-03-14',
      metrics: [
        { label: 'Top Product', value: 'Camera Kit A' },
        { label: 'Rentals', value: '45' }
      ]
    },
    {
      id: 4,
      type: 'customers',
      title: 'Customer Insights',
      description: 'Customer behavior and preferences',
      trend: '+8%',
      lastUpdated: '2024-03-14',
      metrics: [
        { label: 'Top Customer', value: 'Acme Films' },
        { label: 'Revenue', value: '₹2.1L' }
      ]
    },
    {
      id: 5,
      type: 'returns',
      title: 'Returns & Delays',
      description: 'Late returns and penalty tracking',
      trend: '-15%',
      lastUpdated: '2024-03-14',
      metrics: [
        { label: 'Late Returns', value: '7' },
        { label: 'On Time', value: '93%' }
      ]
    }
  ]

  const handleExport = (reportId, format) => {
    alert(`Exporting report ${reportId} as ${format}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Reports & Analytics</h2>
        <div className="flex gap-2">
          <select className="input w-40">
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>Last Year</option>
          </select>
          <button className="btn btn-primary">Generate Report</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map(report => (
          <ReportCard 
            key={report.id}
            report={report}
            onExport={handleExport}
          />
        ))}
      </div>
    </div>
  )
}

export default Reports
