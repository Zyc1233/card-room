<template>
  <u-button @click="navigateBack" class="back-button">退出房间</u-button>
</template>

<script>
export default {
  methods: {
    navigateBack() {
       this.$router.push('/pages/reservation/reservation');
    }
  }
};
</script>

<style scoped>
.back-button {
  padding: 10px 15px;
  background-color: #ccc;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.back-button:hover {
  background-color: #bbb;
}
</style> 