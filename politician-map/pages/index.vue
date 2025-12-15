<template>
  <ClientOnly>
    <div>
      <div v-html="htmlContent"></div>
      <PoliticianModal
        :show="showModal"
        :politician="selectedPolitician"
        @close="closeModal"
      />
    </div>
  </ClientOnly>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const htmlContent = ref('')
const showModal = ref(false)
const selectedPolitician = ref(null)

const { politicians, loadPoliticians, findByRegion } = usePoliticians()

onMounted(async () => {
  try {
    // Load politician data first
    await loadPoliticians()
    console.log('✅ Politicians loaded:', politicians.value.length)

    // Set up global modal function for map_zoom.js to call
    window.openPoliticianModal = (regionName) => {
      console.log('🖱️ openPoliticianModal called with:', regionName)
      const politician = findByRegion(regionName)
      console.log('👤 Found politician:', politician)

      if (politician) {
        selectedPolitician.value = politician
        showModal.value = true
        console.log('✅ Modal opened for:', politician.의원명)
      } else {
        console.log('❌ No politician found for:', regionName)
        console.log('📋 First 5 regions in CSV:', politicians.value.slice(0, 5).map(p => p.지역))
        alert(`"${regionName}" 지역의 의원 정보를 찾을 수 없습니다.`)
      }
    }

    // Fetch the original HTML content
    const response = await fetch('/original.html')
    const html = await response.text()

    // Extract body content
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
    if (bodyMatch) {
      htmlContent.value = bodyMatch[1]
    }

    // Wait for DOM to update
    await nextTick()

    // Execute scripts
    executeScripts()
  } catch (error) {
    console.error('Failed to load HTML:', error)
  }
})

function executeScripts() {
  // D3.js and other scripts are loaded via nuxt.config.ts
  // The map_zoom.js script will automatically run when the DOM is ready
  if (window.d3) {
    // Trigger DOMContentLoaded event for scripts that listen to it
    const event = new Event('DOMContentLoaded')
    document.dispatchEvent(event)
  }
}


function closeModal() {
  showModal.value = false
  selectedPolitician.value = null
}
</script>

<style>
/* Global styles are loaded from /app.css via nuxt.config.ts */
</style>
