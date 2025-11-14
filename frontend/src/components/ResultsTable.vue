<template>
  <div class="results-card">
    <div class="results-header">
      <div>
        <h2>Risultati</h2>
        <div class="results-subtitle">
          Edificio: <strong>{{ searchParams.building }}</strong> · 
          Data: <strong>{{ searchParams.date }}</strong> · 
          <template v-if="flexibleMode">
            Cerca slot di <strong>{{ searchParams.duration }}h</strong> tra 
            <strong>{{ searchParams.start_time }}</strong> e <strong>{{ searchParams.end_time }}</strong>
          </template>
          <template v-else>
            Orario: <strong>{{ searchParams.start_time }}</strong> → <strong>{{ searchParams.end_time }}</strong>
          </template>
        </div>
      </div>
    </div>

    <div v-if="results.length === 0" class="empty-state">
      Nessuna aula disponibile per il periodo selezionato.
    </div>

    <div v-else>
      <div class="results-count">
        Trovate {{ results.length }} aula{{ results.length !== 1 ? "e" : "" }}.
      </div>
      
      <div class="results-table">
        <table>
          <thead>
            <tr>
              <th>Aula</th>
              <th>Posti</th>
              <th v-if="flexibleMode">Slot Disponibili</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="result in results" :key="result.name">
              <td class="room-name">{{ result.name }}</td>
              <td>{{ result.seats }}</td>
              <td v-if="flexibleMode" class="slots">
                <span 
                  v-for="(slot, index) in result.slots" 
                  :key="index"
                  class="slot-badge"
                >
                  {{ slot.start }}–{{ slot.end }}
                </span>
              </td>
              <td>
                <a :href="result.url" target="_blank" rel="noopener noreferrer" class="calendar-link">
                  Apri calendario ↗
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  results: {
    type: Array,
    required: true
  },
  searchParams: {
    type: Object,
    required: true
  },
  flexibleMode: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.results-card {
  background: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(6px);
  border: 1px solid #1f2937;
  border-radius: 16px;
  padding: 24px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.results-header h2 {
  font-size: 22px;
  margin: 0 0 4px;
  color: #f3f4f6;
}

.results-subtitle {
  color: #9ca3af;
  font-size: 14px;
}

.results-subtitle strong {
  color: #e5e7eb;
}

.results-count {
  color: #94a3b8;
  margin-bottom: 16px;
  font-size: 14px;
}

.results-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
}

thead th {
  font-size: 12px;
  text-align: left;
  color: #9ca3af;
  padding: 8px 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

tbody tr {
  background: #0b1220;
  border: 1px solid #1f2937;
}

tbody td {
  padding: 12px;
  color: #e5e7eb;
  border-top: 1px solid #1f2937;
  border-bottom: 1px solid #1f2937;
}

tbody td:first-child {
  border-left: 1px solid #1f2937;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}

tbody td:last-child {
  border-right: 1px solid #1f2937;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
}

.room-name {
  font-weight: 600;
  color: #22d3ee;
}

.slots {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.slot-badge {
  display: inline-block;
  background: rgba(34, 211, 238, 0.2);
  color: #22d3ee;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.calendar-link {
  color: #22d3ee;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.calendar-link:hover {
  color: #06b6d4;
  text-decoration: underline;
}

.empty-state {
  padding: 24px;
  text-align: center;
  color: #94a3b8;
  font-size: 16px;
}

@media (max-width: 768px) {
  .results-card {
    padding: 16px;
  }

  .results-header h2 {
    font-size: 18px;
  }

  .results-subtitle {
    font-size: 12px;
  }

  .results-table {
    font-size: 14px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  table {
    min-width: 600px; /* Ensure table doesn't get too cramped */
  }

  thead th,
  tbody td {
    padding: 10px 8px;
    font-size: 13px;
  }

  .slots {
    flex-direction: column;
    gap: 4px;
  }

  .slot-badge {
    width: fit-content;
    font-size: 11px;
    padding: 3px 6px;
  }

  .calendar-link {
    font-size: 12px;
    white-space: nowrap;
  }
}

@media (max-width: 480px) {
  .results-card {
    padding: 12px;
  }

  .results-header h2 {
    font-size: 16px;
  }

  table {
    min-width: 500px;
  }

  thead th {
    font-size: 11px;
    padding: 6px 4px;
  }

  tbody td {
    font-size: 12px;
    padding: 8px 4px;
  }

  .room-name {
    font-size: 13px;
  }
}
</style>

