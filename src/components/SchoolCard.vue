<template>
    <div class="school-card-container">
        <div class="school-card" :class="{ 'is-active': isActive }">
            <!-- 卡片头部 -->
            <div class="card-header" @click="$emit('toggle', localSchoolData.id)">
                <div class="school-info">
                    <div class="title-content">
                        <h3>{{ schoolName }}</h3>
                        <p class="slogan">{{ schoolSlogan }}</p>
                    </div>
                </div>
                <div v-if="isEditMode" class="actions">
                    <el-tooltip content="邀请加入该团体" placement="top">
                        <el-button icon="el-icon-user" type="success" circle
                            @click.stop="handleInviteSchool"></el-button>
                    </el-tooltip>
                    <el-button icon="el-icon-edit" circle @click.stop="showEditDialog"></el-button>
                    <el-button type="danger" icon="el-icon-delete" circle @click.stop="handleDelete"></el-button>
                </div>
                <img :src="schoolImage" class="school-image">
            </div>

            <!-- 展开内容 -->
            <div v-show="isActive" class="card-content">
                <div v-if="!isShowScoreDetails" class="inner-wrapper" v-loading="loading">
                    <!-- 常规标签页面板 -->
                    <el-tabs v-model="activeTab">
                        <el-tab-pane label="运动员" name="athletes">
                            <!-- 运动员列表 -->
                            <div class="athletes-list">
                                <div v-for="athlete in sortedPlayers" :key="athlete.pid" class="athlete-item" :class="{
                                    'is-leader': isLeader(athlete),
                                    'is-current-user': isCurrentUser(athlete)
                                }">
                                    <div class="athlete-info">
                                        <el-avatar :size="40" :src="athlete.head || null">
                                            {{ athlete.name.charAt(0) }}
                                        </el-avatar>
                                        <div class="details">
                                            <div class="name">
                                                {{ athlete.name }}
                                                <el-tag size="mini" type="info" v-if="athlete.number">
                                                    #{{ athlete.number }}
                                                </el-tag>
                                                <el-tag size="mini" type="danger" v-if="isLeader(athlete)">负责人</el-tag>
                                                <el-tag size="mini" type="warning"
                                                    v-if="isCurrentUser(athlete)">我</el-tag>
                                            </div>
                                            <div class="meta" v-if="!isLeader(athlete)">
                                                <span>项目: {{ getAthleteEvents(athlete) }}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="isEditMode || isCurrentUser(athlete)" class="actions">
                                        <el-tooltip v-if="athlete.uid === null" :content="`邀请${athlete.name}注册`"
                                            placement="top">
                                            <el-button type="success" icon="el-icon-user" circle
                                                @click="handleInvitePlayer(athlete)">
                                            </el-button>
                                        </el-tooltip>
                                        <el-button type="primary" icon="el-icon-edit" circle
                                            @click="handleEditPlayer(athlete)">
                                        </el-button>
                                        <el-button type="danger" v-if="!isCurrentUser(athlete)" icon="el-icon-delete"
                                            circle @click="handleDeletePlayer(athlete)">
                                        </el-button>
                                    </div>
                                </div>
                                <!-- 修改添加按钮区域 -->
                                <div v-if="isEditMode && canAddMore" class="action-buttons">
                                    <!-- 当 powerDegree 包含 5 时显示分开的按钮 -->
                                    <template v-if="isAdmin">
                                        <div class="add-button add-athlete" @click="handleAddPlayer">
                                            <i class="el-icon-plus"></i>
                                            <span>添加运动员</span>
                                        </div>
                                        <div class="add-button add-leader" @click="handleAddLeader">
                                            <i class="el-icon-plus"></i>
                                            <span>添加负责人</span>
                                        </div>
                                    </template>
                                    <!-- 不是管理员时显示单个按钮 -->
                                    <div v-else class="add-button add-athlete" @click="handleAddPlayer">
                                        <i class="el-icon-plus"></i>
                                        <span>添加运动员</span>
                                    </div>
                                </div>
                                <!-- 添加退出团体按钮，放在添加按钮后面 -->
                                <div v-if="hasCurrentUserRecord" class="quit-school" @click="handleQuitSchool">
                                    <i class="el-icon-warning"></i>
                                    退出当前团体
                                </div>
                            </div>
                        </el-tab-pane>

                        <el-tab-pane label="得分情况" name="scores">
                            <!-- 分数统计 -->
                            <div class="score-stats">
                                <div class="degree-item">
                                    <h4>团体总分</h4>
                                    <div class="score">{{ formatDegree(detail?.totalDegree) }}分</div>
                                    <el-button type="text" @click="showScoreDetails('all')">
                                        查看详情
                                    </el-button>
                                </div>
                                <div class="degree-item">
                                    <h4>男子总分</h4>
                                    <div class="score">{{ formatDegree(detail?.maleDegree) }}分</div>
                                    <el-button type="text" @click="showScoreDetails('male')">
                                        查看详情
                                    </el-button>
                                </div>
                                <div class="degree-item">
                                    <h4>女子总分</h4>
                                    <div class="score">{{ formatDegree(detail?.femaleDegree) }}分</div>
                                    <el-button type="text" @click="showScoreDetails('female')">
                                        查看详情
                                    </el-button>
                                </div>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </div>

                <!-- 分数详情面板 -->
                <div v-else class="score-details-panel">
                    <div class="panel-header">
                        <h3>{{ scoreDetailsTitle }}</h3>
                        <el-button class="close-btn" icon="el-icon-close" circle @click="closeScoreDetails">
                        </el-button>
                    </div>
                    <div class="score-details-content">
                        <el-table :data="currentScoreDetails" border>
                            <el-table-column prop="eventName" label="比赛项目">
                                <template slot-scope="scope">
                                    {{ formatEventName(scope.row) }}
                                </template>
                            </el-table-column>
                            <el-table-column prop="athleteName" label="运动员" />
                            <el-table-column label="成绩">
                                <template slot-scope="scope">
                                    {{ formatScore(scope.row.score) }}
                                </template>
                            </el-table-column>
                            <el-table-column prop="degree" label="得分" />
                        </el-table>
                    </div>
                </div>
            </div>
        </div>

        <!-- 使用封装好的 PlayerDialog 代替原来的运动员对话框 -->
        <player-dialog :visible.sync="playerDialogVisible" :is-edit="isEditingPlayer" :player-data="currentPlayer"
            :school-id="localSchoolData.id" :school-name="schoolName" :sport-events="sportEvents"
            :max-events="maxPlayerEvents" @success="handlePlayerSuccess" />

        <!-- 使用SchoolDialog -->
        <school-dialog :visible.sync="dialogVisible" :is-edit="true" :school-data="localSchoolData"
            :level-config="levelConfig" @success="handleEditSuccess" />

        <!-- 添加确认对话框 -->
        <confirm-dialog :visible.sync="showDeleteConfirm" title="警告" message="确定要删除该团体吗?" :show-checkbox="true"
            checkbox-label="同时删除该团体下所有运动员的团体身份" @confirm="confirmDelete" @cancel="showDeleteConfirm = false" />

        <!-- 修改邀请码对话框内容 -->
        <base-dialog title="邀请码" :visible.sync="inviteDialogVisible" width="400px">
            <div class="invite-content">
                <p>（有效期为3天）</p>
                <p class="invite-code" :class="{ 'is-existing': isExistingCode }">{{ inviteCode }}</p>
                <p>已复制到剪贴板，快去邀请{{ inviteGender ? '他' : '她' }}吧</p>
            </div>
        </base-dialog>
    </div>
