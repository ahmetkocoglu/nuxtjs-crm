<template>
  <div class="container mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Müşteri Yönetimi</h1>
      <div class="flex gap-2">
        <div class="relative">
          <button 
            @click="showExportMenu = !showExportMenu"
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
          >
            📥 Dışa Aktar
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          <div 
            v-if="showExportMenu"
            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border z-10"
          >
            <button 
              @click="exportData('excel')"
              class="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              📊 Excel (.xlsx)
            </button>
            <button 
              @click="exportData('csv')"
              class="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              📄 CSV
            </button>
          </div>
        </div>
        <button 
          @click="showAddForm = true"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Yeni Müşteri Ekle
        </button>
      </div>
    </div>

    <!-- Rest of the component stays the same -->
  </div>
</template>

<script setup lang="ts">
// ... existing code ...

const showExportMenu = ref(false)

// Close menu when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('button')) {
      showExportMenu.value = false
    }
  })
})

const exportData = async (format: 'excel' | 'csv') => {
  showExportMenu.value = false
  
  try {
    const params = new URLSearchParams()
    params.append('format', format)
    if (filterStatus.value) params.append('status', filterStatus.value)
    
    const response = await fetch(`/api/export/customers?${params.toString()}`)
    const blob = await response.blob()
    
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `musteriler-${Date.now()}.${format === 'excel' ? 'xlsx' : 'csv'}`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Export error:', error)
    alert('Dışa aktarma sırasında bir hata oluştu')
  }
}

// ... rest of existing code ...
</script>

<style scoped>

</style>