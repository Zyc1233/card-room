<template>
  <view class="container">
	<u-toast ref="uToast"></u-toast> 
    <!-- 新增操作按钮组 -->
    <view class="left-button-group">
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
      
	  <!-- 修改后的返回顶部组件 -->
	  <u-back-top 
	    :scroll-top="scrollTop"
	    icon="arrow-upward"
	    mode="circle"
	    top="0"
		duration="100"
	    :bottom="100"
	    :right="20"
		z-index="9"
	    @click="scrollToTop"
		:iconStyle="iconStyle"
	  ></u-back-top>
	  
      <u-loadmore 
        :status="loadStatus"
        :load-text="{
          loadmore: '点击加载更多',
          loading: '正在加载',
          nomore: '没有更多了'
        }"
      />
    </u-list>


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
	mode: 'square',
	iconStyle: {
		fontSize: '32rpx',
		color: '#2979ff'
	}
  }),
  async created() {
    await this.loadReservations();
  },
  methods: {
    async loadReservations(loadmore = false) {
      try {
        this.loadStatus = 'loading';
        
        const res = await getAllReservations();
        const allData = res.sort((a, b) => b.timestamp - a.timestamp)
          .map(item => ({
            ...item,
            date: item.date.replace(/\//g, '-') // 统一日期格式
          }));
        
        // 模拟分页逻辑
        const start = (this.currentPage - 1) * this.pageSize;
        const newData = allData.slice(start, start + this.pageSize);

        this.reservations = loadmore 
          ? [...this.reservations, ...newData]
          : newData;

        this.loadStatus = newData.length >= this.pageSize ? 'loadmore' : 'nomore';
        
      } catch (error) {
        this.showFeedback('加载失败: ' + error.errMsg, 'error');
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
        this.showFeedback('还未到预约时间，无法进入房间', 'warning');
        return;
      }
      if (now > endDateTime) {
        this.showFeedback('预约时间已结束，无法进入房间', 'warning');
        return;
      }
      
      this.$router.push({
        path: '/pages/room/room',
        query: {
          roomType: reservation.roomType,
          date: reservation.date,
          startTime: reservation.startTime,
          endTime: reservation.endTime
        }
      });
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
    },
    scrollToTop() {
      uni.pageScrollTo({
        scrollTop: 0,
        duration: 100
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
  onPageScroll(e) {
    this.scrollTop = e.scrollTop;
  },
};
</script>

<style lang="scss" scoped>
.container {
  height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  position: relative;
  padding-bottom: 120rpx; // 为底部导航留出空间
  overflow-y: auto;
}

.left-button-group {
  position: fixed;
  right: 50rpx; // 给返回按钮留出空间
  bottom: 100rpx; // 调整原有按钮组位置
  z-index: 1001;
  
  @media (min-width: 768px) {
    right: 120rpx;
    bottom: 300rpx;
  }
}

.scroll-list {
  height: calc(100vh - 160rpx);
  ::v-deep .u-list {
   	padding: 0;
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
</style>