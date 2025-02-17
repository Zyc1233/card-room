<template>
  <div class="device-row">
    <span>风扇</span>
    <img :src="imageResource" @click="toggleFan" class="device-icon" />
    <span>{{ switchState ? '风扇已开启' : '风扇已关闭' }}</span>
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
      return this.switchState ? 'static/fan1.png' : 'static/fan2.png';
    }
  },
  methods: {
    toggleFan() {
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