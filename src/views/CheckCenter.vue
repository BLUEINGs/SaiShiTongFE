<template>
  <div class="athlete-management" v-loading="loading">
    <!-- 头部操作栏 -->
    <div class="action-bar">
      <div class="filter-container">
        <!-- 项目类型筛选 -->
        <FilterDropdown 
          v-model="currentEventFilter" 
          :options="filterOptions.event" 
          label="项目" 
          default-value="all" 
          @change="handleEventFilter" 
        />
        
        <!-- 状态筛选 -->
        <FilterDropdown 
          v-model="currentStatusFilter" 
          :options="filterOptions.status" 
          label="状态" 
          default-value="all" 
          @change="handleStatusFilter" 
        />
      </div>
    </div>
  
    <!-- 运动员列表展示区域（此处简化，实际应展示列表） -->
    <div class="athlete-list">
      <!-- 这里会根据筛选条件展示过滤后的运动员数据 -->
        <!-- 空状态时展示出暂无数据 -->
        <h1>暂未开发，敬请期待</h1>
        </div>

   

    </div>
  
</template>

<script>
import FilterDropdown from '@/components/filter/FilterDropdown.vue';
// import { Empty } from 'element-ui';
// import request from '@/utils/request'
// import ResponsiveDialog from '@/components/ResponsiveDialog.vue'

export default {
  name: 'CheckCenter',
  components: {
    FilterDropdown,
   
   
  },
  data() {
    return {
      loading: false, // 数据加载状态
      athletes: [],   // 运动员数据（从API获取）
      
      // 当前筛选值
      currentEventFilter: 'all',     // 当前选中的项目
      currentStatusFilter: 'all',    // 当前选中的状态
      
      // 筛选选项配置
      filterOptions: {
        event: [
          { value: 'all', label: '全部' },
          { value: 'field', label: '田赛' },
          { value: 'track', label: '径赛' }
        ],
        status: [
          { value: 'all', label: '全部' },
          { value: 'notReported', label: '未报到' },
          { value: 'reported', label: '已报到' },
          { value: 'quit', label: '已弃权' }
        ]
      }
    };
  },
  methods: {
    /**
     * 处理项目筛选变化
     * @param {string} event - 选中的项目值 ('all', 'field', 'track')
     */
    handleEventFilter(event) {
      console.log('项目筛选变更:', event);
      this.currentEventFilter = event;
      this.filterAthletes();
    },
    
    /**
     * 处理状态筛选变化
     * @param {string} status - 选中的状态值 ('all', 'notReported', 'reported', 'quit')
     */
    handleStatusFilter(status) {
      console.log('状态筛选变更:', status);
      this.currentStatusFilter = status;
      this.filterAthletes();
    },
    
    /**
     * 根据筛选条件过滤运动员数据
     */
    filterAthletes() {
      // 这里应该从API获取数据，这里简化处理
      let filtered = this.athletes;
      
      // 项目筛选逻辑
      if (this.currentEventFilter !== 'all') {
        filtered = filtered.filter(athlete => 
          athlete.eventType === this.currentEventFilter
        );
      }
      
      // 状态筛选逻辑
      if (this.currentStatusFilter !== 'all') {
        filtered = filtered.filter(athlete => {
          switch (this.currentStatusFilter) {
            case 'notReported':
              return athlete.status === 'NOT_REPORTED';
            case 'reported':
              return athlete.status === 'REPORTED';
            case 'quit':
              return athlete.status === 'QUIT';
            default:
              return true;
          }
        });
      }
      
      console.log('筛选后的运动员列表:', filtered);
      // 这里应该将filtered赋值给展示的列表数据
      
    },
    
    // 模拟从API获取数据的方法
    fetchAthletesData() {
      this.loading = true;
      // 实际应从API获取数据
      this.athletes = [
        { id: 1, name: '张三', eventType: 'field', status: 'NOT_REPORTED' },
        { id: 2, name: '李四', eventType: 'field', status: 'REPORTED' },
        { id: 3, name: '王五', eventType: 'track', status: 'REPORTED' },
        { id: 4, name: '赵六', eventType: 'track', status: 'QUIT' }
      ];
      this.loading = false;
      this.filterAthletes();
    }
  },
  mounted() {
    // 组件挂载时获取数据
    this.fetchAthletesData();
  }
};
</script>

<style scoped>
.athlete-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.action-bar {
 display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding: 0 16px;
        flex-wrap: wrap;
        gap: 16px;
}

.filter-container {
  display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            width: 100%;
}

.athlete-list {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
}
</style>



