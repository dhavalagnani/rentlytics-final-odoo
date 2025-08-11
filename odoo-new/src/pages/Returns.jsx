import React from 'react'

function Returns() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">Returns & Delays</h2>
      <div className="card p-5 space-y-3">
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="text-sm text-ink-muted">Late Fee</label>
            <input className="input mt-1" placeholder="e.g., ₹200/day" />
          </div>
          <div>
            <label className="text-sm text-ink-muted">Grace Period</label>
            <input className="input mt-1" placeholder="e.g., 2 hours" />
          </div>
          <div>
            <label className="text-sm text-ink-muted">Auto-apply</label>
            <select className="input mt-1"><option>Yes</option><option>No</option></select>
          </div>
        </div>
        <button className="btn btn-primary w-fit">Save</button>
      </div>
    </div>
  )
}

export default Returns
