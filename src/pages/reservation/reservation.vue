<template>
  <div class="room-reservation">
    <!-- 轮播图改用van-swipe -->
    <van-swipe class="my-swipe" :autoplay="3000" @change="handleSwiperChange" :loop="true" :show-indicators="true"
      indicator-color="#3c9cff">
      <van-swipe-item v-for="(item, index) in swiperList" :key="index">
        <img :src="item.image" class="swipe-image" />
        <div class="swipe-title">{{ item.title }}</div>
      </van-swipe-item>
    </van-swipe>

    <!-- 表单容器 -->
    <van-form @submit="submitForm" class="form-container">
      <!-- 房间类型选择 -->
      <van-field readonly clickable name="picker" :value="roomType" label="房间类型" placeholder="请选择房间类型"
        @click="showRoomPicker = true">
        <template #right-icon>
          <van-icon name="arrow-down" />
        </template>
      </van-field>
      <van-popup v-model="showRoomPicker" position="bottom">
        <van-picker title="请选择预约房间" :columns="roomOptions" value-key="name" show-toolbar @confirm="roomConfirm"
          @cancel="showRoomPicker = false" />
      </van-popup>

      <!-- 日期选择 -->
      <van-field readonly clickable name="date" :value="formattedDate" label="预约日期" placeholder="请选择日期"
        @click="showDatePicker = true" />
      <van-calendar v-model:show="showDatePicker" :min-date="minDate" :max-date="maxDate" @confirm="dateConfirm"
        :round="false" title="选择预约日期" :show-title="true" :default-date="date" :poppable="true" />

      <!-- 拆分时间选择字段 -->
      <van-field readonly clickable name="startTime" :value="startTime" label="开始时间" placeholder="选择开始时间"
        @click="showStartPicker = true" />
      <van-field readonly clickable name="endTime" :value="endTime" label="结束时间" placeholder="选择结束时间"
        @click="showEndPicker = true" />

      <!-- 开始时间弹窗 -->
      <van-popup v-model="showStartPicker" position="bottom">
        <van-datetime-picker v-model="startTimeValue" type="time" title="选择开始时间" :min-hour="0" :max-hour="23"
          @confirm="handleStartConfirm" />
      </van-popup>

      <!-- 结束时间弹窗 -->
      <van-popup v-model="showEndPicker" position="bottom">
        <van-datetime-picker v-model="endTimeValue" type="time" title="选择结束时间" :min-hour="0" :max-hour="23"
          @confirm="handleEndConfirm" />
      </van-popup>

      <!-- 时间验证提示 -->
      <view class="time-validation" v-if="timeError">
        <text class="error-text">{{ timeError }}</text>
      </view>

      <!-- 姓名输入 -->
      <van-field v-model="name" name="name" label="用户名称" placeholder="请输入姓名" />

      <!-- 操作按钮 -->
      <div class="button-group">
        <van-button round block type="primary" native-type="submit">立即预约</van-button>
        <van-button round block plain type="primary" @click="viewReservation">查看预约</van-button>
      </div>
    </van-form>
  </div>
</template>

<script>
// 引入依赖组件和工具库
import { addReservation, getReservationsByRoomAndDate, getAllReservations, checkDuplicateReservation } from '@/utils/db';
import dayjs from 'dayjs';  // 日期处理库
import {
  Swipe,
  showToast,
  SwipeItem,
  Calendar,
  Picker,
  Popup,
  Field,
  Button,
  Toast,
  Dialog,
  Image,
  DatetimePicker
} from 'vant';

