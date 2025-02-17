<template>
	<view class="room-reservation">
		<u-form class="form-container" ref="uForm">
			<!-- 房间类型 -->
			<u-form-item label="房间类型" prop="roomType" borderBottom @click="showRoomPicker = true">
				<u--input
					v-model="roomType"
					disabled
					disabledColor="#ffffff"
					placeholder="请选择房间类型"
					border="none"
				></u--input>
				<u-icon name="arrow-down" slot="right"></u-icon>
			</u-form-item>

			<!-- 预约日期 -->
			<u-form-item label="预约日期" prop="date" borderBottom @click="showDatePicker = true">
				<u--input
					:value="formattedDate"
					@click="showDatePicker = true"
					disabled
					disabledColor="#ffffff"
					placeholder="请选择日期"
					border="none"
				></u--input>
				<u-icon name="arrow-down" slot="right"></u-icon>
			</u-form-item>

			<!-- 时间选择 -->
			<u-form-item label="预约时间" prop="time" borderBottom @click="openTimePicker">
				<u--input
					v-model="timeRange"
					disabled
					disabledColor="#ffffff"
					placeholder="请选择时间"
					border="none"
				></u--input>
			</u-form-item>

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

			<!-- 预约人信息 -->
			<u-form-item label="预约人姓名" prop="name" borderBottom>
				<u--input
					v-model="name"
					placeholder="请输入姓名"
					border="none"
					:customStyle="{ padding: '12px' }"
				></u--input>
			</u-form-item>

			<!-- 操作按钮 -->
			<u-button 
				type="primary" 
				@click="submitForm"
				customStyle="margin-top:30px"
			>确认修改</u-button>
		</u-form>

		<!-- uView组件 -->
		<u-picker
			:show="showRoomPicker"
			:columns="[roomOptions]"
			keyName="name"
			@confirm="roomConfirm"
			@cancel="showRoomPicker = false"
		></u-picker>

		<u-datetime-picker
			:show="showDatePicker"
			v-model="dateTimestamp"
			mode="date"
			:minDate="minDate"
			:maxDate="maxDate"
			@confirm="dateConfirm"
			@cancel="showDatePicker = false"
		></u-datetime-picker>

		<!-- 在模板底部添加alert -->
		<u-alert
			v-if="showAlert"
			:title="alertMessage"
			:type="alertType"
			:closeAble="true"
			@close="showAlert = false"
			customStyle="position:fixed; top:20px; left:50%; transform:translateX(-50%); z-index:9999;"
		/>
	</view>
</template>

<script>
	import { getReservationsByRoomAndDate, updateReservation } from '@/utils/db';
	import dayjs from 'dayjs';

	export default {
		data() {
			return {
				editingId: null,
				roomType: '',
				dateTimestamp: Number(new Date()),
				name: '',
				startHour: '00',
				startMinute: '00',
				endHour: '00',
				endMinute: '00',
				timeRange: '',
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
				minDate: Number(new Date()),
				maxDate: Number(new Date()) + 365 * 24 * 60 * 60 * 1000,
				showRoomPicker: false,
				showAlert: false,
				alertMessage: '',
				alertType: 'error',
			}
		},
		computed: {
			formattedDate() {
				return dayjs(this.dateTimestamp).format('YYYY年MM月DD日');
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
			},
			date() {
				return dayjs(this.dateTimestamp).format('YYYY-MM-DD');
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
				this.startHour = '00';
				this.startMinute = '00';
				this.endHour = '00';
				this.endMinute = '00';

				if (this.$route.query.id) {
					// 使用nextTick确保DOM更新
					this.$nextTick(() => {
						this.editingId = this.$route.query.id;
						this.roomType = this.$route.query.roomType;
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
						this.dateTimestamp = initDate.getTime();
					});
				}
			},
			validateName() {
				this.nameError = this.name.trim() ? '' : '请输入预约人姓名';
			},
			validateTime(type) {
				const validateField = (value, max, field) => {
					let num = parseInt(value) || 0;
					num = Math.max(0, Math.min(max, num));
					this[field] = num.toString().padStart(2, '0');
					return num;
				};

				if (type === 'start') {
					validateField(this.startHour, 23, 'startHour');
					validateField(this.startMinute, 59, 'startMinute');
				} else {
					validateField(this.endHour, 23, 'endHour');
					validateField(this.endMinute, 59, 'endMinute');
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
			dateConfirm(e) {
				this.dateTimestamp = e.value;
				this.showDatePicker = false;
			},
			showNotification(message, type = 'error') {
				this.alertMessage = message;
				this.alertType = type;
				this.showAlert = true;
				setTimeout(() => {
					this.showAlert = false;
				}, 3000);
			},
			async submitForm() {
				this.validateName();
				if (this.nameError) return;

				if (!this.timeRange || this.timeError) {
					this.showNotification('请选择有效的时间段');
					return;
				}

				try {
					// 检查时间冲突（排除当前预约）
					const existing = await getReservationsByRoomAndDate(this.roomType, this.date);
					const otherReservations = existing.filter(item => item.id !== this.editingId);
					
					if (this.checkTimeConflict(otherReservations)) {
						this.showNotification('该时间段已被预约，请选择其他时间');
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

					this.showNotification('修改成功', 'success');
					this.$router.push({
						path: '/pages/reservation/check',
						query: { refresh: true }
					});
				} catch (error) {
					this.showNotification(`修改失败: ${error.message}`);
					console.error('更新错误:', error);
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
			},
			roomConfirm(e) {
				this.roomType = e.value[0].name;
				this.showRoomPicker = false;
			},
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

	/* 优化uView组件样式 */
	:deep(.u-form-item__body) {
		padding: 12px 0;
	}

	:deep(.u-input__content) {
		min-height: auto;
	}
</style>
