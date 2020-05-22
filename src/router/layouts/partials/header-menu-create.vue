<script>
import { modalManager } from '@state/helpers'
import Modals from '@layouts/partials/modals'

export default {
  components: {
    Modals,
  },
  data() {
    return {
      data: {},
    }
  },
  methods: {
    ...modalManager,

    modal(value) {
      this.open({ name: value, object: [] })
    },
    gaClickDropdrownCreate(){
      this.$ga.event('header_bar', 'dropdown_create')
    }
  },
}
</script>

<template>
  <li>
    <div v-if="authorize('company', 'create')">
      <b-dropdown right @shown="gaClickDropdrownCreate">
        <template v-slot:button-content>
          <span>{{ $t('Create') }}</span>
          <font-awesome-icon :icon="['far', 'angle-down']" style="position:relative; margin-left:4px;" />
        </template>
        <b-dropdown-item @click="modal('projectCreate')">
          <p>{{ $t('Create Project') }}</p>
          <span>{{ $t('Perfect project overview for modern teams') }}</span>
        </b-dropdown-item>
        <b-dropdown-item @click="modal('sprintCreate')">
          <p>{{ $t('Create Sprint') }}</p>
          <span>{{ $t('Sprint is one timeboxed iteration of a continuous cycle') }}</span>
        </b-dropdown-item>
        <b-dropdown-item @click="modal('userstoryCreate')">
          <p>{{ $t('Create User Story') }}</p>
          <span>{{ $t('User stories are short and simple descriptions of capabilities') }}</span>
        </b-dropdown-item>
      </b-dropdown>
    </div>
    <Modals></Modals>
  </li>
</template>
