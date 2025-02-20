<template>
  <div class="info-container">
    <van-cell-group>
      <text 
        type="primary" 
        :bold="true" 
        size="28" 
        text="预约成功 🎉" 
        align="center" 
        margin="0 0 40px 0"
      />
      
      <van-cell 
        v-for="(item, index) in infoItems"
        :key="index"
        :title="item.label"
        :value="item.value"
        :border="false"
        class="custom-cell"
      />
    </van-cell-group>

    <van-row class="btn-group">
      <van-col span="11">
        <van-button
          type="danger"
          block
          round
          @click="cancel"
          class="action-btn"
        >取消预约</van-button>
      </van-col>
      <van-col span="11" offset="2">
        <van-button
          type="primary"
          block
          round
          @click="goRoom"
          class="action-btn"
        >前往房间</van-button>
      </van-col>
    </van-row>
  </div>
</template>

<script>
import { deleteReservation } from '@/utils/db';
import dayjs from 'dayjs';

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
      return dayjs(this.reservation.date).format('YYYY年MM月DD日');
    }
  },
  watch: {
    reservation: {
      immediate: true,
      handler(newVal) {
        this.infoItems = [
          { label: '用户名称：', value: newVal.user || '未知用户' },
          { label: '房间类型：', value: newVal.roomType || '未知类型' },
          { label: '预约日期：', value: this.formattedDate || '未选择日期' },
          { label: '预约时间：', value: `${newVal.startTime || ''} - ${newVal.endTime || ''}`.trim() || '未选择时间' }
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
        date: dayjs(this.$route.query.date).format('YYYY-MM-DD'),
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
  padding: 16px;
  background: #f7f8fa;

  .custom-cell {
    margin: 8px 0;
    border-left: 3px solid #07c160;
    background: #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    
    &::after {
      border: none;
    }
  }
}

.btn-group {
  margin-top: 24px;
  
  .action-btn {
    height: 44px;
    font-size: 16px;
  }
}

::v-deep .van-button {
  transition: all 0.3s ease;
  
  &:active {
    transform: translateY(2px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
}
</style>