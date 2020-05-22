<script>
import VueRx from 'vue-rx'
import { clipperFixed } from 'vuejs-clipper'

export default {
  components: {
    clipperFixed,
  },
  props: {
    img64: {
      type: String | null,
      required: true,
    },
    round: {
      type: Boolean,
      required: true,
    },
    size: {
      type: Object | null,
      required: false,
    },
  },
  data() {
    return {
      zoom: 1,
      zoomMin: 0.1,
      zoomMax: 4,
      zoomStep: 0.01,
      ratio: this.size ? this.size.width / this.size.height : 1,
    }
  },
  mounted() {
    this.$refs.clipper.onChange$.subscribe((ev) => {
      // This happens whenever zooming, moving and rotating occur.
      if (this.isNumeric(ev)) {
        this.controlZoom(ev)
      }
    })
  },
  methods: {
    isNumeric: function(n) {
      return !isNaN(parseFloat(n)) && isFinite(n)
    },

    onClickClipImage() {
      const canvas = this.$refs.clipper.clip()
      const imgCropped = canvas.toDataURL('image/png', 1)
      this.sendImageCropResult(imgCropped)
    },

    onClickCancelClip() {
      this.sendImageCropResult(null)
    },

    sendImageCropResult(image) {
      this.$emit('get-image-cropped', image)
    },

    checkZoom(evt) {
      this.$refs.clipper.setWH$.next(parseFloat(evt.target.value))
      this.zoom = parseFloat(evt.target.value)
    },

    controlZoom(zoom) {
      if (zoom > this.zoomMax) {
        zoom = this.zoomMax
        this.$refs.clipper.setWH$.next(this.zoomMax)
      } else if (zoom < this.zoomMin) {
        zoom = this.zoomMin
        this.$refs.clipper.setWH$.next(this.zoomMin)
      }
      this.zoom = zoom
    },
  },
}
</script>

<template>
  <div>
    <div class="flex justify-content-center">
      <clipperFixed ref="clipper" class="basic lg" :src="img64" :ratio="ratio" :round="round" :grid="false">
        <div class="placeholder" slot="placeholder">No image</div>
      </clipperFixed>
    </div>
    <div class="flex justify-content-center">
      <input
        type="range"
        :min="zoomMin"
        :max="zoomMax"
        :step="zoomStep"
        :value="zoom"
        class="slider m-2"
        id="myRange"
        @change="checkZoom"
      />
    </div>
    <div class="flex justify-content-center mt-2 mb-4">
      <b-button variant="secondary" class="btn btn-secondary font-weight-bold" @click="onClickCancelClip">
        {{ $t('Cancel') }}
      </b-button>
      <b-button variant="primary" class="btn btn-primary font-weight-bold ml-2" @click="onClickClipImage">
        {{ $t('Crop Image') }}
      </b-button>
    </div>
  </div>
</template>

<style scoped>
.flex {
  display: flex;
  flex-wrap: wrap;
}
.flex .lg {
  flex-basis: 0;
  flex-grow: 3;
  margin: 3px;
}
.flex .md {
  flex-basis: 0;
  margin: 3px;
  flex-grow: 2;
}
.basic {
  max-width: 700px;
  min-width: 270px;
}
.placeholder {
  text-align: center;
  padding: 20px;
  background-color: lightgray;
}

.slider {
  width: 50%;
}
</style>
