const StatCard = ({ title, value, icon: Icon, color, description }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm font-medium text-slate-600">{title}</p>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
    <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
    {description && (
      <p className="text-sm text-slate-500">{description}</p>
    )}
  </div>
)

export default StatCard
