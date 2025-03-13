<template>
	<div class="room-reservation">
		<!-- 添加toast组件 -->
		<u-toast ref="uToast"></u-toast>

		<!-- 轮播图改用u-swiper -->
		<u-swiper :list="swiperList" keyName="image" :title="currentPriceText" showTitle @change="handleSwiperChange"
			height="200" indicator indicatorMode="dot" indicatorActiveColor="#3c9cff" radius="4" :previousMargin="30"
			:nextMargin="30" circular bgColor="#f3f4f6">

		</u-swiper>

		<!-- 表单容器 -->
		<div class="form-container">
			<u-form @submit="submitForm">
				<!-- 房间类型选择改用u-picker -->
				<u-form-item label="房间类型:" prop="roomType" borderBottom @click="showRoomPicker = true"
					label-width="160rpx">
					<u--input v-model="roomType" disabled disabledColor="#ffffff" placeholder="请选择房间类型"
						border="none"></u--input>
					<u-icon name="arrow-down" slot="right"></u-icon>
				</u-form-item>

				<!-- 添加房间选择器 -->
				<u-picker :show="showRoomPicker" :columns="[roomOptions]" keyName="name" @confirm="roomConfirm"
					@cancel="showRoomPicker = false"></u-picker>

				<!-- 日期选择改用u-calendar -->
				<u-form-item label="预约日期:" prop="date" borderBottom @click="showDatePicker = true" label-width="160rpx">
					<u--input :value="formattedDate" disabled disabledColor="#ffffff" placeholder="请选择日期"
						border="none"></u--input>
					<u-icon name="arrow-down" slot="right"></u-icon>
				</u-form-item>

				<!-- 修改日期选择器为u-calendar -->
				<u-calendar :show="showDatePicker" mode="single" :minDate="minDate" :maxDate="maxDate"
					@confirm="dateConfirm" @close="showDatePicker = false" :defaultDate="date" title="选择预约日期"
					color="#3c9cff"></u-calendar>

				<!-- 修改时间选择部分 -->
				<u-form-item label="预约时间:" prop="timeRange" borderBottom @click="openTimePicker" label-width="160rpx">
					<u--input v-model="timeRange" disabled disabledColor="#ffffff" placeholder="请选择时间"
						border="none"></u--input>
				</u-form-item>

				<!-- 修改时间选择弹窗为uview组件 -->
				<u-modal :show="showTimePicker" title="选择预约时间" @confirm="confirmTimePicker" @cancel="closeTimePicker"
					:showCancelButton="true" width="80%">
					<view class="time-picker-content">
						<view class="time-input-container">
							<text class="time-label">开始时间</text>
							<u-input v-model="startHour" type="number" placeholder="时" :max="23" :min="0"
								border="bottom" @input="validateTime('start')"></u-input>
							<text class="time-colon">:</text>
							<u-input v-model="startMinute" type="number" placeholder="分" :max="59" :min="0"
								border="bottom" @input="validateTime('start')"></u-input>
						</view>

						<view class="time-input-container">
							<text class="time-label">结束时间</text>
							<u-input v-model="endHour" type="number" placeholder="时" :max="23" :min="0" border="bottom"
								@input="validateTime('end')"></u-input>
							<text class="time-colon">:</text>
							<u-input v-model="endMinute" type="number" placeholder="分" :max="59" :min="0"
								border="bottom" @input="validateTime('end')"></u-input>
						</view>

						<view class="time-validation">
							<u-alert title="时间格式错误" v-if="timeError" :title="timeError" type="error"
								:showIcon="true"></u-alert>
							<u-text v-else type="info" :text="`时长：${durationHours}小时${durationMinutes}分钟`"></u-text>
						</view>
					</view>
				</u-modal>

				<!-- 姓名输入 -->
				<u-form-item label="用户名称:" prop="name" label-width="160rpx">
					<u-input v-model="name" placeholder="请输入姓名"></u-input>
				</u-form-item>

				<!-- 操作按钮 -->
				<u-button type="primary" @click="submitForm">立即预约</u-button>
				<u-button @click="viewReservation">查看预约</u-button>
			</u-form>
		</div>
	</div>
</template>

