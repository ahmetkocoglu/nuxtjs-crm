<template>
  <div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Raporlar ve Analizler</h1>

    <!-- Rapor Seçenekleri -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">Rapor Tipi</label>
          <select v-model="selectedReport" class="border p-2 rounded w-full">
            <option value="sales">📊 Satış Raporu</option>
            <option value="customers">👥 Müşteri Raporu</option>
            <option value="activities">📈 Aktivite Raporu</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Periyot</label>
          <select v-model="selectedPeriod" @change="loadReportData" class="border p-2 rounded w-full">
            <option value="day">Günlük</option>
            <option value="week">Haftalık</option>
            <option value="month">Aylık</option>
            <option value="year">Yıllık</option>
          </select>
        </div>

        <div class="md:col-span-2 flex items-end gap-2">
          <button
            @click="loadReportData"
            class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            🔍 Rapor Oluştur
          </button>
          <button
            @click="exportReport"
            class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
          >
            📥 Excel İndir
          </button>
        </div>
      </div>
    </div>

    <!-- Satış Raporu -->
    <div v-if="selectedReport === 'sales'" class="space-y-6">
      <!-- Özet Kartlar -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-gray-500 text-sm font-medium mb-2">Ortalama Fırsat Değeri</h3>
          <p class="text-3xl font-bold text-blue-600">
            {{ formatCurrency(salesData?.avgDealValue || 0) }}
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-gray-500 text-sm font-medium mb-2">Ortalama Kapanış Süresi</h3>
          <p class="text-3xl font-bold text-green-600">
            {{ Math.round(salesData?.avgClosingTime || 0) }} gün
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-gray-500 text-sm font-medium mb-2">Toplam Satış</h3>
          <p class="text-3xl font-bold text-purple-600">
            {{ salesTimeSeries.reduce((sum, item) => sum + item.revenue, 0) | formatCurrency }}
          </p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-gray-500 text-sm font-medium mb-2">Toplam Fırsat</h3>
          <p class="text-3xl font-bold text-orange-600">
            {{ salesTimeSeries.reduce((sum, item) => sum + item.count, 0) }}
          </p>
        </div>
      </div>

      <!-- Satış Trendi -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-xl font-semibold mb-4">Satış Trendi</h3>
        <div class="h-80">
          <LineChart v-if="salesChartData" :data="salesChartData" :options="lineChartOptions" />
        </div>
      </div>

      <!-- Dönüşüm Hunisi -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-xl font-semibold mb-4">Dönüşüm Hunisi</h3>
          <div class="space-y-3">
            <div v-for="stage in funnelStages" :key="stage.name" class="relative">
              <div class="flex justify-between mb-1">
                <span class="font-medium">{{ stage.name }}</span>
                <span class="text-gray-600">{{ stage.count }} ({{ stage.percentage }}%)</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-8">
                <div
                  class="h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  :style="{ width: stage.percentage + '%', backgroundColor: stage.color }"
                >
                  {{ formatCurrency(stage.value) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Kayıp Nedenleri -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-xl font-semibold mb-4">Kayıp Nedenleri</h3>
          <div class="h-64">
            <DoughnutChart v-if="lostReasonsChartData" :data="lostReasonsChartData" />
          </div>
        </div>
      </div>
    </div>

    <!-- Müşteri Raporu -->
    <div v-if="selectedReport === 'customers'" class="space-y-6">
      <!-- Müşteri Büyümesi -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-xl font-semibold mb-4">Müşteri Büyüme Trendi</h3>
        <div class="h-80">
          <LineChart v-if="customerGrowthChartData" :data="customerGrowthChartData" :options="lineChartOptions" />
        </div>
      </div>

      <!-- En Değerli Müşteriler -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-xl font-semibold mb-4">En Değerli Müşteriler (Top 10)</h3>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-100">
            <tr>
              <th class="p-3 text-left">#</th>
              <th class="p-3 text-left">Müşteri</th>
              <th class="p-3 text-left">Şirket</th>
              <th class="p-3 text-left">Toplam Gelir</th>
              <th class="p-3 text-left">Fırsat Sayısı</th>
              <th class="p-3 text-left">Ortalama Fırsat</th>
            </tr>
            </thead>
            <tbody>
            <tr
              v-for="(customer, index) in topCustomers"
              :key="customer._id"
              class="border-t hover:bg-gray-50"
            >
              <td class="p-3">{{ index + 1 }}</td>
              <td class="p-3 font-medium">
                {{ customer.customer.firstName }} {{ customer.customer.lastName }}
              </td>
              <td class="p-3">{{ customer.customer.company }}</td>
              <td class="p-3 text-green-600 font-semibold">
                {{ formatCurrency(customer.totalRevenue) }}
              </td>
              <td class="p-3">{{ customer.dealCount }}</td>
              <td class="p-3">
                {{ formatCurrency(customer.totalRevenue / customer.dealCount) }}
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Müşteri Segmentasyonu -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-xl font-semibold mb-4">Müşteri Segmentasyonu</h3>
          <div class="space-y-3">
            <div v-for="segment in customerSegments" :key="segment.range" class="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <div class="font-medium">{{ segment.range }}</div>
                <div class="text-sm text-gray-600">{{ segment.count }} müşteri</div>
              </div>
              <div class="text-right">
                <div class="font-semibold text-blue-600">{{ segment.percentage }}%</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Müşteri Metrikleri -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-xl font-semibold mb-4">Müşteri Metrikleri</h3>
          <div class="space-y-4">
            <div class="p-4 bg-blue-50 rounded-lg">
              <div class="text-sm text-gray-600 mb-1">Ortalama Müşteri Değeri (CLV)</div>
              <div class="text-2xl font-bold text-blue-600">
                {{ formatCurrency(customersData?.avgCLV || 0) }}
              </div>
            </div>
            <div class="p-4 bg-green-50 rounded-lg">
              <div class="text-sm text-gray-600 mb-1">Müşteri Başına Ortalama Fırsat</div>
              <div class="text-2xl font-bold text-green-600">
                {{ (customersData?.avgDealsPerCustomer || 0).toFixed(1) }}
              </div>
            </div>
            <div class="p-4 bg-red-50 rounded-lg">
              <div class="text-sm text-gray-600 mb-1">Müşteri Kayıp Oranı (Churn)</div>
              <div class="text-2xl font-bold text-red-600">
                %{{ (customersData?.churnRate || 0).toFixed(1) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Aktivite Raporu -->
    <div v-if="selectedReport === 'activities'" class="space-y-6">
      <!-- Aktivite Trendi -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-xl font-semibold mb-4">Aktivite Trendi (Son 30 Gün)</h3>
        <div class="h-80">
          <LineChart v-if="activityTrendChartData" :data="activityTrendChartData" :options="lineChartOptions" />
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Aktivite Tiplerine Göre Dağılım -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-xl font-semibold mb-4">Aktivite Tipleri</h3>
          <div class="h-64">
            <DoughnutChart v-if="activityTypeChartData" :data="activityTypeChartData" />
          </div>
        </div>

        <!-- Aktivite Sonuçları -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-xl font-semibold mb-4">Aktivite Sonuçları</h3>
          <div class="h-64">
            <DoughnutChart v-if="activityOutcomeChartData" :data="activityOutcomeChartData" />
          </div>
        </div>
      </div>

      <!-- En Aktif Kullanıcılar -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-xl font-semibold mb-4">En Aktif Kullanıcılar</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div
            v-for="(user, index) in topUsers"
            :key="user._id"
            class="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center"
          >
            <div class="text-3xl mb-2">🏆</div>
            <div class="font-semibold">{{ user._id }}</div>
            <div class="text-2xl font-bold text-blue-600">{{ user.count }}</div>
            <div class="text-sm text-gray-600">aktivite</div>
          </div>
        </div>
      </div>

      <!-- Ortalama Aktivite Süreleri -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-xl font-semibold mb-4">Ortalama Aktivite Süreleri</h3>
        <div class="space-y-3">
          <div
            v-for="duration in activityDurations"
            :key="duration._id"
            class="flex items-center gap-4"
          >
            <div class="w-32 font-medium">{{ getActivityTypeName(duration._id) }}</div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <div class="flex-1 bg-gray-200 rounded-full h-6">
                  <div
                    class="bg-blue-500 h-6 rounded-full flex items-center justify-end px-2 text-white text-sm"
                    :style="{ width: (duration.avgDuration / maxDuration * 100) + '%' }"
                  >
                    {{ Math.round(duration.avgDuration) }} dk
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const selectedReport = ref('sales')
const selectedPeriod = ref('month')

// Fetch data
const { data: salesDataResponse, refresh: refreshSales } = await useFetch('/api/analytics/sales', {
  query: { period: selectedPeriod },
})
const { data: customersDataResponse, refresh: refreshCustomers } = await useFetch('/api/analytics/customers')
const { data: activitiesDataResponse, refresh: refreshActivities } = await useFetch('/api/analytics/activities')

const salesData = computed(() => salesDataResponse.value?.data)
const customersData = computed(() => customersDataResponse.value?.data)
const activitiesData = computed(() => activitiesDataResponse.value?.data)

const loadReportData = () => {
  if (selectedReport.value === 'sales') {
    refreshSales()
  } else if (selectedReport.value === 'customers') {
    refreshCustomers()
  } else if (selectedReport.value === 'activities') {
    refreshActivities()
  }
}

// Sales Data Processing
const salesTimeSeries = computed(() => salesData.value?.salesTimeSeries || [])

const salesChartData = computed(() => {
  if (!salesTimeSeries.value.length) return null

  const labels = salesTimeSeries.value.map((item: any) => {
    if (item._id.day) {
      return `${item._id.day}/${item._id.month}`
    } else if (item._id.week) {
      return `Hafta ${item._id.week}`
    } else if (item._id.month) {
      return `${item._id.month}/${item._id.year}`
    } else {
      return item._id.year
    }
  })

  return {
    labels,
    datasets: [
      {
        label: 'Gelir',
        data: salesTimeSeries.value.map((item: any) => item.revenue),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Fırsat Sayısı',
        data: salesTimeSeries.value.map((item: any) => item.count),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y1',
      },
    ],
  }
})

const funnelStages = computed(() => {
  if (!salesData.value?.funnelData) return []

  const stages = salesData.value.funnelData
  const total = stages.reduce((sum: number, s: any) => sum + s.count, 0)

  const stageOrder = ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost']
  const stageColors: any = {
    lead: '#9CA3AF',
    qualified: '#3B82F6',
    proposal: '#8B5CF6',
    negotiation: '#F59E0B',
    won: '#10B981',
    lost: '#EF4444',
  }
  const stageNames: any = {
    lead: 'Lead',
    qualified: 'Kalifiye',
    proposal: 'Teklif',
    negotiation: 'Müzakere',
    won: 'Kazanıldı',
    lost: 'Kaybedildi',
  }

  return stageOrder
    .map(stageName => {
      const stage = stages.find((s: any) => s._id === stageName)
      if (!stage) return null
      return {
        name: stageNames[stageName],
        count: stage.count,
        value: stage.totalValue,
        percentage: Math.round((stage.count / total) * 100),
        color: stageColors[stageName],
      }
    })
    .filter(Boolean)
})

const lostReasonsChartData = computed(() => {
  if (!salesData.value?.lostReasons?.length) return null

  return {
    labels: salesData.value.lostReasons.map((r: any) => r._id),
    datasets: [{
      data: salesData.value.lostReasons.map((r: any) => r.count),
      backgroundColor: [
        '#EF4444',
        '#F97316',
        '#F59E0B',
        '#EAB308',
        '#84CC16',
        '#22C55E',
      ],
    }],
  }
})

// Customer Data Processing
const topCustomers = computed(() => customersData.value?.topCustomersByValue || [])

const customerSegments = computed(() => {
  if (!customersData.value?.customerSegmentation) return []

  const segments = customersData.value.customerSegmentation
  const total = segments.reduce((sum: number, s: any) => sum + s.count, 0)

  const rangeNames: any = {
    0: '0 - 10K',
    10000: '10K - 50K',
    50000: '50K - 100K',
    100000: '100K - 500K',
    500000: '500K+',
  }

  return segments.map((s: any) => ({
    range: rangeNames[s._id] || 'Diğer',
    count: s.count,
    percentage: Math.round((s.count / total) * 100),
  }))
})

const customerGrowthChartData = computed(() => {
  if (!customersData.value?.customerGrowth?.length) return null

  const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

  return {
    labels: customersData.value.customerGrowth.map((item: any) =>
      `${monthNames[item._id.month - 1]} ${item._id.year}`
    ),
    datasets: [{
      label: 'Yeni Müşteriler',
      data: customersData.value.customerGrowth.map((item: any) => item.count),
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true,
    }],
  }
})

// Activity Data Processing
const activityTrendChartData = computed(() => {
  if (!activitiesData.value?.activityTrend?.length) return null

  return {
    labels: activitiesData.value.activityTrend.map((item: any) =>
      `${item._id.day}/${item._id.month}`
    ),
    datasets: [{
      label: 'Aktivite Sayısı',
      data: activitiesData.value.activityTrend.map((item: any) => item.count),
      borderColor: '#8B5CF6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      tension: 0.4,
      fill: true,
    }],
  }
})

const activityTypeChartData = computed(() => {
  if (!activitiesData.value?.activitiesByType?.length) return null

  const typeNames: any = {
    call: 'Görüşme',
    email: 'E-posta',
    meeting: 'Toplantı',
    note: 'Not',
    task: 'Görev',
    deal: 'Fırsat',
  }

  return {
    labels: activitiesData.value.activitiesByType.map((t: any) => typeNames[t._id] || t._id),
    datasets: [{
      data: activitiesData.value.activitiesByType.map((t: any) => t.count),
      backgroundColor: [
        '#3B82F6',
        '#10B981',
        '#8B5CF6',
        '#F59E0B',
        '#F97316',
        '#EC4899',
      ],
    }],
  }
})

const activityOutcomeChartData = computed(() => {
  if (!activitiesData.value?.activitiesByOutcome?.length) return null

  const outcomeNames: any = {
    successful: 'Başarılı',
    unsuccessful: 'Başarısız',
    pending: 'Beklemede',
    scheduled: 'Planlandı',
  }

  return {
    labels: activitiesData.value.activitiesByOutcome.map((o: any) => outcomeNames[o._id] || o._id),
    datasets: [{
      data: activitiesData.value.activitiesByOutcome.map((o: any) => o.count),
      backgroundColor: [
        '#10B981',
        '#EF4444',
        '#F59E0B',
        '#3B82F6',
      ],
    }],
  }
})

const topUsers = computed(() => activitiesData.value?.topUsersByActivity || [])

const activityDurations = computed(() => activitiesData.value?.avgActivityDuration || [])

const maxDuration = computed(() => {
  if (!activityDurations.value.length) return 0
  return Math.max(...activityDurations.value.map((d: any) => d.avgDuration))
})

// Chart Options
const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      position: 'left',
    },
    y1: {
      beginAtZero: true,
      position: 'right',
      grid: {
        drawOnChartArea: false,
      },
    },
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
    },
  },
}

// Helpers
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const getActivityTypeName = (type: string) => {
  const names: any = {
    call: 'Görüşme',
    email: 'E-posta',
    meeting: 'Toplantı',
    note: 'Not',
    task: 'Görev',
    deal: 'Fırsat',
  }
  return names[type] || type
}

const exportReport = () => {
  // Excel export functionality
  alert('Excel export özelliği yakında eklenecek!')
}
</script>