export const useSearch = () => {
  const searchTerm = ref('')
  const searchResults = ref<any>(null)
  const isSearching = ref(false)
  const showResults = ref(false)

  let debounceTimeout: any = null

  const search = async (term: string) => {
    searchTerm.value = term

    if (term.length < 2) {
      searchResults.value = null
      showResults.value = false
      return
    }

    // Debounce search
    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }

    debounceTimeout = setTimeout(async () => {
      isSearching.value = true
      try {
        const response = await $fetch('/api/search/global', {
          params: { q: term, limit: 5 },
        })

        if (response.success) {
          searchResults.value = response.data
          showResults.value = true
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        isSearching.value = false
      }
    }, 300)
  }

  const clearSearch = () => {
    searchTerm.value = ''
    searchResults.value = null
    showResults.value = false
  }

  return {
    searchTerm,
    searchResults,
    isSearching,
    showResults,
    search,
    clearSearch,
  }
}