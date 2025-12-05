/**
 * 格式化日期
 * @param {Date} date 日期对象
 * @param {string} format 格式字符串，如：'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
    if (!date) return '';
    if (typeof date === 'string') {
        date = new Date(date);
    }
    if (!(date instanceof Date)) return '';

    const padStart = (str, len = 2) => String(str).padStart(len, '0');

    const yyyy = date.getFullYear();
    const MM = padStart(date.getMonth() + 1);
    const DD = padStart(date.getDate());
    const HH = padStart(date.getHours());
    const mm = padStart(date.getMinutes());
    const ss = padStart(date.getSeconds());

    return format
        .replace('YYYY', yyyy)
        .replace('MM', MM)
        .replace('DD', DD)
        .replace('HH', HH)
        .replace('mm', mm)
        .replace('ss', ss);
}
