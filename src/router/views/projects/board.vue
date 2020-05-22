<script>
import Layout from '@layouts/tpl-main-large'
import Axios from '@utils/axios'
import BoardTask from '@components/projects/board-task'
import Draggable from 'vuedraggable'
import { isMobile } from 'mobile-device-detect';
import Swatches from 'vue-swatches'
import 'vue-swatches/dist/vue-swatches.min.css'

export default {
  page: {
    title: 'Board',
    meta: [{ name: 'description', content: '' }],
  },
  components: {
    Layout,
    BoardTask,
    Draggable,
    Swatches,
  },
  data() {
    return {
      loading: true,
      btnLoading: false,
      canDragColums: isMobile,

      width: 0,
      newColumn: '',
      colorColumn: '#000000',
      workflows: [],
      boxNewColumn: false,
      nameColumn: '',
    }
  },
  computed: {
    dragOptions() {
      return {
        animation: 0,
        group: 'columns',
        disabled: false,
        ghostClass: 'ghost',
      }
    },
  },
  mounted() {
    this.getWorkflows()
  },
  methods: {
    getWorkflows() {
      Axios()
        .get(
          'projects-workflows/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug
        )
        .then((response) => {
          this.workflows = response.data.data
          this.width = this.workflows.length * 295 + 280
          this.loading = false
        })
        .catch((e) => {
          console.error(e)
        })
    },
    moveColumn(evt) {
      Axios()
        .put(
          '/projects-workflows/' +
            evt.moved.element.id +
            '/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug,
          {
            position: evt.moved.newIndex + 1,
          }
        )
        .then((response) => {})
        .catch((e) => {
          console.error(e)
        })
    },
    addNewColumn() {
      var nameColumn = this.nameColumn
      if (nameColumn.length > 3) {
        this.btnLoading = true

        Axios()
          .post(
            '/projects-workflows/?company_slug=' +
              this.$route.params.companySlug +
              '&project_slug=' +
              this.$route.params.projectSlug,
            {
              title: this.nameColumn,
              color: this.colorColumn,
              status: 0,
            }
          )
          .then((response) => {
            this.btnLoading = false
            this.toggleNewColumn()
            this.workflows.push(response.data.data)
            this.width += 295
            this.nameColumn = ''
            this.colorColumn = '#000000'
          })
          .catch((e) => {
            console.error(e)
          })
      } else {
        alert(this.$t('Column name must have at least 4 characters'))
      }
    },
    toggleNewColumn() {
      if (this.boxNewColumn) {
        this.boxNewColumn = false
      } else {
        this.boxNewColumn = true
      }
    },
  },
}
</script>

<template>
  <Layout>
    
    <div slot="content" class="">
      <div class="ui">
        <div class="lists" :style="'width:' + width + 'px'">
          <div class="">
            <Draggable
              :disabled="canDragColums"
              class="list row"
              style="min-width: calc(100% + 40px);"
              tag="ul"
              :list="workflows"
              v-bind="dragOptions"
              draggable=".draggableColumn"
              @change="moveColumn"
            >
              <li
                v-for="workflow in workflows"
                :key="workflow.id"
                class="draggableColumn"
                style="max-height: calc(100vh - 100px);"
              >
                <BoardTask :workflow="workflow"></BoardTask>
              </li>
              <div v-show="!loading" class="mg-r-20 mg-l-0">
                <div class="addColumnBox" @click="toggleNewColumn">
                  <span v-if="!boxNewColumn">
                    <i class="fas fa-plus"></i>
                  </span>
                  <span v-if="boxNewColumn">
                    <i class="fas fa-times"></i>
                  </span>
                </div>
                <div v-show="boxNewColumn" class="addColumnForm" :style="'border-top-color:' + colorColumn">
                  <div class="d-flex">
                    <b-form-input
                      v-model="nameColumn"
                      class="input-sm"
                      :placeholder="$t('Enter the name of your column')"
                    ></b-form-input>
                  </div>

                  <div class="mt-2 justify-content-between d-flex">
                    <Swatches
                      v-model="colorColumn"
                      colors="text-advanced"
                      popover-to="left"
                      max-height="400"
                      class="justify-content-end"
                    ></Swatches>

                    <span v-if="!btnLoading" class="cursor-pointer add-column" @click="addNewColumn">
                      {{ $t('+ Add Column') }}
                    </span>

                    <span v-if="btnLoading" class="cursor-pointer add-column">
                      <b-spinner small type="grow"></b-spinner>
                      {{ $t('Adding Column...') }}
                    </span>
                  </div>
                </div>
              </div>
            </Draggable>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
