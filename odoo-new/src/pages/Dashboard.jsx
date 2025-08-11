import React from 'react'

function Stat({ label, value, trend }) {
  return (
    <div className="card p-4">
      <div className="text-sm text-ink-muted">{label}</div>
      <div className="mt-1 text-2xl font-bold text-white">{value}</div>
      {trend && <div className={`mt-2 text-xs ${trend.includes('+') ? 'text-success' : 'text-danger'}`}>{trend} vs last period</div>}
    </div>
  )
}

function Dashboard() {
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Active Rentals" value="128" trend="+12%" />
        <Stat label="Utilization" value="84%" trend="+3%" />
        <Stat label="Late Returns" value="7" trend="-2" />
        <Stat label="Revenue (30d)" value="₹4.6L" trend="+18%" />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card p-6">
          <h3 className="text-lg font-semibold text-white">Today's Schedule</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { time: '09:30', title: 'Pickup – Camera Kit A', name: 'Acme Films', type: 'pickup' },
              { time: '11:00', title: 'Return – Excavator ZX', name: 'BuildRight LLC', type: 'return' },
              { time: '14:15', title: 'Pickup – Projector 4K', name: 'City Events', type: 'pickup' },
              { time: '18:00', title: 'Return – Tent 10x20', name: 'CampGo', type: 'return' },
            ].map((ev, i) => (
              <div key={i} className="glass rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-ink-muted">{ev.time}</div>
                  <div className="font-medium text-white">{ev.title}</div>
                  <div className="text-xs text-white/70">{ev.name}</div>
                </div>
                <span className={`chip ${ev.type === 'pickup' ? 'text-sky-300' : 'text-lime-300'}`}>{ev.type}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white">Notifications</h3>
          <div className="mt-4 space-y-3">
            {[
              'Reminder: Return due in 2 days – Lens EF 70-200mm',
              'Deposit received – Order #RNT-1042',
              'Late fee applied – Order #RNT-0991',
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-primary mt-2" />
                <p className="text-sm text-white/90">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Dashboard
