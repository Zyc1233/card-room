<template>
  <view class="container">
    <!-- 新增操作按钮组 -->
    <view class="left-button-group">
		<u-button
		  type="error" 
		  icon="arrow-leftward" 
		  size="small"
		  @click="logout"
		>退出登录</u-button>
      <u-button 
        type="primary" 
        icon="reload" 
        size="small"
        @click="refresh"
        customStyle="margin-right: 8px"
      >更新</u-button>
    </view>

    <u-list
      ref="scrollContainer"
      :scroll-top="scrollTop"
      :lower-threshold="50"
      :pre-load-screen="1.5"
      enable-flex
      @scrolltolower="loadMore"
      @scroll="handleScroll"
      class="scroll-list"
    >
      <u-list-item 
        v-for="(reservation, index) in reservations"
        :key="index"
        :anchor="index"
      >
        <u-cell
          :title="`用户: ${reservation.user} 房间: ${reservation.roomType}`"
          :label="`日期: ${reservation.date} ${reservation.startTime}-${reservation.endTime}`"
        >
          <template #right-icon>
            <view class="button-group">
              <u-button 
                text="取消"
                size="small" 
                type="error" 
                @click="cancelReservation(index)"
                customStyle="margin-left: 8px"
              ></u-button>
              <u-button
                text="修改"
                size="small"
                type="warning"
                @click="editReservation(index)"
                customStyle="margin-left: 8px"
              ></u-button>
              <u-button
                text="进入"
                size="small"
                type="primary"
                @click="goToRoom(index)"
                customStyle="margin-left: 8px"
              ></u-button>
            </view>
          </template>
        </u-cell>
      </u-list-item>
      
      <u-loadmore 
        :status="loadStatus"
        :load-text="{
          loadmore: '点击加载更多',
          loading: '正在加载',
          nomore: '没有更多了'
        }"
      />
    </u-list>

    <u-toast ref="uToast"></u-toast>

    <!-- 添加返回顶部按钮 -->
    <u-back-top 
      :scroll-top="scrollTop"
      icon="arrow-upward"
      :duration="300"
      :top="100"
      :icon-style="iconStyle"
      @click="scrollToTop"
      :custom-style="{bottom: '160px'}"
    ></u-back-top>

    <!-- 添加底部导航 -->
    <view class="bottom-nav-wrapper">
      <BottomNav activeIndex="1" />
    </view>
  </view>
</template>

<script>
import BottomNav from '@/pages/BottomNav/BottomNav.vue';
import { getAllReservations, deleteReservation } from '@/utils/db';

