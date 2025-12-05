<template>
    <div class="filter-bar" :class="{ 'mobile': isMobile }">
        <el-radio-group v-model="localValue" size="medium" @change="handleChange">
            <el-radio-button v-for="option in options" :key="option.value" :label="option.value">
                {{ option.label }}
            </el-radio-button>
        </el-radio-group>
    </div>
</template>

<script>
export default {
    name: 'FilterBar',
    props: {
        value: {
            type: [String, Number],
            required: true
        },
        options: {
            type: Array,
            required: true
        },
        defaultValue: {
            type: [String, Number],
            default: null
        }
    },
    data() {
        return {
            localValue: this.value,
            isMobile: window.innerWidth <= 768
        }
    },
    methods: {
        handleChange(val) {
            this.$emit('input', val)
            this.$emit('change', val)
        },
        handleResize() {
            this.isMobile = window.innerWidth <= 768
        }
    },
    watch: {
        value(val) {
            this.localValue = val
        }
    },
    mounted() {
        window.addEventListener('resize', this.handleResize)
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize)
    }
}
</script>

<style lang="less" scoped>
.filter-bar {
    text-align: left; // 左对齐

    .el-radio-group {
        display: flex;
        gap: 8px;
    }

    ::v-deep .el-radio-button {
        &:first-child .el-radio-button__inner {
            border-radius: 4px 0 0 4px;
        }

        &:last-child .el-radio-button__inner {
            border-radius: 0 4px 4px 0;
        }

        .el-radio-button__inner {
            padding: 8px 16px;
            border: 1px solid #dcdfe6;
            transition: all 0.3s;

            &:hover {
                color: #409EFF;
            }
        }

        &.is-active .el-radio-button__inner {
            background-color: #ecf5ff;
            border-color: #409EFF;
            color: #409EFF;
            box-shadow: none;
        }
    }

    &.mobile {
        width: 100%;

        .el-radio-group {
            width: 100%;
            display: flex;
        }

        ::v-deep .el-radio-button {
            flex: 1;

            .el-radio-button__inner {
                width: 100%;
                padding: 8px 0;
                text-align: center;
                white-space: nowrap;
            }

            // 移除相邻按钮的左边框
            &:not(:first-child) .el-radio-button__inner {
                border-left: 0;
            }
        }
    }
}
</style>
