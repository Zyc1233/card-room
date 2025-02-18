<template>
  <u-row class="device-row" justify="space-between" align="center">
    <u-col span="5">
      <text class="u-font-sm">门禁控制</text>
    </u-col>
    
    <u-col span="3" class="u-text-right">
      <u-switch 
        v-model="switchState"
        :active-color="activeColor"
        :inactive-color="inactiveColor"
        size="40"
        @change="handleChange"
      ></u-switch>
    </u-col>

    <u-col span="3" class="u-text-right">
      <text class="state-text" :class="switchState ? 'active' : 'inactive'">
        {{ switchState ? '门已开启' : '门已关闭' }}
      </text>
    </u-col>
  </u-row>
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
  padding: 10px;
  margin: 10px 0;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.state-text {
  font-size: 12px;
  &.active {
    color: #2979ff;
  }
  &.inactive {
    color: #909399;
  }
}
</style> 