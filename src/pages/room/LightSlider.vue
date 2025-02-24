<template>
  <van-row class="light-control" justify="space-between" align="center">
    <van-col span="10">
      <span class="label-text">灯光亮度</span>
    </van-col>

    <van-col span="10" class="slider">
      <van-slider v-model="sliderValue" :min="0" :max="100" :step="5" bar-height="3px" button-size="20px"
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
  padding: 16px;
  margin: 10px 0;
  border-radius: 8px;
  background: var(--card-bg);
  box-shadow: 0 2px 12px var(--shadow-color);
}

.label-text {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
}

.slider{
	padding-top: 10px;
}

.text-right {
  text-align: right;
}

.value-display {
  font-size: 16px;
  color: var(--primary-color);
  font-weight: 500;
  filter: brightness(1.2);
}

// 修改时间输入样式
[type="number"] {
  color: var(--text-primary);
}

.van-slider {
  --van-slider-inactive-background: var(--border-color);
  --van-slider-button-background: var(--primary-color);
  
  &__bar {
    background: var(--primary-color);
  }
}

.slider {
  background: var(--button-bg);
  border-radius: 20px;
  padding: 8px 12px;
}
</style>