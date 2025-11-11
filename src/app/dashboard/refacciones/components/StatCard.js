'use client'

const StatCard = ({ title, value, icon: Icon, color, description }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 lg:p-6 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs lg:text-sm text-slate-600 font-medium mb-1">{title}</p>
          <p className="text-xl lg:text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>
        <div className={`${color} w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center`}>
          <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
        </div>
      </div>
    </div>
  )
}

export default StatCard
