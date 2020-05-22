<script>
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import CreateCompany from '@components/projects/modal/create-company'
import { modalManager } from '@state/helpers'

export default {
  components: { vSelect, CreateCompany },
  data() {
    return {
      company: null,
      companiesUser: JSON.parse(localStorage.getItem('COMPANIES_USER')),
      currentCompany: JSON.parse(localStorage.getItem('CURRENT_COMPANY')),
      companiesUserList: [],
      visibleCompanyList: true,
      countShow: 0,
    }
  },
  created() {
    this.companiesList()
  },
  mounted() {
    this.$eventBus.$on('change-current-company', this.handleChangedCurrentCompanyEvent)
  },
  methods: {
    ...modalManager,

    modal(value) {
      this.open({ name: value, object: [] })
    },
    companiesList() {
      let data = this.companiesUser
      var arr = []

      if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          if (data[i].slug !== this.currentCompany.slug) {
            arr.push({
              index: i,
              name: data[i].name,
              slug: data[i].slug,
              headline: data[i].description,
              avatar: data[i].logo,
            })
          }
        }
      }
      arr.push({
        index: data.length + 1,
        label: '',
        code: '-',
        headline: '',
        avatar: '',
      })
      this.companiesUserList = arr
    },
    changeCompany() {
      this.visibleCompanyList = false
      if (this.company.code !== '-') {
        localStorage.setItem('CURRENT_COMPANY', JSON.stringify(this.companiesUser[this.company.index]))
        this.$cookies.set('company', this.companiesUser[this.company.index].name, (60 * 60 * 24 * 30))
        location.href = '/projects'
      } else {
        this.visibleCompanyList = true
        this.company = null
        this.modal('createCompany')
      }
    },

    redirectToCompany(company) {
        localStorage.setItem('CURRENT_COMPANY', JSON.stringify(company))
        this.$cookies.set('company', company.name, (60 * 60 * 24 * 30))
        location.href = '/projects'
    },

    createCompany() {
        this.visibleCompanyList = true
        this.modal('createCompany')
    },

    handleChangedCurrentCompanyEvent(data) {
      this.currentCompany = data
    },
    gaClickDropdrownCompany(){
      this.$ga.event('header_bar', 'dropdown_company')
    }
  },
}
</script>

<template>
  <li>
    <b-dropdown right>
      <template v-slot:button-content>
        <span v-text="currentCompany.name"></span>
        <font-awesome-icon :icon="['far', 'angle-down']" style="position:relative; margin-left:4px;" />
      </template>
      <b-dropdown-group :header="$t('Company Profiles') ">
      <b-dropdown-item v-for="(item, index) in companiesUser" v-show="currentCompany.slug !== item.slug"  :key="index"  @click="redirectToCompany(item)">
        <p>{{ item.name }}</p>
      </b-dropdown-item>
      </b-dropdown-group>
      <b-dropdown-divider></b-dropdown-divider>
      <b-dropdown-item @click="createCompany">
        <p><font-awesome-icon :icon="['far', 'briefcase']" style="position:relative; top:-1px;" /> {{ $t('Create another Company Profile') }}</p>
        <span>{{ $t('Does your company have many clients or departments? Create a new Company Profile for each one and better organize your projects.') }}</span>
      </b-dropdown-item>
    </b-dropdown>
    <CreateCompany></CreateCompany>
  </li>

    <!--

  <li class="nav-item dropdown header-dropdown">

    

    <span class="nav-title dropdown-toggle btn cursor-pointer" data-toggle="dropdown" :alt="$t('Create')" :title="$t('Create')" @click="gaClickDropdrownCompany">
      <span class="text-center wd-100" v-text="currentCompany.name"></span>
    </span>
    <div class="dropdown-menu dropdown-menu-right navbar-dropdown menu-max" style="margin:16px 0 0 0; widht:385px !important;">
      <div v-if="companiesUser.length > 1">
        <div class="header-dropdown-subitem">
          {{ $t('Company Profiles') }}
        </div>
        <div class="header-dropdown-space"></div>
        <a v-if="currentCompany.slug != company.slug" v-for="(company, index) in companiesUser" :key="index" href="javascript:;" class="header-dropdown-item" @click="redirectToCompany(company)">
          
          <small class="d-block">{{ company.description | truncate(60) }}</small>
        </a>
        <div class="header-dropdown-lastitem d-none d-sm-block"></div>
      </div>
      <a href="javascript:;" class="header-dropdown-item" @click="createCompany" :style="companiesUser.length <= 1? 'margin-top:10px' : ''">
        <span><font-awesome-icon :icon="['far', 'briefcase']" style="position:relative; top:-1px;" /> {{ $t('Create another Company Profile') }}</span>
        <small class="d-block">{{ $t('Does your company have many clients or departments? Create a new Company Profile for each one and better organize your projects.') }}</small>
      </a>
    </div>
    <CreateCompany></CreateCompany>
  </li>
  <!--
  <div>
    <div class="nav-item dropdown header-dropdown">
      <div class="members header-change-company">
        <div v-if="visibleCompanyList" class="item-input d-flex" style="width:260px;">
          <v-select
            v-show="companiesUser.length > 1"
            v-model="company"
            :options="companiesUserList"
            :placeholder="currentCompany.name"
            :searchable="false"
            style="width:100%; margin-bottom:0; font-size:13px; color: #9EA9C1; text-align:center; height:30px;"
            @input="changeCompany"
          >
            <template slot="option" slot-scope="option">
              <div v-if="option.code !== '-'" class="d-flex align-items-center justify-content-end members-line">
                <div v-show="option.avatar" class="">
                  <img :src="option.avatar" :alt="option.label" :title="option.label" class="avatar-26" />
                </div>
                <div class="wd-100 d-flex justify-content-start align-items-center">
                  <div class="ml-10-px">
                    <span class="fw-600">{{ option.label | truncate(25) }}</span>
                  </div>
                </div>
              </div>
              <span v-else>
                <div class="text-left members-line">
                  <a v-text="$t('Create another Company')"></a>
                </div>
              </span>
            </template>
            <span slot="no-options">
              {{ $t('Now you can have multiple companies') }}. <a href="javascript:;" v-text="$t('Create another Company')"></a>
            </span>
          </v-select>
        </div>
        <div v-show="!visibleCompanyList" class="text-right">
          <b-spinner :label="$t('Loading')" small style="margin-top: 1px;"></b-spinner>
        </div>
      </div>
    </div>

    
  </div>
  -->
</template>
