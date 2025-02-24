<template>
  <view class="container">
    <view class="calculator-card">
      <form @submit.prevent>
        <!-- 房间选择 -->
        <van-field label="房间类型:" :value="selectedRoom.name" readonly placeholder="请选择房间类型"
          @click="showRoomPicker = true">
          <template #right-icon>
            <van-icon name="arrow-down" />
          </template>
        </van-field>
        <!-- 房间选择器 -->
        <van-popup v-model="showRoomPicker" position="bottom">
          <van-picker :columns="rooms.map(r => ({ ...r, text: `${r.name}（${r.price}元/小时）` }))" value-key="text"
            :default-index="getDefaultRoomIndex()" @confirm="roomConfirm" @cancel="showRoomPicker = false" show-toolbar
            title="选择房间类型" :confirm-button-text="'确定'" :cancel-button-text="'取消'" />
        </van-popup>

        <!-- 时间输入 -->
        <van-field label="使用时间:" v-model="inputMinutes" type="number" placeholder="请输入使用时间（分钟）" />

        <!-- VIP选择 -->
        <van-field label="VIP优惠" colon>
          <template #input>
            <van-checkbox v-model="isVip" shape="round" >我是VIP（享受8折优惠）</van-checkbox>
          </template>
        </van-field>
      </form>

      <!-- 计算按钮 -->
      <van-button type="primary" @click="calculateFee" round style="margin-top: 30rpx;">
        立即计算
      </van-button>

      <!-- 结果展示区域 -->
      <view class="result-area" v-if="showResult">
        <view class="result-text" v-html="resultText"></view>
        <van-button type="primary" size="normal" @click="showResult = false" style="margin-top: 30rpx;">
          关闭
        </van-button>
      </view>
    </view>
  </view>
</template>

<script>
import { Picker } from 'vant';
export default {
  components: {
    [Picker.name]: Picker,
  },
  data() {
    return {
      rooms: [
        { name: '扑克室', price: 20 },
        { name: '麻将室', price: 20 },
        { name: '象棋室', price: 15 },
        { name: '桌游室', price: 40 }
      ],
      selectedRoom: { name: '扑克室', price: 20 },
      inputMinutes: '',
      isVip: false,
      showResult: false,
      showRoomPicker: false,
      resultText: '总费用: 0元'
    };
  },
  methods: {
    getDefaultRoomIndex() {
      return this.rooms.findIndex(room => room.name === this.selectedRoom.name);
    },
    roomConfirm(e) {
      this.selectedRoom = this.rooms.find(room =>
        room.name === e.name && room.price === e.price
      );
      this.showRoomPicker = false;
    },
    calculateFee() {
      console.log('[费用计算] 开始计算', {
        room: this.selectedRoom,
        minutes: this.inputMinutes,
        isVip: this.isVip
      });
      
      try {
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
          <p>房间类型: ${this.selectedRoom.name}</p>
          <p>使用时间: ${displayMinutes}</p>
          <p>VIP会员: ${vipStatus}</p>
          <p>----------------------------</p>
          <p>计费规则:</p>
          <p>- 基础费用: ${baseHours}小时 × ${this.selectedRoom.price}元/小时 = ${this.selectedRoom.price * baseHours}元</p>
          ${extraMinutes > 0 ? `<p>- 附加费用: 超过${Math.ceil(extraMinutes / 30)}个半小时段 × 5元 = ${extraFee}元（不足半小时按半小时算）</p>` : ''}
          <p>总费用: ${Math.round(total)}元</p>
        `;

        this.showResult = true;

        // 计费过程日志
        console.log(`[计费规则] 基础时间:${baseMinutes}分钟 单价:${this.selectedRoom.price}元`);
        console.log(`[附加费用] 额外分钟:${extraMinutes} 计费段数:${Math.ceil(extraMinutes/30)}`);
        
        // 结果生成日志
        console.log('[计算结果] 最终费用:', total);
      } catch (e) {
        console.error('[计算异常]', e);
        uni.showToast({ title: '计算出现错误', icon: 'none' });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  padding: 30rpx;
  background: var(--background);

  .calculator-card {
	background: var(--button-hover);
    border-radius: 24rpx;
    padding: 40rpx 30rpx;
    box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
    border: 1rpx solid #ebeef5;
  }

  .van-field {
    margin-bottom: 30rpx;
    border-radius: 16rpx;
    padding: 24rpx 30rpx;
    background: var(--button-hover);
    transition: all 0.3s;

    &__label {
      font-weight: 500;
      color: var(--text);
    }

    &:active {
      background: #f0f2f5;
    }
  }

  .van-button--primary {
    background: linear-gradient(135deg, #409EFF, #3375b9);
    border: none;
    width: 100%;
    font-weight: 500;

    &:hover {
      opacity: 0.9;
      box-shadow: 0 6rpx 16rpx rgba(41, 121, 255, 0.4);
    }
  }

  .result-area {
    animation: fadeIn 0.4s cubic-bezier(0.22, 0.61, 0.36, 1);
    margin-top: 50rpx;
    padding: 40rpx;
    background: linear-gradient(135deg, #f6faff, #ebf5ff);
    border: 1rpx solid #ebf5ff;

    .result-text {
      font-size: 28rpx;
      color: var(--text-primary);
      line-height: 1.6;
      background: var(--card-bg);
      border: 1px solid var(--border-color);

      p {
        margin: 15rpx 0;
        color: #606266;

        &:last-child {
          color: #409EFF;
          font-weight: 600;
          font-size: 32rpx;
        }
      }
    }

    .van-button {
      align-items: center;
      margin-right: 20rpx;
      background: rgba(255, 0, 0, 0.1);
      color: #ff0000;
    }
  }

  // 时间输入特别样式
  [type="number"] {
    font-weight: 500;
    color: #303133;
  }

  // VIP复选框样式
  .van-checkbox__label {
    color: var(--text-primary);
  }



  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(30rpx) scale(0.95);
    }

    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .van-picker-column__item {
    color: var(--text-primary) !important;
  }

  .van-picker__confirm {
    color: var(--primary-color) !important;
  }
}
</style>