export default {
  components: {
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem,
    [Calendar.name]: Calendar,
    [Picker.name]: Picker,
    [Popup.name]: Popup,
    [Field.name]: Field,
    [Button.name]: Button,
    [Toast.name]: Toast,
    [Dialog.Component.name]: Dialog.Component, // 注册Dialog组件
    [Image.name]: Image,
    [DatetimePicker.name]: DatetimePicker
  },
  data() {
    return {
      // 轮播图配置数据
      swiperList: [
        {
          image: '/static/puke.png',
          title: '扑克室 20 元/小时 1 小时起,每半小时加 5 元'
        },
        {
          image: '/static/majiang.png',
          title: '麻将室 20 元/小时 2 小时起,每半小时加 5 元'
        },
        {
          image: '/static/xiangqi.png',
          title: '象棋室 15 元/小时 1 小时起,每半小时加 5 元'
        },
        {
          image: '/static/zhuoyou.png',
          title: '桌游室 40 元/小时 1 小时起,每半小时加 5 元'
        }
      ],
      currentPrice: 0,

      // 房间类型选项（需要与后台同步）
      roomOptions: [
        { name: '扑克室1' },
        { name: '扑克室2' },
        { name: '麻将室1' },
        { name: '麻将室2' },
        { name: '象棋室1' },
        { name: '象棋室2' },
        { name: '桌游室1' },
        { name: '桌游室2' }
      ],
      // 表单数据
      roomType: '',  
      name: '',
      // 时间相关状态
      startTime: '',
      endTime: '',
      // 日期选择范围（最近7天到未来30天）
      minDate: new Date(),
      maxDate: dayjs().add(3, 'month').toDate(),
      date: new Date(),
      // 组件显示控制
      showDatePicker: false, // 日期选择器显示状态
      showTimePicker: false, // 时间选择弹窗显示状态
      showRoomPicker: false, // 房间选择器显示状态

      // 时间选择相关状态
      startTimeValue: dayjs().format('HH:mm'), // 改为字符串初始值
      endTimeValue: dayjs().add(1, 'hour').format('HH:mm'), // 改为字符串初始值
      showStartPicker: false,
      showEndPicker: false,
      timeError: '',        // 时间验证错误信息
    };
  },
  computed: {
    currentPriceText() {
      return this.swiperList[this.currentPrice]?.title || '';
    },
    // 格式化显示日期
    formattedDate() {
      return dayjs(this.date).format('YYYY年MM月DD日');
    },
    durationText() {
      if (!this.startTime || !this.endTime) return '';
      const start = dayjs(this.startTime, 'HH:mm');
      const end = dayjs(this.endTime, 'HH:mm');
      const duration = end.diff(start, 'minute');
      return `${Math.floor(duration / 60)}小时${duration % 60}分钟`;
    },
    timeRange() {
      return this.startTime && this.endTime
        ? `${this.startTime} - ${this.endTime}`
        : '';
    }
  },
  created() {
    this.minDate = new Date();
    this.maxDate = dayjs().add(3, 'month').toDate();
    this.loadReservations(); // 初始化加载预约记录
  },
  methods: {
    // 表单提交处理
    async submitForm() {
      console.log('[预约提交] 开始处理表单提交', {
        user: this.name,
        room: this.roomType,
        date: this.date
      });
      
      // 统一使用Toast组件提示
      if (!this.roomType) {
        Toast.fail('请选择房间类型');
        return;
      }
      if (!this.date) {
        Toast.fail('请选择预约日期');
        return;
      }
      if (!this.startTime || !this.endTime) {
        Toast.fail('请选择预约时间');
        return;
      }
      if (!this.name) {
        Toast.fail('请输入预约人姓名');
        return;
      }

      // 添加加载提示
      Toast.loading({
        message: '提交中...',
        forbidClick: true,
        duration: 0
      });

      try {
        // 使用优化后的检查
        const isDuplicate = await checkDuplicateReservation({
          user: this.name,
          roomType: this.roomType,
          date: this.date,
          startTime: this.startTime,
          endTime: this.endTime
        });

        if (isDuplicate) {
          Toast.fail({
            message: '该时间段您已存在完全相同的预约记录',
            duration: 1500
          });
          return;
        }

        // 修改时间有效性验证逻辑
        const now = new Date();
        const startDateTime = new Date(`${this.date}T${this.startTime}`);
        const endDateTime = new Date(`${this.date}T${this.endTime}`);

        // 仅保留过期时间检查
        if (now > endDateTime) {
          Toast.fail({
            message: '预约时间已全部过期',
            duration: 1500
          });
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

        const existing = await getReservationsByRoomAndDate(this.roomType, this.date);
        console.log(`[冲突检查] 找到${existing.length}条现有预约记录`, existing);
        if (checkConflict(existing)) {
          Toast.fail({
            message: '该时间段已被预约',
            duration: 1500
          });
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
        console.log('[预约成功] 生成预约ID:', id, reservation);
        Toast.success({
          message: '预约提交成功',
          duration: 1500
        });

        this.$router.push({
          path: '/pages/reservation/info',
          query: {
            id: id,
            roomType: this.roomType,
            date: dayjs(this.date).format('YYYY-MM-DD'),
            startTime: this.startTime,
            endTime: this.endTime,
            user: this.name
          }
        });

      } catch (error) {
        console.error('[预约异常] 提交失败:', error);
        Toast.fail('预约保存失败');
      } finally {
        Toast.clear();
      }
    },
    viewReservation() {
      console.log('查看预约情况');
      this.$router.push('/pages/reservation/check');
    },
    handleSwiperChange(e) {
      this.currentPrice = e.current;
    },
    openDatePicker() {
      this.showDatePicker = true;
    },
    openTimePicker() {
      this.showTimePicker = true;
      // 设置默认时间为当前时间+30分钟
      const now = new Date();
      const startTime = new Date(now.getTime() + 2 * 60000);
      this.startTime = startTime.toISOString().slice(11, 16);
      this.endTime = (startTime.getTime() + 60 * 60 * 1000).toISOString().slice(11, 16);
    },
    closeDatePicker() {
      this.showDatePicker = false;
    },
    closeTimePicker() {
      this.showTimePicker = false;
      this.timeError = '';
    },
    confirmDatePicker() {
      if (!this.date) {
        this.$refs.vanToast.show({
          title: '请选择一个日期',
          type: 'error'
        });
        return;
      }
      this.showDatePicker = false;
    },
    confirmTimePicker() {
      if (this.timeError) {
        this.$refs.vanToast.show({
          title: this.timeError,
          type: 'error',
          icon: false
        });
        return;
      }
      this.timeRange = `${this.startTime} - ${this.endTime}`;
      this.showTimePicker = false;
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
    handleStartConfirm(value) {
      this.startTime = typeof value === 'string' ? value : dayjs(value).format('HH:mm');
      this.startTimeValue = this.startTime; // 同步更新picker的值
      this.showStartPicker = false;
      this.validateTime();
    },
    handleEndConfirm(value) {
      this.endTime = typeof value === 'string' ? value : dayjs(value).format('HH:mm');
      this.endTimeValue = this.endTime; // 同步更新picker的值
      this.showEndPicker = false;
      this.validateTime();
    },
    validateTime() {
      console.log('[时间验证] 开始时间:', this.startTime, '结束时间:', this.endTime);
      if (!this.startTime || !this.endTime) return;

      const start = dayjs(this.startTime, 'HH:mm');
      const end = dayjs(this.endTime, 'HH:mm');

      if (end.isBefore(start)) {
        Toast.fail('结束时间不能早于开始时间');
      } else if (end.diff(start, 'minute') < 60) {
        Toast.fail('预约时长至少需要60分钟');
      }
    },
    roomConfirm(value) {
      this.roomType = value.name;  // 直接获取选中项对象
      this.showRoomPicker = false;
    },
    dateConfirm(e) {
      this.date = e;  // 直接接收Date对象
      this.showDatePicker = false;
    },
    async loadReservations() {
      try {
        const reservations = await getAllReservations();
      } catch (error) {
        Toast.fail('加载预约记录失败');
      }
    },
    showToast(message, type = 'fail') {
      Dialog.alert({
        message,
        theme: 'round-button',
        className: `custom-dialog ${type}-dialog`
      });
    },
    formatReservationTime(date, start, end) {
      try {
        const startTime = dayjs(`${date} ${start}`, 'YYYY年MM月DD日 HH:mm');
        const endTime = dayjs(`${date} ${end}`, 'YYYY年MM月DD日 HH:mm');
        
        if (!startTime.isValid() || !endTime.isValid()) {
          return '时间格式错误';
        }
        
        return `${startTime.format('HH:mm')} - ${endTime.format('HH:mm')}`;
      } catch (e) {
        console.error('时间格式化错误:', e);
        return '时间显示异常';
      }
    },
  },
  mounted() {
    // 保留自动轮播功能
    setInterval(() => {
      this.currentPrice = (this.currentPrice + 1) % this.swiperList.length;
    }, 3000);
  },
  watch: {
    '$route'(to, from) {
      if (to.query.refresh) {
        this.loadReservations(); // 刷新预约数据

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
  background: var(--background);
  min-height: 100vh;
  padding: 16px;
}

.form-container {
  background: var(--card-bg);
  border-radius: 16rpx;
  padding: 30rpx;
  margin-top: 40rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
}

.swipe-image {
  height: 200px;
  width: 100%;
}

.van-field {
  padding: 10px 16px;
}

.time-picker-content {
  padding: 20rpx 0;
}

.time-input-container {
  display: flex;
  align-items: center;
  margin: 30rpx 0;
  padding: 0 20rpx;

  .time-label {
    width: 140r px;
    font-size: 28rpx;
    color: var(--text);
  }

  .van-field {
    flex: 1;
    margin: 0 10rpx;
    text-align: center;
  }

  .time-colon {
    color: #666;
    margin: 0 10rpx;
  }
}

.time-validation {
  margin-top: 40rpx;
  text-align: center;
}

.button-group {
  margin: 20px 16px;
}

.van-button {
  margin-top: 15px;
}

.bottom-nav-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.van-swipe-item {
  background: var(--card-bg);
  border-color: var(--border-color);
}

.swipe-title {
  background: rgba(0, 0, 0, 0.6);
  color: var(--text-inverse);
}

.van-cell {
  background: var(--card-bg);
  color: var(--text);
}

.van-button--primary {
  background: var(--primary-color);
}

.van-field__control::placeholder {
  color: var(--placeholder-color) !important;
}

/* 改为通过Vant主题变量控制 */
:deep(.van-calendar) {
  --van-calendar-background: var(--card-bg);
  --van-calendar-header-title-color: var(--text-primary);
  --van-calendar-month-title-color: var(--text-primary);
  --van-calendar-day-color: var(--text);
  --van-calendar-selected-day-background: var(--primary-color);
  --van-calendar-selected-day-color: var(--text-inverse);
  --van-calendar-disabled-day-color: var(--text-secondary);
}
</style>