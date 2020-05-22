<template>
  <div>
    <highcharts v-show="data" :options="chartOptions" style="width:100%; height:312px;"></highcharts>
    
    <div class="alert alert-info mt-4" v-show="!data">
      <span> {{ $t('Burndown is not available. You should add tasks to this sprint.') }} </span>
    </div>
  </div>
</template>

<script>
import { Chart } from 'highcharts-vue'

export default {
  components: {
    highcharts: Chart,
  },
  props: {
    data: {
      type: Array,
      required: false,
      default: null,
    },

    typeName:{
      type: String,
      required: false,
      default: 'task',
    }
  },
  data() {
    return {
      chartOptions: {}
    }
  },

  mounted() {
    this.chartOptions = {
      title: {
        text: '',
        align: 'left',
      },
      chart: {
        backgroundColor: 'transparent',
      },
      colors: ['blue', 'rgba(50,152,50,1)'],
      plotOptions: {
        line: {
          lineWidth: 3,
        },
        tooltip: {
          hideDelay: 200,
        },
      },
      yAxis: {
        visible: true,
        title: {
          text: this.text(),
        },
        plotLines: [
          {
            value: 0,
            width: 1,
          },
        ],
      },
      xAxis: {
        visible: false,
        categories: this.categories(),
        plotLines: [
          {
            color: 'rgba(68, 170, 213, .3)',
            width: 6,
            value: this.startPlotLine(),
            label: {
              text: 'Sprint: The first day',
              x: +10,
              y: +30,
              rotation: 360,
            },
          },
          {
            color: 'rgba(68, 170, 213, .3)',
            width: 6,
            value: this.endPlotLine(),
            label: {
              text: 'Sprint: The last day',
              x: -96,
              y: +30,
              rotation: 360,
            },
          },
        ],
      },
      tooltip: {
        valueSuffix: this.text(),
        crosshairs: true,
        shared: true,
      },
      legend: {
        layout: 'horizontal',
        align: 'right',
        verticalAlign: 'top',
        borderWidth: 0,
      },
      series: [
        {
          name: 'Ideal Burn',
          color: '#1D2E67',
          lineWidth: 4,
          pointStart: 0,
          data: this.decrement(),
        },
        {
          name: 'Actual Burn',
          color: '#0CC777',
          lineWidth: 4,
          data: this.closedCountDown(),
        },
      ],
    }
  },

  methods: {
    text() {
      return this.typeName
    },

    categories() {
      let categories = []

      if (this.data.length > 0) {
        this.data.forEach((item) => {
          categories.push(item.date)
        })
      }

      return categories
    },

    startPlotLine() {
      let startPlotLine = 0

      if (this.data.length > 0) {
        startPlotLine = this.data[0].startPlotLines
      }

      return startPlotLine
    },

    endPlotLine() {
      let endPlotLine = 0

      if (this.data.length > 0) {
        endPlotLine = this.data[0].endPlotLines
      }

      return endPlotLine
    },

    decrement() {
      let decrement = []

      if (this.data.length > 0) {
        this.data.forEach((item) => {
          decrement.push(item.decrement)
        })
      }

      return decrement
    },

    closedCountDown() {
      let closedCountDown = []

      if (this.data.length > 0) {
        this.data.forEach((item) => {
          closedCountDown.push(item.closedCountDown)
        })
      }

      return closedCountDown
    },
  },
}
</script>
