import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

// This tells TypeScript that a 'Chart' constant exists in the global scope,
// which is loaded via the <script> tag in index.html. This prevents errors
// in local development environments that don't understand import maps.
declare const Chart: any;

type SalesPeriod = 'daily' | 'monthly' | 'quarterly' | 'yearly';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  private dataService = inject(DataService);
  // FIX: 'Chart' is a value from a global script, not a TypeScript type. Using 'any' for the chart instance type.
  private chart: any | undefined;

  salesChart = viewChild.required<ElementRef<HTMLCanvasElement>>('salesChart');
  
  salesPeriod = signal<SalesPeriod>('monthly');

  private salesData = this.dataService.salesData;
  topProducts = computed(() => this.salesData()?.topProducts ?? []);
  keyMetrics = computed(() => this.salesData()?.keyMetrics ?? { totalRevenue: 0, totalOrders: 0, newCustomers: 0 });
  
  chartTitle = computed(() => {
    switch(this.salesPeriod()) {
      case 'daily': return 'Daily Sales';
      case 'monthly': return 'Monthly Sales';
      case 'quarterly': return 'Quarterly Sales';
      case 'yearly': return 'Yearly Sales';
    }
  });

  activeSalesData = computed(() => {
    const data = this.salesData();
    if (!data) return { labels: [], data: [] };

    switch(this.salesPeriod()) {
      case 'daily':
        return {
          labels: data.dailySales.map(s => s.day),
          data: data.dailySales.map(s => s.revenue),
        };
      case 'monthly':
        return {
          labels: data.monthlySales.map(s => s.month),
          data: data.monthlySales.map(s => s.revenue),
        };
      case 'quarterly':
        return {
          labels: data.quarterlySales.map(s => s.quarter),
          data: data.quarterlySales.map(s => s.revenue),
        };
      case 'yearly':
        return {
          labels: data.yearlySales.map(s => s.year),
          data: data.yearlySales.map(s => s.revenue),
        };
      default:
        return { labels: [], data: [] };
    }
  });

  constructor() {
    effect(() => {
      // This effect will run whenever activeSalesData changes.
      // We update the chart if it has already been initialized.
      const sales = this.activeSalesData();
      if (this.chart && sales.labels.length > 0) {
        this.chart.data.labels = sales.labels;
        this.chart.data.datasets[0].data = sales.data;
        this.chart.data.datasets[0].label = this.chartTitle();
        this.chart.update();
      }
    });
  }

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
  
  setSalesPeriod(period: SalesPeriod) {
    this.salesPeriod.set(period);
  }

  private createChart(): void {
    const sales = this.activeSalesData();

    const canvas = this.salesChart().nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.clientHeight);
    gradient.addColorStop(0, 'rgba(20, 184, 166, 0.5)'); // teal-500 with opacity
    gradient.addColorStop(1, 'rgba(20, 184, 166, 0)');   // transparent

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: sales.labels,
        datasets: [
          {
            label: this.chartTitle(),
            data: sales.data,
            backgroundColor: gradient,
            borderColor: 'rgba(13, 148, 136, 1)', // teal-600
            borderWidth: 3,
            fill: true,
            tension: 0.4, // For smooth curves
            pointBackgroundColor: '#ffffff',
            pointBorderColor: 'rgba(13, 148, 136, 1)', // teal-600
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(15, 118, 110, 1)', // teal-700
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: '#ffffff',
            titleColor: '#1e293b',
            bodyColor: '#475569',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function (context: any) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                  }).format(context.parsed.y);
                }
                return label;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#e2e8f0',
              // FIX: The `borderDash` property is valid for grid lines in Chart.js but may be missing from the project's type definitions.
              // @ts-ignore
              borderDash: [5, 5],
              drawBorder: false,
            },
            ticks: {
              color: '#64748b', // slate-500
              padding: 10,
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: '#64748b', // slate-500
            },
          },
        },
      },
    });
  }
}
