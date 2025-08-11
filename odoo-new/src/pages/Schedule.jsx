import React from 'react'
import ScheduleEvent from '../components/ScheduleEvent'

function Schedule() {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const events = [
    { type: 'pickup', title: 'Projector', time: '09:30' },
    { type: 'return', title: 'Camera', time: '14:00' },
    { type: 'maintenance', title: 'Drone', time: '11:00' },
    { type: 'reservation', title: 'Audio Kit', time: '16:00' },
  ]

  const handleEventClick = (event) => {
    alert(`Event: ${event.title} at ${event.time}`)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">Schedule</h2>
      <div className="card p-4">
        <div className="grid grid-cols-7 gap-2">
          {days.map(d => (
            <div key={d} className="p-3 rounded-xl bg-white/5 text-center text-white/80 font-medium">{d}</div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-7 gap-2">
          {new Array(14).fill(0).map((_, i) => (
            <div key={i} className="min-h-24 rounded-xl bg-surface-elev border border-border/60 p-2">
              {i % 3 === 0 && (
                <ScheduleEvent 
                  event={events[0]} 
                  onClick={handleEventClick}
                />
              )}
              {i % 5 === 0 && (
                <ScheduleEvent 
                  event={events[1]} 
                  onClick={handleEventClick}
                />
              )}
              {i % 7 === 0 && (
                <ScheduleEvent 
                  event={events[2]} 
                  onClick={handleEventClick}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Schedule