</template>

<script>
import SchoolDialog from '@/components/dialogs/SchoolDialog.vue'
import PlayerDialog from '@/components/dialogs/PlayerDialog.vue'
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'
import BaseDialog from './BaseDialog.vue'
import request from '@/utils/request'
import { formatEventName } from '@/utils/formatters'

export default {
    name: 'SchoolCard',
    components: {
        SchoolDialog,
        PlayerDialog,
        ConfirmDialog,
        BaseDialog
    },
    props: {
        schoolData: {
            type: Object,
            required: true
        },
        isActive: Boolean,
        isEditMode: Boolean,
        isSchoolMode: Boolean,
        maxPlayers: {
            type: Number,
            required: true // 改为必需
        },
        loading: {  // 添加loading属性
            type: Boolean,
            default: false
        },
        sportEvents: { // 添加sportEvents到props
            type: Array,
            default: () => []
        },
        maxEvents: {
            type: Number,
            required: true // 改为必需
        },
        levelConfig: {
            type: Array,
            required: true // 改为必需
        }
    },
    data() {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        return {
            activeTab: 'athletes',
            scoreDetailsTitle: '',
            currentScoreDetails: [],
            playerDialogVisible: false,
            isEditingPlayer: false,
            currentPlayer: {
                id: null,
                name: '',
                class: '',
                gender: null,
                events: [],
                head: '',
                level: {}
            },
            playerFile: null,
            localPlayers: [], // 添加本地运动员数据
            isShowScoreDetails: false,
            localSchoolData: {}, // 添加本地学校数据
            detail: null, // 保存详情数据
            maxAthletes: 8, // 默认最多8名运动员
            maxPlayerEvents: 7, // 默认每人最多报7个项目
            dialogVisible: false,
            showDeleteConfirm: false,
            inviteDialogVisible: false,
            inviteCode: '',
            inviteGender: true, // true为男，false为女
            isExistingCode: false, // 添加标记是否为已存在的邀请码
            currentUserId: userInfo.uid || null,
            currentUserInfo: userInfo
        }
    },
    watch: {
        'schoolData': { // 修改这里,监听整个schoolData对象
            immediate: true,
            handler(val) {
                this.localSchoolData = JSON.parse(JSON.stringify({
                    id: val.id,
                    name: val.name,
                    slogan: val.slogan,
                    image: val.image,
                    teamNumber: val.teamNumber || []
                }));
            }
        },
        'schoolData.detail.players': {
            immediate: true,
            handler(val) {
                this.localPlayers = val ? [...val] : []
            }
        },
        isActive: {
            immediate: true,
            handler(val) {
                if (val && !this.detail) {  // 修改这里，只在没有详情数据时获取
                    this.fetchSchoolDetail() // 不再通过handleActiveChange中转
                }
            }
        }
    },
    computed: {
        canAddMore() {
            return !this.detail?.players ||
                this.detail.players.length < this.maxAthletes
        },
        schoolPlayers() {
            return this.detail?.players || []
        },
        schoolName() {
            return this.localSchoolData.name;
        },
        schoolSlogan() {
            return this.localSchoolData.slogan || '暂无口号';
        },
        schoolImage() {
            return this.localSchoolData.image || null;
        },
        // 添加排序后的运动员列表
        sortedPlayers() {
            if (!this.localPlayers) return [];

            return [...this.localPlayers].sort((a, b) => {
                // 负责人优先
                if (a.userType === 2 && b.userType !== 2) return -1;
                if (b.userType === 2 && a.userType !== 2) return 1;
                return 0;
            });
        },

        // 判断是否为当前用户
        isCurrentUser() {
            return (player) => player.uid == this.currentUserId;
        },

        // 判断是否为负责人
        isLeader() {
            return (player) => player.userType === 2;
        },
        // 添加 isAdmin 计算属性
        isAdmin() {
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            const powerDegree = JSON.parse(userInfo.powerDegree || '[]');
            return powerDegree.includes(5);
        },
        // 添加新的计算属性判断是否显示退出按钮
        hasCurrentUserRecord() {
            if (!this.detail?.players || !this.currentUserId) return false;

            // 仅当用户是运动员或负责人时显示退出按钮
            return this.detail.players.some(player =>
                player.uid === this.currentUserId &&
                (player.userType === 2 || player.userType === 4)
            );
        }
    },
    methods: {
        formatEventName, // 添加formatEventName方法
        validateEvents(rule, value, callback) {
            if (!value || value.length === 0) {
                callback()
                return
            }

            const uniqueMainSpIds = new Set(value.map(event => event.mainSpId))
            if (uniqueMainSpIds.size > this.maxPlayerEvents) { // 使用新的限制值
                callback(new Error(`每名运动员最多可报${this.maxPlayerEvents}个不同主项目`))
            } else {
                callback()
            }
        },
        handleEventsChange(selectedEvents) {
            console.log('事件改变，当前选择的项目:', selectedEvents);

            // 添加性别检查：如果运动员性别未选择，不允许选择任何项目
            if (this.currentPlayer.gender === null) {
                this.$message.warning('请先选择运动员性别');
                this.currentPlayer.events = []; // 清空已选项目
                return;
            }

            // 确保所有选中的项目都有mainSpId
            const hasAllMainSpIds = selectedEvents.every(event => event && event.mainSpId != null);

            if (!hasAllMainSpIds) {
                console.error('存在没有mainSpId的项目，需要检查数据转换过程');
                this.$message.error('项目数据不完整，请联系管理员');
                return;
            }

            if (!this.validateEventSelection(selectedEvents)) {
                this.$message.warning(`最多只能选择${this.maxEvents}个不同的主项目`);
                return;
            }

            // 修改性别验证逻辑：只验证有性别要求的项目
            const hasGenderConflict = selectedEvents.some(event => {
                return event.gender !== null && event.gender !== this.currentPlayer.gender;
            });

            if (hasGenderConflict) {
                this.$message.warning('不能选择与运动员性别不符的项目');
                return;
            }

            this.currentPlayer.events = selectedEvents;
        },
        getAthleteEvents(athlete) {
            if (athlete.userType === 2) {
                return ''; // 负责人不显示项目信息
            }
            if (!athlete || !Array.isArray(athlete.events)) {
                return '暂无参赛项目'
            }
            return athlete.events.map(event => formatEventName(event)).join('、')
        },
        formatDegree(value) {
            if (value === null || value === undefined) return 0;
            return Number(value).toFixed(1);
        },
        formatScore(scoreStr) {
            if (!scoreStr) return '暂无成绩';
            try {
                // 处理字符串形式的 scoreMap，如 "{分=3, 秒=40}"
                const score = scoreStr.replace(/[{}]/g, '').split(',').map(s => s.trim());
                return score.map(item => {
                    const [unit, value] = item.split('=');
                    return `${value}${unit}`;
                }).join('');
            } catch (e) {
                console.error('成绩格式化失败:', e);
                return scoreStr;
            }
        },
        showScoreDetails(gender) {
            this.isShowScoreDetails = true
            this.scoreDetailsTitle = gender === 'all' ? '团体得分明细' :
                `${gender === 'male' ? '男子' : '女子'}比赛得分明细`

            this.currentScoreDetails = gender === 'all' ?
                [...(this.detail?.maleDegreeDetails || []),
                ...(this.detail?.femaleDegreeDetails || [])] :
                this.detail?.[`${gender}DegreeDetails`] || []

            if (this.currentScoreDetails.length === 0) {
                this.$message.info('暂无得分明细数据')
                this.isShowScoreDetails = false
            }
        },
        closeScoreDetails() {
            this.currentScoreDetails = [];
            this.scoreDetailsTitle = '';
            this.isShowScoreDetails = false
        },
        handleAddPlayer() {
            this.isEditingPlayer = false
            this.currentPlayer = {
                id: Date.now(),
                name: '',
                class: '',
                gender: null,
                events: [],
                head: null,
                isLeader: false // 标记为运动员
            }
            this.playerDialogVisible = true
        },
        async handleAddLeader() {
            this.isEditingPlayer = false;
            this.currentPlayer = {
                id: Date.now(),
                name: '',
                class: '',
                gender: null,
                head: null,
                isLeader: true // 标记为负责人
            };
            this.playerDialogVisible = true;
        },
        handleEditPlayer(player) {
            this.isEditingPlayer = true
            this.currentPlayer = {
                id: player.id,
                pid: player.pid,
                name: player.name,
                number: player.number,
                class: player.pClass || '',
                gender: player.gender,
                head: player.head,
                sports: [...(player.sports || [])],
                events: this.convertPlayerEvents(player),
                level: player.level || {},
                isLeader: player.userType === 2, // 根据 userType 判断是否为负责人
                isEditing: true // 添加编辑标记
            }
            this.playerDialogVisible = true
        },
        async handleDeletePlayer(player) {
            try {
                await this.$confirm(
                    '删除该运动员将同时取消其已报名的所有项目，是否继续？',
                    '警告',
                    {
                        type: 'warning',
                        confirmButtonText: '确定',
                        cancelButtonText: '取消'
                    }
                )

                const res = await request({
                    url: '/deletePlayer',
                    method: 'get',
                    params: { pid: player.pid }
                })

                if (res.code === 1) {
                    this.$message.success('删除成功')
                    // 删除后重新获取学校详情
                    await this.fetchSchoolDetail()
                }
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('删除运动员失败:', error)
                    this.$message.error('删除运动员失败')
                }
            }
        },
        async handleDelete() {
            this.showDeleteConfirm = true
        },

        async confirmDelete(deleteWithPlayers) {
            try {
                const res = await request({
                    url: '/deleteSchool',
                    method: 'get',
                    params: {
                        scId: this.schoolData.id,
                        deletePlayers: deleteWithPlayers
                    }
                });

                if (res.code === 1) {
                    // 删除成功后不再重新获取详情，而是触发刷新列表事件
                    this.$emit('refresh');
                    this.$message.success('删除成功');
                }
            } catch (error) {
                console.error('删除团体失败:', error);
                this.$message.error('删除团体失败');
            }
        },
        handlePlayerSuccess(/* player */) {
            // 关闭对话框后重新获取学校详情
            this.playerDialogVisible = false
            this.fetchSchoolDetail()
        },
        convertPlayerEvents(player) {
            if (!Array.isArray(player.sports) || !Array.isArray(this.sportEvents)) {
                return [];
            }
            return player.sports.map(spId => {
                const event = this.sportEvents.find(e => e.spId === spId);
                if (!event) {
                    console.warn(`未找到ID为${spId}的比赛信息`);
                    return null;
                }
                return {
                    id: event.spId,
                    name: event.name,
                    status: event.status,
                    mainSpId: event.mainSpId,
                    compType: event.compType,
                    gender: event.gender
                };
            }).filter(Boolean);
        },
        updatePlayerImage(imageUrl) {
            this.currentPlayer.head = imageUrl
        },
        updatePlayerFile(file) {
            this.playerFile = file
        },
        async fetchSchoolDetail() {
            if (!this.localSchoolData.id) return;

            this.$emit('update:loading', true);
            try {
                const res = await request({
                    url: '/getSchoolDetail',
                    method: 'get',
                    params: { scId: this.localSchoolData.id }
                });

                if (res.code === 1) {
                    // 修改得分明细的数据处理逻辑
                    const maleDegreeDetails = (res.data.maleDegreeDetails || []).map(detail => ({
                        ...detail,
                        spId: detail.spId,  // 确保spId字段存在
                        gender: true,        // 添加性别字段
                        compType: detail.compType || 3  // 添加比赛类型字段，默认为决赛
                    }));

                    const femaleDegreeDetails = (res.data.femaleDegreeDetails || []).map(detail => ({
                        ...detail,
                        spId: detail.spId,  // 确保spId字段存在
                        gender: false,       // 添加性别字段
                        compType: detail.compType || 3  // 添加比赛类型字段，默认为决赛
                    }));

                    this.detail = {
                        ...res.data,
                        players: res.data.players?.map(player => ({
                            ...player,
                            id: player.pid, // 添加 id 字段映射
                            pClass: player.pclass || player.pClass, // 处理字段名不一致
                            events: this.convertPlayerEvents(player),
                            sports: player.sports || [], // 确保 sports 字段存在
                            head: player.head
                        })) || [],
                        totalDegree: res.data.totalDegree || 0,
                        maleDegree: res.data.maleDegree || 0,
                        femaleDegree: res.data.femaleDegree || 0,
                        maleDegreeDetails,
                        femaleDegreeDetails
                    };

                    console.log('处理后的学校详情:', this.detail); // 添加日志
                    this.localPlayers = this.detail.players; // 直接赋值而不是用 $set
                }
            } catch (error) {
                console.error('获取学校详情失败:', error);
                this.$message.error('获取学校详情失败');
            } finally {
                this.$emit('update:loading', false);
            }
        },
        showEditDialog() {
            console.log('开启编辑对话框,当前学校数据:', this.localSchoolData);
            this.dialogVisible = true;
        },
        async handleEditSuccess(updatedSchool) {
            // 1. 更新本地数据
            this.localSchoolData = {
                ...this.localSchoolData,
                name: updatedSchool.name,
                slogan: updatedSchool.slogan,
                image: updatedSchool.image,
                teamNumber: updatedSchool.teamNumber || []
            }

            // 2. 如果卡片是展开状态,重新获取详细信息
            if (this.isActive) {
                await this.fetchSchoolDetail()
            }

            // 3. 通知父组件更新
            this.$emit('success', updatedSchool)
        },
        async handleInvitePlayer(player) {
            // 根据是否为负责人设置不同的 userType
            const userType = player.userType === 2 ? [2] : [4];
            await this.createAndShowInviteCode(`pid=${player.pid}`, player.gender, userType);
        },

        async handleInviteSchool() {
            await this.createAndShowInviteCode(`scId=${this.localSchoolData.id}`);
        },

        async copyToClipboard(text) {
            let copied = false;

            // 方案1: 使用新版 Clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                try {
                    await navigator.clipboard.writeText(text);
                    copied = true;
                } catch (err) {
                    console.warn('Clipboard API failed:', err);
                }
            }

            // 如果方案1失败，使用方案2: execCommand
            if (!copied) {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                // 防止滚动
                textarea.style.cssText = 'position:fixed; top:-99999px; left:-99999px; opacity:0;';

                document.body.appendChild(textarea);

                if (navigator.userAgent.match(/ipad|iphone/i)) {
                    // iOS 特殊处理
                    const range = document.createRange();
                    range.selectNodeContents(textarea);
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);
                    textarea.setSelectionRange(0, 999999);
                } else {
                    // 其他设备
                    textarea.select();
                }

                try {
                    copied = document.execCommand('copy');
                    if (!copied) {
                        console.warn('execCommand copy failed');
                    }
                } catch (err) {
                    console.warn('execCommand error:', err);
                    copied = false;
                }

                document.body.removeChild(textarea);
            }

            // 如果两种方案都失败了，至少让用户知道需要手动复制
            if (!copied) {
                // 显示手动复制提示
                this.$message({
                    message: '自动复制失败，请手动复制邀请码',
                    type: 'warning',
                    duration: 3000
                });
            }

            return copied;
        },

        async createAndShowInviteCode(user, gender = null, userType = [4]) {
            try {
                let success = false;
                let code = '';

                while (!success) {
                    code = this.generateRandomCode();
                    const response = await request({
                        url: '/createInviteCode',
                        method: 'post',
                        data: {
                            code,
                            user,
                            userType,
                            expireTime: new Date(Date.now() + 24 * 60 * 60 * 1000 * 3).toISOString()
                        }
                    });

                    if (response.code === 1) {
                        success = true;
                        this.inviteCode = code;
                        this.isExistingCode = false;
                    } else if (response.message == "DUPLICATED_USER") {
                        success = true;
                        this.inviteCode = response.data;
                        this.isExistingCode = true;
                    } else if (response.message !== 'DUPLICATED_CODE') {
                        throw new Error(response.message || '生成邀请码失败');
                    }
                }

                // 先显示对话框，再尝试复制
                this.inviteDialogVisible = true;
                this.inviteGender = gender !== null ? gender : true;

                // 等待DOM更新后再执行复制
                this.$nextTick(async () => {
                    const copySuccess = await this.copyToClipboard(this.inviteCode);
                    if (copySuccess) {
                        this.$message.success('邀请码已复制到剪贴板');
                    }
                });

            } catch (error) {
                console.error('生成邀请码失败:', error);
                this.$message.error(error.message || '生成邀请码失败');
            }
        },

        generateRandomCode() {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';
            let code = '';
            for (let i = 0; i < 8; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return code;
        },
        // 添加退出团体方法
        async handleQuitSchool() {
            try {
                await this.$confirm('确定要退出该团体吗？此操作无法撤销', '警告', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                });

                const params = new URLSearchParams();
                params.append('scId', this.localSchoolData.id);

                const res = await request({
                    url: '/quitSchool',
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: params
                });

                if (res.code === 1) {
                    this.$message.success('退出成功');
                    this.$emit('refresh');
                }
            } catch (error) {
                if (error !== 'cancel') {
                    console.error('退出团体失败:', error);
                    this.$message.error('退出失败');
                }
            }
        },
        isAllowEdit() {
            this.detail.players.forEach(player => {
                if (player.uid === this.currentUserId && player.userType === 2) {
                    return true;
                }
            });
        }

    }
}
</script>

