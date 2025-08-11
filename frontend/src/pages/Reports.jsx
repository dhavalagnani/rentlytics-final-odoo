import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import ReportCard from '../components/ReportCard'
import layoutService from '../services/layoutService'

function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const stats = await layoutService.getDashboardStats()
      
      // Transform stats into report format
      const reportsData = [
        {
          id: 1,
          type: 'revenue',
          title: 'Revenue Analytics',
          description: 'Monthly revenue trends and projections',
          trend: stats.revenueTrend || '+0%',
          lastUpdated: new Date().toISOString().split('T')[0],
          metrics: [
            { label: 'This Month', value: stats.currentMonthRevenue || '₹0' },
            { label: 'Last Month', value: stats.lastMonthRevenue || '₹0' }
          ]
        },
        {
          id: 2,
          type: 'utilization',
          title: 'Equipment Utilization',
          description: 'Product usage and availability metrics',
          trend: stats.utilizationTrend || '+0%',
          lastUpdated: new Date().toISOString().split('T')[0],
          metrics: [
            { label: 'Current', value: stats.currentUtilization || '0%' },
            { label: 'Average', value: stats.averageUtilization || '0%' }
          ]
        },
        {
          id: 3,
          type: 'products',
          title: 'Product Performance',
          description: 'Most and least rented products',
          trend: stats.productTrend || '+0%',
          lastUpdated: new Date().toISOString().split('T')[0],
          metrics: [
            { label: 'Top Product', value: stats.topProduct || 'N/A' },
            { label: 'Rentals', value: stats.topProductRentals || '0' }
          ]
        },
        {
          id: 4,
          type: 'customers',
          title: 'Customer Insights',
          description: 'Customer behavior and preferences',
          trend: stats.customerTrend || '+0%',
          lastUpdated: new Date().toISOString().split('T')[0],
          metrics: [
            { label: 'Top Customer', value: stats.topCustomer || 'N/A' },
            { label: 'Revenue', value: stats.topCustomerRevenue || '₹0' }
          ]
        },
        {
          id: 5,
          type: 'returns',
          title: 'Returns & Delays',
          description: 'Late returns and penalty tracking',
          trend: stats.returnTrend || '+0%',
          lastUpdated: new Date().toISOString().split('T')[0],
          metrics: [
            { label: 'Late Returns', value: stats.lateReturns || '0' },
            { label: 'On Time', value: stats.onTimeReturns || '0%' }
          ]
        }
      ]
      
      setReports(reportsData)
    } catch (error) {
      console.error('Error loading reports:', error)
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (reportId, format) => {
    try {
      // In a real app, this would call an API to generate and download the report
      toast.info(`Exporting report ${reportId} as ${format}...`)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success(`Report exported successfully as ${format}`)
    } catch (error) {
      console.error('Error exporting report:', error)
      toast.error('Failed to export report')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Reports & Analytics</h2>
        <button 
          onClick={() => loadReports()}
          className="btn btn-outline"
        >
          Refresh Data
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/60">No reports available</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onExport={handleExport}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Reports
