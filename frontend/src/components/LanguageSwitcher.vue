<template>
  <div class="language-switcher">
    <select
      v-model="currentLocale"
      @change="changeLanguage"
      class="language-select"
    >
      <option value="en">English</option>
      <option value="uk">Українська</option>
    </select>
  </div>
</template>

<script>
import { ref, onMounted } from "vue"
import { useI18n } from "vue-i18n"

export default {
  name: "LanguageSwitcher",
  setup() {
    const { locale } = useI18n()
    const currentLocale = ref(locale.value)

    const changeLanguage = () => {
      locale.value = currentLocale.value
      localStorage.setItem("locale", currentLocale.value)
    }

    onMounted(() => {
      currentLocale.value = locale.value
    })

    return {
      currentLocale,
      changeLanguage,
    }
  },
}
</script>

<style scoped>
.language-switcher {
  display: flex;
  align-items: center;
}

.language-select {
  padding: 0.5rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background: white;
  color: var(--text-color);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.language-select:hover {
  border-color: var(--primary-color);
}

.language-select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}
</style>
