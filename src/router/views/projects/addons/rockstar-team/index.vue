<script>
import Layout from '@layouts/tpl-main-project'
import Axios from '@utils/axios'
import DatePicker from 'vue2-datepicker'
import ListUsers from '@components/utils/list-users'
import TitleLoading from '@components/utils/title-loading'

export default {
  page: {
    title: 'Rockstar team',
    meta: [{ name: 'description', content: '' }],
  },
  components: { Layout, DatePicker, ListUsers, TitleLoading },
  data() {
    return {
      loading: true,
      dates: '',
      items: [],
      gridConfig: {
        style: [
          'max-width:100px; width:100px;',
          'max-width:55px; width:55px;',
          '',
          'max-width:95px; width:95px;',
          'max-width:95px; width:95px;',
          'max-width:200px; width:200px;',
        ],
        crownColor: [
          '#FBD01E',
          '#C0C0C0',
          '#847E69',
          'transparent',
          'transparent',
          'transparent',
          'transparent',
          'transparent',
          'transparent',
          'transparent',
        ],
      },
    }
  },
  created() {
    this.getList('', '')
  },
  methods: {
    getList(dateStart, dateEnd) {
      Axios()
        .get(
          'rockstar-team/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug +
            '&quantity=15&sort_by=tasks' +
            '&start=' +
            dateStart +
            '&end=' +
            dateEnd
        )
        .then((response) => {
          this.items = response.data.data
          this.loading = false
        })
        .catch((error) => {
          console.error(error)
        })
    },
    changeDate(date) {
      this.loading = true
      let d0 = new Date(date[0])
      let d1 = new Date(date[1])
      let dateStart = d0.getFullYear() + '-' + (d0.getMonth() + 1) + '-' + d0.getDate()
      let dateEnd = d1.getFullYear() + '-' + (d1.getMonth() + 1) + '-' + d1.getDate()
      this.getList(dateStart, dateEnd)
    },
  },
}
</script>

<template>
  <Layout>
    <template slot="header-left">
      <TitleLoading
        :title="$t('Rockstar Team')" :loading="loading"></TitleLoading>
    </template>

    <div slot="content" class="rockstar-team pt-60px">
      <div class="container">

        <div class="row mb-30-px">
          <div class="col-md-12 pr-0">
            
            <div>
              <DatePicker v-model="dates" range lang="en" type="date" confirm @change="changeDate"></DatePicker>
            </div>

            <div class="mt-4 mb-4">
              <div class="divTable">
                <div class="divTableHead">
                  <div class="divTableRow">
                    <div class="divTableCell text-left" :style="gridConfig.style[0]">
                      {{ $t('Position') }}
                    </div>
                    <div class="divTableCell" :style="gridConfig.style[1]"> </div>
                    <div class="divTableCell text-left" :style="gridConfig.style[2]">
                      {{ $t('Member') }}
                    </div>
                    <div class="divTableCell text-right" :style="gridConfig.style[3]"> {{ $tc('Effort') }}</div>
                    <div class="divTableCell text-right" :style="gridConfig.style[4]"> {{ $t('Tasks') }}</div>
                    <div class="divTableCell text-right" :style="gridConfig.style[5]"> {{ $t('Worked') }}</div>
                  </div>
                </div>
                <div class="divTableBody">
                  <div v-for="(item, key) in items" :key="item.user.username" class="divTableRowBg">
                    <div v-if="key <= 10">
                      <div class="divTableRow d-flex align-items-center ">
                        <div class="d-flex divTableCell text-left rockstar-king" :style="gridConfig.style[0]">
                          <span class="ranking-number tx-36-px fw-700 text-primary">
                            {{ key + 1 }}
                          </span>
                          <span class="ranking-crown">
                            <i :style="'color:' + gridConfig.crownColor[key]" class="fas fa-crown"></i>
                          </span>
                        </div>
                        <div class="divTableCell text-center d-flex align-items-center " :style="gridConfig.style[1]">
                          <ListUsers :user="item.user" :link="true"></ListUsers>
                        </div>
                        <div class="divTableCell d-flex align-items-center" :style="gridConfig.style[2]">
                          <div class="text-left wd-100">
                            <router-link
                              :to="{
                                name: 'profile.user',
                                params: { username: item.user.username },
                              }"
                              class="txt-primary-title txt-link"
                            >
                              {{ item.user.name }}
                            </router-link>
                            <span v-if="item.user.headline" class="d-block info">
                              {{ item.user.headline }}
                            </span>
                          </div>
                        </div>
                        <div
                          class="divTableCell text-right rockstar-king d-flex align-items-center "
                          :style="gridConfig.style[3]"
                        >
                          <span class="ranking-number text-right d-block tx-20px fw-700 text-primary">
                            {{ item.total_efforts }}
                          </span>
                        </div>
                        <div class="divTableCell rockstar-king d-flex align-items-center " :style="gridConfig.style[4]">
                          <span class="ranking-number text-right d-block tx-20px fw-700 text-primary">
                            {{ item.closed_issues_count }}
                          </span>
                        </div>
                        <div
                          class="divTableCell text-right rockstar-king d-flex"
                          :style="gridConfig.style[5]"
                        >
                          <span class="ranking-number text-right d-block tx-20px fw-700 text-primary">
                            {{ item.duration_worked }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>
