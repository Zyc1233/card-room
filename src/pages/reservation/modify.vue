<template>
	<div class="room-reservation">
		<div class="form-container">
			<form @submit.prevent="submitForm">
				<!-- 房间类型 -->
				<div class="form-group">
					<label for="room-type">房间类型</label>
					<select id="room-type" v-model="roomType">
						<option v-for="(room, index) in roomOptions" :key="index" :value="room">{{ room }}</option>
					</select>
				</div>

				<!-- 预约日期 -->
				<div class="form-group">
					<label for="date">预约日期</label>
					<input type="text" id="date" v-model="formattedDate" @click="openDatePicker" readonly />
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

				<!-- 时间选择 -->
				<div class="form-group">
					<label for="time">预约时间</label>
					<input type="text" id="time" v-model="timeRange" @click="openTimePicker" readonly />
					
					<!-- 时间选择弹窗 -->
					<div v-if="showTimePicker" class="time-picker-modal">
						<div class="time-picker-header">
							<h2>修改预约时间</h2>
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

				<!-- 预约人信息 -->
				<div class="form-group">
					<label for="name">预约人姓名</label>
					<input
						type="text"
						id="name"
						v-model="name"
						placeholder="请输入姓名"
						:class="{ 'input-error': nameError }"
						@input="validateName"
					/>
					<p v-if="nameError" class="error-message">{{ nameError }}</p>
				</div>

				<!-- 操作按钮 -->
				<div class="button-group">
					<button
					 type="button"
					 class="submit-button"
					 @click="submitForm">确认修改</button>
				</div>
			</form>
		</div>
	</div>
</template>

