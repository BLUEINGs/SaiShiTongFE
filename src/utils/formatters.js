/**
 * 格式化比赛项目名称
 * @param {Object} event 比赛项目对象
 * @returns {string} 格式化后的比赛项目名称
 */
export function formatEventName(event) {
    if (!event) return '';

    let prefix = '';
    if (event.gender !== null) {
        prefix = event.gender ? '男子' : '女子';
    }

    const compType = {
        1: '(预赛)',
        2: '(半决赛)',
        3: '(决赛)'
    }[event.compType] || '';

    return `${prefix}${event.name || event.eventName}${compType}`;
}

/**
 * 格式化成绩显示
 * @param {Object|string} scoreMap 成绩对象或字符串
 * @returns {string} 格式化后的成绩字符串
 */
export function formatScore(scoreMap) {
    if (!scoreMap) return '暂无成绩'

    // 处理字符串形式的 scoreMap
    if (typeof scoreMap === 'string') {
        try {
            // 移除大括号并分割每个单位-值对
            const pairs = scoreMap.replace(/[{}]/g, '').split(',')
            return pairs.map(pair => {
                const [unit, value] = pair.split('=')
                return `${value}${unit}`
            }).join('')
        } catch (e) {
            console.error('分数格式化失败:', e)
            return '格式错误'
        }
    }

    // 处理对象形式的 scoreMap
    return Object.entries(scoreMap)
        .map(([unit, value]) => `${value}${unit}`)
        .join('')
}
