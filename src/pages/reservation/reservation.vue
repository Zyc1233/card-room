<template>
  <div class="room-reservation">
    <!-- 轮播图 -->
    <div class="carousel">
      <button @click="prevImage" class="carousel-control prev">〈</button>
      <div
        v-for="(image, index) in images"
        :key="index"
        class="carousel-item"
        :style="{ transform: `translateX(-${currentImage * 100}%)` }"
      >
        <img :src="image" alt="房间图片" />
      </div>
      <button @click="nextImage" class="carousel-control next">〉</button>
    </div>
    <!-- 价格信息区域 -->
    <div class="pricing-info">
      <div
        v-for="(price, index) in prices"
        :key="index"
        class="pricing-item"
        :style="{ transform: `translateX(-${currentPrice * 100}%)` }"
      >
        <p>{{ price }}</p>
      </div>
    </div>
    <!-- 表单容器 -->
    <div class="form-container">
      <form @submit.prevent="submitForm">
        <!-- 房间类型选择 -->
        <div class="form-group">
          <label for="room-type">请选择房间类型</label>
          <select id="room-type" v-model="roomType">
            <option value="扑克室1">扑克室1</option>
			<option value="扑克室2">扑克室2</option>
            <option value="麻将室1">麻将室1</option>
			<option value="麻将室2">麻将室2</option>
            <option value="象棋室1">象棋室1</option>
			<option value="象棋室2">象棋室2</option>
            <option value="桌游室1">桌游室1</option>
			<option value="桌游室2">桌游室2</option>
          </select>
        </div>
        <!-- 预约日期选择 -->
        <div class="form-group">
          <label for="date">请选择预约日期</label>
          <input type="text" id="date" v-model="date" @click="openDatePicker" readonly />
          <div v-if="showDatePicker" class="date-picker-modal">
            <div class="header-date">
              <button @click="prevMonth" class="month-switch-button"><</button>
              <span>{{ selectedYear }}年{{ selectedMonth }}月</span>
              <button @click="nextMonth" class="month-switch-button">></button>
            </div>
            <div class="date-week">
              <div v-for="day in daysOfWeek" :key="day">{{ day }}</div>
            </div>
            <div class="date-grid">
              <div
                v-for="(dayObj, index) in daysInMonth"
                :key="index"
                @click="selectDate(dayObj.day)"
                :class="{
                  'active-day': isSelectedDate(dayObj.day),
                  'today-day': dayObj.isToday,
                }"
              >
                {{ dayObj.day || '' }}
              </div>
            </div>
            <div class="button-container">
              <button @click="closeDatePicker" class="cancel-button">取消</button>
              <button @click="confirmDatePicker" class="confirm-button">确定</button>
            </div>
          </div>
        </div>
        <!-- 预约时间选择 -->
        <div class="form-group">
          <label for="time">请输入预约时间</label>
          <input type="text" id="time" v-model="timeRange" @click="openTimePicker" readonly />
          <div v-if="showTimePicker" class="time-picker-modal">
            <div class="time-picker-header">
              <h2>请选择预约时间</h2>
            </div>
            <div class="time-input-container">
              <label>开始时间</label>
              <div class="time-input">
                <input
                  type="number"
                  v-model="startHour"
                  :max="23"
                  :min="0"
                  placeholder="时"
                  @input="validateTime('start')"
                />
                <span>:</span>
                <input
                  type="number"
                  v-model="startMinute"
                  :max="59"
                  :min="0"
                  placeholder="分"
                  @input="validateTime('start')"
                />
              </div>
            </div>
            <div class="time-input-container">
              <label>结束时间</label>
              <div class="time-input">
                <input
                  type="number"
                  v-model="endHour"
                  :max="23"
                  :min="0"
                  placeholder="时"
                  @input="validateTime('end')"
                />
                <span>:</span>
                <input
                  type="number"
                  v-model="endMinute"
                  :max="59"
                  :min="0"
                  placeholder="分"
                  @input="validateTime('end')"
                />
              </div>
            </div>
            <div class="time-validation">
              <p v-if="timeError" class="error-message">{{ timeError }}</p>
              <p v-else>时长：{{ durationHours }}小时{{ durationMinutes }}分钟</p>
            </div>
            <div class="button-container">
              <button type="button" @click="closeTimePicker" class="cancel-button">取消</button>
              <button type="button" @click="confirmTimePicker" class="confirm-button">确定</button>
            </div>
          </div>
        </div>
        <!-- 预约人姓名输入 -->
        <div class="form-group">
          <label for="name">预约人姓名</label>
          <input type="text" id="name" v-model="name" placeholder="请输入预约人姓名" />
        </div>
        <!-- 操作按钮 -->
        <div class="button-group">
          <button type="button" @click="submitForm">预约</button>
          <button type="button" @click="viewReservation">查看预约情况</button>
        </div>
      </form>
    </div>
    <!-- 底部导航区域 -->
    <BottomNav />
  </div>
