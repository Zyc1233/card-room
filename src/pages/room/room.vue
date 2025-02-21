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
      currentRoom: this.$route.query.roomType || '未知房间',
      timer: null,
      temperature: 16,
      humidity: 75,
      startTime: 0,
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
    timeStatus() {
      const now = Date.now();
      if (now < this.startTime) {
        return { type: 'primary', text: '等待开始' };
      } else if (now <= this.endTime) {
        return { type: 'success', text: '使用中' };
      }
      return { type: 'danger', text: '已结束' };
    },
    timeFormat() {
      return this.timeStatus.type === 'primary' ? 'HH时mm分ss秒' : 'HH时mm分ss秒';
    },
    reservationTime() {
      try {
        console.log('[调试] 原始路由参数:', JSON.parse(JSON.stringify(this.$route.query)));

        // 统一日期处理（支持中英文格式）
        const parseChineseDate = (dateStr) => {
          return dayjs(dateStr.replace(/[年月]/g, '-').replace(/日/g, ''), 'YYYY-MM-DD');
        };

        // 统一时间处理（支持无冒号格式）
        const parseTime = (timeStr) => {
          // 加强时间清洗逻辑
          const cleaned = String(timeStr)
            .replace(/[^0-9]/g, '')    // 移除非数字字符
            .padStart(4, '0')          // 确保4位数字
            .slice(0, 4);              // 截取前4位
          
          console.log('清洗后的时间:', cleaned); // 添加调试日志
          
          // 使用dayjs对象直接设置时间
          const timeObj = dayjs()
            .hour(cleaned.slice(0, 2))
            .minute(cleaned.slice(2, 4))
            .second(0);

          console.log('解析时间结果:', {
            input: timeStr,
            cleaned,
            formatted: timeObj.format('HH:mm'),
            valid: timeObj.isValid()
          });

          return timeObj;
        };

        // 解析参数
        const date = parseChineseDate(this.$route.query.date);
        const start = parseTime(this.$route.query.startTime);
        const end = parseTime(this.$route.query.endTime);

        console.log('[调试] 解析结果:', {
          date: date.format(),
          start: start.format(),
          end: end.format(),
          dateValid: date.isValid(),
          startValid: start.isValid(),
          endValid: end.isValid()
        });

        if (!date.isValid() || !start.isValid() || !end.isValid()) {
          throw new Error('时间参数解析失败');
        }

        // 统一格式输出
        return `${date.format('YYYY年MM月DD日')} ${start.format('HH:mm')} - ${end.format('HH:mm')}`;
        
      } catch (e) {
        console.error('时间处理错误:', e);
        return '时间显示异常';
      }
    }
  },
  watch: {
    '$route.query': {
      immediate: true,
      handler() {
        this.currentRoom = this.$route.query.roomType || '未知房间';
        this.initCountdown(); // 路由参数变化时重新初始化倒计时
      }
    }
  },
  mounted() {
    this.initCountdown();
    this.connectWebSocket();
  },
  beforeDestroy() {
    clearInterval(this.timer); // 清理定时器
  },
  methods: {
    initCountdown() {
      try {
        const decodedDate = decodeURIComponent(this.$route.query.date);
        const decodedStart = decodeURIComponent(this.$route.query.startTime);
        const decodedEnd = decodeURIComponent(this.$route.query.endTime);

        // 适配中文日期格式（YYYY年MM月DD日）
        const dateObj = dayjs(decodedDate, 'YYYY年MM月DD日');
        
        // 处理时间格式（支持HH:mm或HH时mm分）
        const parseTime = (timeStr) => {
          const [hours, minutes] = timeStr.replace(/[^0-9]/g, ':').split(':');
          return dateObj.hour(hours).minute(minutes || 0);
        };

        this.startTime = parseTime(decodedStart);
        this.endTime = parseTime(decodedEnd);

        // 初始化倒计时
        this.calculateTimeDiff();

        // 启动定时器
        this.timer = setInterval(() => {
          this.calculateTimeDiff();
        }, 1000);

        console.log('接收的时间参数:', {
          date: this.$route.query.date,
          startTime: this.$route.query.startTime,
          endTime: this.$route.query.endTime
        });

      } catch (error) {
        console.error('倒计时初始化失败:', error);
        Toast.fail('时间参数错误，无法启动倒计时');
      }
    },
    calculateTimeDiff() {
      const now = Date.now();

      // 验证时间有效性
      if (isNaN(this.startTime) || isNaN(this.endTime)) {
        console.error('无效的时间参数:', {
          start: this.startTime,
          end: this.endTime
        });
        this.timeDiff = 0;
        return;
      }

      if (now < this.startTime) {
        this.timeDiff = this.startTime - now;
      } else if (now <= this.endTime) {
        this.timeDiff = this.endTime - now;
      } else {
        this.timeDiff = 0;
        clearInterval(this.timer);
      }

      if (this.timeDiff <= 0) {
        clearInterval(this.timer);
        this.handleTimeFinish();
      }
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
    connectWebSocket() {
      const ws = new WebSocket('wss://your-api/env');
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.temperature = data.temperature;
        this.humidity = data.humidity;
      };
      ws.onerror = (error) => {
        console.error('WebSocket错误:', error);
        Toast('环境状态连接异常');
      };
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