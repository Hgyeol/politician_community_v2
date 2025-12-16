<template>
  <ClientOnly>
    <div class="fixed inset-0 flex flex-col">
      <!-- 상단 네비게이션 -->
      <nav class="bg-white border-b border-gray-200 z-50 flex-shrink-0">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <NuxtLink to="/" class="flex items-center space-x-2 group">
              <div class="text-2xl">🏛️</div>
              <span class="text-xl font-bold text-gray-900">
                제 22대 국회의원
              </span>
            </NuxtLink>

            <div class="flex items-center space-x-4">
              <NuxtLink
                v-if="!isAuthenticated"
                to="/auth/login"
                class="px-6 py-2 bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all"
              >
                로그인
              </NuxtLink>

              <button
                v-else
                @click="handleSignOut"
                class="px-4 py-2 text-red-600 hover:bg-red-50 font-medium transition-all"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- 지도 영역 -->
      <div class="flex-1 overflow-hidden relative flex items-center justify-center bg-gray-50">
        <div v-html="htmlContent" class="max-w-5xl"></div>
        <PoliticianModal
          :show="showModal"
          :politician="selectedPolitician"
          @close="closeModal"
        />
      </div>
    </div>
  </ClientOnly>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

definePageMeta({
  layout: false
})

const htmlContent = ref('')
const showModal = ref(false)
const selectedPolitician = ref(null)

const { politicians, loadPoliticians, findByRegion } = usePoliticians()
const { isAuthenticated, signOut } = useAuth()

const handleSignOut = async () => {
  await signOut()
}

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
