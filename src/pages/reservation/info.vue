<template>
  <view class="info-container">
    <u-text 
      type="primary" 
      :bold="true" 
      size="28" 
      text="预约成功 🎉" 
      align="center" 
      margin="0 0 40px 0"
    />
    
    <view class="custom-card">
      <u-text
        v-for="(item, index) in infoItems"
        :key="index"
        :text="item.label + item.value"
        size="16"
        margin="15px 0"
        padding="15px"
        border-left="4px solid #00b38a"
        bg-color="#f8f9fa"
        :custom-style="{borderRadius: '6px'}"
      />
    </view>

    <u-row justify="center" gutter="20">
      <u-col span="3">
        <u-button 
          type="error" 
          text="取消预约"
          @click="cancel"
          custom-style="min-width:80px;border-radius:25px"
        />
      </u-col>
      <u-col span="3">
        <u-button
          type="primary"
          text="前往房间"
          @click="goRoom"
          custom-style="min-width:80px;border-radius:25px"
        />
      </u-col>
    </u-row>
  </view>
</template>

<script>
import { deleteReservation } from '@/utils/db';

export default {
  name: 'Info',
  data() {
    return {
      reservation: {},
      infoItems: []
    };
  },
  created() {
    this.updateReservation();
  },
  beforeRouteUpdate(to, from, next) {
    this.updateReservation();
    next();
  },
  computed: {
    formattedDate() {
      return new Date(this.reservation.date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
  },
  watch: {
    reservation: {
      immediate: true,
      handler(newVal) {
        this.infoItems = [
          // { label: '预约ID：', value: newVal.id || '加载中...' },
          { label: '用户：', value: newVal.user || '未知用户' },
          { label: '房间类型：', value: newVal.roomType || '未知类型' },
          { label: '日期：', value: this.formattedDate || '未选择日期' },
          { label: '时间段：', value: `${newVal.startTime || ''} - ${newVal.endTime || ''}`.trim() || '未选择时间' }
        ]
      }
    }
  },
  methods: {
    updateReservation() {
      this.reservation = {
        id: this.$route.query.id,
        user: this.$route.query.user,
        roomType: this.$route.query.roomType,
        date: this.$route.query.date,
        startTime: this.$route.query.startTime,
        endTime: this.$route.query.endTime
      };
    },
    goRoom() {
      const startDateTime = new Date(`${this.reservation.date}T${this.reservation.startTime}`);
      const endDateTime = new Date(`${this.reservation.date}T${this.reservation.endTime}`);
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
          roomType: this.reservation.roomType,
          date: this.reservation.date,
          startTime: this.reservation.startTime,
          endTime: this.reservation.endTime
        }
      });
    },
    async cancel() {
      try {
        await deleteReservation(this.reservation.id);
        this.$router.push({
          path: '/pages/reservation/reservation',
          query: { 
            refresh: true,
            message: '预约已取消',
            type: 'success'
          }
        });
      } catch (error) {
        console.error('取消错误:', error);
        alert('取消预约失败: ' + error.message);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.info-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  min-height: 100vh;
  box-sizing: border-box;

  .custom-card {
    margin: 0 0 30px 0;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
}

::v-deep .u-btn {
  transition: all 0.3s ease !important;
  &:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 5px 15px rgba(0, 179, 138, 0.3) !important;
  }
}
</style>