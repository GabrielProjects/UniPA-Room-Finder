<template>
  <div class="search-form-card">
    <form @submit.prevent="handleSubmit">
      <div class="form-group full-width">
        <label for="building">Edificio</label>
        <select 
          id="building" 
          v-model="formData.building" 
          required
          :disabled="buildings.length === 0"
        >
          <option value="" disabled selected>
            {{ buildings.length === 0 ? "Caricamento..." : "Seleziona un edificio" }}
          </option>
          <option v-for="building in buildings" :key="building" :value="building">
            {{ building }}
          </option>
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="date">Data</label>
          <input 
            id="date" 
            type="date" 
            v-model="formData.date" 
            required
            :min="minDate"
          />
        </div>
        <div class="form-group">
          <label for="start_time">Ora inizio</label>
          <input 
            id="start_time" 
            type="time" 
            v-model="formData.start_time" 
            required
          />
        </div>
        <div class="form-group">
          <label for="end_time">Ora fine</label>
          <input 
            id="end_time" 
            type="time" 
            v-model="formData.end_time" 
            required
          />
        </div>
      </div>

      <div class="flexible-mode full-width">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            v-model="formData.flexible_mode" 
            value="1"
          />
          <span>Cerca qualsiasi slot disponibile nell'intervallo</span>
        </label>
        <div v-if="formData.flexible_mode" class="duration-input">
          <label for="duration">Durata richiesta (ore)</label>
          <input 
            id="duration" 
            type="number" 
            v-model.number="formData.duration" 
            min="0.5" 
            max="12" 
            step="0.5" 
            :value="formData.duration || 2"
          />
        </div>
      </div>

      <div class="form-actions full-width">
        <button type="submit" :disabled="loading || buildings.length === 0">
          {{ loading ? "Ricerca in corso..." : "Cerca aule disponibili" }}
        </button>
        <button 
          type="button" 
          @click="$emit('load-buildings')" 
          :disabled="loading"
          class="secondary"
        >
          Ricarica edifici
        </button>
      </div>
    </form>

    <footer class="form-footer">
      <small>Suggerimento: Usa il formato 24 ore. Esempio: 14:00 - 16:30</small>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const props = defineProps({
  buildings: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["search", "load-buildings"]);

const formData = ref({
  building: "",
  date: "",
  start_time: "",
  end_time: "",
  flexible_mode: false,
  duration: 2
});

const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split("T")[0];
});

const handleSubmit = () => {
  const params = {
    building: formData.value.building,
    date: formData.value.date,
    start_time: formData.value.start_time,
    end_time: formData.value.end_time,
    flexible_mode: formData.value.flexible_mode,
    duration: formData.value.duration
  };
  
  emit("search", params);
};

onMounted(() => {
  // Set default date to today
  formData.value.date = minDate.value;
});
</script>

<style scoped>
.search-form-card {
  background: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(6px);
  border: 1px solid #1f2937;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 13px;
  color: #cbd5e1;
  margin-bottom: 6px;
  display: block;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  background: #0b1220;
  border: 1px solid #1f2937;
  border-radius: 10px;
  color: #e5e7eb;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #22d3ee;
}

.form-group input:disabled,
.form-group select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  grid-column: 1 / -1;
}

.full-width {
  grid-column: 1 / -1;
}

.flexible-mode {
  margin-top: 8px;
  padding: 12px;
  background: #0b1220;
  border: 1px solid #1f2937;
  border-radius: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  cursor: pointer;
}

.duration-input {
  margin-top: 8px;
}

.duration-input input {
  max-width: 150px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

button {
  background: linear-gradient(135deg, #2563eb, #22d3ee);
  border: none;
  color: white;
  padding: 12px 16px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  flex: 1;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

button.secondary {
  background: #374151;
  flex: 0 0 auto;
}

button.secondary:hover:not(:disabled) {
  background: #4b5563;
}

.form-footer {
  margin-top: 16px;
  text-align: center;
}

.form-footer small {
  color: #94a3b8;
  font-size: 12px;
}

@media (max-width: 768px) {
  .search-form-card {
    padding: 16px;
  }

  form {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .form-group label {
    font-size: 12px;
  }

  .form-group input,
  .form-group select {
    padding: 12px;
    font-size: 16px; /* Prevent zoom on iOS */
  }

  .form-actions {
    flex-direction: column;
    gap: 10px;
  }

  button {
    padding: 14px 16px;
    font-size: 15px;
    width: 100%;
  }

  button.secondary {
    flex: 1;
  }

  .flexible-mode {
    padding: 10px;
  }

  .duration-input input {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .search-form-card {
    padding: 12px;
  }

  .form-group input,
  .form-group select {
    padding: 10px;
  }

  button {
    padding: 12px;
    font-size: 14px;
  }
}
</style>

