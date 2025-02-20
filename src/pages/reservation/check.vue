<template>
  <view class="container">
    <!-- 新增操作按钮组 -->
    <view class="right-button-group">
		<van-button
		plain
		icon="back-top"
		type="primary"
		size="small"
		@click="backTop"
		color="#0055ff"
		>返回顶部</van-button>
      <van-button 
        plain
        icon="replay"
        type="primary" 
        size="small"
        @click="refresh"
      >更新</van-button>
    </view>

    <van-list
      :loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="loadMore"
      class="scroll-list"
    >
      <van-cell 
        v-for="(reservation, index) in reservations"
        :key="index"
        :title="`用户: ${reservation.user} 房间: ${reservation.roomType}`"
        :label="`日期: ${reservation.date} ${reservation.startTime}-${reservation.endTime}`"
      >
        <view class="button-group" slot="right-icon">
          <van-button 
            size="small" 
            type="danger" 
            @click="cancelReservation(index)"
          >取消</van-button>
          <van-button
            size="small"
            type="warning"
            @click="editReservation(index)"
          >修改</van-button>
          <van-button
            size="small"
            type="primary"
            @click="goToRoom(index)"
          >进入</van-button>
        </view>
      </van-cell>
    </van-list>

    <van-toast ref="vanToast"></van-toast>


  </view>
</template>

<script>
import dayjs from 'dayjs';
import { getAllReservations, deleteReservation } from '@/utils/db';
import { Toast, Dialog, Icon } from 'vant';

export default {
  components: {
    [Icon.name]: Icon
  },
  data: () => ({
    reservations: [],
    currentPage: 1,
    pageSize: 15,
    loading: false,
    finished: false,
    showScrollIndicator: false,
    operationFeedback: {
      show: false,
      message: '',
      type: 'success'
    },
  }),
  async created() {
    await this.loadReservations();
  },
  methods: {
    async loadReservations(loadmore = false) {
      try {
        this.loading = true;
        
        const allData = await getAllReservations();
        const start = (this.currentPage - 1) * this.pageSize;
        const newData = allData
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(start, start + this.pageSize)
          .map(reservation => {
            // 格式化日期和时间
            return {
              ...reservation,
              date: dayjs(reservation.date).format('YYYY年MM月DD日'), 
            };
          });

        this.reservations = loadmore 
          ? [...this.reservations, ...newData]
          : newData;

        this.finished = newData.length < this.pageSize;
        this.loading = false;
        
      } catch (error) {
        Toast('加载失败，请检查网络');
        this.loading = false;
        throw error;
      }
    },
    loadMore() {
      if (this.finished) return;
      this.currentPage++;
      this.loadReservations(true);
    },
    async showConfirmModal(title, content) {
      try {
        await Dialog.confirm({
          title,
          message: content
        });
        return true;
      } catch (error) {
        return false;
      }
    },
    async cancelReservation(index) {
      const confirm = await this.showConfirmModal('确认取消', '确定要取消该预约吗？');
      if (!confirm) return;

      try {
        await deleteReservation(this.reservations[index].id);
        await this.loadReservations();
        Toast.success('预约已取消');
      } catch (error) {
        Toast.fail('取消预约失败');
      }
    },
    editReservation(index) {
      const reservation = this.reservations[index];
      this.$router.push({
        path: '/pages/reservation/modify',
        query: {
          id: reservation.id,
          roomType: reservation.roomType,
          date: dayjs(reservation.date, 'YYYY年MM月DD日').format('YYYY-MM-DD'),
          startTime: reservation.startTime,
          endTime: reservation.endTime,
          name: reservation.user
        }
      });
    },
    goToRoom(index) {
      const reservation = this.reservations[index];
      try {
        // 统一日期格式处理
        const rawDate = reservation.date.replace(/[年月]/g, '-').replace(/日/g, '');
        const formattedDate = dayjs(rawDate).format('YYYY-MM-DD');
        
        this.$router.push({
          path: '/pages/room/room',
          query: {
            roomType: reservation.roomType,
            date: formattedDate,
            startTime: reservation.startTime.replace(/[：]/g, ':'),
            endTime: reservation.endTime.replace(/[：]/g, ':')
          }
        });
      } catch (error) {
        Toast.fail('房间信息异常');
        console.error('跳转参数错误:', error);
      }
    },
    async refresh() {
        try {
            await this.loadReservations();
            Toast.success({
                message: '数据已刷新',
                duration: 1500
            });
        } catch (error) {
            Toast.fail({
                message: '刷新失败，请重试',
                duration: 2000
            });
        }
    },
    showFeedback(message, type = 'success') {
      if (type === 'success') {
        Toast.success(message);
      } else if (type === 'error') {
        Toast.fail(message);
      } else {
        Toast(message);
      }
    },
    backTop() {
        // 返回顶部功能
        try {
            // 微信小程序环境
            uni.pageScrollTo({
                scrollTop: 0,
                duration: 100
            });
        } catch (e) {
            // H5环境
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
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

.right-button-group {
  position: fixed;
  right: 1px;
  width: 69px;
  bottom: 100rpx; // 在底部导航上方
  z-index: 1001;
  
  flex-direction: row;
  
  // 适配不同屏幕尺寸
  @media (min-width: 768px) {
    bottom: 160rpx;
    left: 40rpx;
  }
  .van-button {
    margin-right: 8px;
  }
}

.scroll-list {
  height: calc(100vh - 160rpx);
}

.button-group {
  display: flex;
  align-items: center;
  .van-button {
    min-width: 60px;
  }
}

.bottom-nav-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
}

</style>