<script>
	// 引入依赖组件和工具库
	import {
		addReservation,
		getReservationsByRoomAndDate,
		getAllReservations,
		checkDuplicateReservation
	} from '@/utils/db';
	import dayjs from 'dayjs'; // 日期处理库

	export default {
		data() {
			return {
				// 修改轮播图数据结构
				swiperList: [{
						image: '/static/puke.png',
						title: '扑克室 15 元/小时 1 小时起,每半小时加 5 元'
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

				// 表单数据
				roomType: '扑克室1', // 选择的房间类型
				timeRange: '', // 显示的时间范围文本
				name: '', // 预约人姓名

				// 时间选择相关状态
				startHour: '', // 开始小时
				startMinute: '', // 开始分钟
				endHour: '', // 结束小时
				endMinute: '', // 结束分钟
				timeError: '', // 时间验证错误信息

				// 组件显示控制
				showDatePicker: false, // 日期选择器显示状态
				showTimePicker: false, // 时间选择弹窗显示状态
				showRoomPicker: false, // 房间选择器显示状态

				// 静态数据
				roomOptions: [{
						name: '扑克室1'
					},
					{
						name: '扑克室2'
					},
					{
						name: '麻将室1'
					},
					{
						name: '麻将室2'
					},
					{
						name: '象棋室1'
					},
					{
						name: '象棋室2'
					},
					{
						name: '桌游室1'
					},
					{
						name: '桌游室2'
					}
				],
				timeColumns: [
					Array.from({
						length: 24
					}, (_, i) => `${i}时`),
					Array.from({
						length: 60
					}, (_, i) => `${i}分`)
				],
				minDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
				maxDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
				date: dayjs().format('YYYY-MM-DD'), // 默认当天
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
			// 计算持续时间
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
			this.loadReservations(); // 初始化加载预约记录
		},
		methods: {
			// 表单提交处理
			async submitForm() {
				// 表单验证流程修改为uview提示
				if (!this.roomType) {
					this.$refs.uToast.show({
						title: '请选择房间类型',
						type: 'error'
					});
					return;
				}
				if (!this.date) {
					this.$refs.uToast.show({
						title: '请选择预约日期',
						type: 'error'
					});
					return;
				}
				if (!this.startTime || !this.endTime) {
					this.$refs.uToast.show({
						title: '请选择预约时间',
						type: 'error'
					});
					return;
				}
				if (!this.name) {
					this.$refs.uToast.show({
						title: '请输入预约人姓名',
						type: 'error'
					});
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
					this.$refs.uToast.show({
						title: '该时间段您已存在完全相同的预约记录',
						type: 'warning'
					});
					return;
				}

				// 修改时间有效性验证逻辑
				const now = new Date();
				const startDateTime = new Date(`${this.date}T${this.startTime}`);
				const endDateTime = new Date(`${this.date}T${this.endTime}`);

				// 仅保留过期时间检查
				if (now > endDateTime) {
					this.$refs.uToast.show({
						title: '预约时间已全部过期',
						type: 'error'
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

				try {
					const existing = await getReservationsByRoomAndDate(this.roomType, this.date);
					if (checkConflict(existing)) {
						this.$refs.uToast.show({
							title: '该时间段已被预约',
							type: 'error'
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
					this.$refs.uToast.show({
						title: '保存预约失败',
						type: 'error'
					});
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
				this.startHour = startTime.getHours().toString().padStart(2, '0');
				this.startMinute = startTime.getMinutes().toString().padStart(2, '0');
				this.endHour = (startTime.getHours() + 1).toString().padStart(2, '0');
				this.endMinute = startTime.getMinutes().toString().padStart(2, '0');
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
					this.$refs.uToast.show({
						title: '请选择一个日期',
						type: 'error'
					});
					return;
				}
				this.showDatePicker = false;
			},
			confirmTimePicker() {
				if (this.timeError) {
					this.$refs.uToast.show({
						title: this.timeError,
						type: 'error',
						icon: false
					});
					return;
				}
				this.timeRange = `${this.startHour}:${this.startMinute} - ${this.endHour}:${this.endMinute}`;
				this.startTime = `${this.startHour}:${this.startMinute}`;
				this.endTime = `${this.endHour}:${this.endMinute}`;
				this.showTimePicker = false;
			},
			selectDate(day) {
				this.date =
					`${this.selectedYear}-${String(this.selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
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
				this.daysInMonth = Array.from({
					length: days + firstDay
				}, (_, i) => {
					if (i < firstDay) {
						return {
							day: null,
							isToday: false
						};
					}
					const day = i - firstDay + 1;
					const isToday =
						day === today.getDate() &&
						this.selectedMonth === today.getMonth() + 1 &&
						this.selectedYear === today.getFullYear();
					return {
						day,
						isToday
					};
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
			// 时间验证逻辑
			validateTime(type) {
				const sanitizeInput = (value, max) => {
					// 确保输入值为字符串类型
					const strValue = String(value).replace(/\D/g, ''); // 先转换为字符串再处理

					if (strValue === '') return '';

					let numValue = parseInt(strValue) || 0;

					// 处理两位数自动跳转
					if (strValue.length >= 2) {
						numValue = parseInt(strValue.slice(0, 2));
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

				this.checkTimeValidation(); // 执行时间关系验证
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

				this.timeError = !this.startHour || !this.startMinute || !this.endHour || !this.endMinute ? '请完成时间输入' :
					end <= start ? '结束时间必须晚于开始时间' :
					(end - start) < 60 ? '预约时长至少60分钟' : '';
			},
			updateStartTime() {
				this.validateTime('start');
			},
			updateEndTime() {
				this.validateTime('end');
			},
			handleTimeConfirm(e) {
				const [startH, startM] = e.value[0];
				const [endH, endM] = e.value[1];
				// 处理时间选择逻辑...
			},
			roomConfirm(e) {
				this.roomType = e.value[0].name;
				this.showRoomPicker = false;
			},
			dateConfirm(e) {
				this.date = e[0];
				this.showDatePicker = false;
			},
			async loadReservations() {
				try {
					const reservations = await getAllReservations();
				} catch (error) {
					this.$refs.uToast.show({
						title: '加载预约记录失败',
						type: 'error'
					});
				}
			}
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
		padding: 20rpx 30rpx 120rpx;
		min-height: 100vh;
		background: #f5f7f8;
	}

	.form-container {
		background: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-top: 40rpx;
		box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
	}

	.u-form-item {
		padding: 28rpx 0 !important;
		border-color: #eee !important;
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
			width: 140rpx;
			font-size: 28rpx;
			color: #333;
		}

		.u-input {
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

	.u-button {
		margin-top: 50rpx;
		height: 88rpx;
		font-size: 32rpx;

		&--primary {
			background: linear-gradient(45deg, #3c9cff, #2b85e4);
			box-shadow: 0 4rpx 12rpx rgba(59, 137, 232, 0.3);
		}

		&+.u-button {
			margin-top: 30rpx;
		}
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



	.swiper-arrow.left {
		left: 20rpx;
	}

	.swiper-arrow.right {
		right: 20rpx;
	}
</style>