<script>
	import { getReservationsByRoomAndDate, updateReservation } from '@/utils/db';
	import dayjs from 'dayjs';

	export default {
		data() {
			return {
				editingId: null,
				roomType: '',
				date: '',
				name: '',
				startHour: '',
				startMinute: '',
				endHour: '',
				endMinute: '',
				timeRange: '',
				showTimePicker: false,
				timeError: '',
				nameError: '',
				roomOptions: [
					'扑克室1', '扑克室2',
					'麻将室1', '麻将室2',
					'象棋室1', '象棋室2',
					'桌游室1', '桌游室2'
				],
				showDatePicker: false,
				selectedYear: new Date().getFullYear(),
				selectedMonth: new Date().getMonth() + 1,
				daysInMonth: [],
				daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
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
				this.date = '';
				this.name = '';
				this.startHour = '';
				this.startMinute = '';
				this.endHour = '';
				this.endMinute = '';

				if (this.$route.query.id) {
					// 使用nextTick确保DOM更新
					this.$nextTick(() => {
						this.editingId = this.$route.query.id;
						this.roomType = this.$route.query.roomType;
						this.date = this.$route.query.date;
						this.name = this.$route.query.name;
						
						// 处理带前导零的时间格式（如09:05）
						const parseTime = (timeString) => {
							const time = String(timeString).padStart(4, '0'); // 转换为字符串并补零
							const formatted = time.slice(0,2) + ':' + time.slice(2);
							return {
								hour: formatted.split(':')[0].padStart(2, '0'),
								minute: formatted.split(':')[1].padStart(2, '0')
							};
						};

						const start = parseTime(this.$route.query.startTime);
						const end = parseTime(this.$route.query.endTime);
						
						this.startHour = start.hour;
						this.startMinute = start.minute;
						this.endHour = end.hour;
						this.endMinute = end.minute;
						
						this.updateTimeRange();
						const initDate = new Date(this.$route.query.date);
						this.selectedYear = initDate.getFullYear();
						this.selectedMonth = initDate.getMonth() + 1;
						this.calculateDaysInMonth();
					});
				}
			},
			validateName() {
				this.nameError = this.name.trim() ? '' : '请输入预约人姓名';
			},
			validateTime(type) {
				const validateField = (value, max, field) => {
					value = Math.max(0, Math.min(max, parseInt(value) || 0));
					this[field] = value.toString().padStart(2, '0');
					return value;
				};

				if (type === 'start') {
					this.startHour = validateField(this.startHour, 23, 'startHour');
					this.startMinute = validateField(this.startMinute, 59, 'startMinute');
				} else {
					this.endHour = validateField(this.endHour, 23, 'endHour');
					this.endMinute = validateField(this.endMinute, 59, 'endMinute');
				}

				this.checkTimeValidation();
			},
			checkTimeValidation() {
				const startTotal = parseInt(this.startHour) * 60 + parseInt(this.startMinute);
				const endTotal = parseInt(this.endHour) * 60 + parseInt(this.endMinute);
				
				if (endTotal <= startTotal) {
					this.timeError = '结束时间必须晚于开始时间';
				} else if (endTotal - startTotal < 60) {
					this.timeError = '预约时长至少1小时';
				} else {
					this.timeError = '';
				}
			},
			updateTimeRange() {
				this.timeRange = `${this.startHour}:${this.startMinute} - ${this.endHour}:${this.endMinute}`;
			},
			openTimePicker() {
				this.showTimePicker = true;
			},
			closeTimePicker() {
				this.showTimePicker = false;
				this.timeError = '';
			},
			confirmTimePicker() {
				if (this.timeError) return;
				this.updateTimeRange();
				this.closeTimePicker();
			},
			openDatePicker() {
				this.showDatePicker = true;
				this.calculateDaysInMonth();
			},
			closeDatePicker() {
				this.showDatePicker = false;
			},
			confirmDatePicker() {
				if (!this.date) {
					alert('请选择一个日期');
					return;
				}
				this.showDatePicker = false;
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
					if (i < firstDay) return { day: null, isToday: false };
					const day = i - firstDay + 1;
					const isToday = day === today.getDate() &&
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
			async submitForm() {
				this.validateName();
				if (this.nameError) return;

				if (!this.timeRange || this.timeError) {
					alert('请选择有效的时间段');
					return;
				}

				try {
					// 检查时间冲突（排除当前预约）
					const existing = await getReservationsByRoomAndDate(this.roomType, this.date);
					const otherReservations = existing.filter(item => item.id !== this.editingId);
					
					if (this.checkTimeConflict(otherReservations)) {
						alert('该时间段已被预约，请选择其他时间');
						return;
					}

					await updateReservation(this.editingId, {
						user: this.name.trim(),
						roomType: this.roomType,
						date: this.date,
						startTime: `${String(this.startHour).padStart(2, '0')}:${String(this.startMinute).padStart(2, '0')}`,
						endTime: `${String(this.endHour).padStart(2, '0')}:${String(this.endMinute).padStart(2, '0')}`,
						timestamp: new Date().getTime()
					});

					// 添加成功反馈
					this.$router.push({
						path: '/pages/reservation/check',
						query: { 
							refresh: true,
							message: '修改成功',
							type: 'success'
						}
					});
				} catch (error) {
					console.error('更新错误:', error);
					alert(`修改失败: ${error.message}`);
				}
			},
			checkTimeConflict(existing) {
				const newStart = parseInt(this.startHour) * 60 + parseInt(this.startMinute);
				const newEnd = parseInt(this.endHour) * 60 + parseInt(this.endMinute);
				
				return existing.some(item => {
					const [existStartH, existStartM] = item.startTime.split(':');
					const [existEndH, existEndM] = item.endTime.split(':');
					const existStart = parseInt(existStartH) * 60 + parseInt(existStartM);
					const existEnd = parseInt(existEndH) * 60 + parseInt(existEndM);
					
					return (newStart < existEnd) && (newEnd > existStart);
				});
		}
	}
}
</script>

<style scoped>
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
		box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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

	input, select {
		width: 100%;
		padding: 12px;
		border: 1px solid #ddd;
		border-radius: 8px;
		font-size: 15px;
		transition: border-color 0.3s;
	}

	input:focus, select:focus {
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

	.button-group {
		margin-top: 30px;
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
	.time-picker-modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: white;
		width: 320px;
		padding: 20px;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0,0,0,0.15);
		z-index: 1000;
	}

	.time-picker-header h2 {
		margin: 0 0 20px;
		color: #333;
		font-size: 18px;
		text-align: center;
	}

	.time-input-container {
		margin: 15px 0;
	}

	.time-input {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.time-input input {
		width: 70px;
		padding: 8px;
		text-align: center;
	}

	.time-validation {
		text-align: center;
		margin: 15px 0;
		font-size: 14px;
		color: #666;
	}

	.button-container {
		display: flex;
		gap: 10px;
		margin-top: 20px;
	}

	.cancel-button, .confirm-button {
		flex: 1;
		padding: 10px;
		border: none;
		border-radius: 6px;
		cursor: pointer;
	}

	.cancel-button {
		background: #f0f0f0;
		color: #666;
	}

	.confirm-button {
		background: #00b38a;
		color: white;
	}

	/* 日期选择器样式（从reservation.vue复制） */
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
</style>
