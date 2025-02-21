<template>
  <div class="room-container">
    <!-- 使用Vant官方倒计时组件 -->
    <van-count-down class="countdown-cell" :time="timeDiff" :auto-start="false" :format="timeFormat">
      <template #default="timeData">
        <div class="countdown-box">
          <van-tag :type="timeStatus.type" class="status-tag">
            {{ timeStatus.text }}
          </van-tag>
          <span class="countdown-text">
            {{ timeData.hours }}时{{ timeData.minutes }}分{{ timeData.seconds }}秒
          </span>
        </div>
      </template>
    </van-count-down>

    <!-- 房间信息使用卡片布局 -->
    <van-card class="info-card">
      <template #desc>
        <div class="card-content">
          <van-row class="vertical-layout">
            <van-col span="24" class="info-item">
              <div class="info-content">
                <van-icon name="home-o" class="info-icon" />
                <div class="text-group">
                  <span class="info-label">当前房间</span>
                  <span class="info-value">{{ currentRoom }}</span>
                </div>
              </div>
            </van-col>

            <van-col span="24" class="info-item">
              <div class="info-content">
                <van-icon name="clock-o" class="info-icon" />
                <div class="text-group">
                  <span class="info-label">预约时间</span>
                  <span class="info-value">{{ reservationTime || '加载中...' }}</span>
                </div>
              </div>
            </van-col>
          </van-row>
        </div>
      </template>
    </van-card>

    <!-- 环境状态卡片 -->
    <van-card class="status-card">
      <template #desc>
        <div class="card-content">
          <van-row gutter="10">
            <van-col span="12">温度：{{ temperature }}°C</van-col>
            <van-col span="12">湿度：{{ humidity }}%</van-col>
          </van-row>

          <!-- 设备控制区域 -->
          <div class="device-panel">
            <DoorSwitch />
            <CurtainSwitch />
            <FanSwitch />
            <LightSlider />
          </div>
        </div>
      </template>
    </van-card>

    <!-- 底部退出按钮 -->
    <div class="footer">
      <RoomBackButton />
    </div>
  </div>
</template>

<script>
import { Cell, Card, Row, Col, Toast, CountDown } from 'vant';
import DoorSwitch from './DoorSwitch.vue';
import CurtainSwitch from './CurtainSwitch.vue';
import FanSwitch from './FanSwitch.vue';
import LightSlider from './LightSlider.vue';
import RoomBackButton from './RoomBackButton.vue';
import dayjs from 'dayjs';

export default {
  components: {
    [Cell.name]: Cell,
    [Card.name]: Card,
    [Row.name]: Row,
    [Col.name]: Col,
    [CountDown.name]: CountDown,
    DoorSwitch,
    CurtainSwitch,
    FanSwitch,
    LightSlider,
    RoomBackButton
  },
  data() {
    return {
      formattedTime: '',
      timeDiff: 0,
      endTime: 0,
      currentRoom: decodeURIComponent(this.$route.query.roomType) || '未知房间',
      timer: null,
      temperature: 16,
      humidity: 75,
      startTime: 0,
      timeStatus: { type: 'primary', text: '等待开始' },
    };
  },
  computed: {
    formattedDate() {
      if (!this.$route.query.date) return '';
      const date = new Date(this.$route.query.date);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    },
    timeFormat() {
      return this.timeStatus.type === 'primary' ? 'HH时mm分ss秒' : 'HH时mm分ss秒';
    },
    reservationTime() {
      try {
        const start = dayjs(parseInt(this.$route.query.startTimestamp));
        const end = dayjs(parseInt(this.$route.query.endTimestamp));
        
        if (!start.isValid() || !end.isValid()) {
          throw new Error('无效的时间戳');
        }

        return `${start.format('YYYY年MM月DD日 HH:mm')} - ${end.format('HH:mm')}`;
        
      } catch (e) {
        console.error('时间显示异常:', e);
        return '时间显示异常，请联系管理员';
      }
    }
  },
  watch: {
    '$route.query': {
      immediate: true,
      handler() {
        this.currentRoom = decodeURIComponent(this.$route.query.roomType) || '未知房间';
        this.initCountdown();
      }
    }
  },
  mounted() {
    this.initCountdown();
  },
  beforeDestroy() {
    clearInterval(this.timer); // 清理定时器
  },
  methods: {
    initCountdown() {
      try {
        // 获取并解码路由参数
        const startTimestamp = parseInt(decodeURIComponent(this.$route.query.startTimestamp));
        const endTimestamp = parseInt(decodeURIComponent(this.$route.query.endTimestamp));
        const now = dayjs().valueOf();

        // 增强参数验证
        if (isNaN(startTimestamp) || isNaN(endTimestamp) || startTimestamp >= endTimestamp) {
          throw new Error('无效的时间参数，请检查预约时间');
        }

        // 时间状态判断
        if (now < startTimestamp) {
          this.timeStatus = { type: 'primary', text: '等待开始' };
          this.timeDiff = startTimestamp - now;
        } else if (now <= endTimestamp) {
          this.timeStatus = { type: 'success', text: '使用中' };
          this.timeDiff = endTimestamp - now;
        } else {
          this.timeStatus = { type: 'danger', text: '已结束' };
          this.timeDiff = 0;
        }

        // 启动倒计时
        this.startCountdown();

      } catch (error) {
        console.error('倒计时初始化失败:', error);
        Toast.fail(error.message || '时间参数错误');
        setTimeout(() => this.exitRoom(), 2000);
      }
    },
    startCountdown() {
      // 清除旧定时器
      if (this.timer) clearInterval(this.timer);
      
      // 每秒更新一次
      this.timer = setInterval(() => {
        this.timeDiff -= 1000;
        
        if (this.timeDiff <= 0) {
          clearInterval(this.timer);
          this.handleTimeFinish();
        }
      }, 1000);
    },
    handleTimeFinish() {
      Toast({
        message: '预约时间已结束',
        duration: 1500,
        onClose: () => this.exitRoom()
      });
    },
    exitRoom() {
      this.$router.push('/pages/reservation/check');
    },
    cleanTime(time) {
      return (time || '')
        .replace(/[\u200b-\u200d\ufeff]/g, '') // 清除零宽字符
        .replace(/[^0-9:：]/g, '')  
        .replace(/[：]/g, ':')     
        .replace(/(\d{1,2})(\d{2})$/, '$1:$2');
    },
  }
};
</script>

