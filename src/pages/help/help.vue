<template>
	<van-row class="call-container">
		<van-col span="24">
			<van-col class="content" span="24">
				<van-col 
					v-for="(item,index) in helpList" 
					:key="index" 
					class="section"
				>
					<van-cell 
						:title="`${index+1}. ${item.title}`" 
						title-class="custom-title"
					/>
					<van-col class="details">
						<van-cell
							v-for="(detail,i) in item.details"
							:key="i"
							:title="detail"
							:title-class="i===0 ? 'primary-text' : 'info-text'"
							class="detail-item"
						/>
					</van-col>
				</van-col>
				
				<van-cell 
					title="有问题请联系：12345678912" 
					title-class="contact"
					class="contact-cell"
				/>
			</van-col>
		</van-col>
	</van-row>
</template>

<script>
	export default {
		name: 'Call',
		data() {
			return {
				helpList: [
					{
						title: '预约房间',
						details: [
							'点击"房间预约"进入预约界面',
							'选择房间类型、日期、开始时间和结束时间',
							'输入预约人姓名并点击"预约"按钮',
							'预约成功后，系统会跳转到预约详情页面'
						]
					},
					{
						title: '查看预约记录',
						details: [
							'点击"查看预约情况"进入预约列表',
							'预约列表会显示所有预约记录'
						]
					},
					{
						title: '删除预约',
						details: [
							'在预约列表中找到需要删除的预约记录',
							'点击"取消预约"按钮并确认删除'
						]
					},
					{
						title: '修改预约',
						details: [
							'在预约列表中找到需要修改的预约记录',
							'点击"修改预约"按钮并修改相关信息',
							'点击"修改"按钮完成修改'
						]
					},
					{
						title: '前往房间',
						details: [
							'在预约列表中找到需要前往的房间',
							'点击"前往房间"按钮进入房间详情页面',
							'页面会显示房间信息和倒计时',
							'可以通过页面上的按钮控制设备'
						]
					}
				]
			}
		},
		methods: {
			
		}
	}
</script>

<style scoped>
	.call-container {
		padding: 16px;
		min-height: 100vh;
	}

	.content {
		padding: 0 10px;
	}

	.section {
		margin-bottom: 20px;
	}

	.details {
		margin-left: 15px;
	}

	.detail-item {
		padding: 8px 0;
	}

	.contact-cell {
		margin-top: 30px;
		padding: 15px 0;
	}

	/* 新增自定义样式 */
	.custom-title {
		font-size: 16px;
		font-weight: bold;
	}

	.primary-text {
		color: #1989fa;
	}

	.info-text {
		color: #969799;
	}

	.contact {
		color: #ff976a;
		font-size: 14px;
	}
</style>
