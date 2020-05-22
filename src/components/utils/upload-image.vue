<script>
import Axios from '@utils/axios'
import CropImage from '@components/utils/crop-image'

export default {
  components: {
    CropImage,
  },
  props: {
    buttonText: {
      type: String,
      required: false,
    },
    buttonClass: {
      type: String,
      required: false,
      default: '',
    },
    twoButtons: {
      type: Boolean,
      required: false,
      default: false,
    },
    hasImage: {
      type: Boolean,
      required: false,
      default: true,
    },
    options: {
      type: Object,
      required: true,
    },
    profileImageRound: {
      type: Boolean,
      required: false,
      default: false,
    },
    updatePhoto: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      imageCropped: null,
      cropSize: this.options.cropSize ? this.options.cropSize : null,
      alertMessage: '',
      alertStatus: false,
      cropDimensions: this.options.cropSize ? ` (${this.options.cropSize.width} x ${this.options.cropSize.height})` : ''
    }
  },
  methods: {
    getImageCropped(imageCropped) {
      this.imageCropped = imageCropped
      this.resetFileInput()
      this.closeCropModal()
    },

    resetFileInput() {
      this.$refs.file.value = ''
    },

    onFileChange(e) {
      const file = e.target.files[0]
      this.imageCropped = URL.createObjectURL(file)
      this.callCropTool()
    },

    callCropTool() {
      this.$refs['modal'].show()
    },

    closeCropModal() {
      
      this.closeModal(this.$refs['modal'])
      if (this.imageCropped !== null) {
        if (this.updatePhoto) {
          this.uploadImage()
        } else {
          this.$emit('get-image', this.imageCropped)
        }
      }
    },

    deleteImage() {
      this.imageCropped = ''

      let params = {}
      params[this.options.paramName] = this.imageCropped

      this.httpDelete(params)
    },

    uploadImage() {
      let params = {}
      params[this.options.paramName] = this.imageCropped

      if (this.options.http === 'POST') {
        this.httpPost(params)
      } else if (this.options.http === 'PUT') {
        this.httpPut(params)
      }
    },

    httpDelete(params) {
      Axios()
        .delete(this.options.url, params, {
          headers: this.options.headers,
        })
        .then((_) => {
          this.$emit('get-image', this.imageCropped)
        })
        .catch((error) => {
          alert(error.response.data.message)
        })
    },

    httpPost(params) {
      Axios()
        .post(this.options.url, params, {
          headers: this.options.headers,
        })
        .then((_) => {
          this.$emit('get-image', this.imageCropped)
        })
        .catch((error) => {
          alert(error.response.data.message)
        })
    },

    httpPut(params) {
      Axios()
        .put(this.options.url, params, {
          headers: this.options.headers,
        })
        .then((_) => {
          this.$emit('get-image', this.imageCropped)
        })
        .catch((error) => {
          alert(error.response.data.message)
        })
    },
  },
}
</script>

<template>
  <div>
    <input type="file" ref="file" style="display: none" accept="image/*" @change="onFileChange" />
    <div v-if="!twoButtons">
      <button
        :class="buttonClass === '' ? 'btn btn-primary p-2' : buttonClass"
        style="font-weight:600 !important"
        @click="$refs.file.click()"
      >
        {{ buttonText }}
      </button>
    </div>
    <div v-if="twoButtons">
      <button class="btn btn-primary mr-4-px p-0" @click="$refs.file.click()">
        <font-awesome-icon :icon="['fal', 'cloud-upload']" />
      </button>
      <b-button v-show="hasImage" class="btn btn-primary ml-4-px p-0" @click="deleteImage()">
        <font-awesome-icon :icon="['far', 'times']" />
      </b-button>
    </div>

    <b-modal ref="modal" lazy hideFooter :title="'Crop Image ' + cropDimensions" style="max-width: 600px !important;" @hide="resetFileInput">
      <template v-slot:default="{ hide }">
        <CropImage
          :img64="imageCropped"
          :round="profileImageRound"
          :size="cropSize"
          @get-image-cropped="getImageCropped"
        ></CropImage>
      </template>
    </b-modal>
  </div>
</template>