</template>

<script>
import BottomNav from '@/pages/BottomNav/BottomNav.vue';
import { addReservation, getReservationsByRoomAndDate, getAllReservations, checkDuplicateReservation } from '@/utils/db';

export default {
  components: {
    BottomNav
  },
  data() {
    return {
      currentImage: 0,
      currentPrice: 0,
      roomType: '扑克室1',
      date: '',
      startHour: '',
      startMinute: '',
      endHour: '',
      endMinute: '',
      startTime: '',
      endTime: '',
      timeRange: '',
      name: '',
      images: [
        'static/puke.png',
        'static/majiang.png',
        'static/xiangqi.png',
        'static/zhuoyou.png'
      ],
      prices: [
        '扑克室 15 元/小时 1 小时起,每半小时加 3 元',
        '麻将室 20 元/小时 2 小时起,每半小时加 5 元',
        '象棋室 15 元/小时 1 小时起,每半小时加 3 元',
        '桌游室 30 元/小时 1 小时起,每半小时加 8 元'
      ],
      showDatePicker: false,
      showTimePicker: false,
      selectedYear: new Date().getFullYear(),
      selectedMonth: new Date().getMonth() + 1,
      daysInMonth: [],
      daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
      timeError: '',
      reservations: [],
    };
  },
  computed: {
    durationHours() {
      const start = this.startHour * 60 + parseInt(this.startMinute);
      const end = this.endHour * 60 + parseInt(this.endMinute);
      return Math.floor((end - start) / 60);
    },
    durationMinutes() {
      const start = this.startHour * 60 + parseInt(this.startMinute);
      const end = this.endHour * 60 + parseInt(this.endMinute);
      return (end - start) % 60;
    }
  },
  created() {
    this.loadReservations();
  },
  methods: {
    async loadReservations() {
      try {
        this.reservations = await getAllReservations();
        // 按时间倒序排序
        this.reservations.sort((a, b) => b.timestamp - a.timestamp);
      } catch (error) {
        console.error('加载失败:', error);
        alert('加载预约记录失败');
      }
    },
    async submitForm() {
      if (!this.roomType) {
        alert('请选择房间类型');
        return;
      }
      if (!this.date) {
        alert('请选择预约日期');
        return;
      }
      if (!this.startTime || !this.endTime) {
        alert('请选择预约时间');
        return;
      }
      if (!this.name) {
        alert('请输入预约人姓名');
        return;
      }

      // 使用优化后的检查
      const isDuplicate = await checkDuplicateReservation({
        user: this.name,
        roomType: this.roomType,
        date: this.date,
        startTime: this.startTime,
        endTime: this.endTime
      });
      
      if (isDuplicate) {
        alert('该时间段您已存在完全相同的预约记录');
        return;
      }

      // 修改时间有效性验证逻辑
      const now = new Date();
      const startDateTime = new Date(`${this.date}T${this.startTime}`);
      const endDateTime = new Date(`${this.date}T${this.endTime}`);
      
      // 仅保留过期时间检查
      if (now > endDateTime) {
        alert('预约时间已全部过期');
        return;
      }

      // 检查冲突
      const checkConflict = (existing) => {
        const newStart = startDateTime.getTime();
        const newEnd = endDateTime.getTime();
        
        return existing.some(reservation => {
          const existStart = new Date(reservation.startTime).getTime();
          const existEnd = new Date(reservation.endTime).getTime();
          return (newStart < existEnd) && (newEnd > existStart);
        });
      };

      try {
        const existing = await getReservationsByRoomAndDate(this.roomType, this.date);
        if (checkConflict(existing)) {
          alert('该时间段已被预约');
          return;
        }
        
        const reservation = {
          user: this.name,
          roomType: this.roomType,
          date: this.date,
          startTime: this.startTime,
          endTime: this.endTime,
          timestamp: new Date().getTime()
        };

        const id = await addReservation(reservation);
        this.$router.push({
          path: '/pages/reservation/info',
          query: {
            id: id,
            roomType: this.roomType,
            date: this.date,
            startTime: this.startTime,
            endTime: this.endTime,
            user: this.name
          }
        });
        
      } catch (error) {
        alert('保存预约失败');
      }
    },
    viewReservation() {
      console.log('查看预约情况');
	   this.$router.push('/pages/reservation/check');
    },
    nextImage() {
      this.currentImage = (this.currentImage + 1) % this.images.length;
      this.currentPrice = (this.currentPrice + 1) % this.prices.length;
    },
    prevImage() {
      this.currentImage = (this.currentImage - 1 + this.images.length) % this.images.length;
      this.currentPrice = (this.currentPrice - 1 + this.prices.length) % this.prices.length;
    },
    openDatePicker() {
      this.showDatePicker = true;
      this.calculateDaysInMonth();
    },
    openTimePicker() {
      // 获取当前时间
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // 计算30分钟后的时间
      const endTime = new Date(now.getTime() + 60 * 60000);
      
      // 设置初始时间
      this.startHour = currentHour;
      this.startMinute = currentMinute;
      this.endHour = endTime.getHours();
      this.endMinute = endTime.getMinutes();
      
      this.showTimePicker = true;
      this.validateTime('start');
      this.validateTime('end');
    },
    closeDatePicker() {
      this.showDatePicker = false;
    },
    closeTimePicker() {
      this.showTimePicker = false;
    },
    confirmDatePicker() {
      if (!this.date) {
        alert('请选择一个日期');
        return;
      }
      this.showDatePicker = false;
    },
    confirmTimePicker() {
      if (this.timeError) return;
      const format = (value) => String(value).padStart(2, '0');
      
      this.startTime = `${format(this.startHour)}:${format(this.startMinute)}`;
      this.endTime = `${format(this.endHour)}:${format(this.endMinute)}`;
      this.timeRange = `${this.startTime} - ${this.endTime}`;
      this.closeTimePicker();
    },
    selectDate(day) {
      this.date = `${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    },
    isSelectedDate(day) {
      const selected = new Date(this.date);
      return (
        selected.getDate() === day &&
        selected.getMonth() + 1 === this.selectedMonth &&
        selected.getFullYear() === this.selectedYear
      );
    },
    calculateDaysInMonth() {
      const today = new Date();
      const days = new Date(this.selectedYear, this.selectedMonth, 0).getDate();
      const firstDay = new Date(this.selectedYear, this.selectedMonth - 1, 1).getDay();
      this.daysInMonth = Array.from({ length: days + firstDay }, (_, i) => {
        if (i < firstDay) {
          return { day: null, isToday: false };
        }
        const day = i - firstDay + 1;
        const isToday =
          day === today.getDate() &&
          this.selectedMonth === today.getMonth() + 1 &&
          this.selectedYear === today.getFullYear();
        return { day, isToday };
      });
    },
    prevMonth() {
      this.selectedMonth--;
      if (this.selectedMonth < 1) {
        this.selectedMonth = 12;
        this.selectedYear--;
      }
      this.calculateDaysInMonth();
    },
    nextMonth() {
      this.selectedMonth++;
      if (this.selectedMonth > 12) {
        this.selectedMonth = 1;
        this.selectedYear++;
      }
      this.calculateDaysInMonth();
    },
    validateTime(type) {
      const sanitizeInput = (value, max) => {
        // 确保输入值为字符串类型
        const strValue = String(value).replace(/\D/g, ''); // 先转换为字符串再处理
        
        if (strValue === '') return '';
        
        let numValue = parseInt(strValue) || 0;
        
        // 处理两位数自动跳转
        if (strValue.length >= 2) {
          numValue = parseInt(strValue.slice(0,2));
        }
        
        // 限制最大值并转换为字符串
        numValue = Math.min(numValue, max);
        return numValue > 0 ? String(numValue) : '';
      };

      if (type === 'start') {
        this.startHour = sanitizeInput(this.startHour, 23);
        this.startMinute = sanitizeInput(this.startMinute, 59);
      } else {
        this.endHour = sanitizeInput(this.endHour, 23);
        this.endMinute = sanitizeInput(this.endMinute, 59);
      }

      this.checkTimeValidation();
    },
    checkTimeValidation() {
      // 处理未完成输入的情况
      const getValue = (h, m) => {
        const hour = h === '' ? 0 : parseInt(h);
        const minute = m === '' ? 0 : parseInt(m);
        return hour * 60 + minute;
      };

      const start = getValue(this.startHour, this.startMinute);
      const end = getValue(this.endHour, this.endMinute);
      
      this.timeError = 
        !this.startHour || !this.startMinute || !this.endHour || !this.endMinute ? '请完成时间输入' :
        end <= start ? '结束时间必须晚于开始时间' :
        (end - start) < 60 ? '预约时长至少60分钟' : '';
    },
    updateStartTime() {
      this.validateTime('start');
    },
    updateEndTime() {
      this.validateTime('end');
    }
  },
  mounted() {
    setInterval(this.nextImage, 3000);
  },
  watch: {
    '$route'(to, from) {
      if (to.query.refresh) {
        this.loadReservations();
        
        if (to.query.message) {
          if (this.showFeedback) {
            this.showFeedback(to.query.message, to.query.type || 'success');
          } else {
            alert(to.query.message);
          }
        }
      }
    }
  }
};
</script>


<style scoped>
.room-reservation {
  font-family: Arial, sans-serif;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.carousel {
  display: flex;
  overflow: hidden;
  width: 100%;
  margin-top: 10px;
  position: relative;
}

.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #fff;
  z-index: 10;
}

.carousel-control.prev {
  left: 0;
}

.carousel-control.next {
  right: 0;
}

.carousel-item {
  flex: 0 0 100%;
  transition: transform 0.5s ease-in-out;
}

.carousel-item img {
  width: 100%;
  height: 180px;
  display: block;
  border-radius: 8px;
}

.pricing-info {
  margin-bottom: 30px;
  display: flex;
  overflow: hidden;
  width: 100%;
}

.pricing-item {
  flex: 0 0 100%;
  transition: transform 0.5s ease-in-out;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.form-container {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  font-size: 25px;
  text-align: left;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 25px;
}

.button-group {
  display: flex;
  justify-content: space-between;
}

.button-group button {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background-color: #afafaf;
  color: white;
  text-align: center;
  font-size: 16px;
}

.button-group button:hover {
  background-color: #3a8ee6;
}

.date-picker-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  width: 300px;
}

.header-date {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

.month-switch-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.date-week {
  display: flex;
  justify-content: space-around;
  margin-bottom: 10px;
}

.date-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.date-grid div {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  border-radius: 5px;
  cursor: pointer;
  background-color: #f9f9f9;
}

.active-day {
  background-color: #00b38a;
  color: white;
}

.today-day {
  background-color: #ffeb3b;
}

.button-container {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
}

.cancel-button,
.confirm-button {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.cancel-button {
  color: #00b38a;
  background-color: white;
  border: 1px solid #00b38a;
}

.confirm-button {
  background-color: #00b38a;
  color: white;
}

.time-picker-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  width: 300px;
}

.time-picker-header {
  background-color: #00b38a;
  color: white;
  text-align: center;
  padding: 10px;
  border-radius: 10px 10px 0 0;
}

.time-input-container {
  margin: 20px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-input-container label {
  display: flex;
  margin-left: 10px;
  align-items: center;
  justify-content: center;
}

.time-input {
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-input input {
  width: 50px;
  height: 25px;
  text-align: center;
  margin: 0 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.time-input span {
  margin: 0 5px;
}

.time-validation {
  text-align: center;
  margin: 15px 0;
  font-size: 14px;
  color: #666;
}

.error-message {
  color: #ff4d4f;
  font-size: 13px;
  margin-top: 5px;
}

.time-input input {
  width: 70px;
  padding: 8px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.time-input-container label {
  margin-bottom: 8px;
  display: block;
}
</style>