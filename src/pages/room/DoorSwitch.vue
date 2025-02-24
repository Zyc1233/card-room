<template>
  <van-row class="device-row" justify="space-between" align="center">
    <van-col span="10">
      <span class="label-text">门禁控制</span>
    </van-col>

    <van-col span="7" class="text-right">
      <van-switch v-model="switchState" :active-color="activeColor" :inactive-color="inactiveColor" size="24px"
        @change="handleChange" />
    </van-col>

    <van-col span="7" class="text-right">
      <span class="state-text" :class="switchState ? 'active' : 'inactive'">
        {{ switchState ? '门禁已打开' : '门禁已关闭' }}
      </span>
    </van-col>
  </van-row>
</template>

<script>
export default {
  data() {
    return {
      switchState: false,
      activeColor: '#2979ff',
      inactiveColor: '#ebedf0'
    };
  },
  methods: {
    handleChange(e) {
      // 可在此处添加风扇控制接口调用
      console.log('门禁状态变更:', e);
    }
  }
};
</script>

<style scoped lang="scss">
.device-row {
  padding: 16px;
  margin: 16px 0;
  border-radius: 12px;
  background: var(--card-bg);
  box-shadow: 0 4px 12px var(--shadow-color);

  .label-text {
    font-size: 15px;
    font-weight: 500;
    color: var(--text-primary);
  }

  .state-text {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-secondary);

    &.active {
      color: var(--primary-color);
      filter: brightness(1.2);
    }
  }

  .van-switch {
    &--on {
      background: var(--primary-color);
    }
    
    &--off {
      background: var(--button-bg);
    }
  }
}

.text-right {
  text-align: right;
}

.state-text.inactive {
  color: var(--text-secondary);
  opacity: 0.8;
}
</style>