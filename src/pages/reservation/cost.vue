<template>
	<view class="container">
		<view class="calculator-card">
			<u-form :model="formData" ref="uForm">
				<!-- 房间选择 -->
				<u-form-item
				 label="房间类型:" 
				 prop="room"  
				 @click="showRoomPicker = true"
				 label-width="160rpx">
					<u--input
						v-model="selectedRoom.name"
						disabled
						disabledColor="#ffffff"
						placeholder="请选择房间类型"
						border="none"
					></u--input>
					<u-icon name="arrow-down" slot="right"></u-icon>
				</u-form-item>

				<!-- 时间输入 -->
				<u-form-item 
				 label="使用时间:" 
				 prop="minutes"
				 label-width="160rpx">
					<u--input
						v-model="inputMinutes"
						placeholder="请输入使用时间（分钟）"
						border="none"
						type="number"
					></u--input>
				</u-form-item>

				<!-- VIP选择 -->
				<u-form-item 
				 label="VIP优惠:" 
				 prop="vip"
				 label-width="160rpx">
					<u-checkbox-group
						v-model="checkboxValue"
						placement="row"
						@change="checkboxChange"
					>
						<u-checkbox 
							:name="true"
							label="我是VIP（享受8折优惠）"
							shape="circle"
						></u-checkbox>
					</u-checkbox-group>
				</u-form-item>
			</u-form>

			<!-- 计算按钮 -->
			<u-button
				type="primary"
				@click="calculateFee"
				customStyle="margin-top: 30rpx"
				shape="circle"
			>立即计算</u-button>

			<!-- 结果展示区域 -->
			<view class="result-area" v-if="showResult">
				<u--text 
					:text="resultText" 
					size="18" 
					color="#2979ff"
					bold
					align="center"
				></u--text>
				<u-button 
					type="primary" 
					size="mini"
					@click="showResult = false"
					customStyle="margin-top: 20rpx;"
				>关闭</u-button>
			</view>

			<!-- 房间选择器 -->
			<u-picker
				:show="showRoomPicker"
				:columns="[rooms]"
				keyName="name"
				@confirm="roomConfirm"
				@cancel="showRoomPicker = false"
			></u-picker>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				rooms: [
					{ name: '麻将室', price: 20 },
					{ name: '象棋室', price: 15 },
					{ name: '扑克室', price: 15 },
					{ name: '桌游室', price: 40 }
				],
				selectedRoom: { name: '麻将室', price: 20 },
				inputMinutes: '',
				checkboxValue: [],
				isVip: false,
				showResult: false,
				showRoomPicker: false,
				isZoomed: false,
				resultText: '总费用: 0元',
				formData: {
					room: '',
					minutes: '',
					vip: false
				}
			}
		},
		methods: {
			roomConfirm(e) {
				this.selectedRoom = e.value[0]
				this.showRoomPicker = false
			},
			calculateFee() {	
				// 加强输入验证
				if (!this.inputMinutes || isNaN(this.inputMinutes) || this.inputMinutes.trim() === '') {
					uni.showToast({ title: '请输入有效时间', icon: 'none' });
					return;
				}

				const minutes = parseInt(this.inputMinutes);
				if (minutes < 1) {
					uni.showToast({ title: '时间需大于0分钟', icon: 'none' });
					return;
				}

				try {
				
					
					let total = 0;
					const baseMinutes = Math.max(minutes, 60);
					const hours = Math.floor(baseMinutes / 60);
					total += this.selectedRoom.price * hours;
			

					const extraMinutes = baseMinutes % 60;
					if (extraMinutes > 0) {
						const extraFee = Math.ceil(extraMinutes / 30) * 5;
						total += extraFee;
					
					}

					if (this.isVip) {
						console.log('应用VIP折扣');
						total *= 0.8;
					}

					// 构建详细结果文本
					const displayMinutes = minutes < 60 ? `${minutes}分钟（按60分钟计费）` : `${minutes}分钟`;
					const vipStatus = this.isVip ? '是（享受8折优惠）' : '否';
					const baseHours = Math.floor(baseMinutes / 60);
					const extraFee = extraMinutes > 0 ? Math.ceil(extraMinutes / 30) * 5 : 0;
					
					this.resultText = `
						房间类型: ${this.selectedRoom.name}
						使用时间: ${displayMinutes}
						VIP会员: ${vipStatus}
						----------------------------
						计费规则:
						- 基础费用: ${baseHours}小时 × ${this.selectedRoom.price}元/小时 = ${this.selectedRoom.price * baseHours}元
						${extraMinutes > 0 ? `- 附加费用: 超过${Math.ceil(extraMinutes/30)}个半小时段 × 5元 = ${extraFee}元（不足半小时按半小时算）\n` : ''}
						总费用: ${Math.round(total)}元
					`;

					this.showResult = true;
				} catch (e) {
					console.error('计算错误：', e);
					uni.showToast({ title: '计算出现错误', icon: 'none' });
				}
			},
			checkboxChange(e) {
				this.isVip = e.includes(true)
				this.formData.vip = this.isVip
			}
		}
	}
</script>

<style lang="scss" scoped>
.container {
	padding: 30rpx;
	background: #f5f7fa;

	.calculator-card {
		background: #fff;
		border-radius: 24rpx;
		padding: 20rpx;
		box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.05);
	}

	.result-area {
		margin-top: 40rpx;
		padding: 40rpx;
		background: linear-gradient(135deg, #f8f9ff 0%, #f1f4ff 100%);
		border-radius: 20rpx;
		border: none;
		box-shadow: 0 4rpx 12rpx rgba(41,121,255,0.1);
		
		.u--text {
			line-height: 1.8;
			padding: 20rpx;
			background: #fff;
			border-radius: 12rpx;
			box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
			white-space: pre-wrap;
			text-align: left;
			
			&::before {
				display: block;
				font-size: 48rpx;
				text-align: center;
				margin-bottom: 20rpx;
			}
		}
		
		.u-button {
			border-radius: 50rpx;
			transition: all 0.3s;
			&:active {
				transform: scale(0.95);
			}
		}
	}

	.u-form-item {
		margin-bottom: 30rpx;
		border-radius: 12rpx;
		padding: 0 20rpx;
		background: #f8f9fa;
		
		&__body {
			padding: 25rpx 0;
		}
	}

	.u-button {
		height: 90rpx;
		font-size: 32rpx;
		letter-spacing: 2rpx;
		box-shadow: 0 4rpx 12rpx rgba(41,121,255,0.3);
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(30rpx) scale(0.95); }
		to { opacity: 1; transform: translateY(0) scale(1); }
	}
}


.u-form-item__message {
	color: #fa3534;
	font-size: 24rpx;
	padding-top: 8rpx;
}

/* 强制弹窗层级 */
::v-deep .u-popup__content {
	z-index: 10086 !important;
	box-shadow: 0 0 20rpx rgba(0,0,0,0.1);
}
</style>
