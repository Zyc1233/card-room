<template>
	<view class="container">
		<van-cell-group title="费用计算" class="calculator-card">
			<!-- 房间选择 -->
			<van-cell
				title="房间类型:"
				:value="selectedRoom.name"
				is-link
				@click="showRoomPicker = true"
			/>

			<!-- 时间输入 -->
			<van-field
				v-model="inputMinutes"
				label="使用时间:"
				placeholder="请输入分钟数"
				type="number"
				clearable
			/>
			<van-popup v-model="showRoomPicker" position="bottom">
			  <van-picker
			    title="请选择预约房间"
			    :columns="rooms"
			    value-key="name"
			    show-toolbar
			    @confirm="roomConfirm"
			    @cancel="showRoomPicker = false"
			  />
			</van-popup>

			<!-- VIP选择 -->
			<van-cell center title="VIP会员（8折优惠）">
				<van-switch
					v-model="isVip"
					size="24px"
					active-color="#07c160"
				/>
			</van-cell>

			<!-- 操作按钮 -->
			<view class="action-buttons">
				<van-button
					type="info"
					block
					@click="calculateFee"
					custom-class="calculate-btn"
				>
					立即计算
				</van-button>
			</view>

			<!-- 结果展示 -->
			<van-collapse :value="showResult ? ['result'] : []">
				<van-collapse-item name="result" title="计算结果">
					<view class="result-content">
						{{ resultText }}
					</view>
					<van-button
						plain
						type="info"
						size="small"
						@click="showResult = false"
					>
						关闭
					</van-button>
				</van-collapse-item>
			</van-collapse>
		</van-cell-group>

		<!-- 房间选择器 -->
		<van-popup
			:show="showRoomPicker"
			position="bottom"
			@close="showRoomPicker = false"
		>
			<van-picker
				:columns="rooms"
				value-key="name"
				@confirm="roomConfirm"
				@cancel="showRoomPicker = false"
			/>
		</van-popup>
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
				isVip: false,
				showResult: false,
				showRoomPicker: false,
				resultText: '总费用: 0元'
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
			}
		}
	}
</script>

<style lang="scss" scoped>
.container {
	padding: 30rpx;
	background: #f5f7fa;
}

.calculator-card {
	margin: 16px;
	border-radius: 8px;
	overflow: hidden;
	
	::v-deep .van-cell__title {
		flex: 0 0 80px;
	}

	.action-buttons {
		padding: 16px;
		
		.calculate-btn {
			border-radius: 8px;
		}
	}

	.result-content {
		padding: 12px;
		background: #f8f9fa;
		border-radius: 6px;
		margin: 12px 0;
		white-space: pre-wrap;
		line-height: 1.6;
	}
}

.van-form-item__message {
	color: #fa3534;
	font-size: 24rpx;
	padding-top: 8rpx;
}
</style>
