<template>
  <van-row class="light-control" justify="space-between" align="center">
    <van-col span="10">
      <span class="label-text">灯光亮度</span>
    </van-col>

    <van-col span="10">
      <van-slider v-model="sliderValue" :min="0" :max="100" :step="5" bar-height="4px" button-size="20px"
        active-color="#00b38a" inactive-color="#ebedf0" @change="handleChange" />
    </van-col>

    <van-col span="4" class="text-right">
      <span class="value-display">{{ sliderValue }}%</span>
    </van-col>
  </van-row>
</template>

<script>
import { Slider, Toast } from 'vant';

export default {
  components: {
    [Slider.name]: Slider,
  },
  data() {
    return {
      sliderValue: 75
    }
  },
  methods: {
    handleChange(value) {
      // 可在此处添加亮度调节接口调用
      Toast('当前亮度：' + value)
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
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.label-text {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.text-right {
  text-align: right;
}

.value-display {
  font-size: 16px;
  color: #00b38a;
  font-weight: 500;
}
</style>