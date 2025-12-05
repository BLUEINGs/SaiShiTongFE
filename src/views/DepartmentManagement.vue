<template>
    <div class="department-management" v-loading="loading">
        <!-- 修改按钮组 -->
        <div v-if="localEditMode || isAthlete" class="action-bar">
            <div class="floating-buttons">
                <!-- 只有编辑模式才显示添加团体按钮 -->
                <el-button v-if="localEditMode" type="primary" icon="el-icon-plus" @click="handleAddSchool">
                    添加团体
                </el-button>
                <!-- 运动员可以看到加入团体按钮 -->
                <el-button v-if="isAthlete" type="success" icon="el-icon-plus" @click="showJoinDialog">
                    加入团体
                </el-button>
                <!-- 只有编辑模式才显示设置按钮 -->
                <el-button v-if="localEditMode" type="primary" icon="el-icon-setting" circle
                    @click="showConfig"></el-button>
            </div>
        </div>

        <!-- 学校卡片列表 -->
        <transition-group name="card-list" tag="div" class="school-grid" :class="{ 'has-active': activeSchoolId }">
            <school-card v-for="school in schools" :key="school.id" :school-data="school"
                :is-active="activeSchoolId === school.id" :is-edit-mode="localEditMode"
                :max-players="configForm.maxPlayers" :max-events="configForm.maxEvents"
                :level-config="configForm.levelConfig" :loading="loadingDetail" :sport-events="sportEvents"
                @toggle="handleToggleSchool" @success="handleSchoolSuccess" @refresh="fetchSchools" />

            <!-- 修改添加卡片的样式 -->
            <div v-if="localEditMode" :key="'add'" add class="school-card">
                <div class="card-header" @click="handleAddSchool">
                    <div class="school-info">
                        <div class="title-content">
                            <h3>添加团体</h3>
                        </div>
                    </div>
                    <div class="school-image add-placeholder">
                        <i class="el-icon-plus"></i>
                    </div>
                </div>
                <div class="card-content">
                    <school-dialog :visible.sync="schoolDialogVisible" :is-edit="false" :school-data="currentSchool"
                        :level-config="configForm.levelConfig" @success="handleSchoolSuccess" />
                </div>
            </div>
        </transition-group>

        <!-- 参数配置对话框 -->
        <responsive-dialog title="参数配置" :visible.sync="configDialogVisible" width="600px" @confirm="saveConfig"
            @cancel="configDialogVisible = false">
            <el-form :model="configForm" label-width="120px">
                <el-form-item :label="`团体运动员上限`">
                    <el-input-number v-model="configForm.maxPlayers" :min="1" :max="10"></el-input-number>
                </el-form-item>
                <el-form-item label="个人限报项目">
                    <el-input-number v-model="configForm.maxEvents" :min="1" :max="5"></el-input-number>
                    <span class="hint">每名运动员最多可报项目数</span>
                </el-form-item>
                <el-divider>编号级别配置</el-divider>
                <div v-for="(level, index) in configForm.levelConfig" :key="index" class="level-config-item">
                    <div class="level-header" @click="handleLevelHeaderClick">
                        <div class="level-info" @click.stop>
                            <el-input v-model="level.field" placeholder="如：学院" size="small"></el-input>
                            <el-radio-group v-model="level.isNumeric" size="small">
                                <el-radio :label="true">纯数字</el-radio>
                                <el-radio :label="false">自定义</el-radio>
                            </el-radio-group>
                        </div>
                        <div class="level-actions">
                            <el-button type="text"
                                :icon="level.isExpanded ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></el-button>
                            <el-button v-if="index !== 0" type="danger" icon="el-icon-delete" circle size="mini"
                                @click.stop="removeLevelConfig(index)"></el-button>
                        </div>
                    </div>

                    <div v-show="level.isExpanded" class="level-content">
                        <template v-if="level.isNumeric">
                            <el-form-item label="位数限制">
                                <el-input-number v-model="level.digits" :min="1" :max="4"></el-input-number>
                            </el-form-item>
                        </template>
                        <template v-else>
                            <div class="value-pairs">
                                <div v-for="(pair, pairIndex) in level.valuePairs" :key="pairIndex" class="value-pair">
                                    <el-input v-model="pair.label" placeholder="显示值" size="small"></el-input>
                                    <el-input v-model="pair.value" placeholder="实际值" size="small"></el-input>
                                    <el-button type="danger" icon="el-icon-delete" circle size="mini"
                                        @click="removeValuePair(index, pairIndex)">
                                    </el-button>
                                </div>
                                <el-button type="primary" size="small" @click="addValuePair(index)">
                                    添加选项
                                </el-button>
                            </div>
                        </template>
                    </div>
                </div>

                <div class="add-level">
                    <el-button type="primary" icon="el-icon-plus" @click="addLevelConfig">添加级别</el-button>
                </div>
            </el-form>
        </responsive-dialog>

        <!-- 使用新的SchoolDialog组件 -->
        <school-dialog :visible.sync="schoolDialogVisible" :is-edit="isSchoolEdit" :school-data="currentSchool"
            :level-config="configForm.levelConfig" @success="handleSchoolSuccess"
            @validate-team-number="validateTeamNumber" />

        <!-- 添加加入运动会对话框 -->
        <el-dialog title="加入运动会" :visible.sync="joinDialogVisible" width="400px">
            <el-form :model="joinForm" :rules="joinRules" ref="joinForm">
                <el-form-item label="邀请码" prop="inviteCode">
                    <el-input v-model="joinForm.inviteCode" placeholder="请输入邀请码"></el-input>
                </el-form-item>
                <div class="dialog-footer">
                    <el-button @click="joinDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="handleJoin">确定</el-button>
                </div>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>
