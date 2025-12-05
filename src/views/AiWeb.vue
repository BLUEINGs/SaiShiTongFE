<template>
  <div class="ai-web-page">
    <div class="content-wrapper">
      <div class="action-bar">
        <div class="left">
          <div class="page-title">
            智能裁判<sup class="beta">β</sup>
          </div>
        </div>

        <div class="filter-section">
          <filter-bar v-model="filter" :options="filterOptions" @change="handleFilterChange" />
        </div>

        <div class="right">
          <el-button type="primary" icon="el-icon-plus" @click="openAddForm">创建比赛</el-button>
        </div>
      </div>

      <div class="ai-judge-container">
        <ai-card v-for="match in filteredList" :key="match.spId" :spId="match.spId" :name="match.name"
          :start-time="match.startTime" :end-time="match.endTime" :state="match.state" />

        <div v-if="filteredList.length === 0" class="no-data">
          <i class="fas fa-basketball-ball"></i>
          <p>暂无比赛数据</p>
        </div>
      </div>
    </div>

    <add-match-form :visible.sync="showForm" @submit="handleSubmit" @cancel="showForm = false" />
  </div>
</template>

<script>
import AiCard from '@/components/AiCard.vue';
import FilterBar from '@/components/filter/FilterBar.vue';
import AddMatchForm from '@/components/AddMatchForm.vue';
import request from '@/utils/request';

export default {
  name: 'AiWeb',
  components: {
    AiCard,
    FilterBar,
    AddMatchForm
  },
  data() {
    return {
      matchList: [],
      filter: 0,
      filterOptions: [
        { value: 0, label: '全部' },
        { value: 1, label: '报名中' },
        { value: 2, label: '进行中' },
        { value: 3, label: '已结束' }
      ],
      showForm: false
    };
  },
  computed: {
    filteredList() {
      if (this.filter === 0) return this.matchList;
      return this.matchList.filter(m => m.state === this.filter);
    }
  },
  mounted() {
    this.fetchScoreData();
  },
  methods: {
    openAddForm() {
      this.showForm = true;
    },
    handleFilterChange(newFilter) {
      this.filter = newFilter;
    },
    async fetchScoreData() {
      try {
        const response = await request({
          url: '/saishitong/basketballEvent',
          method: 'get'
        });
        this.handleResponse(response);
      } catch (error) {
        console.error(`请求失败: ${error.message || '未知错误'}`);
        this.$message.error(error.message || '获取比赛列表失败');
      }
    },
    handleResponse(response) {
      if (response && response.code === 1) {
        if (response.data && Array.isArray(response.data)) {
          this.matchList = response.data;
        } else {
          this.matchList = [];
          this.$message.warning('获取到的比赛数据格式异常');
        }
      } else {
        this.matchList = [];
        this.$message.error(response && response.message ? response.message : '获取比赛列表失败');
      }
    },
    async handleSubmit(formData) {
      // 直接复用 AiHead 的提交逻辑：将时间转为 ISO 格式后提交
      try {
        const converted = { ...formData };
        for (const key in converted) {
          if (key.includes('Time') && converted[key]) {
            converted[key] = new Date(converted[key]).toISOString();
          }
        }
        const res = await request({
          method: 'post',
          url: '/saishitong/basketballGame/information',
          data: converted,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        console.log(res)
        if (res && res.code == 1) {
          this.$message.success(`创建成功: ${res.message}`);
        } else {
          this.$message.error(`操作失败: ${res.message}`);
        }
        this.showForm = false;
        this.fetchScoreData();
      } catch (err) {
        console.error('提交失败:', err);
        this.$message.error(err.message || '请求失败');
      }
    }
  }
};
</script>

<style scoped>
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 16px;
}

.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
}

.beta {
  font-size: 12px;
  margin-left: 4px;
  color: #ff7a18;
}

.filter-section {
  flex: 1;
}

.right {
  flex-shrink: 0;
}

.ai-judge-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
  row-gap: 15px;
  column-gap: 30px;
  justify-content: center;
  padding: 0 0 30px 0;
  min-height: calc(100vh - 160px);
  /* background-color: #f5f7fa; */
}

.no-data {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 250px;
  color: #718096;
  font-size: 18px;
  font-weight: 600;
}

.no-data i {
  font-size: 42px;
  margin-bottom: 15px;
}

@media (max-width: 1080px) {
  .ai-judge-container {
    grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
    padding: 15px 20px;
    row-gap: 12px;
  }
}

@media (max-width: 768px) {
  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-section {
    width: 100%;
  }

  .right .el-button {
    width: 100%;
  }

  .ai-judge-container {
    grid-template-columns: 1fr;
    padding: 15px;
    row-gap: 15px;
    column-gap: 0;
  }
}
</style>