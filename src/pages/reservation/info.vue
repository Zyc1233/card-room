<template>
  <div class="info-container">
    <van-cell-group>
      <text type="primary" :bold="true" size="28" text="预约成功 🎉" align="center" margin="0 0 40px 0" />

      <van-cell v-for="(item, index) in infoItems" :key="index" :title="item.label" :value="item.value" :border="false"
        class="custom-cell" />
    </van-cell-group>

    <van-row class="btn-group">
      <van-col span="11">
        <van-button type="danger" block round @click="cancel" class="action-btn">取消预约</van-button>
      </van-col>
      <van-col span="11" offset="2">
        <van-button type="primary" block round @click="goRoom" class="action-btn">前往房间</van-button>
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
      try {
        // 统一时间格式处理
        const dateStr = this.reservation.date.replace(/[年月]/g, '-').replace(/日/g, '');
        const timeFormat = 'YYYY-MM-DD HH:mm';
        
        // 严格校验时间格式
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(this.reservation.startTime) || !timeRegex.test(this.reservation.endTime)) {
          throw new Error('时间格式应为HH:mm（如09:00）');
        }

        // 构造完整时间对象
        const startTime = dayjs(`${dateStr} ${this.reservation.startTime}`, timeFormat);
        const endTime = dayjs(`${dateStr} ${this.reservation.endTime}`, timeFormat);
        const now = dayjs();

        // 增强有效性检查
        if (!startTime.isValid()) throw new Error(`开始时间无效：${dateStr} ${this.reservation.startTime}`);
        if (!endTime.isValid()) throw new Error(`结束时间无效：${dateStr} ${this.reservation.endTime}`);
        if (startTime.isAfter(endTime)) throw new Error('开始时间不能晚于结束时间');

        // 时间状态检查
        if (now.isBefore(startTime)) {
          this.$toast(`预约将于${startTime.format('HH:mm')}开始`);
          return;
        }
        if (now.isAfter(endTime)) {
          this.$toast(`预约已于${endTime.format('HH:mm')}结束`);
          return;
        }

        // 跳转参数处理
        this.$router.push({
          path: '/pages/room/room',
          query: {
            roomType: encodeURIComponent(this.reservation.roomType),
            startTimestamp: startTime.valueOf(),
            endTimestamp: endTime.valueOf(),
            _t: Date.now()
          }
        });

      } catch (error) {
        console.error('跳转失败:', {
          error,
          date: this.reservation.date,
          start: this.reservation.startTime,
          end: this.reservation.endTime
        });
        this.$toast(error.message || '房间进入失败');
      }
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
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

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
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}
</style>