<template>
	<view>
		<van-search v-model="value" show-action placeholder="请输入房间类型或日期（格式：YYYY-MM-DD）" @search="searchReservations">
			<template #action>
				<div @click="searchReservations">搜索</div>
			</template>
		</van-search>
		<!-- 历史搜索 -->
		<div class="historyBox" v-if="searchHistory.length > 0">
			<div class="titleBox">
				历史搜索
				<span class="delete_sp" @click="clearHistory">
					<van-icon name="delete" />
				</span>
			</div>
			<div class="storageSearchParams">
				<div v-for="(item, index) in searchHistory" :key="index" class="item" @click="onHistorySearch(item)">{{ item
					}}
				</div>
			</div>
		</div>
		<view class="result-container">
			<van-cell v-for="item in searchResult" :key="item.id" :title="`${item.roomType} - ${formatChineseDate(item.date)}`"
				:label="`${item.startTime}-${item.endTime} | ${item.user}（${item.purpose}）`" />
			<van-empty v-if="searchResult.length === 0" description="暂无相关预约记录" />
		</view>

	</view>
</template>

<script>
import { Search, Cell, Empty } from 'vant';
import { searchReservations } from '@/utils/db';

export default {
	components: {
		Search,
		[Cell.name]: Cell,
		[Empty.name]: Empty
	},
	data() {
		return {
			value: '',
			searchResult: [],
			searchHistory: []
		}
	},
	mounted() {
		this.loadSearchHistory();
	},
	methods: {
		async searchReservations() {
			if (!this.value.trim()) {
				uni.showToast({ title: '请输入搜索关键词', icon: 'none' });
				return;
			}

			try {
				this.saveSearchHistory(this.value.trim());
				
				const results = await searchReservations(this.value);
				this.searchResult = results.sort((a, b) =>
					new Date(b.date) - new Date(a.date)
				);
			} catch (error) {
				uni.showToast({ title: '搜索失败，请重试', icon: 'none' });
			}
		},
		saveSearchHistory(value) {
			let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
			
			const index = history.indexOf(value);
			if (index > -1) {
				history.splice(index, 1);
			}
			
			history.unshift(value);
			
			if(history.length > 10) history = history.slice(0,10);
			
			localStorage.setItem('searchHistory', JSON.stringify(history));
			this.searchHistory = history;
		},
		loadSearchHistory() {
			const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
			this.searchHistory = history;
		},
		clearHistory() {
			uni.showModal({
				title: '提示',
				content: '确定要清空所有历史记录吗？',
				success: (res) => {
					if (res.confirm) {
						localStorage.removeItem('searchHistory');
						this.searchHistory = [];
					}
				}
			});
		},
		onHistorySearch(keyword) {
			this.value = keyword;
			this.searchReservations();
		},
		formatChineseDate(date) {
			try {
				// 处理Date对象和字符串两种格式
				let dateStr = date;
				if (date instanceof Date) {
					dateStr = date.toISOString().split('T')[0];
				}
				
				// 处理可能存在的非标准分隔符
				const cleanDate = dateStr.replace(/[^0-9]/g, '');
				const year = cleanDate.slice(0,4);
				const month = cleanDate.slice(4,6);
				const day = cleanDate.slice(6,8);
				
				return `${year}年${month}月${day}日`;
			} catch (e) {
				console.error('日期处理异常:', date);
				return typeof date === 'string' ? date : '无效日期';
			}
		}
	}
}
</script>

<style>
.result-container {
	padding: 20rpx;
}

.van-cell__title {
	font-weight: bold;
}

.van-cell__label {
	color: #666;
	font-size: 12px;
}

.historyBox {
	padding: 20rpx 30rpx;
}

.titleBox {
	font-size: 28rpx;
	color: #333;
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.delete_sp {
	display: flex;
	align-items: center;
}

.storageSearchParams {
	display: flex;
	flex-wrap: wrap;
	gap: 20rpx;
}

.item {
	padding: 10rpx 20rpx;
	background: #f7f8fa;
	border-radius: 8rpx;
	font-size: 24rpx;
	color: #666;
}
</style>
