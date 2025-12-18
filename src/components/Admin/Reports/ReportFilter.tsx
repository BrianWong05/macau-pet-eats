import { useTranslation } from 'react-i18next'

type FilterStatus = 'pending' | 'approved' | 'rejected' | 'all'

interface ReportFilterProps {
  filterStatus: FilterStatus
  setFilterStatus: (status: FilterStatus) => void
}

export function ReportFilter({ filterStatus, setFilterStatus }: ReportFilterProps) {
  const { t } = useTranslation()
  const statuses: FilterStatus[] = ['pending', 'approved', 'rejected', 'all']

  return (
    <div className="flex gap-2">
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => setFilterStatus(status)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filterStatus === status
              ? 'bg-primary-500 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          {t(`admin.reports.status.${status}`)}
        </button>
      ))}
    </div>
  )
}