<style lang="less" scoped>
.school-card-container {
    .school-card {
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        overflow: hidden;

        &.is-active {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .card-header {
            position: relative;
            cursor: pointer;
            height: 240px; // 增加高度
            overflow: hidden; // 防止图片溢出

            &:hover {
                background: #f5f7fa;
            }

            .school-info {
                position: relative;
                z-index: 2;
                height: 100%;
                padding: 0 20px;
                margin-top: -10px;
                display: flex;
                flex-direction: column;
                justify-content: flex-end;

                .title-content {
                    text-align: left;

                    h3 {
                        margin: 0;
                        font-size: 28px;
                        color: #fff;
                        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
                    }

                    .slogan {
                        margin: 8px 0 0;
                        color: #fff;
                        font-size: 16px;
                        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
                    }
                }
            }

            .actions {
                position: absolute;
                top: 16px;
                right: 16px;
                z-index: 3;
                display: flex;
                gap: 8px;
            }

            .school-image {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s ease;
                z-index: 1;
            }

            &:hover .school-image {
                transform: scale(1.05); // 添加悬停效果
            }
        }

        .card-content {
            border-top: 1px solid #ebeef5;

            .inner-wrapper {
                // 删除原有的边框样式
                margin: 0;
                padding: 16px;
                background: #fff;
            }

            .athletes-list {
                padding: 16px;

                .athlete-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    margin-bottom: 8px;
                    background: #f5f7fa;
                    border-radius: 4px;
                    transition: all 0.3s;

                    .athlete-info {
                        display: flex;
                        align-items: flex-start; // 改为flex-start
                        gap: 12px;
                        flex: 1; // 添加flex: 1

                        .el-avatar {
                            flex-shrink: 0; // 防止头像被压缩
                            width: 40px !important; // 强制固定宽度
                            height: 40px !important;
                        }

                        .details {
                            flex: 1; // 让details占据剩余空间
                            overflow-wrap: break-word; // 允许长文本换行

                            .name {
                                text-align: left; // 确保名字居左
                                font-size: 15px;
                                margin-bottom: 4px;
                                color: #303133;
                                display: flex;
                                align-items: center;
                                gap: 8px;

                                .el-tag {
                                    margin-left: 8px;
                                }
                            }

                            .meta {
                                text-align: left; // 确保标签居左
                                font-size: 13px;
                                color: #909399;

                                span {
                                    margin-right: 12px;
                                }

                                white-space: normal; // 允许文本换行
                                word-break: break-word;
                            }
                        }
                    }

                    .actions {
                        display: flex;
                        gap: 8px;
                    }
                }
            }

            .action-buttons {
                margin: 16px 0;
                display: grid;
                gap: 10px;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));

                .add-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                    background: #f5f7fa;
                    border: 1px dashed #dcdfe6;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.3s;

                    &:hover {
                        border-color: #409EFF;
                        color: #409EFF;
                    }

                    i {
                        margin-right: 8px;
                    }

                    &.add-leader {
                        background: #ecf5ff;
                        border-color: #409EFF;

                        &:hover {
                            background: #409EFF;
                            color: white;
                        }
                    }
                }
            }

            .score-details-panel {
                padding: 16px;

                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;

                    h3 {
                        margin: 0;
                        font-size: 18px;
                    }

                    .close-btn {

                        // 优化关闭按钮样式
                        &:hover {
                            background: #f56c6c;
                            color: #fff;
                        }
                    }
                }

                .score-details-content {
                    margin-top: 16px;
                }
            }

            .score-stats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 16px;
                padding: 16px 0;

                .degree-item {
                    text-align: center;
                    padding: 20px;
                    background: #f5f7fa;
                    border-radius: 8px;
                    transition: all 0.3s;

                    &:hover {
                        background: #eef5fe;
                    }

                    h4 {
                        margin: 0 0 12px;
                        color: #303133;
                    }

                    .score {
                        font-size: 24px;
                        color: #409EFF;
                        font-weight: bold;
                        margin-bottom: 8px;
                    }
                }
            }
        }
    }

    @media (max-width: 768px) {
        .school-card {
            margin: 0;
            // border-radius: 0;
            box-shadow: none;

            .card-header {
                height: 180px;
            }

            .card-content {
                .inner-wrapper {
                    padding: 10px 0;
                }

                .athletes-list {
                    padding: 10px;

                    .athlete-item {
                        margin: 0 0 10px 0;
                        border-radius: 0;
                    }
                }

                .score-stats {
                    grid-template-columns: 1fr;
                    padding: 10px;
                    gap: 10px;
                }

                .score-details-panel {
                    padding: 10px;
                }
            }
        }
    }
}

.athlete-item {
    &.is-leader {
        background: #ecf5ff;
        border-left: 3px solid #409EFF;
    }

    &.is-current-user {
        background: #fdf6ec;
        border-left: 3px solid #e6a23c;
    }
}

.quit-school {
    margin-top: 16px;
    padding: 12px;
    background: #fef0f0;
    color: #f56c6c;
    border-radius: 4px;
    cursor: pointer;
    text-align: center;
    transition: all 0.3s;

    &:hover {
        background: #fee;
    }

    i {
        margin-right: 8px;
    }
}

.invite-content {
    text-align: center;
    padding: 20px;

    .invite-code {
        font-size: 28px;
        color: #409EFF;
        margin: 24px 0;
        font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        letter-spacing: 3px;
        font-weight: 500;
        background: #f5f7fa;
        padding: 16px;
        border-radius: 8px;
        text-shadow: 0 1px 2px rgba(64, 158, 255, 0.1);

        &.is-existing {
            // 已存在的邀请码使用不同的样式
            background: #ecf5ff;
            border: 1px dashed #409EFF;
        }
    }
}
</style>
