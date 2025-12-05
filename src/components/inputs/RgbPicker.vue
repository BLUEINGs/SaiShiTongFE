<template>
    <div class="rgb-picker" ref="root">
        <div class="preview" :style="{ background: rgbCss }" @click="togglePicker"></div>

        <div class="inputs">
            <input class="num" type="number" min="0" max="255" v-model.number="r" @input="onRgbInput" />
            <span class="comma">,</span>
            <input class="num" type="number" min="0" max="255" v-model.number="g" @input="onRgbInput" />
            <span class="comma">,</span>
            <input class="num" type="number" min="0" max="255" v-model.number="b" @input="onRgbInput" />
        </div>

        <div class="picker-popup" v-if="showPicker">
            <!-- 快速预设颜色 -->
            <div class="preset-grid">
                <div v-for="preset in presets" :key="preset.name" class="preset-item" :title="preset.name"
                    :style="{ background: `rgb(${preset.r}, ${preset.g}, ${preset.b})` }" @click="applyPreset(preset)">
                </div>
            </div>
            <div class="slider-row">
                <label>R</label>
                <input type="range" min="0" max="255" v-model.number="tempR" @input="onTempChange"
                    :style="{ background: sliderBg('r') }" />
                <input class="num small" type="number" min="0" max="255" v-model.number="tempR" @input="onTempChange" />
            </div>
            <div class="slider-row">
                <label>G</label>
                <input type="range" min="0" max="255" v-model.number="tempG" @input="onTempChange"
                    :style="{ background: sliderBg('g') }" />
                <input class="num small" type="number" min="0" max="255" v-model.number="tempG" @input="onTempChange" />
            </div>
            <div class="slider-row">
                <label>B</label>
                <input type="range" min="0" max="255" v-model.number="tempB" @input="onTempChange"
                    :style="{ background: sliderBg('b') }" />
                <input class="num small" type="number" min="0" max="255" v-model.number="tempB" @input="onTempChange" />
            </div>

            <div class="popup-actions">
                <button class="el-button el-button--primary" @click="confirmPopup">确认</button>
                <button class="el-button" @click="cancelPopup">取消</button>
            </div>
        </div>
    </div>
</template>

