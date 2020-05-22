<script>
export default {
  props: {
    users: {
      type: Array,
      required: false,
      default: null,
    },
    user: {
      type: Object,
      required: false,
      default: null,
    },
    size: {
      type: String,
      required: false,
      default: "28",
    },
    link: {
      type: Boolean,
      required: false,
      default: false,
    },
    overlap: {
      type: Boolean,
      required: false,
      default: true,
    },
    limit: {
      type: Number,
      required: false,
      default: 3,
    },
    owner: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      filtered: null
    }
  },
  methods: {
    removeDuplicates(list) {
      let participants = this.owner ? this.removeOwner(list, this.owner) : list

      let uniqueParticipants = participants.filter(function(a) {
        return !this[JSON.stringify(a)] && (this[JSON.stringify(a)] = true)
      }, Object.create(null))

      return uniqueParticipants
    },
    removeOwner(list, owner) {
      return list.length > 0 ? list.filter((data) => data.username !== owner.username) : []
    },
    removeFilter() {
      let elements = document.getElementsByClassName('task-card')
      for (let i = 0; i < elements.length; i++) {
        elements[i].style.display = ''
      }
      this.filtered = null
    }
  },
}
</script>

<template>
  <div>
    <div v-if="Array.isArray(users) && users.length > 0" class="task-users list-users d-flex flex-wrap">
      <div
        v-for="(u, index) in removeDuplicates(users)"
        :key="u.username"
        v-b-popover.hover.top="u.name"
        :data-username="u.username"
        :data-fullname="u.name"
        :data-avatar="u.avatar"
        class="list-user"
      >
        <span v-if="index < limit" :alt="u.name">
          <b-avatar v-if="link" 
            :to="{ name: 'profile.user', params: { username: u.username } }" 
            :src="u.avatar" :size="size"></b-avatar>
          
          <b-avatar v-else
            :src="u.avatar" :size="size"></b-avatar>
        </span>
      </div>
      <span v-if="users.length > limit" class="badge badge-pill text-white badge-primary qtd-more-users">
        +{{ users.length - limit }}
      </span>
    </div>
    <div v-if="user" :alt="user.name">
      <b-avatar v-if="link" 
        :to="{ name: 'profile.user', params: { username: user.username } }" 
        :src="user.avatar" :size="size"></b-avatar>
      
      <b-avatar v-else
        :src="user.avatar" :size="size"></b-avatar>
    </div>
  </div>
</template>
