import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
} from 'chart.js';
import { formatMs } from '../lib/time';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

interface MiniTrendChartProps {
  labels: string[];
  data: number[];
}

const MiniTrendChart = ({ labels, data }: MiniTrendChartProps) => {
  if (data.length === 0) {
    return <p className="text-xs text-slate-400">No swims yet.</p>;
  }

  return (
    <div className="h-32">
      <Line
        data={{
          labels,
          datasets: [
            {
              label: 'Time',
              data,
              fill: true,
              borderColor: '#38bdf8',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              tension: 0.3,
              pointRadius: 3
            }
          ]
        }}
        options={{
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (context) => formatMs(Number(context.raw))
              }
            }
          },
          scales: {
            x: { display: false },
            y: {
              ticks: {
                callback: (value) => formatMs(Number(value))
              }
            }
          }
        }}
      />
    </div>
  );
};

export default MiniTrendChart;
