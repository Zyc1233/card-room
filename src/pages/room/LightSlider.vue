<template>
  <div class="light-control">
    <span>灯光：</span>
    <vue-slide-bar v-model="sliderValue" class="light-slider"/>
    <b>{{ sliderValue }}%</b>
  </div>
</template>

<script>
import Vue from 'vue'
import VueSlideBar from 'vue-slide-bar'

export default {
  data() {
    return {
      sliderValue: 80
    }
  },
  methods: {
    handleInput() {
      // 这里可以添加与后端交互的逻辑
      console.log('当前亮度：', this.sliderValue)
    }
  },
  components: {
    VueSlideBar
  }
}
</script>

<style scoped>
.light-control {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
}

.light-slider {
  flex: 1;
  width: 250px; /* 设置滑动条的宽度 */
  height: 80px; /* 设置滑动条的高度 */
  background: #ffffff;
  border-radius: 4px;
  outline: none;
}

/* 滑动条轨道样式 */
.light-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 50px;
  background: #00b38a;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.3s;
}

.light-slider::-moz-range-thumb {
  width: 20px;
  height: 50px;
  background: #00b38a;
  border-radius: 50%;
  cursor: pointer;
}

.value-display {
  min-width: 40px;
  text-align: center;
  font-weight: bold;
  color: #00b38a;
}
</style>