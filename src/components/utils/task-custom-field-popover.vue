<script>
import Axios from '@utils/axios'

export default {
  components: {},
  props: {
    selectableOptions: {
      type: Array,
      required: true,
    },
    popoverTargetName: {
      type: String,
      required: true,
    },
    itemId: {
      type: Number,
      required: false,
      default: null,
    },
    templateSelectedId: {
      type: Number,
      required: false,
      default: null,
    },
    companySlug: {
      type: String,
      required: true,
    },
    projectSlug: {
      type: String,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      popoverShow: false,
      newOptionName: '',
    }
  },
  methods: {
    openPanel() {
      this.popoverShow = true
    },

    closePanel() {
      this.popoverShow = false
    },

    addOption() {
      let option = {
        id: null,
        name: this.newOptionName,
      }
      this.selectableOptions.push(option)
      this.updateSelectOptionName(option)
      this.newOptionName = ''
    },

    updateSelectOptionName(option) {
      if (this.popoverTargetName !== 'newTask') {
        let meta = this.buildMeta()
        this.updateSelected(meta)
      }
    },

    buildMeta() {
      let meta = []
      this.selectableOptions.forEach((opt) => {
        meta.push(opt.name)
      })
      return meta.join(',')
    },

    getUrl() {
      let url =
        'templates/field/' + this.templateSelectedId + '/items/' + this.itemId + '/?company_slug=' + this.companySlug

      if (this.projectSlug) {
        url += '&project_slug=' + this.projectSlug
      }
      return url
    },

    updateSelected(meta) {
      let url = this.getUrl()

      Axios()
        .put(url, {
          meta: meta,
        })
        .then((response) => {})
        .catch((e) => {
          console.error(e)
        })
    },

    deleteOption(option) {

      this.$bvModal.msgBoxConfirm(this.$t('Do you really want to delete?'), this.msgBoxConfirmConfig() )
      .then(value => {
        
        if(value){
          this.selectableOptions.splice(this.selectableOptions.indexOf(option), 1)
          this.updateSelectOptionName(option)
        }
      })

    },
  },
}
</script>

<template>
  <b-popover
    :target="popoverTargetName"
    triggers="click"
    :show.sync="popoverShow"
    placement="auto"
    container="my-container"
    @show="openPanel"
    @hidden="closePanel"
  >
    <template v-slot:title>
      <div class="row">
        <div class="col-11" style="padding-right: 0">
          <i class="fas fa-bars"></i>
          {{ $t('Edit Options') }}
        </div>
        <div class="col-1" style="padding: 0">
          <span title="Close" class="align-right" @click.stop.prevent="closePanel">
            <i class="fas fa-times"></i>
          </span>
        </div>
      </div>
    </template>

    <div class="row">
      <div class="col-8">
        <b-form-input v-model="newOptionName" placeholder="Option label name" size="sm"></b-form-input>
      </div>
      <div class="col-4">
        <b-button :disabled="!newOptionName" class="btn btn-primary font-weight-bold" @click="addOption">
          {{ $t('Add') }}
        </b-button>
      </div>
    </div>
    <div class="mt-4">
      <table v-if="selectableOptions.length" class="table table-striped">
        <tr>
          <th>{{ $t('Name') }}</th>
          <th></th>
        </tr>
        <tr v-for="option in selectableOptions" :key="option.id">
          <td>
            <b-form-input v-model="option.name" @change="updateSelectOptionName(option)"></b-form-input>
          </td>
          <td>
            <span class="cursor-pointer" @click="deleteOption(option)">
              <i class="fas fa-trash"></i>
            </span>
          </td>
        </tr>
      </table>
    </div>
  </b-popover>
</template>
