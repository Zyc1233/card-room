<template>
  <u-tabbar 
    :value="activeIndex" 
    @change="setActive"
    :fixed="true"
    activeColor="#007AFF"
    inactiveColor="#666"
  >
    <u-tabbar-item 
      v-for="(item, index) in navItems"
      :key="index"
      :text="item.text"
      :icon="item.icon"
      :active-icon="item.activeIcon"
    />
  </u-tabbar>
</template>

<script>
const navItems = [
  { text: '房间预约', icon: 'home', activeIcon: 'home-fill', path: '/pages/reservation/reservation' },
  { text: '预约情况', icon: 'list-dot', activeIcon: 'list-dot-fill', path: '/pages/reservation/check' },
  { text: '计算费用', icon: 'coupon', activeIcon: 'coupon-fill', path: '/pages/reservation/cost' },
  { text: '我的', icon: 'account', activeIcon: 'account-fill', path: '/pages/user/user' }
];

export default {
  data: () => ({ navItems }),
  computed: {
    activeIndex() {
      return this.navItems.findIndex(item => this.$route.path.startsWith(item.path));
    }
  },
  methods: {
    setActive(index) {
      this.$router.push(navItems[index].path);
    }
  }
};
</script>

<style scoped>
::v-deep(.u-tabbar) {
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
}

.bottom-nav {
  height: 120rpx; 
  /* 其他样式 */
}
</style>