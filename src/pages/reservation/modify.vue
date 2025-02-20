<template>
	<view class="room-reservation">
		<!-- 使用van-form重构表单 -->
		<van-form class="form-container" @submit="submitForm">
			<!-- 房间类型 -->
			<van-field
				readonly
				clickable
				name="roomType"
				:value="roomType"
				label="房间类型"
				placeholder="请选择房间类型"
				@click="showRoomPicker = true"
			/>
			
			<!-- 预约日期 -->
			<van-field
				readonly
				clickable
				name="date"
				:value="formattedDate"
				label="预约日期"
				placeholder="请选择日期"
				@click="showDatePicker = true"
			/>

			<!-- 时间选择 -->
			<van-field
				readonly
				clickable
				name="startTime"
				:value="startTime"
				label="开始时间"
				placeholder="选择开始时间"
				@click="showStartPicker = true"
			/>
			<van-field
				readonly
				clickable
				name="endTime"
				:value="endTime"
				label="结束时间"
				placeholder="选择结束时间"
				@click="showEndPicker = true"
			/>

			<!-- 用户名称 -->
			<van-field
				v-model="name"
				name="name"
				label="用户名称"
				placeholder="请输入姓名"
				:error-message="nameError"
			/>

			<!-- 操作按钮 -->
			<div class="button-group">
				<van-button round block type="primary" native-type="submit">确认修改</van-button>
			</div>
		</van-form>

		<!-- Vant组件 -->
		<van-popup v-model="showRoomPicker" position="bottom">
			<van-picker
				title="选择房间类型"
				:columns="roomOptions"
				value-key="name"
				show-toolbar
				@confirm="roomConfirm"
				@cancel="showRoomPicker = false"
			/>
		</van-popup>

		<van-calendar
			v-model:show="showDatePicker"
			:min-date="minDate"
			:max-date="maxDate"
			@confirm="dateConfirm"
			:default-date="date"
		/>

		<!-- 开始时间选择器 -->
		<van-popup v-model="showStartPicker" position="bottom">
			<van-datetime-picker
				v-model="startTimeValue"
				type="time"
				title="选择开始时间"
				@confirm="handleStartConfirm"
			/>
		</van-popup>

		<!-- 结束时间选择器 -->
		<van-popup v-model="showEndPicker" position="bottom">
			<van-datetime-picker
				v-model="endTimeValue"
				type="time"
				title="选择结束时间"
				@confirm="handleEndConfirm"
			/>
		</van-popup>
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
				date: new Date(),
				name: '',
				startTime: '',
				endTime: '',
				startTimeValue: dayjs().format('HH:mm'),
				endTimeValue: dayjs().add(1, 'hour').format('HH:mm'),
				showStartPicker: false,
				showEndPicker: false,
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
				minDate: new Date(dayjs().format('YYYY-MM-DD')),
				maxDate: new Date(dayjs().add(365, 'day').format('YYYY-MM-DD')),
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
					// 使用nextTick确保DOM更新
					this.$nextTick(() => {
						this.editingId = this.$route.query.id;
						this.roomType = this.$route.query.roomType;
						this.name = this.$route.query.name;
						
						const parseTime = (timeString) => {
							return dayjs(timeString, 'HH:mm').format('HH:mm');
						};

						this.startTime = parseTime(this.$route.query.startTime);
						this.endTime = parseTime(this.$route.query.endTime);
						
						this.date = dayjs(this.$route.query.date).toDate();
					});
				}
			},
			validateName() {
				this.nameError = this.name.trim() ? '' : '请输入预约人姓名';
			},
			validateTime() {
				if (!this.startTime || !this.endTime) return;
				
				const start = dayjs(this.startTime, 'HH:mm');
				const end = dayjs(this.endTime, 'HH:mm');
				
				if (end.isBefore(start)) {
					this.timeError = '结束时间不能早于开始时间';
				} else if (end.diff(start, 'minute') < 60) {
					this.timeError = '预约时长至少需要60分钟';
				} else {
					this.timeError = '';
				}
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

				if (this.timeError || !this.startTime || !this.endTime) {
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
						startTime: this.startTime,
						endTime: this.endTime,
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
				const newStart = dayjs(this.startTime, 'HH:mm');
				const newEnd = dayjs(this.endTime, 'HH:mm');
				
				return existing.some(item => {
					const existStart = dayjs(item.startTime, 'HH:mm');
					const existEnd = dayjs(item.endTime, 'HH:mm');
					return (newStart.isBefore(existEnd) && newEnd.isAfter(existStart));
				});
			},
			roomConfirm(e) {
				this.roomType = e.value[0].name;
				this.showRoomPicker = false;
			},
			dateConfirm(e) {
				this.date = new Date(e);
				this.showDatePicker = false;
			},
		}
	}
</script>

<style scoped>
	/* 修改样式适配Vant */
	.form-container {
		padding: 20px;
	}

	.van-field {
		margin-bottom: 15px;
	}

	.button-group {
		margin: 30px 16px 0;
	}

	/* 保留原有其他样式 */
</style>
