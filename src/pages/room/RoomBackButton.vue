<template>
  <van-button type="default" size="small" round class="back-button" color="#ccc" @click="navigateBack">
    <van-icon name="arrow-left" />
    退出房间
  </van-button>
</template>

<script>
import { Button, Icon } from 'vant';

export default {
  components: {
    [Button.name]: Button,
    [Icon.name]: Icon
  },
  methods: {
    navigateBack() {
      this.$router.push('/pages/reservation/reservation');
    }
  }
};
</script>

<style scoped>
.back-button {
  width: 100px;

}
</style>