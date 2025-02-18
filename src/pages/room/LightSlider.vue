<template>
  <u-row class="light-control" justify="space-between" align="center">
    <u-col span="5">
      <text class="u-font-sm">灯光亮度</text>
    </u-col>
    
    <u-col span="6">
      <u-slider
        v-model="sliderValue"
        :min="0"
        :max="100"
        :step="5"
        block-size="20"
        active-color="#00b38a"
        inactive-color="#ebedf0"
        @change="handleChange"
      ></u-slider>
    </u-col>

    <u-col span="3" class="u-text-right">
      <text class="value-display">{{ sliderValue }}%</text>
    </u-col>
  </u-row>
</template>

<script>
export default {
  data() {
    return {
      sliderValue: 75
    }
  },
  methods: {
    handleChange(value) {
      // 可在此处添加亮度调节接口调用
      console.log('当前亮度：', value)
    }
  }
}
</script>

<style scoped lang="scss">
.light-control {
  padding: 10px;
  margin: 10px 0;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.value-display {
  font-size: 16px;
  color: #00b38a;
  font-weight: bold;
}
</style>