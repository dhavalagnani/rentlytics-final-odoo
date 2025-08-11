import React from 'react'
import PricingCard from '../components/PricingCard'

function Pricing() {
  const pricingLists = [
    {
      id: 1,
      name: 'Standard',
      description: 'Default pricing for regular customers',
      hourly: '₹10',
      daily: '₹60',
      weekly: '₹300',
      isDefault: true
    },
    {
      id: 2,
      name: 'Corporate',
      description: 'Discounted rates for corporate clients',
      hourly: '₹9',
      daily: '₹55',
      weekly: '₹280',
      discount: '10% off for bulk orders',
      isDefault: false
    },
    {
      id: 3,
      name: 'Premium',
      description: 'Premium service with priority support',
      hourly: '₹12',
      daily: '₹70',
      weekly: '₹350',
      discount: 'Free delivery & setup',
      isDefault: false
    }
  ]

  const handleEditPricing = (pricing) => {
    alert(`Editing pricing: ${pricing.name}`)
  }

  const handleDeletePricing = (pricingId) => {
    alert(`Deleting pricing ID: ${pricingId}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Pricing & Pricelists</h2>
        <button className="btn btn-primary">Add New Pricelist</button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pricingLists.map((pricing) => (
          <PricingCard 
            key={pricing.id}
            pricing={pricing}
            onEdit={handleEditPricing}
            onDelete={handleDeletePricing}
          />
        ))}
      </div>
    </div>
  )
}

export default Pricing
