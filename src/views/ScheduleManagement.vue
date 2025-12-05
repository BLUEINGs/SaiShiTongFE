<template>
    <div class="schedule-management">
        <div class="filter-bar">
            <div class="filter-container">
                <template v-if="viewMode === 'browse'">
                    <el-select v-model="recentFilters.date" placeholder="选择日期" size="small" class="date-select">
                        <el-option v-for="date in recentDates" :key="date.value" :label="date.label"
                            :value="date.value">
                            {{ date.label }}
                            <small v-if="date.value === today">({{ formatDate(date.value) }})</small>
                        </el-option>
                    </el-select>
                    <el-select v-model="recentFilters.status" multiple placeholder="比赛状态" size="small"
                        class="status-select" :popper-class="'status-select-dropdown'">
                        <el-option label="进行中" value="ongoing">
                            <span style="font-size: 16px">进行中</span>
                        </el-option>
                        <el-option label="已结束" value="completed">
                            <span style="font-size: 16px">已结束</span>
                        </el-option>
                        <el-option label="未开始" value="pending">
                            <span style="font-size: 16px">未开始</span>
                        </el-option>
                    </el-select>
                </template>
                <template v-else>
                    <FilterDropdown v-model="listViewFilters.date" :options="dateOptions" label="日期" placeholder="选择日期"
                        size="small" :hide-label="isMobile" />
                    <FilterDropdown v-model="listViewFilters.timeOfDay" :options="filterOptions.timeOfDay" label="时间段"
                        placeholder="选择时间段" size="small" :hide-label="isMobile" />
                    <FilterDropdown v-model="listViewFilters.compType" :options="filterOptions.compType" label="赛型"
                        placeholder="选择赛型" size="small" :hide-label="isMobile" />
                    <FilterDropdown v-model="listViewFilters.eventType" :options="filterOptions.eventType" label="类型"
                        placeholder="选择类型" size="small" :hide-label="isMobile" />
                </template>
            </div>
            <div class="view-switcher">
                <el-button-group size="small">
                    <el-button :type="viewMode === 'browse' ? 'primary' : ''" icon="el-icon-view"
                        @click="viewMode = 'browse'" circle></el-button>
                    <el-button :type="viewMode === 'list' ? 'primary' : ''" icon="el-icon-menu"
                        @click="viewMode = 'list'" circle></el-button>
                </el-button-group>
            </div>
        </div>

        <!-- 查阅视图 -->
        <div v-show="viewMode === 'browse'" class="browse-view">
            <div class="timeline-container">
                <div v-if="filteredRecentEvents.length === 0" class="empty-state">
                    <i class="el-icon-date"></i>
                    <p>当前没有比赛</p>
                </div>
                <el-timeline v-else>
                    <el-timeline-item v-for="(event, index) in filteredRecentEvents" :key="`${event.id}-${index}`"
                        :timestamp="formatTimeRange(event)" :type="getTimelineItemType(event.status)"
                        :color="getTimelineItemColor(event.status)" placement="top">
                        <el-card class="timeline-card" :class="getStatusClass(event.status)">
                            <div class="event-header">
                                <h3 class="event-title">{{ event.eventName }}</h3>
                                <div class="event-meta">
                                    <span class="status-text">{{ getStatusText(event.status) }}</span>
                                </div>
                            </div>
                            <div class="event-info">
                                <span class="venue">
                                    <i class="el-icon-location"></i>
                                    {{ event.venue }}
                                </span>
                            </div>
                        </el-card>
                    </el-timeline-item>
                </el-timeline>
            </div>
        </div>

        <!-- 列表视图 -->
        <div v-show="viewMode === 'list'" class="list-view">
            <div class="total-count">共 {{ filterListViewData().length }} 条赛程</div>

            <!-- 桌面端表格视图 -->
            <el-table v-if="!isMobile" :data="filterListViewData()" style="width: 100%" border>
                <el-table-column prop="date" label="日期" width="120">
                    <template slot-scope="scope">
                        <template v-if="isEditMode && editingEvent?.id === scope.row.id">
                            <el-date-picker v-model="editingEvent.date" type="date" placeholder="选择日期"
                                value-format="yyyy-MM-dd" />
                        </template>
                        <span v-else>{{ formatDate(scope.row.date) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="时间段" width="240">
                    <template slot-scope="scope">
                        <template v-if="isEditMode && editingEvent?.id === scope.row.id">
                            <el-time-select v-model="editingEvent.startTime" :picker-options="{
                                start: '08:00',
                                step: '00:30',
                                end: '20:00'
                            }" placeholder="开始时间" size="mini" style="width: 110px" @change="handleTimeChange">
                            </el-time-select>
                            <span style="margin: 0 8px">至</span>
                            <el-time-select v-model="editingEvent.endTime" :picker-options="{
                                start: '08:00',
                                step: '00:30',
                                end: '20:00',
                                minTime: editingEvent.startTime
                            }" placeholder="结束时间" size="mini" style="width: 110px" @change="handleTimeChange">
                            </el-time-select>
                        </template>
                        <span v-else>{{ scope.row.startTime }} - {{ scope.row.endTime }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="eventName" label="比赛项目">
                    <template slot-scope="scope">
                        {{ scope.row.eventName }}
                    </template>
                </el-table-column>
                <el-table-column prop="compType" label="赛型" width="100">
                    <template slot-scope="scope">
                        {{ getPhaseText(scope.row.compType) }}
                    </template>
                </el-table-column>
                <el-table-column prop="eventType" label="类型" width="100">
                    <template slot-scope="scope">
                        {{ scope.row.eventType === 1 ? '径赛' : '田赛' }}
                    </template>
                </el-table-column>
                <el-table-column prop="venue" label="比赛场地" width="150">
                    <template slot-scope="scope">
                        <template v-if="isEditMode && editingEvent?.id === scope.row.id">
                            <el-select v-model="editingEvent.venue" placeholder="选择场地">
                                <el-option v-for="venue in venues" :key="venue" :label="venue" :value="venue" />
                            </el-select>
                        </template>
                        <span v-else>{{ scope.row.venue }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                    <template slot-scope="scope">
                        <el-tag :type="getStatusTagType(scope.row.status)">
                            {{ getStatusText(scope.row.status) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="150" v-if="isEditMode">
                    <template slot-scope="scope">
                        <template v-if="editingEvent?.id === scope.row.id">
                            <el-button size="mini" type="success" @click="saveEvent">保存</el-button>
                            <el-button size="mini" type="info" @click="cancelEdit">取消</el-button>
                        </template>
                        <el-button v-else size="mini" type="primary" @click="editEvent(scope.row)">
                            编辑
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 移动端列表视图 -->
            <div v-else class="mobile-list">
                <div v-for="event in filterListViewData()" :key="event.id" class="mobile-list-item"
                    @click="editEvent(event)">
                    <div class="event-content">
                        <div class="name-and-meta">
                            <span class="event-name">{{ event.eventName }}</span>
                            <div class="meta-container">
                                <span class="event-date">{{ formatDate(event.date) }}</span>
                                <span class="event-time">{{ event.startTime }} - {{ event.endTime }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 使用封装的响应式对话框组件 -->
        <responsive-dialog :visible.sync="showEditDialog" title="调整比赛时间" width="500px" @confirm="saveEvent"
            @cancel="cancelEdit">
            <el-form v-if="editingEvent" :model="editingEvent" label-width="100px">
                <el-form-item label="比赛项目">
                    <span>{{ editingEvent.eventName }}</span>
                </el-form-item>
                <el-form-item label="日期">
                    <el-date-picker v-model="editingEvent.date" type="date" value-format="yyyy-MM-dd" />
                </el-form-item>
                <el-form-item label="开始时间">
                    <el-time-picker v-model="editingEvent.startTime" placeholder="选择时间" value-format="HH:mm" />
                </el-form-item>
                <el-form-item label="结束时间">
                    <el-time-picker v-model="editingEvent.endTime" placeholder="选择时间" value-format="HH:mm" />
                </el-form-item>
                <el-form-item label="比赛场地">
                    <el-select v-model="editingEvent.venue" placeholder="选择场地">
                        <el-option v-for="venue in venues" :key="venue" :label="venue" :value="venue" />
                    </el-select>
                </el-form-item>
            </el-form>
        </responsive-dialog>
    </div>
</template>

<script>
import ResponsiveDialog from '@/components/ResponsiveDialog.vue'
import { getSchedules, updateSchedule } from '@/api/schedule'
import { formatEventName } from '@/utils/formatters'
import FilterDropdown from '@/components/filter/FilterDropdown.vue'

export default {
    name: 'ScheduleManagement',
    components: {
        ResponsiveDialog,
        FilterDropdown
    },
    data() {
        return {
            isEditMode: false,
            viewMode: 'browse',
            scheduleData: [],
            loading: false,
            venues: ['主田径场', '副田径场', '室内体育馆', '训练场'],
            currentWeek: new Date().toISOString().split('T')[0],
            editingEvent: null,
            showEditDialog: false,
            timeSlots: Array.from({ length: 13 }, (_, i) => ({
                time: `${(8 + i).toString().padStart(2, '0')}:00`
            })),
            recentFilters: {
                date: new Date().toISOString().split('T')[0],
                status: ['pending', 'ongoing', 'completed'] // 默认全选
            },
            today: new Date().toISOString().split('T')[0],
            isMobile: window.innerWidth <= 768,
            timeTableData: Array.from({ length: 13 }, (_, i) => ({
                time: `${(8 + i).toString().padStart(2, '0')}:00`
            })),
            weekStartDate: null,
            lastFetchTime: 0,
            fetchInterval: 5 * 60 * 1000,
            listViewFilters: {
                date: 'all',
                timeOfDay: 'all',
                compType: 'all',
                eventType: 'all'
            },
            filterOptions: {
                timeOfDay: [
                    { value: 'all', label: '全部' },
                    { value: 'morning', label: '上午' },
                    { value: 'afternoon', label: '下午' }
                ],
                compType: [
                    { value: 'all', label: '全部' },
                    { value: 1, label: '预赛' },
                    { value: 2, label: '半决赛' },
                    { value: 3, label: '决赛' }
                ],
                eventType: [
                    { value: 'all', label: '全部' },
                    { value: 1, label: '径赛' },
                    { value: 2, label: '田赛' }
                ]
            },
            recentDates: [] // 初始化为空数组
        }
    },
    computed: {
        // 筛选最近视图的比赛数据
        filteredRecentEvents() {
            if (!this.scheduleData) return [];

            const filtered = this.scheduleData.filter(event => {
                const matchDate = event.date === this.recentFilters.date;
                const matchStatus = this.recentFilters.status.includes(event.status);
                return matchDate && matchStatus;
            });

            return this.sortByStartTime(filtered);
        },
        formatDateRange() {
            if (!this.currentWeek) return '';

            const start = new Date(this.currentWeek);
            const end = new Date(this.currentWeek);
            end.setDate(end.getDate() + 6);

            return `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`;
        },
        dateOptions() {
            const allOption = [{ value: 'all', label: '全部' }];
            const datesMap = new Map();

            this.scheduleData.forEach(event => {
                if (!datesMap.has(event.date)) {
                    datesMap.set(event.date, {
                        value: event.date,
                        label: this.formatDate(event.date)
                    });
                }
            });

            const uniqueDates = Array.from(datesMap.values())
                .sort((a, b) => new Date(a.value) - new Date(b.value));

            return [...allOption, ...uniqueDates];
        }
    },
    methods: {
        // 数据转换方法：后端数据 -> 前端显示格式
        processScheduleData(data) {
            return data.map(item => ({
                id: item.spId,
                spId: item.spId,
                date: item.gameStartTime?.split('T')[0],
                startTime: item.gameStartTime?.split('T')[1]?.split('+')[0]?.slice(0, 5),
                endTime: item.gameEndTime?.split('T')[1]?.split('+')[0]?.slice(0, 5),
                name: item.name || '未命名比赛',
                eventName: formatEventName(item),
                eventType: item.eventType,
                compType: Number(item.compType) || 1,  // 确保 compType 被正确处理
                venue: item.venue || '待定',
                status: this.calculateStatus(item.gameStartTime, item.gameEndTime),
                gender: item.gender
            }));
        },

        // 根据时间计算比赛状态
        calculateStatus(startTime, endTime) {
            const now = new Date().getTime();
            const start = new Date(startTime).getTime();
            const end = new Date(endTime).getTime();

            if (now < start) return 'pending';
            if (now > end) return 'completed';
            return 'ongoing';
        },

        // 获取赛程数据
        async fetchScheduleData() {
            const now = Date.now();
            // 如果距离上次请求不足5分钟且已有数据，则直接使用现有数据
            if (now - this.lastFetchTime < this.fetchInterval && this.scheduleData.length > 0) {
                this.updateCurrentView();
                return;
            }

            try {
                this.loading = true;
                const res = await getSchedules();
                if (res.code === 1 && Array.isArray(res.data)) {
                    this.scheduleData = this.processScheduleData(res.data);
                    this.lastFetchTime = now;
                    this.updateCurrentView();
                } else {
                    throw new Error(res.message || '数据格式错误');
                }
            } catch (error) {
                this.$message.error('获取赛程数据失败: ' + error.message);
            } finally {
                this.loading = false;
            }
        },

        // 根据当前视图模式更新显示数据
        updateCurrentView() {
            if (this.viewMode === 'browse') {
                const today = new Date();
                const threeDaysLater = new Date(today);
                threeDaysLater.setDate(today.getDate() + 2);

                this.filteredScheduleData = this.scheduleData.filter(item => {
                    const itemDate = new Date(item.date);
                    const matchDate = itemDate >= today && itemDate <= threeDaysLater;
                    const matchStatus = this.recentFilters.status.includes(item.status);
                    return matchDate && matchStatus;
                });
            } else {
                this.filteredScheduleData = this.scheduleData;
            }
        },

        // 保存赛程修改
        async saveEvent() {
            if (!this.editingEvent.spId) return

            try {
                // 创建本地时间Date对象
                const localDate = new Date(this.editingEvent.date);

                // 设置开始时间
                const [startHours, startMinutes] = this.editingEvent.startTime.split(':');
                const startDate = new Date(localDate);
                startDate.setHours(parseInt(startHours), parseInt(startMinutes), 0);

                // 设置结束时间
                const [endHours, endMinutes] = this.editingEvent.endTime.split(':');
                const endDate = new Date(localDate);
                endDate.setHours(parseInt(endHours), parseInt(endMinutes), 0);

                const updateData = {
                    spId: this.editingEvent.spId,
                    startTime: startDate.toISOString(), // 自动转换为UTC时间
                    endTime: endDate.toISOString(),    // 自动转换为UTC时间
                    venue: this.editingEvent.venue
                }

                const res = await updateSchedule(updateData)
                if (res.code === 1) {
                    this.$message.success('保存成功')
                    await this.fetchScheduleData()
                }
            } catch (error) {
                this.$message.error('保存失败')
            } finally {
                this.cancelEdit()
            }
        },

        handleWeekChange(date) {
            this.currentWeek = date;
            this.weekStartDate = new Date(date);
        },

        previousWeek() {
            const date = new Date(this.currentWeek);
            date.setDate(date.getDate() - 7);
            this.currentWeek = date.toISOString().split('T')[0];
        },

        nextWeek() {
            const date = new Date(this.currentWeek);
            date.setDate(date.getDate() + 7);
            this.currentWeek = date.toISOString().split('T')[0];
        },

        getDayLabel(day) {
            const date = new Date(this.currentWeek);
            date.setDate(date.getDate() + day - 1);
            return `${date.getMonth() + 1}月${date.getDate()}日`;
        },

        getScheduleEvent(timeSlot, day) {
            const date = new Date(this.currentWeek);
            date.setDate(date.getDate() + day - 1);
            const dateStr = date.toISOString().split('T')[0];

            return this.scheduleData.filter(event =>
                event.date === dateStr &&
                this.timeOverlaps(timeSlot, event.startTime, event.endTime)
            );
        },

        timeOverlaps(timeSlot, startTime, endTime) {
            const slotTime = parseInt(timeSlot.split(':')[0]);
            const startHour = parseInt(startTime.split(':')[0]);
            const endHour = parseInt(endTime.split(':')[0]);
            return slotTime >= startHour && slotTime < endHour;
        },

        handleTimeChange() {
            // 当时间改变时立即保存
            if (this.editingEvent.startTime && this.editingEvent.endTime) {
                this.saveEvent();
            }
        },

        editEvent(event) {
            // 使用深拷贝来避免直接修改原始数据
            this.editingEvent = JSON.parse(JSON.stringify({
                ...event,
                // 确保时间格式正确
                startTime: event.startTime || '08:00',
                endTime: event.endTime || '09:00'
            }));
            // 手机版或非列表视图时，直接显示对话框
            if (this.isMobile || this.viewMode !== 'list') {
                this.showEditDialog = true;
            }
        },

        cancelEdit() {
            this.editingEvent = null;
            this.showEditDialog = false;
        },

        formatDate(date) {
            if (!date) return '';
            const d = new Date(date);
            return `${d.getMonth() + 1}月${d.getDate()}日`;  // 修改日期格式
        },

        getEventTagType(type) {
            return type === 'track' ? 'primary' : 'success';
        },

        getPhaseTagType(phase) {
            const types = {
                preliminary: 'info',
                semifinal: 'warning',
                final: 'danger'
            };
            return types[phase] || 'info';
        },

        getStatusTagType(status) {
            const types = {
                pending: 'info',
                ongoing: 'warning',
                completed: 'success'
            };
            return types[status] || 'info';
        },

        getStatusText(status) {
            const texts = {
                pending: '未开始',
                ongoing: '进行中',
                completed: '已结束'
            };
            return texts[status] || status;
        },

        getPhaseText(phase) {
            // console.log('获取阶段文本:', phase); // 添加日志
            return {
                1: '预赛',
                2: '半决赛',
                3: '决赛'
            }[phase] || '未知';
        },

        formatTimeRange(event) {
            return `${event.startTime} - ${event.endTime}`;
        },

        getTimelineItemType(status) {
            const types = {
                pending: 'info',
                ongoing: 'warning',
                completed: 'success'
            };
            return types[status] || 'info';
        },

        getTimelineItemColor(status) {
            const colors = {
                pending: '#909399',
                ongoing: '#E6A23C',
                completed: '#67C23A'
            };
            return colors[status] || '#909399';
        },

        getStatusClass(status) {
            return {
                'status-ongoing': status === 'ongoing',
                'status-completed': status === 'completed',
                'status-pending': status === 'pending'
            };
        },

        checkDevice() {
            this.isMobile = window.innerWidth <= 768;
        },

        // 获取最近日期选项
        getRecentDates() {
            if (!this.scheduleData || !this.scheduleData.length) {
                return [{ value: this.today, label: '今天' }];
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            // 使用Map来确保日期唯一性
            const datesMap = new Map();

            this.scheduleData.forEach(event => {
                if (!event.date) return;

                const eventDate = new Date(event.date);
                eventDate.setHours(0, 0, 0, 0);
                const dateKey = event.date; // 使用日期字符串作为key

                if (!datesMap.has(dateKey)) {
                    let label;
                    if (eventDate.getTime() === today.getTime()) {
                        label = '今天';
                    } else if (eventDate.getTime() === tomorrow.getTime()) {
                        label = '明天';
                    } else if (eventDate.getTime() === yesterday.getTime()) {
                        label = '昨天';
                    } else {
                        label = `${eventDate.getMonth() + 1}月${eventDate.getDate()}日`;
                    }

                    datesMap.set(dateKey, {
                        value: event.date,
                        label: label
                    });
                }
            });

            return Array.from(datesMap.values()).sort((a, b) => new Date(a.value) - new Date(b.value));
        },

        filterListViewData() {
            if (!this.scheduleData) return [];

            const filtered = this.scheduleData.filter(event => {
                // 日期筛选
                if (this.listViewFilters.date !== 'all' && event.date !== this.listViewFilters.date) {
                    return false;
                }
                // 时间段筛选
                if (this.listViewFilters.timeOfDay !== 'all') {
                    const hour = parseInt(event.startTime?.split(':')[0] || '0');
                    if (this.listViewFilters.timeOfDay === 'morning' && hour >= 12) return false;
                    if (this.listViewFilters.timeOfDay === 'afternoon' && hour < 12) return false;
                }
                // 赛型筛选
                if (this.listViewFilters.compType !== 'all' && event.compType !== this.listViewFilters.compType) {
                    return false;
                }
                // 田赛/径赛筛选
                if (this.listViewFilters.eventType !== 'all' && event.eventType !== this.listViewFilters.eventType) {
                    return false;
                }
                return true;
            });

            return this.sortByStartTime(filtered);
        },

        // 添加排序方法
        sortByStartTime(events) {
            return [...events].sort((a, b) => {
                const timeA = new Date(`${a.date} ${a.startTime}`).getTime();
                const timeB = new Date(`${b.date} ${b.startTime}`).getTime();
                return timeA - timeB;
            });
        },

        // 修改获取日期选项方法,添加日期距离计算
        getClosestDate(dates) {
            const today = new Date();
            let closest = dates[0];
            let minDiff = Infinity;

            dates.forEach(date => {
                const diff = Math.abs(new Date(date.value) - today);
                if (diff < minDiff) {
                    minDiff = diff;
                    closest = date;
                }
            });

            return closest.value;
        }
    },

    async created() {
        // 先获取数据
        await this.fetchScheduleData();
        // 然后更新日期选项
        this.recentDates = this.getRecentDates();
        // 设置默认选中最近的日期
        if (this.recentDates.length > 0) {
            this.recentFilters.date = this.getClosestDate(this.recentDates);
        }
        this.handleWeekChange(this.currentWeek);

        // 添加定时刷新
        this.refreshTimer = setInterval(() => {
            this.fetchScheduleData();
        }, this.fetchInterval);

        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const powerDegree = userInfo.powerDegree || [];
        this.isEditMode = powerDegree.includes(5);
    },

    // 添加监听器
    watch: {
        viewMode: {
            handler() {
                this.updateCurrentView();
            },
            immediate: true
        },
        'recentFilters.date'() {
            if (this.viewMode === 'browse') {
                this.updateCurrentView();
            }
        },
        'recentFilters.status'() {
            if (this.viewMode === 'browse') {
                this.updateCurrentView();
            }
        },
        currentWeek() {
            this.updateCurrentView();
        },
        listViewFilters: {
            handler() {
                if (this.viewMode === 'list') {
                    this.updateCurrentView();
                }
            },
            deep: true
        }
    },

    beforeDestroy() {
        // 清理定时器
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
    }
};
</script>

<style lang="less" scoped>
.schedule-management {
    padding: 20px;

    .filter-bar {
        position: sticky;
        top: 60px !important; // 统一设置顶部距离
        z-index: 9;
        padding: 8px 20px;
        display: flex;
        align-items: center;
        gap: 10px;
        border-bottom: 1px solid #EBEEF5;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);

        .filter-container {
            display: flex;
            gap: 8px;
            flex: 1;
            min-width: 0;

            .compact-select {
                width: auto;
                flex: 1;
            }

            .date-select {
                ::v-deep {
                    .el-input__inner {
                        font-size: 14px;
                    }
                }
            }

            .status-select {
                min-width: 200px; // 加宽状态筛选器

                ::v-deep {
                    .el-input__inner {
                        font-size: 16px;
                    }

                    .el-select__tags {
                        display: flex !important;
                        flex-wrap: nowrap;
                        overflow: hidden;

                        .el-tag {
                            font-size: 16px;
                            background-color: transparent;
                            border: none;
                            padding: 0 4px;
                            height: auto;
                            line-height: normal;
                        }
                    }
                }
            }

            ::v-deep .filter-dropdown {
                min-width: 0;
                flex: 1;

                .filter-trigger {
                    .value {
                        font-size: 16px;
                    }
                }
            }
        }

        .view-switcher {
            margin-left: auto;
        }
    }

    .mobile-list {
        border-top: 1px solid #EBEEF5;

        .mobile-list-item {
            padding: 12px 16px;
            border-bottom: 1px solid #EBEEF5;
            cursor: pointer;

            &:active {
                background: #f5f7fa;
            }

            .event-content {
                .name-and-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end; // 底部对齐

                    .event-name {
                        font-size: 16px; // 增大字体
                        color: #303133;
                        flex: 1;
                        margin-right: 12px;
                    }

                    .meta-container {
                        display: flex;
                        align-items: baseline;
                        gap: 12px;
                        flex-shrink: 0;

                        .event-date {
                            font-size: 12px;
                            color: #909399;
                        }

                        .event-time {
                            font-size: 16px; // 增大字体
                            color: #303133;
                            font-weight: 700;
                            text-align: right;
                        }
                    }
                }
            }
        }
    }

    .filter-bar {
        position: sticky;
        top: 0;
        z-index: 10;
        background: #fff;
        padding: 10px 20px;
        margin-bottom: 40px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;

        .filter-container {
            display: flex;
            gap: 10px;
            flex: 1;

            .el-select,
            ::v-deep .filter-dropdown {
                max-width: 150px;
            }
        }

        .view-switcher {
            flex-shrink: 0;
        }
    }

    .mobile-event-list {
        padding: 10px;

        .event-card {
            background: #fff;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 10px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;

            &:active {
                background: #f5f7fa;
            }

            .event-main {
                flex: 1;

                .event-name {
                    font-size: 16px;
                    font-weight: 500;
                    margin-bottom: 4px;
                }

                .event-date {
                    font-size: 12px;
                    color: #909399;
                }
            }

            .event-time {
                font-size: 14px;
                color: #606266;
                margin-left: 10px;
            }
        }
    }

    .browse-view {
        .timeline-container {
            padding: 10px;

            .empty-state {
                text-align: center;
                padding: 40px 0;
                color: #909399;

                i {
                    font-size: 48px;
                    margin-bottom: 10px;
                }

                p {
                    margin: 0;
                    font-size: 14px;
                }
            }

            .timeline-card {
                margin: 0 0 0 10px;
                border-radius: 8px;
                transition: all 0.3s;

                &.status-ongoing {
                    background-color: #fdf6ec;
                    border-left: 4px solid #e6a23c;
                }

                &.status-completed {
                    background-color: #f0f9eb;
                    border-left: 4px solid #67c23a;
                }

                &.status-pending {
                    background-color: #f4f4f5;
                    border-left: 4px solid #909399;
                }

                .event-header {
                    .event-title {
                        margin: 0;
                        font-size: 16px;
                        color: #303133;
                        line-height: 1.4;
                    }

                    .event-meta {
                        margin-top: 8px;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        flex-wrap: wrap;

                        .event-phase {
                            color: #606266;
                            font-size: 14px;
                        }
                    }
                }

                .event-info {
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid rgba(0, 0, 0, 0.05);

                    .venue {
                        font-size: 14px;
                        display: flex;
                        align-items: center;
                        gap: 6px;

                        i {
                            color: #909399;
                        }
                    }
                }
            }
        }

        ::v-deep {
            .el-timeline {
                padding-left: 0;
            }

            .el-timeline-item__tail {
                left: 4px;
            }

            .el-timeline-item__node {
                left: 4px;
                size: 8px;
            }

            .el-timeline-item__wrapper {
                padding-left: 20px;
            }

            .el-timeline-item__timestamp {
                font-size: 14px;
                color: #606266;
                margin-bottom: 8px;
            }
        }

        // 移除最外层卡片的阴影和边框
        ::v-deep .el-card {
            border: none;
            box-shadow: none;
            background: transparent;
        }

        .filter-bar {

            // 调整多选器的样式
            ::v-deep .el-select {
                .el-select__tags {
                    white-space: nowrap;
                    overflow: hidden;
                    max-width: calc(100% - 30px); // 为展开按钮预留空间

                    .el-select__tags-text {
                        display: inline-block;
                        max-width: 100%;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    .el-tag {
                        margin-right: 2px;
                    }
                }

                .el-tag--small {
                    max-width: calc(50% - 10px);
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }
        }
    }

    .list-view {
        .filter-section {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;

            .filter-item {
                min-width: 150px;
                flex: 1;
            }
        }

        .total-count {
            margin-left: 16px;
            margin-top: 10px;
            color: #606266;
            font-size: 14px;
        }
    }
}

// 保持原有的响应式样式
@media screen and (max-width: 768px) {
    .schedule-management {
        padding: 0; // 移除整体padding
        padding-bottom: 60px; // 添加底部空间
        min-height: calc(100vh - 60px); // 确保最小高度

        .filter-bar {
            padding: 8px;
            top: 60px !important; // 确保移动端也是60px
            margin-bottom: 0 !important;

            .filter-container {

                .el-select,
                ::v-deep .filter-dropdown {
                    max-width: 90px;
                }

                ::v-deep {
                    .el-select__tags {
                        display: none;
                    }
                }
            }

            ::v-deep {
                .el-radio-button__inner {
                    padding: 8px 12px;
                }
            }
        }

        .browse-view {
            padding-bottom: 20px; // 添加底部间距

            // 移除最外层卡片
            .el-card {
                border: none;
                box-shadow: none;
                background: transparent;
            }

            .timeline-container {
                padding: 0;
                margin-bottom: 20px; // 添加底部间距

                ::v-deep {
                    .el-timeline {

                        // 隐藏时间轴
                        .el-timeline-item__tail,
                        .el-timeline-item__node {
                            display: none;
                        }

                        .el-timeline-item__wrapper {
                            padding-left: 0;
                            padding-right: 0;
                            width: 100%;
                        }

                        .el-timeline-item__timestamp {
                            margin: 10px;
                            padding: 0 10px;
                            display: inline-block;
                            background: #f5f7fa;
                            border-radius: 4px;
                        }

                        .el-timeline-item__content {
                            width: 100%;
                        }

                        .el-card {
                            margin: 0 0 10px 0;
                            width: 100%;
                            border-radius: 0;
                        }
                    }
                }
            }
        }

        .list-view {
            padding-bottom: 20px; // 添加底部间距

            .mobile-list {
                margin-bottom: 20px; // 添加底部间距
            }
        }

        // 修改移动端对话框样式
        ::v-deep .mobile-dialog {
            margin: 0;
            position: fixed; // 改用 fixed 定位
            height: 100vh; // 使用视口高度
            display: flex;
            flex-direction: column;

            .el-dialog__body {
                flex: 1;
                overflow-y: auto; // 允许内容滚动
                -webkit-overflow-scrolling: touch; // 增加 iOS 滚动流畅度
            }

            .el-dialog__footer {
                position: relative; // 改用相对定位
                flex-shrink: 0; // 防止被压缩
            }
        }
    }
}

// 添加全局滚动条样式
::v-deep {
    .el-table__body-wrapper {
        &::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }

        &::-webkit-scrollbar-thumb {
            background: #c0c4cc;
            border-radius: 3px;
        }

        &::-webkit-scrollbar-track {
            background: #f5f7fa;
        }
    }
}

.status-text {
    color: #606266;
    font-size: 14px;
}

// 添加状态选择器下拉菜单样式
::v-deep .status-select-dropdown {
    .el-select-dropdown__item {
        height: 40px;
        line-height: 40px;
        font-size: 16px;
    }
}
</style>
