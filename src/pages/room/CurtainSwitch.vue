<template>
  <div class="device-row">
    <span>窗帘</span>
    <img :src="imageResource" @click="toggleCurtain" class="device-icon" />
    <span>{{ switchState ? '窗帘已拉开' : '窗帘已封闭' }}</span>
  </div>
</template>

<script>
export default {
  data() {
    return {
      switchState: false,
    };
  },
  computed: {
    imageResource() {
      return this.switchState ? 'static/curtain_on.png' : 'static/curtain_off.png';
    }
  },
  methods: {
    toggleCurtain() {
      this.switchState = !this.switchState;
    }
  }
};
</script>

<style scoped>
.device-row {
  display: flex;
  align-items: center;
}
.device-icon {
  width: 50px;
  cursor: pointer;
  margin: 0 10px;
}
</style> 