export default {
  components: {
    BottomNav
  },
  data: () => ({
    reservations: [],
    currentPage: 1,
    pageSize: 15,
    loadStatus: 'loadmore',
    showScrollIndicator: false,
    operationFeedback: {
      show: false,
      message: '',
      type: 'success'
    },
    scrollTop: 0,
    // 添加按钮样式配置
    iconStyle: {
      backgroundColor: '#2979ff',
      color: '#fff'
    }
  }),
  async created() {
    await this.loadReservations();
  },
  methods: {
    async loadReservations(loadmore = false) {
      try {
        this.loadStatus = 'loading';
        
        const allData = await getAllReservations();
        // 模拟分页逻辑
        const start = (this.currentPage - 1) * this.pageSize;
        const newData = allData
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(start, start + this.pageSize);

        this.reservations = loadmore 
          ? [...this.reservations, ...newData]
          : newData;

        this.loadStatus = newData.length >= this.pageSize ? 'loadmore' : 'nomore';
        
      } catch (error) {
        this.showFeedback('加载失败', 'error');
        this.loadStatus = 'loadmore';
      }
    },
    loadMore() {
      if (this.loadStatus === 'nomore') return;
      this.currentPage++;
      this.loadReservations(true);
    },
    async showConfirmModal(title, content) {
      try {
        const res = await uni.showModal({
          title,
          content,
          showCancel: true
        });
        
        return { confirm: res.confirm };
      } catch (error) {
        console.error('弹窗错误:', error);
        return { confirm: false };
      }
    },
    async cancelReservation(index) {
      const { confirm } = await this.showConfirmModal('确认取消', '确定要取消该预约吗？');
      if (!confirm) return;

      try {
        await deleteReservation(this.reservations[index].id);
        await this.loadReservations();
        this.showFeedback('预约已取消');
      } catch (error) {
        this.showFeedback('取消预约失败', 'error');
        console.error('取消预约错误:', error);
      }
    },
    editReservation(index) {
      const reservation = this.reservations[index];
      this.$router.push({
        path: '/pages/reservation/modify',
        query: {
          id: reservation.id,
          roomType: reservation.roomType,
          date: reservation.date,
          startTime: reservation.startTime,
          endTime: reservation.endTime,
          name: reservation.user,
          _t: Date.now()
        }
      });
    },
    goToRoom(index) {
      const reservation = this.reservations[index];
      const startDateTime = new Date(`${reservation.date}T${reservation.startTime}`);
      const endDateTime = new Date(`${reservation.date}T${reservation.endTime}`);
      const now = new Date();
      
      if (now < startDateTime) {
        alert('还未到预约时间，无法进入房间');
        return;
      }
      if (now > endDateTime) {
        alert('预约时间已结束，无法进入房间');
        return;
      }
      
      this.$router.push({
        path: '/pages/room/room',
        query: {
          roomType: reservation.roomType,
          date: reservervation.date,
          startTime: reservation.startTime,
          endTime: reservation.endTime
        }
      });
    },
    async logout() {
      const { confirm } = await this.showConfirmModal('确认退出', '确定要退出登录吗？');
      if (!confirm) return;

      try {
        uni.navigateTo({
          url: '/pages/login/login'
        });
        this.showFeedback('已退出登录');
      } catch (error) {
        this.showFeedback('退出登录失败', 'error');
        console.error('路由跳转错误:', error);
      }
    },
    refresh() {
      this.loadReservations();
      this.$refs.uToast.show({
        type: 'success',
        message: '数据已更新'
      })
    },
    showFeedback(message, type = 'success') {
      if (this.$refs.uToast) {
        this.$refs.uToast.show({
          type,
          message,
          icon: type === 'success' ? 'checkmark-circle' : 'close-circle'
        });
      } else {
        console.warn('uToast组件未初始化');
        uni.showToast({
          title: message,
          icon: 'none'
        });
      }
    },
    handleScroll(e) {
      if (!e.detail) return;
      this.scrollTop = e.detail.scrollTop || 0;
    },
    // 添加返回顶部方法
    scrollToTop() {
      this.scrollTop = this.scrollTop ? 0 : 1;
      this.$nextTick(() => {
        this.scrollTop = 0;
      });
    },
  },
  watch: {
    '$route'(to, from) {
      if (to.query.refresh) {
        this.loadReservations();
        this.showFeedback('预约信息已更新', 'success');
      }
    }
  },
  onReady() {
    this.scrollTop = 1; // 触发响应式更新
  },
  onPageScroll(e) {  // 必须使用页面滚动监听
    this.scrollTop = e.scrollTop;
  }
};
</script>

<style lang="scss" scoped>
.container {
  height: 100vh;
  box-sizing: border-box;
  position: relative;
  padding-bottom: 120rpx; // 为底部导航留出空间
  overflow-y: auto;
}

.left-button-group {
  position: fixed;
  left: 10rpx;
  width: 200px;
  bottom: 100rpx; // 在底部导航上方
  z-index: 1001;
  display: flex;
  flex-direction: row;
  
  // 适配不同屏幕尺寸
  @media (min-width: 768px) {
    bottom: 160rpx;
    left: 40rpx;
  }
}

.scroll-list {
  height: calc(100vh - 160rpx);
  ::v-deep .u-list {
    // 保持原有滚动容器样式
  }
}

.button-group {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-right: -10rpx;
}

::v-deep .u-cell__body {
  padding: 20rpx 0 !important;
}

.bottom-nav-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
}

// 添加返回顶部按钮样式
::v-deep .u-back-top {
  bottom: 160px !important;
  right: 30rpx;
  z-index: 1002;
  
  @media (min-width: 768px) {
    bottom: 200px;
    right: 60rpx;
  }
}
</style>