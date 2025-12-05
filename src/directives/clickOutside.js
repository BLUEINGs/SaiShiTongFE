export default {
    bind(el, binding) {
        el.clickOutsideEvent = (event) => {
            if (!(el === event.target || el.contains(event.target))) {
                binding.value(event);
            }
        };
        document.addEventListener('click', el.clickOutsideEvent);
    },
    unbind(el) {
        document.removeEventListener('click', el.clickOutsideEvent);
    }
};
// 发生在指令绑定元素外部的点击事件