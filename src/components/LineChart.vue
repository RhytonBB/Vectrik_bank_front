<template>
  <div>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, defineProps } from 'vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const props = defineProps({ 
  chartData: Object,
  options: {
    type: Object,
    default: () => ({})
  }
})

const canvas = ref(null)
let chartInstance = null

const renderChart = () => {
  if (!props.chartData) return
  if (chartInstance) chartInstance.destroy()
  
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          font: {
            size: window.innerWidth < 600 ? 12 : 14
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: window.innerWidth < 600 ? 10 : 12
          }
        }
      },
      y: {
        ticks: {
          font: {
            size: window.innerWidth < 600 ? 10 : 12
          }
        }
      }
    }
  }
  
  chartInstance = new Chart(canvas.value, {
    type: 'line',
    data: props.chartData,
    options: { ...defaultOptions, ...props.options }
  })
}

watch(() => props.chartData, renderChart)
onMounted(renderChart)
</script>

<style scoped>
div {
  position: relative;
  height: 300px;
  width: 100%;
}

@media (max-width: 600px) {
  div {
    height: 250px !important;
  }
}
</style> 