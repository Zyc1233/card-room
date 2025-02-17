<template>
  <div class="device-row">
    <span>门禁</span>
    <img :src="imageResource" @click="toggleDoor" class="device-icon" />
    <span>{{ switchState ? '门已打开' : '门已关闭' }}</span>
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
      return this.switchState ? 'static/door_on.png' : 'static/door_off.png';
    }
  },
  methods: {
    toggleDoor() {
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