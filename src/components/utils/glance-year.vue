<script>
import Axios from '@utils/axios'
import ListTasks from '@components/projects/tasks/list-tasks'

export default {
  components: { ListTasks },
  props: {
    data: {
      type: Array,
      required: true,
      default: null,
    },
    slug: {
      type: String,
      required: true,
      default: '-',
    },
    type: {
      type: String,
      required: true,
      default: 'project',
    },
  },
  data() {
    return {
      loadingCalendar: true,
      loadingContributions: true,
      closedIssues: [],
      createdIssues: [],
      selectedDay: null,
    }
  },
  watch: {
    data(object) {
      this.loadingCalendar = false
      $('#js-glanceyear').glanceyear(this.data, {
        showToday: true,
        eventClick: this.clicked,
      })
    },
  },
  mounted() {},
  methods: {
    clicked(event) {
      this.selectedDay = event.date
      this.loadingContributions = true
      Axios()
        .get('glance-year/' + this.type + '/' + this.slug + '/contributions/?date=' + event.date)
        .then((response) => {
          this.loadingContributions = false
          this.createdIssues = response.data.data.createdIssues
          this.closedIssues = response.data.data.closedIssues
        })
        .catch((e) => {
          console.error(e)
        })
    },
  },
}
;(function($) {
  $.fn.glanceyear = function(massive, options) {
    var $_this = $(this)

    var settings = $.extend(
      {
        eventClick: function(e) {
          // alert('Date: ' + e.date + ', Count:' + e.count)
        },
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        weeks: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
        targetQuantity: '.glanceyear-quantity',
        tagId: 'glanceyear-svgTag',
        showToday: false,
        today: new Date(),
      },
      options
    )

    var svgElement = createElementSvg('svg', {
      width: 54 * 15 + 15,
      height: 7 * 15 + 15,
    })

    var gElementContainer = createElementSvg('g', {
      transform: 'translate(15, 15)',
    })

    var $_tag = $('<div>')
      .addClass('svg-tag')
      .attr('id', settings.tagId)
      .appendTo($('body'))
      .hide()

    var dayCount = 366
    var monthCount

    // Weeks
    for (var i = 0; i < 54; i++) {
      var gElement = createElementSvg('g', {
        transform: 'translate(' + 13 * i + ',0)',
      })
      var firstDate = new Date()
      firstDate.setMonth(settings.today.getMonth())
      firstDate.setFullYear(settings.today.getFullYear())
      firstDate.setDate(settings.today.getDate() - dayCount - 1)

      var daysLeft = daysInMonth(firstDate) - firstDate.getDate()

      // Days in week
      for (var j = firstDate.getDay(); j < 7; j++) {
        var rectDate = new Date()
        rectDate.setMonth(settings.today.getMonth())
        rectDate.setFullYear(settings.today.getFullYear())
        rectDate.setDate(settings.today.getDate() - dayCount)

        if (rectDate.getMonth() != monthCount && i < 52 && j > 3 && daysLeft > 7) {
          // new Month
          var textMonth = createElementSvg('text', {
            x: 12 * i,
            y: '-6',
            class: 'month',
          })
          textMonth.textContent = getNameMonth(rectDate.getMonth())
          gElementContainer.appendChild(textMonth)
          monthCount = rectDate.getMonth()
        }

        dayCount--
        if (dayCount >= 0 || (settings.showToday && dayCount >= -1)) {
          // Day-obj factory

          var rectElement = createElementSvg('rect', {
            class: 'day',
            width: '12px',
            height: '14px',
            'data-date': rectDate.getFullYear() + '-' + (rectDate.getMonth() + 1) + '-' + rectDate.getDate(),
            y: 15 * j,
          })

          rectElement.onmouseover = function() {
            var dateString = $(this)
              .attr('data-date')
              .split('-')
            var date = new Date(dateString[0], dateString[1] - 1, dateString[2])

            var tagDate = getBeautyDate(date)
            var tagCount = $(this).attr('data-count')
            var tagCountData = $(this).attr('data-count')

            if (tagCountData) {
              if (tagCountData > 1) {
                tagCount = $(this).attr('data-count') + ' tasks'
              } else {
                tagCount = $(this).attr('data-count') + ' task'
              }
            } else {
              tagCount = 'No scores'
            }

            $_tag
              .html('<b>' + tagCount + '</b> on ' + tagDate)
              .show()
              .css({
                left: $(this).offset().left - $_tag.outerWidth() / 2 + 5,
                top: $(this).offset().top - 33,
              })
          }

          rectElement.onmouseleave = function() {
            $_tag.text('').hide()
          }

          rectElement.onclick = function() {
            settings.eventClick({
              date: $(this).attr('data-date'),
              count: $(this).attr('data-count') || 0,
            })
          }

          gElement.appendChild(rectElement)
        }
      }

      gElementContainer.appendChild(gElement)
    }
    var textM = createElementSvg('text', { x: '-12', y: '8' })
    textM.textContent = getNameWeek(0)
    gElementContainer.appendChild(textM)
    var textW = createElementSvg('text', { x: '-12', y: '32' })
    textW.textContent = getNameWeek(2)
    gElementContainer.appendChild(textW)
    var textF = createElementSvg('text', { x: '-12', y: '56' })
    textF.textContent = getNameWeek(4)
    gElementContainer.appendChild(textF)
    var textS = createElementSvg('text', { x: '-12', y: '80' })
    textS.textContent = getNameWeek(6)
    gElementContainer.appendChild(textS)

    svgElement.appendChild(gElementContainer)

    // Append Calendar to document;
    $_this.append(svgElement)

    fillData(massive)

    function createElementSvg(type, prop) {
      var e = document.createElementNS('http://www.w3.org/2000/svg', type)
      for (var p in prop) {
        e.setAttribute(p, prop[p])
      }
      return e
    }

    function fillData(massive) {
      var scoreCount = 0
      for (var m in massive) {
        $_this.find('rect.day[data-date="' + massive[m].date + '"]').attr('data-count', massive[m].value)
        scoreCount += parseInt(massive[m].value)
      }
      $(settings.targetQuantity).text(massive.length + ' days, ' + scoreCount + ' scores')
    }

    function getNameMonth(a) {
      return settings.months[a]
    }
    function getNameWeek(a) {
      return settings.weeks[a]
    }
    function getBeautyDate(a) {
      return getNameMonth(a.getMonth()) + ' ' + a.getDate() + ', ' + a.getFullYear()
    }
    function daysInMonth(d) {
      return 32 - new Date(d.getFullYear(), d.getMonth(), 32).getDate()
    }
  }
})(jQuery)
</script>

