'use client'

const StatCard = ({ title, value, icon: Icon, color, description }) => (
  <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-slate-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2 lg:mb-3">
          <p className="text-xs lg:text-sm font-medium text-slate-600">{title}</p>
          <div className={`p-1.5 lg:p-2 rounded-lg ${color}`}>
            <Icon className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
          </div>
        </div>
        <p className="text-xl lg:text-3xl font-bold text-slate-900 mb-1">{value}</p>
        {description && (
          <p className="text-xs text-slate-500">{description}</p>
        )}
      </div>
    </div>
  </div>
)

export default StatCard