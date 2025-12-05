<template>
    <transition :name="isMobile ? 'slide-up' : 'fade'">
        <div v-if="value" class="bottom-sheet-container" :class="{ 'mobile': isMobile }">
            <div v-if="isMobile" class="bottom-sheet-mask" @click="$emit('input', false)"></div>
            <div class="bottom-sheet-content" :style="contentStyle">
                <div v-if="isMobile" class="bottom-sheet-header">
                    <div class="drag-handle"></div>
                </div>
                <div class="bottom-sheet-body">
                    <slot></slot>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    name: 'BottomSheet',
    props: {
        value: Boolean,
        target: HTMLElement
    },
    data() {
        return {
            isMobile: window.innerWidth <= 768,
            contentStyle: {}
        }
    },
    watch: {
        value(val) {
            if (val) {
                // position after next tick so DOM exists
                this.$nextTick(this.updatePosition)
            }
        }
    },
    methods: {
        updatePosition() {
            if (!this.target) return
            const rect = this.target.getBoundingClientRect()

            if (this.isMobile) {
                // mobile handled by CSS (fixed bottom)
                this.contentStyle = {}
                return
            }
            // Place popup fixed relative to viewport. Do not force width; let content determine its own width.
            // If there isn't enough space below (approx popupHeight), open above instead.
            const popupHeight = 370 // estimated popup height in px
            const spaceBelow = window.innerHeight - rect.bottom
            const spaceAbove = rect.top

            let top
            if (spaceBelow < popupHeight && spaceAbove > popupHeight) {
                // open above
                top = Math.round(rect.top - popupHeight - 6)
            } else {
                // open below
                top = Math.round(rect.bottom + 6)
            }

            // initial left aligned to target; adjust to keep within viewport
            let left = Math.round(rect.left)
            const minLeft = 8
            const maxLeft = window.innerWidth - 8
            if (left < minLeft) left = minLeft
            if (left > maxLeft) left = maxLeft

            this.contentStyle = {
                position: 'fixed',
                left: `${left}px`,
                top: `${top}px`,
                marginTop: '0',
                transform: 'none',
                zIndex: 10000
            }
        }
    },
    created() {
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth <= 768
            this.updatePosition()
        })
    },
    /* mounted() {
        // 添加目标元素relative定位
        if (this.target && !this.isMobile) {
            this.target.style.position = 'relative'
        }
    } */
}
</script>

<style lang="less" scoped>
.bottom-sheet-container {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
    /* 提高z-index确保在对话框之上 */
    pointer-events: none;

    &.mobile {
        pointer-events: auto;

        .bottom-sheet-content {
            position: fixed;
            left: 0;
            bottom: 0;
            width: 100%;
            max-height: 80vh;
            border-radius: 16px 16px 0 0;
        }

        .bottom-sheet-mask {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.4);
            z-index: 1;
        }
    }

    /* non-mobile handled via JS positioning (fixed) */

    .bottom-sheet-content {
        pointer-events: auto;
        background: white;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
        border-radius: 4px;
        overflow: hidden;
        transform-origin: top center; // 添加这行确保从上方展开
        z-index: 2;

        .bottom-sheet-header {
            padding: 8px 0;
            display: flex;
            justify-content: center;

            .drag-handle {
                width: 36px;
                height: 4px;
                border-radius: 2px;
                background: #dcdfe6;
            }
        }

        .bottom-sheet-body {
            max-height: calc(80vh - 30px);
            overflow-y: auto;
        }
    }
}

// 统一动画效果
.slide-up-enter-active,
.slide-up-leave-active,
.fade-enter-active,
.fade-leave-active {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    .bottom-sheet-content {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
}

.slide-up-enter,
.slide-up-leave-to,
.fade-enter,
.fade-leave-to {
    opacity: 0;

    .bottom-sheet-content {
        transform: translateY(-20px) !important;
        opacity: 0;
    }
}

.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.3s ease-out;

    .bottom-sheet-mask {
        transition: opacity 0.3s;
    }

    .bottom-sheet-content {
        z-index: 2;
        transition: transform 0.3s;
    }
}

.slide-up-enter,
.slide-up-leave-to {
    .bottom-sheet-mask {
        // z-index: 2;
        opacity: 0;
    }

    .bottom-sheet-content {
        transform: translateY(100%);
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>