<template>
  <div class="glanceyear-container">
    <div>
      <font-awesome-icon :icon="['far', 'calendar-alt']" class="txt-9EA9C1" style="position:relative; top:-1px;" />
      <span class="tx-16-px fw-500 ml-8-px">{{ $t('Heatmap Activities') }}</span>

      <b-spinner v-show="loadingCalendar" :label="$t('Loading')" small class="title-loading"></b-spinner>
      <span class="glanceyear-quantity"></span>
    </div>
    <div id="js-glanceyear" class="mt-15-px glanceyear-content"> </div>

    <div class="glanceyear-summary">
      <div class="glanceyear-legend">
        {{ $t('Less') }}&nbsp;
        <span style="background-color: rgba(61, 79, 159, 0.1);"></span>
        <span style="background-color: rgba(61, 79, 159, 0.5)"></span>
        <span style="background-color: #3D4F9F"></span>
        <span style="background-color: #001737"></span>
        &nbsp;{{ $t('More') }}
      </div>
      {{ $t('Calendar with map data entered') }} <br />
      <span id="debug"></span>
    </div>

    <div v-if="selectedDay" class="">
      <hr />

      <div class="clearfix">
        <h6>
          {{ $t('Contributions at') }} {{ selectedDay }}

          <b-spinner
            v-show="loadingContributions"
            :label="$t('Loading')"
            variant="secondary"
            small
            class="title-loading"
            style="top:-1px;"
          ></b-spinner>
        </h6>
      </div>

      <div class="">
        <div v-if="createdIssues[0]">
          <ListTasks :items="createdIssues" :search="false"></ListTasks>
        </div>

        <div v-if="closedIssues[0]">
          <ListTasks :items="closedIssues" :search="false"></ListTasks>
        </div>

        <div v-if="selectedDay && !loadingContributions && !createdIssues[0] && !closedIssues[0]">
          {{ $t('Contributions does not exist or you do not have permission to see it') }}
        </div>
      </div>
    </div>
  </div>
</template>
