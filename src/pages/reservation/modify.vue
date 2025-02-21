<template>
	<view class="room-reservation">
		<!-- 使用vant表单组件 -->
		<van-form class="form-container" @submit="submitForm">
			<!-- 房间类型 -->
			<van-field readonly clickable :value="roomType" name="roomType" label="房间类型" placeholder="请选择房间类型"
				@click="showRoomPicker = true" @input="roomType = $event">
				<template #right-icon>
					<van-icon name="arrow-down" />
				</template>
			</van-field>
			<van-popup v-model="showRoomPicker" position="bottom">
				<van-picker title="选择房间类型" :columns="roomOptions" value-key="name" show-toolbar @confirm="roomConfirm"
					@cancel="showRoomPicker = false" />
			</van-popup>

			<!-- 预约日期 -->
			<van-field readonly clickable name="date" :value="formattedDate" label="预约日期" placeholder="请选择日期"
				@click="showDatePicker = true" />
			<van-calendar v-model:show="showDatePicker" :min-date="minDate" :max-date="maxDate" @confirm="dateConfirm"
				:default-date="date" />

			<!-- 时间选择 -->
			<van-field readonly clickable name="startTime" :value="startTime" label="开始时间" placeholder="选择开始时间"
				@click="showStartPicker = true" />
			<van-field readonly clickable name="endTime" :value="endTime" label="结束时间" placeholder="选择结束时间"
				@click="showEndPicker = true" />

			<!-- 时间选择器弹窗 -->
			<van-popup v-model="showStartPicker" position="bottom">
				<van-datetime-picker v-model="startTimeValue" type="time" title="选择开始时间"
					@confirm="handleStartConfirm" />
			</van-popup>
			<van-popup v-model="showEndPicker" position="bottom">
				<van-datetime-picker v-model="endTimeValue" type="time" title="选择结束时间" @confirm="handleEndConfirm" />
			</van-popup>

			<!-- 用户名称 -->
			<van-field v-model="name" name="name" label="用户名称" placeholder="请输入姓名" />

			<!-- 操作按钮 -->
			<div class="button-group">
				<van-button round block type="primary" native-type="submit">确认修改</van-button>
			</div>
		</van-form>
	</view>
</template>

<script>
import { getReservationsByRoomAndDate, updateReservation } from '@/utils/db';
import dayjs from 'dayjs';
import {
	Form,
	Field,
	Button,
	Calendar,
	Picker,
	Popup,
	DatetimePicker,
	Toast
} from 'vant';

