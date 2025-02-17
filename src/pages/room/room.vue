<template>
  <div class="room-container">
    <div class="countdown">
      剩余时间：{{ remainingTime }}
    </div>
    <div class="room-info">
      <p>当前房间：{{ currentRoom }}</p>
      <p>预约时间：{{ reservationTime }}</p>
    </div>
    <div class="status-info">
      <p>温度：{{ temperature }}°C</p>
      <p>湿度：{{ humidity }}%</p>
      <div class="device-control">
        <DoorSwitch />
        <CurtainSwitch />
        <FanSwitch />
        <LightSlider />
      </div>
    </div>
    <RoomBackButton @click="exitRoom" />
  </div>
</template>

<script>
import DoorSwitch from './DoorSwitch.vue';
import CurtainSwitch from './CurtainSwitch.vue';
import FanSwitch from './FanSwitch.vue';
import LightSlider from './LightSlider.vue';
import RoomBackButton from './RoomBackButton.vue';

export default {
  components: {
    DoorSwitch,
    CurtainSwitch,
    FanSwitch,
    LightSlider,
    RoomBackButton
  },
  data() {
    return {
      remainingTime: '00:00:00',
      currentRoom: this.$route.query.roomType || '未知房间',
      reservationTime: '',
      endTimestamp: 0,
      timer: null,
      temperature: 16,
      humidity: 75,
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
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    initCountdown() {
      clearInterval(this.timer); // 清除旧定时器
      const start = `${this.$route.query.date}T${this.$route.query.startTime}`;
      const end = `${this.$route.query.date}T${this.$route.query.endTime}`;
      
      const startTime = new Date(start).getTime();
      const endTime = new Date(end).getTime();
      this.endTimestamp = endTime;

      this.reservationTime = `${this.formattedDate} ${this.$route.query.startTime}-${this.$route.query.endTime}`;
      
      this.updateTime(); 
      
      this.timer = setInterval(this.updateTime, 1000);
    },
    updateTime() {
      const now = Date.now();
      const diff = this.endTimestamp - now;

      if (diff <= 0) {
        this.remainingTime = '00:00:00';
        clearInterval(this.timer);
        alert('预约时间已结束');
        this.exitRoom();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      this.remainingTime = 
        `${hours.toString().padStart(2, '0')}小时
         ${minutes.toString().padStart(2, '0')}分
         ${seconds.toString().padStart(2, '0')}秒`.replace(/\s+/g, ' ');
    },
    exitRoom() {
      this.$router.push('/pages/reservation/check');
    }
  }
};
</script>

<style scoped>
.room-container {
  padding: 20px;
}

.countdown {
  font-size: 30px;
  font-weight: bold;
  margin-bottom: 20px;
}

.room-info {
  margin-bottom: 20px;
  font-size: 30px;
}

.status-info {
  font-size: 30px;
  margin-bottom: 20px;
}

.device-control {
  display: flex;
  font-size: 30px;
  text-align: center;
  flex-direction: column;
  gap: 15px;
}

.exit-button {
  padding: 12px 24px;
  background: #ff4d4d;
  color: white;
  border-radius: 25px;
  font-size: 1rem;
  transition: all 0.3s ease;
}
.exit-button:hover {
  background: #ff3333;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 77, 77, 0.3);
}
</style>