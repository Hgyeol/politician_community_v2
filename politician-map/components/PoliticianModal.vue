<template>
  <Transition name="panel">
    <div v-if="show" class="panel-container">
      <button class="panel-close" @click="closeModal">×</button>

      <div v-if="politician" class="panel-content">
        <div class="politician-image">
          <img
            v-if="politicianImage"
            :src="politicianImage"
            :alt="politician.의원명"
            @error="handleImageError"
          >
          <div v-else class="no-image">
            사진 없음
          </div>
        </div>

        <div class="politician-info">
          <h2>{{ politician.의원명 }}</h2>
          <div class="info-row">
            <span class="label">지역</span>
            <span class="value">{{ politician.지역 }}</span>
          </div>
          <div class="info-row">
            <span class="label">정당</span>
            <span class="value">{{ politician.정당 }}</span>
          </div>
          <div class="info-row">
            <span class="label">소속위원회</span>
            <span class="value">{{ politician.소속위원회 }}</span>
          </div>
          <div class="info-row">
            <span class="label">당선</span>
            <span class="value">{{ politician.당선횟수 }}<template v-if="politician.당선방법"> ({{ politician.당선방법 }})</template></span>
          </div>
        </div>

        <!-- 게시판 이동 버튼 -->
        <div class="mt-6">
          <NuxtLink
            :to="`/politicians/${politician.id}/suggestions`"
            class="block w-full px-6 py-3 bg-gray-800 text-white text-center rounded-lg font-semibold hover:bg-gray-900 transition-all"
          >
            건의사항 게시판 →
          </NuxtLink>
        </div>
      </div>

      <div v-else class="panel-content">
        <p class="no-data">선택한 지역의 의원 정보를 찾을 수 없습니다.</p>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  show: Boolean,
  politician: Object
})

const emit = defineEmits(['close'])

const politicianImage = ref('')
const imageExtensions = ['jpg', 'jpeg', 'png', 'JPG', 'JPEG', 'PNG', 'gif', 'GIF']

watch(() => props.politician, (newPolitician) => {
  if (newPolitician && newPolitician.의원명) {
    // Try different image extensions
    tryLoadImage(newPolitician.의원명)
  }
}, { immediate: true })

async function tryLoadImage(name) {
  politicianImage.value = ''

  for (const ext of imageExtensions) {
    const imagePath = `/image/${name}.${ext}`
    try {
      const response = await fetch(imagePath, { method: 'HEAD' })
      if (response.ok) {
        politicianImage.value = imagePath
        return
      }
    } catch (error) {
      // Continue to next extension
    }
  }
}

function handleImageError() {
  politicianImage.value = ''
}

function closeModal() {
  emit('close')
}
</script>

<style scoped>
.panel-container {
  position: fixed;
  right: 0;
  top: 64px;
  width: 400px;
  height: calc(100vh - 64px);
  background: white;
  border-left: 1px solid #e5e7eb;
  overflow-y: auto;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.04);
  z-index: 1000;
}

.panel-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 1;
  color: #6b7280;
}

.panel-close:hover {
  background: #e5e7eb;
  color: #111827;
}

.panel-content {
  padding: 40px 24px;
}

.politician-image {
  width: 200px;
  height: 240px;
  margin: 0 auto 30px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.politician-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 16px;
  font-weight: 500;
}

.politician-info h2 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
  text-align: center;
  color: #111827;
}

.info-row {
  display: flex;
  padding: 16px 0;
  border-bottom: 1px solid #e2e8f0;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #4a5568;
  min-width: 100px;
  font-size: 15px;
}

.value {
  flex: 1;
  color: #2d3748;
  font-size: 15px;
  line-height: 1.6;
}

.no-data {
  text-align: center;
  color: #718096;
  font-size: 16px;
  padding: 40px 20px;
}

/* Panel transition */
.panel-enter-active,
.panel-leave-active {
  transition: transform 0.3s ease;
}

.panel-enter-from,
.panel-leave-to {
  transform: translateX(100%);
}

@media (max-width: 768px) {
  .panel-container {
    width: 320px;
    min-width: 320px;
  }

  .panel-content {
    padding: 24px 16px;
  }

  .politician-image {
    width: 160px;
    height: 192px;
  }

  .politician-info h2 {
    font-size: 24px;
  }

  .info-row {
    flex-direction: column;
    gap: 8px;
  }

  .label {
    min-width: auto;
    font-size: 14px;
  }

  .value {
    font-size: 14px;
  }
}
</style>
