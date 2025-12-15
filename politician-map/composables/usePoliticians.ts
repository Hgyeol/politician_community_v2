export function usePoliticians() {
  const politicians = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function loadPoliticians() {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/의원.csv')
      const csvText = await response.text()

      // Parse CSV
      const lines = csvText.trim().split('\n')
      const headers = lines[0].split(',')

      const data = []
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i])
        const obj: any = {}

        headers.forEach((header, index) => {
          obj[header] = values[index] || ''
        })

        data.push(obj)
      }

      politicians.value = data
    } catch (err) {
      error.value = '의원 데이터를 불러오는데 실패했습니다.'
      console.error('Failed to load politicians:', err)
    } finally {
      loading.value = false
    }
  }

  function parseCSVLine(line: string): string[] {
    const result = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }

    result.push(current.trim())
    return result
  }

  function findByRegion(regionName: string) {
    return politicians.value.find(p => p.지역 === regionName)
  }

  return {
    politicians,
    loading,
    error,
    loadPoliticians,
    findByRegion
  }
}
