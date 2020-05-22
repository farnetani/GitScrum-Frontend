<script>
import Axios from '@utils/axios'
import DatePicker from 'vue2-datepicker'
import moment from 'moment'

export default {
  components: { DatePicker },
  data() {
    return {
      bDisplayIcons: true,
      bDisplayImages: true,
      bDisplayDates: true,
      bDisplayLabels: true,
      bDisplayUsers: true,
      bDisplayStats: true,
      bDisplayProgress: true,
      bSearch: '',
      bStartDate: null,
      bDueDate: null,
      bPercent: [0, 100],
      bWorkflows: [],

      loading: true,
      timer: 0,
      isBlocker: 0,
      isDraft: 0,
      isBug: 0,
      startDate: '',
      dueDate: '',
      filterTitle: '',
      optionUsers: [],
      filterUsers: [],
      optionLabels: null,
      filterLabels: [],
      optionTypes: null,
      filterTypes: [],
      optionEfforts: null,
      filterEfforts: []
    }
  },
  created(){
    this.getEfforts()
    this.getTypes()
    this.getLabels()
    this.getMembers()
  },
  methods: {

    exportTask(){
      Axios()
        .get(
          '/' + this.$route.params.companySlug + '/' + this.$route.params.projectSlug + '/tasks/excel',
          { responseType: 'blob' }
        )
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', 'tasks.xlsx')
          document.body.appendChild(link)
          link.click()
        })
        .catch((e) => {
          console.error(e)
        })
    },

    getMembers(){
      
      let project = this.$store.getters['project/getProject']

      for (let i = 0; i < project.users.length; i++) {
        this.optionUsers.push(project.users[i].name)
      }

    },

    getLabels(){
      if ( !this.optionLabels ){
        Axios()
        .get(
          'task-labels/project/?company_slug=' +
          this.$route.params.companySlug +
          '&project_slug=' +
          this.$route.params.projectSlug
        )
        .then((response) => {
          
          this.optionLabels = []

          for (let i = 0; i < response.data.data.length; i++) {
            this.optionLabels.push(response.data.data[i].title)
          }

        })
      }
    },
    
    getTypes(){
      if ( !this.optionTypes ){
        Axios()
        .get(
          'project-templates/type/?company_slug=' +
          this.$route.params.companySlug +
          '&project_slug=' +
          this.$route.params.projectSlug
        )
        .then((response) => {
          
          this.optionTypes = []

          for (let i = 0; i < response.data.data.length; i++) {
            this.optionTypes.push(response.data.data[i].title)
          }

        })
      }
    },

    getEfforts(){
      if ( !this.optionEfforts ){
        Axios()
        .get(
          'project-templates/effort/?company_slug=' +
          this.$route.params.companySlug +
          '&project_slug=' +
          this.$route.params.projectSlug
        )
        .then((response) => {
          
          this.optionEfforts = []

          for (let i = 0; i < response.data.data.length; i++) {
            this.optionEfforts.push(response.data.data[i].title)
          }

        })
      }
    },

    addFilter(){
      
      let filters = []
      let arrStartDate = ''
      let arrDueDate = ''

      if (this.startDate[0]) {
        let startDate1 = moment(this.startDate[0]).format('YYYY-MM-DD')
        let startDate2 = moment(this.startDate[1]).format('YYYY-MM-DD')
        arrStartDate = [startDate1, startDate2]
      }

      if (this.dueDate[0]) {
        let dueDate1 = moment(this.dueDate[0]).format('YYYY-MM-DD')
        let dueDate2 = moment(this.dueDate[1]).format('YYYY-MM-DD')
        arrDueDate = [dueDate1, dueDate2]
      }

      filters.push({ title : this.filterTitle})
      filters.push({ start_date : arrStartDate})
      filters.push({ due_date : arrDueDate})
      filters.push({ users : this.filterUsers})
      filters.push({ labels : this.filterLabels})
      filters.push({ types : this.filterTypes})
      filters.push({ efforts : this.filterEfforts})
      filters.push({ timer : this.timer})
      filters.push({ is_blocker : this.isBlocker})
      filters.push({ is_draft : this.isDraft})
      filters.push({ is_bug : this.isBug})

      this.$store.dispatch('taskFilter/setFilter', filters)
    }

  },
}
</script>

