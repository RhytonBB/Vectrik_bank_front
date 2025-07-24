<template>
  <div>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, defineProps } from 'vue'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const props = defineProps({ chartData: Object })
const canvas = ref(null)
let chartInstance = null

const renderChart = () => {
  if (!props.chartData) return
  if (chartInstance) chartInstance.destroy()
  chartInstance = new Chart(canvas.value, {
    type: 'line',
    data: props.chartData,
    options: { responsive: true }
  })
}

watch(() => props.chartData, renderChart)
onMounted(renderChart)
</script> 