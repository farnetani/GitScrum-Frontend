<script>
import Axios from '@utils/axios'
import Alert from '@components/utils/alert'

export default {
  components: { Alert },
  data() {
    return {
      loading: true,
      enableShareableBoard: false,
      tokenShareableBoard: '',
      showShareBoardCheck: false,
      linkCopied: false,
    }
  },
  methods: {
    update() {
      this.loading = true
      this.tokenShareableBoard = this.$t('Updating Shareable Link...')
      this.linkCopied = false

      Axios()
        .put(
          'share-board/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug
        )
        .then((response) => {
          this.tokenShareableBoard = this.getDomain('bp') + response.data.data.token
          this.loading = false
        })
    },
    state(status) {
      this.loading = true
      this.enableShareableBoard = false
      this.linkCopied = false

      if (status) {
        this.tokenShareableBoard = this.$t('Enabling shareable link...')
      } else {
        this.tokenShareableBoard = this.$t('Disabling shareable link...')
      }

      Axios()
        .post(
          'share-board/toggle/?company_slug=' +
            this.$route.params.companySlug +
            '&project_slug=' +
            this.$route.params.projectSlug
        )
        .then((response) => {
          this.enableShareableBoard = response.data.data.enabled
          this.tokenShareableBoard = this.getDomain('bp') + response.data.data.token
          this.loading = false
          this.check()
        })
        .catch((e) => {
          this.loading = false
          this.enableShareableBoard = true
        })
    },
    check() {
      if (!this.enableShareableBoard) {
        this.tokenShareableBoard = ''
      }
    },

    showShareBoard() {
      this.loading = true
      Axios()
      .get(
        'share-board/?company_slug=' +
          this.$route.params.companySlug +
          '&project_slug=' +
          this.$route.params.projectSlug
      )
      .then((response) => {
        this.enableShareableBoard = response.data.data.enabled
        this.tokenShareableBoard = this.getDomain('bp') + response.data.data.token
        this.showShareBoardCheck = true
        this.loading = false
        this.check()
      })
      .catch((error) => {
        if (error) this.loading = false
      })
    },
    

    onCopy() {

      this.$copyText(this.tokenShareableBoard)
      this.linkCopied = false
      
    },
  },
}
</script>

<template>

  <div class="shareable-board">
    <b-dropdown @shown="showShareBoard">
      <template v-slot:button-content>
        <font-awesome-icon :icon="['fa', 'share-alt']" />&nbsp;
        {{ $t('Share Board') }}
      </template>
      <b-dropdown-form style="width: 400px">
        <h4>{{ $t('Sharing is Loving!') }}</h4>
        <h5>{{ $t('Share-text') }}</h5>
        <div>
          <b-spinner
            v-show="loading && !showShareBoardCheck"
            :label="$t('Loading')"
            variant="secondary"
            small
            class="ml-2 title-loading"
          ></b-spinner>

          <b-form-checkbox
            v-if="showShareBoardCheck"
            v-model="enableShareableBoard"
            :disabled="loading"
            class="mt-15-px"
            @change="state"
          >
            <span class="tx-12-px ls-003">{{ $t('Get Shareable Link') }}</span>
            <b-spinner
              v-show="loading"
              :label="$t('Loading')"
              variant="secondary"
              small
              class="ml-2 title-loading"
            ></b-spinner>
          </b-form-checkbox>

          <div v-show="tokenShareableBoard !== ''">
            <span class="d-block tx-10-px ls-003">
              {{ $t('Anyone who has the link can view Board Planning') }}
            </span>

            <b-input-group>
              <b-input v-model="tokenShareableBoard" 
                :readonly="true" 
                autocomplete="off"></b-input>
              <b-input-group-append>
                <b-button 
                v-clipboard:copy="tokenShareableBoard"
                v-clipboard:success="onCopy"
                variant="outline-secondary" >
                  <font-awesome-icon :icon="['far', 'copy']" />
                </b-button>
              </b-input-group-append>
            </b-input-group>

            
            <div class="mt-15-px justify-content-between d-flex">
              <a
                href="javascript:;"
                :class="{ disabled: !enableShareableBoard || loading }"
                class="txt-3D4F9F fw-600 tx-12-px ls-003"
                @click="update"
              >
                {{ $t('Update Link') }}
              </a>

              <a
                :href="tokenShareableBoard"
                :class="{ disabled: !enableShareableBoard || loading }"
                class="txt-3D4F9F fw-600 tx-12-px ls-003"
                target="_blank"
              >
                {{ $t('Open Shareable Board') }}
              </a>
            </div>
          </div>
        </div>
      </b-dropdown-form>
    </b-dropdown>
  </div>
</template>
