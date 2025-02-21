<template>
  <van-row class="device-row" justify="space-between" align="center">
    <van-col span="10">
      <span class="label-text">窗帘控制</span>
    </van-col>

    <van-col span="7" class="text-right">
      <van-switch v-model="switchState" :active-color="activeColor" :inactive-color="inactiveColor" size="24px"
        @change="handleChange" />
    </van-col>

    <van-col span="7" class="text-right">
      <span class="state-text" :class="switchState ? 'active' : 'inactive'">
        {{ switchState ? '窗帘已打开' : '窗帘已关闭' }}
      </span>
    </van-col>
  </van-row>
</template>

<script>
import { Switch } from 'vant';

export default {
  components: {
    [Switch.name]: Switch,
  },
  data() {
    return {
      switchState: false,
      activeColor: '#2979ff',
      inactiveColor: '#ebedf0'
    };
  },
  methods: {
    handleChange(e) {
      // 可在此处添加异步控制逻辑
      console.log('开关状态变更:', e);
    }
  }
};
</script>

<style scoped lang="scss">
.device-row {
  padding: 16px;
  margin: 16px 0;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);

  .label-text {
    font-size: 15px;
    font-weight: 500;
    color: #303133;
  }

  .state-text {
    font-size: 14px;
    font-weight: 600;

    &.active {
      color: #1989fa;
    }
  }

  .van-switch {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
}

.text-right {
  text-align: right;
}
</style>