import SchoolCard from '@/components/SchoolCard.vue'
import ResponsiveDialog from '@/components/ResponsiveDialog.vue'
// import ImageUploader from '@/components/ImageUploader.vue';
// import MultiSelect from '@/components/MultiSelect.vue'
import request from '@/utils/request'
// import MultiLevelInput from '@/components/MultiLevelInput.vue'
import SchoolDialog from '@/components/dialogs/SchoolDialog.vue'

export default {
    components: {
        SchoolCard,
        ResponsiveDialog,
        /*        ImageUploader,
               MultiSelect,
               MultiLevelInput, */
        SchoolDialog
    },
    data() {
        return {
            loading: false,
            localEditMode: false,
            activeSchoolId: null,
            schools: [], // 改为空数组
            sportEvents: [], // 存储原始运动项目数据
            sportEventsMap: {}, // 新增：用于存储运动项目ID到名称的映射
            // 添加/编辑对话框
            dialogVisible: false,
            isEdit: false,
            currentSchool: {
                id: null,
                name: '',
                slogan: '',
                image: '',
                players: [],
                teamNumber: [] // 确保有默认值
            },
            currentPlayer: {
                id: null,
                name: '',
                class: '', // 添加性别字段，默认为null
                gender: null,
                events: [], // 改为数组类型
                head: '',
            },
            rules: {
                name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
                class: [{ required: true, message: '班级不能为空', trigger: 'blur' }],
                gender: [
                    { required: true, message: '请选择性别', trigger: 'change' }
                ],
                events: [
                    // 移除必填验证,只保留数量限制验证
                    {
                        validator: (rule, value, callback) => {
                            if (!value || value.length === 0) {
                                callback() // 允许为空
                                return
                            }
                            const uniqueMainSpIds = new Set(value.map(event => event.mainSpId))
                            if (uniqueMainSpIds.size > this.maxEvents) {
                                callback(new Error(`每名运动员最多可报${this.maxEvents}个不同主项目`))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'change'
                    }
                ]
            },
            // 学校编辑对话框
            schoolDialogVisible: false,
            isSchoolEdit: false,
            schoolFile: null,
            playerFile: null,
            // 参数配置相关
            configDialogVisible: false,
            configForm: {
                maxPlayers: 7,  // 默认改为7
                maxEvents: 3,    // 默认为3个项目
                levelConfig: []
            },
            loadingDetail: false, // 添加这一行
            levelConfig: [
                { value: '年级', useChinese: true, range: [1, 9] },
                { value: '班', useChinese: false, range: [1, 9] }
            ],
            // userPowerDegree: [], // 添加这一行
            // isAddCardActive: false, // 添加这一行
            joinDialogVisible: false,
            joinForm: {
                inviteCode: ''
            },
            joinRules: {
                inviteCode: [
                    { required: true, message: '请输入邀请码', trigger: 'blur' }
                ]
            },
            isAthlete: false
        }
    },
    async created() {
        // 修改加载顺序,使用 Promise.all 但不需要保存结果
        await Promise.all([
            this.fetchConfig(),
            this.fetchSportEvents(),
            this.fetchSchools()
        ]);

        // 初始化权限
        const userInfoJson = localStorage.getItem('userInfo')
        var userInfo;
        if (userInfoJson != null) {
            userInfo = JSON.parse(userInfoJson);
        } else {
            userInfo = {
                userType: [] // 默认权限
            };
        }
        // console.log('userInfo:', userInfo); // 添加日志
        // this.userPowerDegree = userInfo.powerDegree || [];
        this.localEditMode = userInfo.userType.includes(5) || userInfo.userType.includes(2) || false;

        // alert(powerDegree)
        this.isAthlete = userInfo.userType.includes(4) || false;
        // alert(this.isAthlete)
    },
    computed: {
        maxPlayers() {
            return this.configForm.maxPlayers;
        },
        maxEvents() {
            return this.configForm.maxEvents;
        },
        filteredSportEvents() {
            // 编辑时显示所有项目,添加时只显示可选项目
            return this.isEdit
                ? this.sportEvents
                : this.sportEvents.filter(event => event.status < 2);
        },
        getEventOptions() {
            return this.sportEvents
                .filter(event => {
                    return this.isEdit ? true : event.status < 2;
                })
                .map(event => {
                    // 检查当前已选择的项目中相同mainSpId的数量
                    const sameMainSpIdEvents = this.currentPlayer.events.filter(
                        e => e.mainSpId === event.mainSpId
                    );

                    return {
                        id: event.spId,
                        name: this.formatEventName(event),
                        status: event.status,
                        compType: event.compType,
                        mainSpId: event.mainSpId,
                        // 修改disabled逻辑
                        disabled: (event.gender !== null && event.gender !== this.currentPlayer.gender) ||
                            (!this.isEdit && sameMainSpIdEvents.length > 0),
                        hidden: !this.isEdit && event.status >= 2
                    };
                });
        },
    },
    mounted() {
        // 修改加载顺序，确保先获取运动项目列表
        this.updateIsMobile();
        window.addEventListener('resize', this.updateIsMobile);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.updateIsMobile);
    },
    methods: {
        updateIsMobile() {
            // 使用实际视口高度判断
            this.isMobile = window.innerWidth <= 767;
        },
        showConfig() {
            this.configDialogVisible = true
            this.fetchConfig() // 获取当前配置
        },
        async fetchConfig() {
            try {
                const res = await request({
                    url: '/getDepartmentConfig',
                    method: 'get'
                });
                if (res.code === 1) {
                    const config = res.data;
                    // 修改这里：解析并转换配置数据结构
                    const levelConfig = JSON.parse(config.levelConfig).map(level => {
                        if (level.isNumeric) {
                            // 处理数字类型
                            const digits = level.valueRange.find(item => item[0] === 'digits');
                            return {
                                ...level,
                                digits: digits ? digits[1] : 2, // 设置默认值为2
                                valuePairs: [], // 数字类型不需要valuePairs
                                isExpanded: false
                            };
                        } else {
                            // 处理非数字类型
                            return {
                                ...level,
                                valuePairs: level.valueRange.map(([label, value]) => ({
                                    label,
                                    value
                                })),
                                isExpanded: false
                            };
                        }
                    });

                    console.log('处理后的levelConfig:', levelConfig); // 添加日志

                    this.configForm = {
                        maxPlayers: config.maxPlayers,
                        maxEvents: config.maxEvents,
                        levelConfig
                    };
                    return true;
                }
            } catch (error) {
                console.error('获取配置失败:', error);
                this.$message.error('获取配置失败');
                return false;
            }
        },
        async saveConfig() {
            try {
                const configData = new URLSearchParams();
                configData.append('maxPlayers', this.configForm.maxPlayers);
                configData.append('maxEvents', this.configForm.maxEvents);

                // 修改这里：转换回后端需要的格式
                const levelConfigData = this.configForm.levelConfig.map(level => ({
                    field: level.field,
                    isNumeric: level.isNumeric,
                    valueRange: level.isNumeric
                        ? [['digits', parseInt(level.digits) || 2]]
                        : (level.valuePairs || []).map(pair => [pair.label, pair.value])
                }));

                configData.append('levelConfig', JSON.stringify(levelConfigData));

                const res = await request({
                    url: '/updateDepartmentConfig',
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: configData
                });

                if (res.code === 1) {
                    this.$message.success('保存成功')
                    this.configDialogVisible = false
                    await this.fetchConfig() // 重新获取最新配置
                }
            } catch (error) {
                console.error('保存配置失败:', error)
                this.$message.error('保存配置失败')
            }
        },
        toggleEditMode() {
            this.localEditMode = !this.localEditMode;
            if (!this.localEditMode) this.activeSchoolId = null;
            this.$emit('update:isEditMode', this.localEditMode);
        },
        async handleToggleSchool(schoolId) {
            // 如果是同一个学校则关闭
            if (this.activeSchoolId === schoolId) {
                this.activeSchoolId = null;
                return;
            }

            // 先设置activeSchoolId，避免watch触发重复请求
            this.activeSchoolId = schoolId;
        },
        closePanel() {
            this.activeSchoolId = null;
        },
        handleAddPlayer(school) {
            if (school.players.length >= this.maxPlayers) {
                this.$message.warning(`每个团体最多添加${this.maxPlayers}名运动员`);
                return;
            }
            this.currentSchool = school;
            this.isEdit = false;
            this.dialogVisible = true;
            this.currentPlayer = {
                id: Date.now(),
                name: '新运动员',
                class: '未知班级',
                gender: null, // 添加性别字段
                events: [], // 初始化为空数组
                head: null
            };
        },
        handleEditPlayer(school, player) {
            console.log('编辑运动员原始数据:', player);
            this.currentSchool = school;
            this.isEdit = true;
            this.dialogVisible = true;

            // 转换项目数据，包含完整信息
            const events = (player.sports || []).map(spId => {
                const event = this.sportEvents.find(e => e.spId === spId);
                console.log('找到的原始项目数据:', event);
                return event ? {
                    id: event.spId,
                    name: event.name,
                    status: event.status,
                    mainSpId: event.mainSpId, // 添加mainSpId
                    compType: event.compType,  // 添加compType
                    gender: event.gender       // 添加gender
                } : null;
            }).filter(Boolean);

            console.log('转换后的项目数据:', events);

            // 确保设置的是简单对象
            this.currentPlayer = {
                id: player.id,
                pid: player.pid, // 添加pid字段
                name: player.name,
                number: player.number, // 添加number字段
                class: player.pClass || '',
                gender: player.gender,
                head: player.head,
                sports: [...(player.sports || [])],
                events: [...events]  // 使用展开运算符创建新数组
            };

            console.log('当前编辑的运动员完整数据:', this.currentPlayer);
        },
        async handleDeletePlayer(school, player) {
            try {
                const res = await request({
                    url: '/deletePlayer',
                    method: 'get',
                    params: {
                        pid: player.pid // 修改这里：使用 pid 而不是 id
                    }
                });

                if (res.code === 1) {
                    // 本地删除运动员数据
                    const index = school.players.findIndex(a => a.id === player.id);
                    school.players.splice(index, 1);
                    this.$message.success('删除成功');
                }
            } catch (error) {
                console.error('删除运动员失败:', error);
                this.$message.error('删除运动员失败');
            }
        },
        // 关闭对话框重置表单
        handleDialogClose() {
            this.$refs.athleteForm.resetFields()
            this.currentSchool = {
                id: null,
                name: '',
                slogan: '',
                image: '',
                players: []
            }
        },
        // 处理文件选择
        handlePreview(file) {
            // 生成临时预览URL
            const previewURL = URL.createObjectURL(file.raw)
            // 更新数据
            this.currentPlayer = {
                ...this.currentPlayer,
                head: previewURL,
                rawFile: file.raw // 保存原始文件用于后续上传
            }

            // 组件销毁时释放内存
            this.$once('hook:beforeDestroy', () => {
                URL.revokeObjectURL(previewURL)
            })
        },
        clearPreview() {
            URL.revokeObjectURL(this.currentPlayer.head)
            this.currentPlayer.head = ''
            this.currentPlayer.rawFile = null
        },
        // 删除前确认
        handleRemove() {
            return this.$confirm('确定移除该头像？', '提示', {
                type: 'warning'
            })
        },

        // 头像上传成功处理（修改后）
        handleAvatarSuccess(res, file) {
            // 保存文件对象用于后续上传
            this.currentPlayer.file = file.raw
            // 本地预览
            this.currentPlayer.head = URL.createObjectURL(file.raw)
        },
        // 修改提交表单方法
        submitForm() {
            this.$refs.athleteForm.validate(async valid => {
                if (valid) {
                    try {
                        const formData = new FormData();
                        formData.append('name', this.currentPlayer.name);
                        formData.append('age', 18); // 暂时传null
                        formData.append('gender', this.currentPlayer.gender === null ? '' : this.currentPlayer.gender); // 修改这里
                        formData.append('pClass', this.currentPlayer.class); // 注意这里：发送时用pClass
                        formData.append('scId', this.currentSchool.id);
                        formData.append('level', JSON.stringify(this.currentPlayer.level))

                        // 修复：确保编辑时发送正确的pid
                        if (this.isEdit && this.currentPlayer.pid) {
                            formData.append('pid', this.currentPlayer.pid);
                        }

                        // 改为单独添加每个运动项目ID
                        this.currentPlayer.events.forEach(event => {
                            formData.append('sports', event.id);
                        });

                        // 提交前检查状态
                        const oldEvents = this.currentPlayer.events.filter(event => event.status >= 2).map(event.id);
                        const newEvents = this.currentPlayer.events.filter(event => event.status < 2).map(event.id);

                        // 合并状态>=2的旧项目和新选择的项目
                        const finalEvents = [...new Set([...oldEvents, ...newEvents])];

                        // 使用合并后的项目列表
                        finalEvents.forEach(spId => {
                            formData.append('sports', spId);
                        });

                        if (this.playerFile) {
                            formData.append('headFile', this.playerFile);
                        }

                        // 根据是否是编辑模式选择不同的接口
                        const url = this.isEdit ? '/modifyPlayer' : '/addPlayer';
                        // 如果是编辑模式,需要添加运动员ID
                        if (this.isEdit) {
                            formData.append('pid', this.currentPlayer.id);
                        }

                        const res = await request({
                            url,
                            method: 'post',
                            data: formData
                        });

                        if (res.code === 1) {
                            if (this.isEdit) {
                                // 编辑模式：更新本地数据
                                const index = this.currentSchool.players.findIndex(p => p.id === this.currentPlayer.id);
                                this.$set(this.currentSchool.players, index, {
                                    ...this.currentPlayer,
                                    id: res.data
                                });
                                this.$message.success('修改成功');
                            } else {
                                // 新增模式：添加到本地数据
                                const newPlayer = {
                                    id: res.data,
                                    ...this.currentPlayer
                                };
                                this.currentSchool.players.push(newPlayer);
                                this.$message.success('添加成功');
                            }
                            this.dialogVisible = false;
                        }
                    } catch (error) {
                        console.error(`${this.isEdit ? '修改' : '添加'}运动员失败:`, error);
                        this.$message.error(`${this.isEdit ? '修改' : '添加'}运动员失败`);
                    }
                }
            });
        },
        handleAddSchool() {
            this.isSchoolEdit = false
            this.currentSchool = {
                id: Date.now(),
                name: '新学校',
                slogan: '',
                image: 'default-school.jpg',
                players: [],
                teamNumber: [] // 初始化为空数组
            }
            this.schoolDialogVisible = true
        },
        /* async handleDeleteSchool(school) {
            try {
                const res = await request({
                    url: '/deleteSchool',
                    method: 'get',
                    params: {
                        scId: school.id
                    }
                });

                if (res.code === 1) {
                    // 删除成功后直接重新获取数据
                    await this.fetchSchools()
                    this.$message.success('删除成功');
                }
            } catch (error) {
                console.error('删除学校失败:', error);
                this.$message.error('删除学校失败');
            }
        }, */
        handleSchoolSuccess(/* school */) {
            // 不再进行本地更新,直接重新获取数据
            this.fetchSchools()
            this.schoolDialogVisible = false
            this.isSchoolEdit = false
        },
        // 获取所有部门数据
        async fetchSchools() {
            try {
                const res = await request({
                    url: '/getSchools',
                    method: 'get'
                });
                if (res.code === 1) {
                    console.log('获取到的原始团体数据:', res.data); // 添加日志

                    this.schools = res.data.map(school => {
                        let teamNumber = [];
                        try {
                            // 确保解析后的teamNumber是普通数组
                            teamNumber = school.teamNumber ?
                                JSON.parse(JSON.stringify(JSON.parse(school.teamNumber))) : []
                        } catch (e) {
                            console.error(`团体 ${school.name} 的teamNumber解析失败:`, e)
                        }

                        return {
                            id: school.scId,
                            name: school.name || '未命名',
                            slogan: school.slogan || '',
                            image: school.img || null,
                            teamNumber, // 保存解析后的teamNumber
                            players: []
                        };
                    });

                    console.log('处理后的团体数据:', this.schools); // 添加日志
                }
            } catch (error) {
                console.error('获取部门数据失败:', error);
                this.$message.error('获取部门数据失败');
            }
        },
        // 获取运动项目列表
        async fetchSportEvents() {
            try {
                const res = await request({
                    url: '/getAvailableSports',
                    method: 'get'
                });
                if (res.code === 1) {
                    // 确保保留所有属性
                    const plainEvents = res.data.map(event => ({
                        spId: event.spId,
                        name: event.name,
                        gender: event.gender,
                        status: event.status,
                        compType: event.compType,
                        mainSpId: event.mainSpId,
                        compSystem: event.compSystem  // 添加这个字段
                    }));

                    this.sportEvents = plainEvents;
                    console.log('处理后的运动项目数据:', this.sportEvents);

                    // 创建简单的映射对象
                    const mapping = plainEvents.reduce((acc, event) => {
                        acc[event.spId] = event.name;
                        return acc;
                    }, {});

                    // 设置映射
                    this.sportEventsMap = { ...mapping };
                    console.log('创建的项目映射:', this.sportEventsMap);
                }
            } catch (error) {
                console.error('获取运动项目列表失败:', error);
                this.$message.error('获取运动项目列表失败');
            }
        },
        // 验证选择的项目是否超过限制
        validateEventSelection(selectedEvents) {
            console.log('验证前的选中项目:', selectedEvents);

            // 过滤掉没有mainSpId的项目
            const validEvents = selectedEvents.filter(event => {
                const hasMainSpId = event && event.mainSpId != null;
                if (!hasMainSpId) {
                    console.warn('发现没有mainSpId的项目:', event);
                }
                return hasMainSpId;
            });

            // 获取所有不同的mainSpId
            const uniqueMainSpIds = new Set(validEvents.map(event => event.mainSpId));
            console.log('不同的mainSpId数量:', uniqueMainSpIds.size);
            console.log('所有有效mainSpId:', Array.from(uniqueMainSpIds));

            return uniqueMainSpIds.size <= this.maxEvents;
        },

        handleEventsChange(selectedEvents) {
            console.log('事件改变，当前选择的项目:', selectedEvents);
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

            this.currentPlayer.events = selectedEvents;
        },
        // 新增：格式化比赛名称的方法
        formatEventName(event) {
            let prefix = '';
            if (event.gender !== null) {
                prefix = event.gender ? '男子' : '女子';
            }
            const stageSuffix = this.getCompTypeText(event.compType);
            return `${prefix}${event.name}${stageSuffix}`;
        },
        getCompTypeText(type) {
            const types = {
                1: '(预赛)',
                2: '(半决赛)',
                3: '(决赛)'
            };
            return types[type] || '';
        },
        addLevelConfig() {
            this.configForm.levelConfig.push({
                field: '',
                isNumeric: true,
                digits: 2, // 添加默认值
                valuePairs: [],
                isExpanded: true
            });
        },
        removeLevelConfig(index) {
            this.configForm.levelConfig.splice(index, 1)
        },
        handleValueRangeEdit(index, values) {
            if (!Array.isArray(values)) return
            const level = this.configForm.levelConfig[index]
            // 确保 values 是可迭代的数组
            level.valueRange = new Map(values.filter(item => Array.isArray(item) && item.length === 2))
        },
        toggleLevelExpand(index) {
            this.$set(this.configForm.levelConfig[index], 'isExpanded',
                !this.configForm.levelConfig[index].isExpanded)
        },

        addValuePair(levelIndex) {
            if (!this.configForm.levelConfig[levelIndex].valuePairs) {
                this.$set(this.configForm.levelConfig[levelIndex], 'valuePairs', []);
            }
            this.configForm.levelConfig[levelIndex].valuePairs.push({
                label: '',
                value: ''
            });
        },

        removeValuePair(levelIndex, pairIndex) {
            this.configForm.levelConfig[levelIndex].valuePairs.splice(pairIndex, 1)
        },
        handleLevelHeaderClick(e) {
            // 如果点击的是输入框或单选框，不触发折叠
            if (e.target.closest('.level-info')) {
                return;
            }
            const levelIndex = this.configForm.levelConfig.findIndex(
                level => level.field === e.currentTarget.querySelector('input').value
            );
            if (levelIndex > -1) {
                this.toggleLevelExpand(levelIndex);
            }
        },
        showJoinDialog() {
            this.joinDialogVisible = true;
            this.joinForm.inviteCode = '';
        },
        async handleJoin() {
            try {
                await this.$refs.joinForm.validate();
                const res = await request({
                    url: '/joinSchool',
                    method: 'post',
                    data: "inviteCode=" + this.joinForm.inviteCode
                });

                if (res.code === 1) {
                    this.$message.success('加入成功');
                    this.joinDialogVisible = false;
                    this.fetchSchools(); // 刷新列表
                } else {
                    let errorMessage = '加入失败';
                    // 处理各种可能的错误情况
                    switch (res.message) {
                        case 'INVALID_CODE':
                            errorMessage = '无效的邀请码';
                            break;
                        case 'EXPIRED_CODE':
                            errorMessage = '邀请码已过期';
                            break;
                        case 'ALREADY_JOINED':
                            errorMessage = '您已经是当前团体的成员';
                            break;
                        case 'SCHOOL_NOT_FOUND':
                            errorMessage = '团体不存在';
                            break;
                        case 'REGISTRATION_CLOSED':
                            errorMessage = '报名已截止';
                            break;
                    }
                    this.$message.error(errorMessage);
                }
            } catch (error) {
                let errorMessage = '加入失败';
                // 处理各种可能的错误情况
                this.$message.error(errorMessage);
            }
        },
        // 添加新方法：验证团体级别是否重复
        async validateTeamNumber({ teamNumber, excludeId }) {
            if (!Array.isArray(teamNumber) || teamNumber.length === 0) {
                return false;
            }

            const targetStr = JSON.stringify(teamNumber);

            return this.schools.some(school => {
                if (school.id === excludeId) {
                    return false;
                }
                const currentTeamNumber = Array.isArray(school.teamNumber) ?
                    JSON.stringify(school.teamNumber) : '[]';
                return currentTeamNumber === targetStr;
            });
        },
    }
}
</script>

<style lang="less" scoped>
.department-management {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    min-height: 100vh; // 确保最小高度

    // 移除多余的滚动条
    .main-content {
        overflow: visible !important;
    }

    .action-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding: 0 16px;
    }

    .school-grid {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
        transition: all 0.3s ease;
        padding: 0 16px;

        &.has-active {
            grid-template-columns: 1fr;
        }

        .school-card {
            border: 1px solid #ebeef5;
            border-radius: 8px;
            overflow: hidden;

            // 特殊处理添加卡片
            &[add] {
                border: 2px dashed #dcdfe6;
                background: transparent;
                transition: all 0.3s;
                cursor: pointer;

                &:hover {
                    border-color: #409EFF;
                    background: rgba(64, 158, 255, 0.1);

                    .card-header {
                        .title-content {

                            h3,
                            .slogan {
                                color: #409EFF;
                            }
                        }

                        .add-placeholder {
                            i {
                                transform: rotate(180deg);
                            }
                        }
                    }
                }

                .card-header {
                    height: 180px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    background: transparent;

                    .title-content {
                        text-align: center;
                        margin-top: 16px;

                        h3 {
                            color: #909399;
                            font-size: 18px;
                            margin: 0;
                            font-weight: normal;
                        }

                        .slogan {
                            color: #c0c4cc;
                            font-size: 14px;
                            margin: 8px 0 0;
                        }
                    }

                    .add-placeholder {
                        width: 80px;
                        height: 80px;
                        border-radius: 50%;
                        background: #f5f7fa;
                        display: flex;
                        align-items: center;
                        justify-content: center;

                        i {
                            font-size: 40px;
                            color: #909399;
                            transition: transform 0.3s;
                        }
                    }
                }
            }
        }
    }

    // Card animations
    .card-list-enter-active,
    .card-list-leave-active {
        transition: all 0.3s ease;
    }

    .card-list-enter,
    .card-list-leave-to {
        opacity: 0;
        transform: translateY(30px);
    }

    .card-list-move {
        transition: transform 0.5s ease;
    }

    @media (max-width: 768px) {
        padding: 0; // 移除内边距
        width: 100%; // 确保占满宽度
        margin: 0; // 移除外边距
        transform: none; // 移除缩放

        .action-bar {
            padding: 10px;
            flex-direction: column;
            align-items: flex-start;
        }

        .school-grid {
            padding: 10px;
            grid-template-columns: 1fr; // 一行一个卡片
            gap: 10px;

            .school-card {
                width: 100%; // 确保卡片占满容器宽度
                margin: 0; // 移除外边距
            }
        }
    }
}

