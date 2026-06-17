// scripts/stats.js

/**
 * Calculates statistics from records
 */
export const getStats = (records) => {
    if (!records || records.length === 0) {
        return {
            total: 0,
            totalDuration: 0,
            averageDuration: 0,
            recordsByTag: {}
        };
    }

    const total = records.length;
    const totalDuration = records.reduce((sum, record) => sum + record.duration, 0);
    const averageDuration = totalDuration / total;

    // Count records by tag
    const recordsByTag = {};
    records.forEach(record => {
        const tag = record.tag || 'Uncategorized';
        recordsByTag[tag] = (recordsByTag[tag] || 0) + 1;
    });

    return {
        total,
        totalDuration,
        averageDuration,
        recordsByTag
    };
};

/**
 * Gets the most frequently used tag
 */
export const getTopTag = (records) => {
    if (!records || records.length === 0) return null;
    
    const tagCount = {};
    records.forEach(record => {
        const tag = record.tag || 'Uncategorized';
        tagCount[tag] = (tagCount[tag] || 0) + 1;
    });

    let topTag = null;
    let maxCount = 0;
    for (const [tag, count] of Object.entries(tagCount)) {
        if (count > maxCount) {
            maxCount = count;
            topTag = tag;
        }
    }
    return topTag;
};

/**
 * Calculates 7-day trend data
 */
export const calculateTrend = (records) => {
    if (!records || records.length === 0) {
        // Return last 7 days with zero values
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push({
                label: date.toLocaleDateString('en-US', { weekday: 'short' }),
                date: date.toISOString().split('T')[0],
                duration: 0
            });
        }
        return days;
    }

    // Get records from the last 7 days
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Group records by date
    const dailyTotals = {};
    records.forEach(record => {
        const recordDate = new Date(record.dueDate);
        if (recordDate >= sevenDaysAgo && recordDate <= today) {
            const dateKey = record.dueDate;
            dailyTotals[dateKey] = (dailyTotals[dateKey] || 0) + record.duration;
        }
    });

    // Build trend data for last 7 days
    const trend = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        trend.push({
            label: date.toLocaleDateString('en-US', { weekday: 'short' }),
            date: dateKey,
            duration: dailyTotals[dateKey] || 0
        });
    }

    return trend;
};

/**
 * Calculates weekly progress towards target
 */
export const calculateWeeklyProgress = (records, target) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyRecords = records.filter(record => {
        const recordDate = new Date(record.dueDate);
        return recordDate >= startOfWeek && recordDate <= today;
    });

    const totalDuration = weeklyRecords.reduce((sum, r) => sum + r.duration, 0);
    const remaining = target - totalDuration;

    return {
        totalDuration,
        remaining,
        isExceeded: remaining < 0,
        isCompleted: remaining <= 0,
        percentage: target > 0 ? Math.min((totalDuration / target) * 100, 100) : 0
    };
};

/**
 * Gets records with due dates in the next 7 days
 */
export const getUpcomingRecords = (records) => {
    if (!records || records.length === 0) return [];

    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    return records.filter(record => {
        const dueDate = new Date(record.dueDate);
        return dueDate >= today && dueDate <= nextWeek;
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
};

/**
 * Gets overdue records
 */
export const getOverdueRecords = (records) => {
    if (!records || records.length === 0) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return records.filter(record => {
        const dueDate = new Date(record.dueDate);
        return dueDate < today;
    }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
};

/**
 * Calculates completion rate for records
 */
export const getCompletionRate = (records) => {
    if (!records || records.length === 0) return 0;

    const completed = records.filter(r => r.completed).length;
    return (completed / records.length) * 100;
};