const StatCard = ({ title, value, icon: Icon, color, description }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    slate: 'bg-slate-50 text-slate-600'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
          {description && (
            <p className="text-xs text-slate-500">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color] || colorClasses.slate}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}

export default StatCard