// 添加媒体查询以修复移动端遮罩层问题
@media (max-width: 768px) {
    /deep/ .el-dialog__wrapper {
        z-index: 2010 !important; // 确保对话框在遮罩上面
    }

    /deep/ .invite-dialog,
    /deep/ .join-dialog {
        .el-dialog {
            margin-top: 20vh !important;
            width: 90% !important;
            max-width: 400px;
        }
    }
}

.level-config-item {
    border: 1px solid #EBEEF5;
    border-radius: 4px;
    margin-bottom: 16px;

    .level-header {
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f5f7fa;
        cursor: pointer;

        &:hover {
            background: #e6e8eb;
        }

        .level-info {
            display: flex;
            align-items: center;
            gap: 16px;
            flex: 1;

            .el-input {
                width: 200px;
            }

            .el-radio-group {
                margin-left: 16px;
            }
        }

        .level-actions {
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 90px; // 确保操作按钮区域有足够宽度

            .el-button--mini {
                padding: 7px;
                font-size: 12px;
            }

            .el-button--text {
                padding: 0 8px;
            }
        }
    }

    .level-content {
        padding: 16px;
        border-top: 1px solid #EBEEF5;

        .value-pairs {
            display: flex;
            flex-direction: column;
            gap: 8px;

            .value-pair {
                display: flex;
                gap: 8px;
                align-items: center;

                .el-input {
                    width: 180px;
                }
            }
        }
    }
}

.add-level {
    text-align: center;
    margin-top: 16px;
}
</style>