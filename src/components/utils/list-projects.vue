<script>

import Axios from '@utils/axios'
import ProjectVisibility from '@components/projects/project-visibility'
import ListLabels from '@components/utils/list-labels'
import moment from 'moment'
import Draggable from 'vuedraggable'
import ManageLabels from '@components/projects/modal/manage-label'

export default {
  components: {
    ProjectVisibility,
    ListLabels,
    Draggable,
    ManageLabels
  },
  props: {
    data: {
      type: Array,
      required: true,
    },
    disabled: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      currentCompany: JSON.parse(window.localStorage.getItem('CURRENT_COMPANY')),
      projectSelected: {},
      seriesTopSpark1: [
        {
          data: [],
        },
      ],
      chartOptionsTopSpark1: {
        chart: {
          sparkline: {
            enabled: true,
          },
        },
        colors: ['#AFBBE2'],
        stroke: {
          curve: 'straight',
        },
        tooltip: {
          fixed: {
            enabled: false,
          },
          x: {
            show: false,
          },
          y: {
            title: {
              formatter: function(seriesName, object) {
                let date = moment()
                  .subtract(7 - object.dataPointIndex, 'day')
                  .format('YYYY-MM-DD')
                return '<small>[' + date + ']</small><br>Closed Tasks '
              },
            },
          },
          marker: {
            show: false,
          },
        },
        fill: {
          opacity: 0.3,
        },
        xaxis: {
          crosshairs: {
            width: 1,
          },
        },
        yaxis: {
          min: 0,
        },
      },
    }
  },
  methods: {
    moment() {
      return moment()
    },
    seriesTopSpark(project) {
      let data = [
        {
          data: project.closed_tasks,
        },
      ]
      return data
    },
    updatePosition(evt) {
      $(evt.item).removeClass('move-card')
      let projects = []

      let elements = document.getElementsByClassName('project-card')

      for (let i = 0; i < elements.length; i++) {
        projects.push(elements[i].getAttribute('data-slug'))
      }

      Axios()
        .put('/projects-positions/?company_slug=' + this.currentCompany.slug, {
          projects: projects,
        })
        .then((response) => {
        })
        .catch((e) => {
          console.error(e)
        })
    },
    openLabelsManagementModal(project) {
      this.projectSelected = project
      this.$refs['modal'].show()
    },
    hideModal() {
      this.closeModal(this.$refs['modal'])
    },
    toggleModal() {
      this.$refs['modal'].toggle('#toggle-btn')
    },

    handleCardShadow(projectSlug) {
      if ($('#' + projectSlug).hasClass('card-shadow')) {
        $('#' + projectSlug).removeClass('card-shadow')
      } else {
        $('#' + projectSlug).addClass('card-shadow')
      }
    },

    updateClass(event) {
      $(event.item).addClass('move-card')
    },

    redirect(project) {
      this.$router.push({
        name: 'projects.board',
        params: { companySlug: project.company.slug, projectSlug: project.slug },
      })
    },
  },
}
</script>

<template>
  <div>
    
    <b-modal id="modal" ref="modal" class="modal-manage-labels" hide-footer lazy size="xl">
      <div slot="modal-title">
        <span class="title">{{ projectSelected.name }}</span>
        <span class="subTitle">{{ $t('Manage Labels') }}</span>
      </div>
      <div class="modalContent">
        <ManageLabels :project="projectSelected"></ManageLabels>
      </div>
    </b-modal>
    
    <div class="d-flex justify-content-center">
      <Draggable
          :disabled="disabled"
          class="d-flex justify-content-center flex-wrap"
          ghost-class="ghost"
          draggable=".project-card"
          @start="updateClass"
          @end="updatePosition"
          
        >
        <div v-for="(project,index) in data" :key="index" :data-slug="project.slug" class="project-card">
          <div :id="project.slug" class="card">
            <div
              class="img cursor-grab"
              :style="
                'background: url(' +
                  project.background_thumb +
                  ') #DFE1E7;background-repeat: no-repeat;background-size: cover;'
              "
              @click="redirect(project)"
            >
              <img v-lazy="project.logo" class="logo" :alt="project.name" />
            </div>

            <b-progress class="project-list-progress" :value="project.percent" :max="100"></b-progress>
            
            <div class="card-body">
              <div class="card-title" @click="redirect(project)">
                <router-link
                  :to="{
                    name: 'projects.board',
                    params: {
                      companySlug: project.company.slug,
                      projectSlug: project.slug,
                    },
                  }"
                >
                  {{ project.name }}
                </router-link>
              </div>
              <div class="project-details d-flex justify-content-between">
                <div class="d-flex justify-content-start ">
                  <div class="border cursor-default padding">
                    <ProjectVisibility :visibility="project.visibility"></ProjectVisibility>
                    <span class="ml-1">
                      {{ project.visibility.title }}
                    </span>
                  </div>
                  <div class="border cursor-default padding ml-1 status-info">
                    {{ project.status.title }}
                    &nbsp;<b>{{ parseFloat(project.percent) | percent(0) }}</b>
                  </div>
                </div>
                <div class="icon d-flex">
                  <a
                    class="project-text collapsed mr-8-px"
                    href="javascript:;"
                    aria-expanded="false"
                    @click="openLabelsManagementModal(project)"
                  >
                    <font-awesome-icon :icon="['fa', 'tags']" style="font-size: 14px;" />
                  </a>
                  <a
                    class="project-text collapsed"
                    data-toggle="collapse"
                    :href="'#collapse' + project.slug"
                    aria-expanded="false"
                    :aria-controls="'collapse' + project.slug"
                    @click="handleCardShadow(project.slug)"
                  >
                    <font-awesome-icon :icon="['fa', 'chart-area']" style="font-size: 18px;" />
                  </a>
                </div>
              </div>

              <div class="collapse-content card-shadow">
                <div :id="'collapse' + project.slug" class="collapse card-body-overlay">
                  <div v-show="project.labels.length" class="titles mt-2">
                    {{ $t('labels') }}
                  </div>
                  <ListLabels :labels="project.labels" class="mt-2 labels-size"></ListLabels>
                  <div class="titles mt-2"> {{ $t('Project Progress in Last 7 Days') }}</div>
                  <apexchart
                    v-if="project.closed_tasks"
                    type="area"
                    height="50"
                    :options="chartOptionsTopSpark1"
                    :series="seriesTopSpark(project)"
                    class=" mt-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Draggable>
    </div>
  </div>
</template>