<template>
  
  <div>
    <div class="form-group mb-0">
        <div class="mt-5-px">
          <b-form-input v-model="filterTitle" type="search" autocomplete="off" class="mb-10-px" :placeholder="$t('Search by title')"></b-form-input>


          <DatePicker
            v-model="startDate"
            style="width:100%"
            class="mb-10-px"
            range
            lang="en"
            format="YYYY-MM-DD"
            confirm
            :placeholder="$t('Start date')"
          ></DatePicker>

          <DatePicker
            v-model="dueDate"
            style="width:100%"
            range
            lang="en"
            format="YYYY-MM-DD"
            confirm
            class="mg-t-5"
            :placeholder="$t('Due date')"
          ></DatePicker>

          <b-form-group :label="$t('Filter by Users')">
            <b-form-tags v-model="filterUsers" size="lg" add-on-change no-outer-focus class="mb-1">
              <template v-slot="{ tags, inputAttrs, inputHandlers, disabled, removeTag }">
                <ul v-if="tags.length > 0" class="list-inline d-inline-block mb-1">
                  <li v-for="tag in tags" :key="tag" class="list-inline-item">
                    <b-form-tag
                      :title="tag"
                      :disabled="disabled"
                      variant="info"
                      @remove="removeTag(tag)">
                    {{ tag }}</b-form-tag>
                  </li>
                </ul>
                <b-form-select
                  :options="optionUsers"
                  v-bind="inputAttrs"
                  v-on="inputHandlers"
                >
                  <template v-slot:first>
                    <option disabled value="">Choose a user ...</option>
                  </template>
                </b-form-select>
              </template>
            </b-form-tags>
          </b-form-group>

          <b-form-group :label="$t('Filter by Labels')">
            <b-form-tags v-model="filterLabels" size="lg" add-on-change no-outer-focus class="mb-1">
              <template v-slot="{ tags, inputAttrs, inputHandlers, disabled, removeTag }">
                <ul v-if="tags.length > 0" class="list-inline d-inline-block mb-1">
                  <li v-for="tag in tags" :key="tag" class="list-inline-item">
                    <b-form-tag
                      :title="tag"
                      :disabled="disabled"
                      variant="info"
                      @remove="removeTag(tag)">
                    {{ tag }}</b-form-tag>
                  </li>
                </ul>
                <b-form-select
                  :options="optionLabels"
                  v-bind="inputAttrs"
                  v-on="inputHandlers"
                >
                  <template v-slot:first>
                    <option disabled value="">Choose a label ...</option>
                  </template>
                </b-form-select>
              </template>
            </b-form-tags>
          </b-form-group>

          <b-form-group :label="$t('Filter by Types')">
            <b-form-tags v-model="filterTypes" size="lg" add-on-change no-outer-focus class="mb-1">
              <template v-slot="{ tags, inputAttrs, inputHandlers, disabled, removeTag }">
                <ul v-if="tags.length > 0" class="list-inline d-inline-block mb-1">
                  <li v-for="tag in tags" :key="tag" class="list-inline-item">
                    <b-form-tag
                      :title="tag"
                      :disabled="disabled"
                      variant="info"
                      @remove="removeTag(tag)"
                    >{{ tag }}</b-form-tag>
                  </li>
                </ul>
                <b-form-select
                  :options="optionTypes"
                  v-bind="inputAttrs"
                  v-on="inputHandlers"
                >
                  <template v-slot:first>
                    <option disabled value="">Choose a type ...</option>
                  </template>
                </b-form-select>
              </template>
            </b-form-tags>
          </b-form-group>

          <b-form-group :label="$t('Filter by Efforts')">
            <b-form-tags v-model="filterEfforts" size="lg" add-on-change no-outer-focus class="mb-1">
              <template v-slot="{ tags, inputAttrs, inputHandlers, disabled, removeTag }">
                <ul v-if="tags.length > 0" class="list-inline d-inline-block mb-1">
                  <li v-for="tag in tags" :key="tag" class="list-inline-item">
                    <b-form-tag
                      :title="tag"
                      :disabled="disabled"
                      variant="info"
                      @remove="removeTag(tag)"
                    >{{ tag }}</b-form-tag>
                  </li>
                </ul>
                <b-form-select
                   :options="optionEfforts"
                  v-bind="inputAttrs"
                  v-on="inputHandlers">
                  <template v-slot:first>
                    <option disabled value="">Choose a effort ...</option>
                  </template>
                </b-form-select>
              </template>
            </b-form-tags>
          </b-form-group>

          <b-container class="mt-8-px mb-15px">
            <b-row>
              <b-col cols="6">
                <b-form-checkbox
                  v-model="timer"
                  value="1"
                  unchecked-value="0">
                  Timer active
                </b-form-checkbox>
              </b-col>
              <b-col cols="6">
                <b-form-checkbox
                  v-model="isBlocker"
                  value="1"
                  unchecked-value="0">
                  Blocked
                </b-form-checkbox>
              </b-col>
              <b-col cols="6">
                <b-form-checkbox
                  v-model="isDraft"
                  value="1"
                  unchecked-value="0">
                  Draft
                </b-form-checkbox>
              </b-col>
              <b-col cols="6">
                <b-form-checkbox
                  v-model="isBug"
                  value="1"
                  unchecked-value="0">
                  Bug
                </b-form-checkbox>
              </b-col>
            </b-row>
          </b-container>

          <div class="d-flex align-items-center justify-content-between">

              <span v-if="authorize('settings', 'update')" class="txt-68748F txt-link tx-11-px" @click="exportTask">
                <font-awesome-icon :icon="['far', 'file-export']" />&nbsp;
                {{ $t('Export All Tasks') }}
              </span>

            <b-button variant="primary" size="xs" @click="addFilter">{{ $t('Apply Filters') }}</b-button>

          </div>

        </div>

    </div>
  </div>
      
</template>