export default {
	components: {
		[Form.name]: Form,
		[Field.name]: Field,
		[Button.name]: Button,
		[Calendar.name]: Calendar,
		[Picker.name]: Picker,
		[Popup.name]: Popup,
		[DatetimePicker.name]: DatetimePicker
	},
	data() {
		return {
			editingId: null,
			roomType: '',
			date: new Date(),
			name: '',
			startTime: '',
			endTime: '',
			startTimeValue: dayjs().format('HH:mm'),
			endTimeValue: dayjs().add(1, 'hour').format('HH:mm'),
			showStartPicker: false,
			showEndPicker: false,
			showTimePicker: false,
			timeError: '',
			nameError: '',
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
			showDatePicker: false,
			minDate: new Date(),
			maxDate: new Date(dayjs().add(365, 'day')),
			showRoomPicker: false,
			showAlert: false,
			alertMessage: '',
			alertType: 'error',
		}
	},
	computed: {
		formattedDate() {
			return dayjs(this.date).format('YYYY年MM月DD日');
		},
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
		this.initializeData();
	},
	watch: {
		'$route'(to, from) {
			if (to.query.id) {
				this.initializeData();
			}
		}
	},
	methods: {
		initializeData() {
			// 清空旧数据
			this.roomType = '';
			this.name = '';
			this.startTime = '';
			this.endTime = '';

			if (this.$route.query.id) {
				this.$nextTick(async () => {
					// 处理姓名参数
					this.name = this.$route.query.name || '';

					// 统一使用dayjs解析日期
					const rawDate = this.$route.query.date;
					this.date = dayjs(rawDate).isValid()
						? dayjs(rawDate).toDate()
						: new Date();

					// 处理房间类型选择
					this.roomType = this.roomOptions.find(
						item => item.name === this.$route.query.roomType
					)?.name || '';

					// 优化时间处理
					const formatTime = (time) => {
						if (!time) return '';
						// 统一处理4位数字和带冒号格式
						return String(time).padStart(4, '0').replace(/(\d{2})(\d{2})/, '$1:$2');
					};

					this.startTime = formatTime(this.$route.query.startTime);
					this.endTime = formatTime(this.$route.query.endTime);

					// 同步时间选择器值
					this.startTimeValue = this.startTime;
					this.endTimeValue = this.endTime;

					this.editingId = this.$route.query.id;
				});
			}
		},
		validateName() {
			this.nameError = this.name.trim() ? '' : '请输入预约人姓名';
		},
		handleStartConfirm(value) {
			this.startTime = typeof value === 'string' ? value : dayjs(value).format('HH:mm');
			this.startTimeValue = this.startTime;
			this.showStartPicker = false;
			this.validateTime();
		},
		handleEndConfirm(value) {
			this.endTime = typeof value === 'string' ? value : dayjs(value).format('HH:mm');
			this.endTimeValue = this.endTime;
			this.showEndPicker = false;
			this.validateTime();
		},
		validateTime() {
			if (!this.startTime || !this.endTime) {
				this.timeError = '请选择完整时间段';
				return false;
			}

			const start = dayjs(this.startTime, 'HH:mm');
			const end = dayjs(this.endTime, 'HH:mm');

			if (end.isBefore(start)) {
				Toast.fail('结束时间不能早于开始时间');
				return false;
			}

			if (end.diff(start, 'minute') < 60) {
				Toast.fail('预约时长至少需要60分钟');
				return false;
			}

			return true;
		},
		showNotification(message, type = 'error') {
			Toast[type]({
				message,
				duration: 3000
			});
		},
		async submitForm() {
			if (!this.roomType) {
				Toast.fail('请选择房间类型');
				return;
			}

			if (!this.validateTime()) return;

			// 修改时间格式处理
			const payload = {
				user: this.name.trim(),
				roomType: this.roomType,
				date: dayjs(this.date).format('YYYY-MM-DD'), // 统一存储格式
				startTime: this.startTime.replace(':', ''),
				endTime: this.endTime.replace(':', ''),
				timestamp: new Date().getTime()
			};

			try {
				// 添加完整的时间冲突检查
				const existing = await getReservationsByRoomAndDate(
					this.roomType,
					dayjs(this.date).toDate()
				);

				const otherReservations = existing.filter(
					item => item.id !== this.editingId
				);

				if (this.checkTimeConflict(otherReservations)) {
					Toast.fail('该时间段已被预约');
					return;
				}

				await updateReservation(this.editingId, payload);
				Toast.success('修改成功');
				this.$router.replace('/pages/reservation/check?refresh=1');
			} catch (error) {
				Toast.fail(`修改失败: ${error.message}`);
			}
		},
		checkTimeConflict(existing) {
			const newStart = dayjs(this.startTime, 'HH:mm');
			const newEnd = dayjs(this.endTime, 'HH:mm');

			return existing.some(item => {
				const [existStartH, existStartM] = item.startTime.split(':');
				const [existEndH, existEndM] = item.endTime.split(':');
				const existStart = dayjs(`${existStartH}:${existStartM}`, 'HH:mm');
				const existEnd = dayjs(`${existEndH}:${existEndM}`, 'HH:mm');

				return (newStart.isBefore(existEnd) || newStart.isSame(existEnd)) && (newEnd.isAfter(existStart) || newEnd.isSame(existStart));
			});
		},
		roomConfirm(pickerValue) {
			console.log('[Debug] 接收到的picker值:', pickerValue);

			// 处理单选模式（当columns是对象数组时）
			if (Array.isArray(pickerValue)) {
				const selected = pickerValue[0];
				if (selected?.name) {
					this.roomType = selected.name;
					console.log('[Success] 设置成功（数组模式）:', this.roomType);
				} else {
					console.error('[Error] 数组模式获取值失败', pickerValue);
				}
			}
			// 处理直接返回对象的情况
			else if (pickerValue?.name) {
				this.roomType = pickerValue.name;
				console.log('[Success] 设置成功（对象模式）:', this.roomType);
			}
			else {
				console.error('[Error] 无法解析picker值', pickerValue);
				this.roomType = '';
			}

			this.showRoomPicker = false;

			// 调试当前数据状态
			console.log('当前roomOptions:', this.roomOptions);
			console.log('当前roomType:', this.roomType);
		},
		dateConfirm(date) {
			this.date = Array.isArray(date) ? date[0] : date; // 处理多选情况
			this.showDatePicker = false;
		},
	}
}
</script>

<style scoped>
/* 调整样式适配vant组件 */
:deep(.van-field__control) {
	text-align: right;
}

.button-group {
	margin: 40rpx 30rpx;
}

/* 优化后的样式 */
.room-reservation {
	padding: 20px;
	background: #f8f9fa;
	min-height: 100vh;
}

.form-container {
	max-width: 600px;
	margin: 20px auto;
	padding: 25px;
	background: white;
	border-radius: 12px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
	margin-bottom: 25px;
}

label {
	display: block;
	margin-bottom: 8px;
	font-size: 16px;
	color: #333;
	font-weight: 500;
}

input,
select {
	width: 100%;
	padding: 12px;
	border: 1px solid #ddd;
	border-radius: 8px;
	font-size: 15px;
	transition: border-color 0.3s;
}

input:focus,
select:focus {
	border-color: #00b38a;
	outline: none;
}

.input-error {
	border-color: #ff4d4f;
}

.error-message {
	color: #ff4d4f;
	font-size: 13px;
	margin-top: 5px;
}

.submit-button {
	width: 100%;
	padding: 14px;
	background: #00b38a;
	color: white;
	border: none;
	border-radius: 8px;
	font-size: 16px;
	cursor: pointer;
	transition: background 0.3s;
}

.submit-button:hover {
	background: #009973;
}

/* 时间选择弹窗样式 */
.time-picker-content {
	padding: 15px;
}

.time-input-container {
	display: flex;
	align-items: center;
	margin: 15px 0;
}

.time-label {
	width: 80px;
	font-size: 14px;
	color: #606266;
}

.time-colon {
	margin: 0 8px;
	font-size: 16px;
}

.time-validation {
	text-align: center;
	margin: 15px 0;
	font-size: 14px;
	color: #666;
}

/* 优化uView组件样式 */
:deep(.u-form-item__body) {
	padding: 12px 0;
}

:deep(.u-input__content) {
	min-height: auto;
}

:deep(.van-picker__toolbar) {
	display: flex !important;
}

:deep(.van-picker-column__item) {
	font-size: 16px !important;
}
</style>
