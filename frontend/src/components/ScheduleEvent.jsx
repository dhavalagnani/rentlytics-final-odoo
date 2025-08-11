import React from 'react'

export default function ScheduleEvent({ event, onClick }) {
  const getEventColor = (type) => {
    switch (type) {
      case 'pickup': return 'bg-sky-500/20 text-sky-300 border-sky-500/30'
      case 'return': return 'bg-lime-500/20 text-lime-300 border-lime-500/30'
      case 'maintenance': return 'bg-orange-500/20 text-orange-300 border-orange-500/30'
      case 'reservation': return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      default: return 'bg-white/10 text-white/80 border-white/20'
    }
  }

  const getEventIcon = (type) => {
    switch (type) {
      case 'pickup': return '📦'
      case 'return': return '↩️'
      case 'maintenance': return '🔧'
      case 'reservation': return '📅'
      default: return '•'
    }
  }

  return (
    <div 
      onClick={() => onClick(event)}
      className={`chip cursor-pointer transition-all hover:scale-105 ${getEventColor(event.type)}`}
      title={`${event.time} - ${event.title}`}
    >
      <span className="text-xs">{getEventIcon(event.type)}</span>
      <span className="text-xs font-medium truncate">{event.title}</span>
    </div>
  )
}
