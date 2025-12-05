import Vue from 'vue'
export const EventBus = new Vue()
export const PICKER_EVENTS = {
    CLOSE_ALL_PICKERS: 'close-all-pickers',
    PICKER_OPENED: 'picker-opened'
}