<style scoped lang="scss">
.room-container {
  padding: 16px;
  background: linear-gradient(180deg, #f7f8fa 0%, #f0f2f5 100%);
  min-height: 100vh;
}

.countdown-cell {
  margin: 0 0 20px;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(25, 137, 250, 0.1);
  background: white;

  ::v-deep .van-count-down {
    font-size: 16px;
    color: #1989fa;
    font-weight: 600;
    padding: 14px 16px;
  }

  .countdown-text {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.info-card,
.status-card {
  margin: 20px 0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);

  ::v-deep .van-card__content {
    padding: 24px;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 24px;
      right: 24px;
      height: 2px;
      background: linear-gradient(90deg, #1989fa33 0%, #1989fa 50%, #1989fa33 100%);
    }
  }
}

.card-content {
  font-size: 15px;
  color: #303133;
  line-height: 1.7;

  .van-row {
    margin: 12px -8px;

    .van-col {
      padding: 8px;
      display: flex;
      align-items: center;
      font-weight: 500;

      &::before {
        content: '';
        width: 6px;
        height: 6px;
        background: #1989fa;
        border-radius: 50%;
        margin-right: 10px;
      }
    }
  }
}

.device-panel {
  margin-top: 28px;
  background: white;
  padding: 8px 16px;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);

  >* {
    margin: 16px 0;
    transition: transform 0.2s;

    &:active {
      transform: scale(0.98);
    }
  }
}

.footer {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 86%;
  max-width: 360px;

  ::v-deep .van-button {
    width: 100%;
    height: 48px;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 0.5px;
    box-shadow: 0 6px 20px rgba(25, 137, 250, 0.2);
    transition: all 0.2s;

    &:active {
      transform: translateY(2px);
      box-shadow: 0 3px 12px rgba(25, 137, 250, 0.2);
    }
  }
}

.countdown-box {
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  // 不同状态下的样式
  &[data-status="waiting"] .status-tag {
    background: #1989fa;
  }
  &[data-status="using"] .status-tag {
    background: #07c160;
  }
  &[data-status="ended"] .status-tag {
    background: #ee0a24;
  }
}

.status-tag {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}

.vertical-layout {
  .info-item {
    padding: 16px 0;
    position: relative;

    &:not(:last-child)::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: #f0f0f0;
    }
  }

  .info-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .info-icon {
    font-size: 20px;
    color: #1989fa;
    flex-shrink: 0;
  }

  .text-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .info-label {
    font-size: 13px;
    color: #909399;
  }

  .info-value {
    font-size: 15px;
    color: #303133;
    font-weight: 500;
    white-space: nowrap; // 防止换行
    transition: all 0.3s ease;
    
    &.updated {
      animation: highlight 1.5s ease;
    }
  }
}

@keyframes highlight {
  0% { background-color: rgba(25, 137, 250, 0.1); }
  100% { background-color: transparent; }
}
</style>