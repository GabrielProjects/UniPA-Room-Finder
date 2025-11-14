<template>
  <div class="app">
    <div class="container">
      <header class="header">
        <h1>🔎 Unipa Room Finder</h1>
        <p>Trova aule libere tra i tuoi orari. I dati provengono dal calendario ufficiale Unipa.</p>
      </header>

      <SearchForm 
        :buildings="buildings" 
        :loading="loading"
        @search="handleSearch"
        @load-buildings="loadBuildings"
      />

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <ResultsTable 
        v-if="results.length > 0"
        :results="results"
        :search-params="searchParams"
        :flexible-mode="flexibleMode"
      />

      <div v-if="loading" class="loading-overlay">
        <div class="spinner"></div>
        <div class="loading-text">{{ loadingMessage }}</div>
        <div v-if="loadingProgress > 0" class="loading-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: loadingProgress + '%' }"></div>
          </div>
          <div class="progress-text">{{ loadingProgress }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import SearchForm from "./components/SearchForm.vue";
import ResultsTable from "./components/ResultsTable.vue";
import { apiService } from "./services/api.js";

const buildings = ref([]);
const results = ref([]);
const loading = ref(false);
const loadingMessage = ref("Ricerca aule disponibili...");
const loadingProgress = ref(0);
const error = ref("");
const searchParams = ref({});
const flexibleMode = ref(false);

const loadBuildings = async () => {
  try {
    loading.value = true;
    loadingMessage.value = "Caricamento edifici...";
    loadingProgress.value = 0;
    error.value = "";
    
    const data = await apiService.getBuildings();
    buildings.value = data.buildings;
    loadingProgress.value = 100;
    
    // Small delay to show completion
    await new Promise(resolve => setTimeout(resolve, 200));
  } catch (err) {
    loadingProgress.value = 0;
    if (err.response) {
      error.value = `Errore nel caricamento degli edifici: ${err.response.data?.error || err.message}`;
    } else if (err.request) {
      error.value = "Impossibile connettersi al server. Verifica la connessione e riprova.";
    } else {
      error.value = `Errore nel caricamento degli edifici: ${err.message}`;
    }
    console.error(err);
  } finally {
    loading.value = false;
    loadingProgress.value = 0;
  }
};

const handleSearch = async (params) => {
  try {
    loading.value = true;
    loadingProgress.value = 0;
    loadingMessage.value = "Ricerca aule disponibili...";
    error.value = "";
    results.value = [];
    searchParams.value = params;
    flexibleMode.value = params.flexible_mode || false;

    // Simulate progress updates (since we don't have real-time progress from API)
    const progressInterval = setInterval(() => {
      if (loadingProgress.value < 90) {
        loadingProgress.value += Math.random() * 10;
      }
    }, 500);

    try {
      const data = await apiService.search(params);
      clearInterval(progressInterval);
      loadingProgress.value = 100;
      
      // Small delay to show 100% before hiding
      await new Promise(resolve => setTimeout(resolve, 300));
      
      results.value = data.results;
      
      if (data.results.length === 0) {
        error.value = "Nessuna aula disponibile per il periodo selezionato.";
      }
    } catch (searchError) {
      clearInterval(progressInterval);
      throw searchError;
    }
  } catch (err) {
    loadingProgress.value = 0;
    if (err.response) {
      error.value = `Errore nella ricerca: ${err.response.data?.error || err.message}`;
    } else if (err.request) {
      error.value = "Impossibile connettersi al server. Verifica la connessione e riprova.";
    } else {
      error.value = `Errore nella ricerca: ${err.message}`;
    }
    console.error(err);
  } finally {
    loading.value = false;
    loadingProgress.value = 0;
  }
};

onMounted(() => {
  loadBuildings();
});
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(180deg, #0b1220, #0a0f1a);
  color: #e5e7eb;
  padding: 20px;
}

.container {
  max-width: 980px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .app {
    padding: 16px;
  }

  .header h1 {
    font-size: 24px;
  }

  .header p {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .app {
    padding: 12px;
  }

  .header {
    margin-bottom: 24px;
  }

  .header h1 {
    font-size: 20px;
  }

  .header p {
    font-size: 13px;
  }
}

.header {
  text-align: center;
  margin-bottom: 32px;
}

.header h1 {
  font-size: 28px;
  margin: 0 0 12px;
  color: #f3f4f6;
}

.header p {
  color: #94a3b8;
  margin: 0;
}

.error-message {
  background: rgba(127, 29, 29, 0.8);
  color: #fecaca;
  border: 1px solid #ef4444;
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 20px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 15, 26, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #1f2937;
  border-top: 4px solid #22d3ee;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #e5e7eb;
  margin-top: 16px;
  font-size: 16px;
}

.loading-progress {
  margin-top: 20px;
  width: 300px;
  max-width: 90%;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #1f2937;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #22d3ee);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  color: #94a3b8;
  font-size: 12px;
  text-align: center;
}
</style>

