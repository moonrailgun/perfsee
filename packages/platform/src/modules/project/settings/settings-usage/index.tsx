import { TimeUsageChart } from './time-usage-chart'
import { UsageTable } from './usage-table'

export const ProjectUsage = () => {
  return (
    <div>
      <UsageTable />
      <TimeUsageChart />
    </div>
  )
}
