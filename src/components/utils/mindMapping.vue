<template>
  <div 
    class="mindMapping" 
    ref="wTextarea" 
    :style = "{
      width  : this.editor.width  + 'px',
      height : this.editor.height + 'px',
    }"
  >
    <div :id='editorId' :ref ='editorId'></div>
    
    <div 
      class="input_text"
      v-if="this.selectId"
      :style="selectBoxStyle"
      @click="stopDocument($event)"
    >
      <input 
        class="input_message" 
        v-model="titleData.message"
        :style="selectInputStyle"
        @blur="setTitle"
      >
    </div>
  </div>
</template>

<script>
import EditorMind from  './js/editorMind.js'
import UUID from './js/uuid.js';
export default {
  name: 'MindMapping',
  data() {
    return {
      editor   : '',
      editorId : 'editor_',
      selectId : '',
      selectBoxStyle   : '', 
      selectInputStyle : '',
      titleData : {
        message : ''
      },
    };
  },
  model: {
    prop  : 'value',//绑定的值，通过父组件传递
    event : 'update_value'//自定义时间名
  },
  props: {
    value     : {
      type    : String,
      default : '',
    },
    width     : {
      type    : Number,
      default : 500,
    },
    height    : {
      type    : Number,
      default : 500,
    },
    spacing   : {    // 标签横向相距距离
      type    : Number,
      default : 50
    },
    topColor  : {    // 标签横向相距距离
      type    : String,
      default : '#ff2970'
    },
    fontSize  : {
      type    : Number,
      default : 40,
    },
    fontLength: {
      type    : Number,
      default : 7,
    },
    onlyColor : {
      type    : Boolean,
      default : false,
    },
  },
  watch: {
  },
  computed: {
  },
  mounted() {
    let uuid = new UUID();
    this.editorId = this.editorId + uuid.generate();
    let setTime = setInterval(() => {
      let dom = document.getElementById(this.editorId)
      if (dom) {
    
        this.editor = new EditorMind(
          this.$svg,
          {
            domId     : this.editorId,   // 目标元素id
            width     : this.width,      // 宽
            height    : this.height,     // 高
            spacing   : this.spacing,    // 标题之间的间距
            topColor  : this.topColor,   // 标题颜色以及箭头颜色   
            fontStyle : {                
              size : this.fontSize,      // 标题文字大小，下一级标题文字大小是上一级的0.8最小是14
              num  : this.fontLength,    // 每个标题显示的字数显示不玩的会用...代替
            },
            dubclickFS: this.editorDubclick,
            toJsonFS  : this.toJsonFS,
            onlyColor : this.onlyColor, 
          }
        );
    
        window._TOOL = this.editor;
        if(this.value){
          this.editor.fromJson(this.value)
        }
        clearInterval(setTime);
      }
    });
    document.onclick = () => {
      this.selectId = '';
    };
    
    // 初始化数据
  },
  methods: {
    editorDubclick(e, data){
      let dom = this.$refs[this.editorId].getBoundingClientRect();
      e   = e.target.getBoundingClientRect();
      
      this.selectId = data;
      this.selectInputStyle = {
        width      : e.width  - 6 + 'px',
        height     : e.height - 2 + 'px',
        fontSize   : this.selectId.font.size + 'px',
        fontWeight : 'bold',
      };
      this.selectBoxStyle   = {
        width      : e.width  + 'px',
        height     : e.height + 'px',
        fontSize   : this.selectId.font.size + 'px',
        fontWeight : 'bold',
        top        : e.y - dom.y  + 'px',
        left       : e.x - dom.x  + 'px',
      };
      this.titleData.message       = this.selectId.title.tit;
    },
    setTitle(){
      this.selectId.changeTitle(this.titleData.message || 'Create Title');
      this.selectId = '';
    },
    stopDocument(e){   
      e.stopPropagation();
    },
    toJsonFS(){
      if(this.editor){
        this.$emit('update_value', this.editor.toJsonData())
      }
    }
  },
};
</script>

<style lang="scss" scoped>
.mindMapping {
  position: relative;
  #editorMindSVGDom{
    width: 100%;
    height: 100%;
  }
  
  *{
    user-select: none !important;
  }
  .input_text{
    position: absolute;
    top: 0;
    left: 0;
    width: 100px;
    height: 100px;
    background: #fff;
    border-radius: 8px;
    .input_message{
      padding-left:5px;
      outline-style: none;
      border: 0px;
      border-radius: 8px;
    }
    .input_message:focus{
      border: 0px;
      outline: 0;
    }
  }
  
}
svg text {
        font-size: 14px !important;
    }
</style>