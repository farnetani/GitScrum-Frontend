<script>
import Axios from '@utils/axios'
import ListUsers from '@components/utils/list-users'

export default {
  components: { ListUsers },
  props: {
    task: {
      type: Object,
      required: false,
      default: function() {
        return []
      },
    },
  },
  data() {
    return {
      btnLoading: false,
      projectMember: [],
      projectMembers: null,
    }
  },
  methods: {
    removeUser(member) {

      this.$bvModal.msgBoxConfirm(this.$t('Do you really want to remove?'), this.msgBoxConfirmConfig() )
      .then(value => {

        if(value){
        
          Axios()
            .delete('task-assignees/?task_uuid=' + this.task.uuid + '&username=' + member.username)
            .then((response) => {
              let u = []
              for (let i = 0; i < this.task.users.length; i++) {
                if (member.username !== this.task.users[i].username) {
                  u.push(this.task.users[i])
                }
              }
              this.task.users = u
              this.getProjectMembers()
            })
            .catch((e) => {
              this.getProjectMembers()
              console.error(e)
            })
        }
      })

    },
    getProjectMembers() {
      if ( this.task.uuid ){
        this.btnLoading = true
        Axios()
          .get('task-assignees/not-added/?task_uuid=' + this.task.uuid)
          .then((response) => {
            this.projectMembers = response.data.data
            this.btnLoading = false
          })
          .catch((e) => {
            console.error(e)
          })
      }
    },
    addUser(member) {
      this.btnLoading = true

      Axios()
        .post('task-assignees/?task_uuid=' + this.task.uuid, {
          username: member.username,
        })
        .then((response) => {
          this.btnLoading = false
          this.task.users.push(member)
          this.projectMember = null
          this.getProjectMembers()
        })
        .catch((e) => {
          this.getProjectMembers()
          console.error(e)
        })
    },
    clickDropdown() {
      if ( !this.projectMembers ){
        this.getProjectMembers()
      }
    },
  },
}
</script>

<template>
  <div class="task-assignees d-flex justify-content-start"> 

    <b-dropdown v-if="authorize('tasks', 'update')" class="styled-dropdown" @shown="clickDropdown" >
      <template v-slot:button-content>
        <font-awesome-icon v-show="!btnLoading" :icon="['far', 'plus']" style="font-size:14px" />
        <b-spinner v-show="btnLoading" tag="div" :label="$t('Loading')" small></b-spinner>
      </template>
      <b-dropdown-group class="dropdown-header-group-title" :header="$t('Assign User')">
        <b-dropdown-item v-for="member in projectMembers" :key="member.username" @click="addUser(member)">
          <div class="d-flex align-items-center justify-content-start">
            <ListUsers :user="member" :link="true" size="18"></ListUsers>
            <span class="fw-600 ml-5-px">{{ member.name }}</span>
          </div>
        </b-dropdown-item>
      </b-dropdown-group>
      <b-dropdown-divider></b-dropdown-divider>
      <b-dropdown-group class="dropdown-header-group-title" :header="$t('Remove User')">
        <b-dropdown-item v-for="member in task.users" :key="member.username" @click="removeUser(member)">
          <div class="d-flex align-items-center justify-content-start">
            <ListUsers :user="member" :link="true" size="18"></ListUsers>
            <span class="fw-600 ml-5-px">{{ member.name }}</span>
          </div>
        </b-dropdown-item>
      </b-dropdown-group>
    </b-dropdown>

    <ListUsers :users="task.users" :limit="30" :link="true" size="26" class="mt-3-px ml-2-px"></ListUsers>

  </div>
</template>
