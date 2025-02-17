<template>
	<view class="container">
		<!-- 图片区域保持不变 -->

		<view class="calculator-card">
			<u-form :model="formData" ref="uForm">
				<!-- 房间选择 -->
				<u-form-item label="房间类型" prop="room" borderBottom @click="showRoomPicker = true">
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
				<u-form-item label="使用时间" prop="minutes" borderBottom>
					<u--input
						v-model="inputMinutes"
						placeholder="请输入使用时间（分钟）"
						border="none"
						type="number"
					></u--input>
				</u-form-item>

				<!-- VIP选择 -->
				<u-form-item label="VIP优惠" prop="vip" borderBottom>
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
		<view class="bottom-nav-wrapper">
		  <BottomNav activeIndex="2" />
		</view>
	</view>
</template>

<script>
	import BottomNav from '@/pages/BottomNav/BottomNav.vue';

	export default {
		components: {
			BottomNav
		},
		data() {
			return {
				rooms: [
					{ name: '麻将室', price: 30 },
					{ name: '象棋室', price: 20 },
					{ name: '扑克室', price: 30 },
					{ name: '桌游室', price: 40 }
				],
				selectedRoom: { name: '麻将室', price: 30 },
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
				// 添加调试信息
				console.log('开始计算，输入分钟数：', this.inputMinutes);
				
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
					// 打印中间计算值
					console.log('基础分钟数：', Math.max(minutes, 60));
					
					let total = 0;
					const baseMinutes = Math.max(minutes, 60);
					const hours = Math.floor(baseMinutes / 60);
					total += this.selectedRoom.price * hours;
					console.log('基础费用：', total);

					const extraMinutes = baseMinutes % 60;
					if (extraMinutes > 0) {
						const extraFee = Math.ceil(extraMinutes / 30) * 5;
						total += extraFee;
						console.log('附加费用：', extraFee);
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
						${extraMinutes > 0 ? `- 附加费用: ${Math.ceil(extraMinutes/30)}个半小时段 × 5元 = ${extraFee}元\n` : ''}
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
	padding: 20rpx;
	
	.zoom-image {
		height: 400rpx;
		margin-bottom: 30rpx;
		overflow: hidden;
		
		.room-img {
			width: 100%;
			height: 100%;
			transition: transform 0.3s;
			
			&.zoomed {
				transform: scale(1.5);
			}
		}
	}
	.result-popup {
		width: 500rpx;
		min-height: 300rpx;
		background: #fff;
		border-radius: 20rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 40rpx;
		
		.popup-content {
			width: 100%;
			text-align: center;
			
			.result-text {
				font-size: 36rpx;
				color: #2979ff;
				font-weight: bold;
			}
		}
	}
	.result-area {
		width: 100%;
		margin-top: 30rpx;
		padding: 30rpx;
		background-color: #f8f8f8;
		border-radius: 16rpx;
		border: 2rpx solid #e4e7ed;
		animation: fadeIn 0.3s ease;

		@keyframes fadeIn {
			from { opacity: 0; transform: translateY(20rpx); }
			to { opacity: 1; transform: translateY(0); }
		}
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