<script>
// 小型 RGB 选择器，输出 (r,g,b) 严格格式的字符串
export default {
    name: 'RgbPicker',
    props: {
        value: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            r: 255,
            g: 255,
            b: 255,
            hex: '#ffffff',
            showPicker: false,
            tempR: 255,
            tempG: 255,
            tempB: 255,
            prevR: 255,
            prevG: 255,
            prevB: 255
        }
    },
    created() {
        // 常用球队预设颜色（r,g,b）
        this.presets = [
            { name: 'Lakers', r: 255, g: 209, b: 0 },
            { name: 'Celtics', r: 0, g: 122, b: 51 },
            { name: 'Bulls', r: 196, g: 30, b: 58 },
            { name: 'Warriors', r: 12, g: 35, b: 64 },
            { name: 'Knicks', r: 0, g: 107, b: 182 },
            { name: 'Spurs', r: 24, g: 24, b: 24 }
        ];
    },
    computed: {
        rgbCss() {
            return `rgb(${this.r}, ${this.g}, ${this.b})`;
        }
    },
    watch: {
        value: {
            immediate: true,
            handler(v) {
                // 期望格式 (r,g,b) 没有空格
                if (!v || typeof v !== 'string') return;
                const m = v.match(/^\((\d{1,3}),(\d{1,3}),(\d{1,3})\)$/);
                if (m) {
                    this.r = this.clamp(Number(m[1]));
                    this.g = this.clamp(Number(m[2]));
                    this.b = this.clamp(Number(m[3]));
                    this.hex = this.rgbToHex(this.r, this.g, this.b);
                    // 初始化 temp / prev 同步
                    this.tempR = this.r; this.tempG = this.g; this.tempB = this.b;
                    this.prevR = this.r; this.prevG = this.g; this.prevB = this.b;
                }
            }
        }
    },
    mounted() {
        document.addEventListener('click', this.handleGlobalClick);
        // 如果父没有传入 value，则在挂载后把默认颜色主动 emit 给父组件
        if (!this.value) {
            // 通过 nextTick 确保父组件的 v-model 已连接
            this.$nextTick(() => {
                this.emitValue()
            })
        }
    },
    beforeDestroy() {
        document.removeEventListener('click', this.handleGlobalClick);
    },
    methods: {
        clamp(n) { return Math.max(0, Math.min(255, isNaN(n) ? 0 : n)); },
        padHex(v) { return v.toString(16).padStart(2, '0'); },
        rgbToHex(r, g, b) {
            return `#${this.padHex(r)}${this.padHex(g)}${this.padHex(b)}`;
        },
        hexToRgb(hex) {
            const h = hex.replace('#', '');
            const bigint = parseInt(h, 16);
            return {
                r: (bigint >> 16) & 255,
                g: (bigint >> 8) & 255,
                b: bigint & 255
            };
        },
        emitValue() {
            const str = `(${this.r},${this.g},${this.b})`;
            this.$emit('input', str);
            this.$emit('change', str);
        },
        onRgbInput() {
            this.r = this.clamp(this.r);
            this.g = this.clamp(this.g);
            this.b = this.clamp(this.b);
            this.hex = this.rgbToHex(this.r, this.g, this.b);
            // live update when typing numbers
            this.emitValue();
        },
        onHexChange() {
            if (!this.hex) return;
            const { r, g, b } = this.hexToRgb(this.hex);
            this.r = r; this.g = g; this.b = b;
            this.emitValue();
        },
        togglePicker() {
            if (this.showPicker) {
                this.cancelPopup();
                return;
            }
            // open popup: store previous values and init temps
            this.prevR = this.r; this.prevG = this.g; this.prevB = this.b;
            this.tempR = this.r; this.tempG = this.g; this.tempB = this.b;
            this.showPicker = true;
        },
        onTempChange() {
            // preview temp values in the preview area
            this.r = this.clamp(this.tempR);
            this.g = this.clamp(this.tempG);
            this.b = this.clamp(this.tempB);
            this.hex = this.rgbToHex(this.r, this.g, this.b);
        },
        confirmPopup() {
            // commit temp to real and emit
            this.r = this.clamp(this.tempR);
            this.g = this.clamp(this.tempG);
            this.b = this.clamp(this.tempB);
            this.hex = this.rgbToHex(this.r, this.g, this.b);
            this.emitValue();
            this.showPicker = false;
        },
        applyPreset(preset) {
            // apply preset immediately but keep popup open for further edits
            this.tempR = preset.r;
            this.tempG = preset.g;
            this.tempB = preset.b;
            // preview
            this.onTempChange();
            // commit to value immediately per user request
            this.r = this.clamp(this.tempR);
            this.g = this.clamp(this.tempG);
            this.b = this.clamp(this.tempB);
            this.hex = this.rgbToHex(this.r, this.g, this.b);
            this.emitValue();
        },
        sliderBg(channel) {
            // return a gradient string for the slider background per channel
            if (channel === 'r') {
                return `linear-gradient(to right, rgba(0,0,0,0.08), rgb(255,0,0))`;
            }
            if (channel === 'g') {
                return `linear-gradient(to right, rgba(0,0,0,0.08), rgb(0,128,0))`;
            }
            if (channel === 'b') {
                return `linear-gradient(to right, rgba(0,0,0,0.08), rgb(0,0,255))`;
            }
            return '';
        },
        cancelPopup() {
            // revert to previous
            this.r = this.prevR; this.g = this.prevG; this.b = this.prevB;
            this.hex = this.rgbToHex(this.r, this.g, this.b);
            this.showPicker = false;
            this.emitValue();
        },
        handleGlobalClick(e) {
            if (!this.showPicker) return;
            const root = this.$refs.root;
            if (!root) return;
            if (!root.contains(e.target)) {
                // click outside: confirm and close
                this.confirmPopup();
            }
        }
    }
}
</script>


<style scoped>
.rgb-picker {
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
}

.preview {
    width: 28px;
    height: 20px;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    cursor: pointer;
}

.inputs {
    display: flex;
    align-items: center;
}

.num {
    width: 48px;
    padding: 6px 8px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    font-size: 13px;
}

.comma {
    margin: 0 6px;
    color: #909399;
}

.picker-popup {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    background: #fff;
    border: 1px solid #ebeef5;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
    padding: 10px;
    border-radius: 6px;
    z-index: 2000;
    width: 320px;
}

.preset-grid {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 8px;
}

.preset-item {
    width: 36px;
    height: 24px;
    border-radius: 6px;
    border: 1px solid #ebeef5;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.preset-item:hover {
    transform: translateY(-2px);
}

.slider-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.slider-row label {
    width: 16px;
    color: #606266;
}

.num.small {
    width: 56px;
}

.popup-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 6px;
}

.el-button {
    padding: 6px 12px;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    background: #fff;
    cursor: pointer;
}

.el-button--primary {
    background: #409eff;
    color: #fff;
    border-color: #409eff;
}
</style>
