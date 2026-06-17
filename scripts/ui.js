

import { filterRecords, getHighlightedRecord, parseSearchQuery, highlight } from './search.js';
import { getStats, calculateTrend, getTopTag } from './stats.js';

let currentRecords = [];
let currentSort = { field: 'dueDate', direction: 'asc' };
let currentSearch = '';

/**
 * Renders records in table or card view based on screen size
 */
export const renderRecords = (records, searchPattern = '') => {
    currentRecords = records;
    currentSearch = searchPattern;
    
    const container = document.getElementById('records-container');
    const isMobile = window.innerWidth < 768;
    
    if (records.length === 0) {
        container.innerHTML = `
            <div class="empty-state" role="status">
                <p>No records found</p>
                ${searchPattern ? '<p>Try adjusting your search criteria</p>' : '<p>Start by adding your first record!</p>'}
            </div>
        `;
        return;
    }

    const filtered = filterRecords(records, searchPattern);
    const sorted = sortRecords(filtered, currentSort.field, currentSort.direction);

    if (sorted.length === 0) {
        container.innerHTML = `
            <div class="empty-state" role="status">
                <p>No records match your search</p>
                <p>Try a different pattern</p>
            </div>
        `;
        return;
    }

    if (isMobile) {
        container.innerHTML = renderCards(sorted, searchPattern);
    } else {
        container.innerHTML = renderTable(sorted, searchPattern);
    }

    // Attach event listeners
    attachRecordEvents();
};

/**
 * Renders records as cards (mobile view)
 */
const renderCards = (records, searchPattern) => {
    return `
        <div class="records-cards" role="list">
            ${records.map((record, index) => {
                const highlighted = getHighlightedRecord(record, searchPattern);
                const durationDisplay = formatDuration(record.duration);
                return `
                    <article class="card" role="listitem" data-index="${index}">
                        <div class="card-header">
                            <h3 class="card-title">${highlighted.title}</h3>
                            <span class="card-tag">${highlighted.tag}</span>
                        </div>
                        <div class="card-body">
                            <p><strong>Due:</strong> ${highlighted.dueDate}</p>
                            <p><strong>Duration:</strong> ${durationDisplay}</p>
                        </div>
                        <div class="card-actions">
                            <button class="edit-btn" data-id="${record.id}" aria-label="Edit record">Edit</button>
                            <button class="delete-btn" data-id="${record.id}" aria-label="Delete record">Delete</button>
                        </div>
                    </article>
                `;
            }).join('')}
        </div>
    `;
};

/**
 * Renders records as table (desktop view)
 */
const renderTable = (records, searchPattern) => {
    return `
        <div class="records-table" role="table">
            <table>
                <thead role="rowgroup">
                    <tr role="row">
                        <th role="columnheader" data-sort="title" class="${getSortClass('title')}">Title</th>
                        <th role="columnheader" data-sort="dueDate" class="${getSortClass('dueDate')}">Due Date</th>
                        <th role="columnheader" data-sort="duration" class="${getSortClass('duration')}">Duration</th>
                        <th role="columnheader" data-sort="tag" class="${getSortClass('tag')}">Tag</th>
                        <th role="columnheader">Actions</th>
                    </tr>
                </thead>
                <tbody role="rowgroup">
                    ${records.map((record) => {
                        const highlighted = getHighlightedRecord(record, searchPattern);
                        const durationDisplay = formatDuration(record.duration);
                        return `
                            <tr role="row" data-id="${record.id}">
                                <td role="cell">${highlighted.title}</td>
                                <td role="cell">${highlighted.dueDate}</td>
                                <td role="cell">${durationDisplay}</td>
                                <td role="cell"><span class="tag-badge">${highlighted.tag}</span></td>
                                <td role="cell">
                                    <button class="edit-btn" data-id="${record.id}" aria-label="Edit record">Edit</button>
                                    <button class="delete-btn" data-id="${record.id}" aria-label="Delete record">Delete</button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
};

/**
 * Sorts records by field
 */
const sortRecords = (records, field, direction) => {
    return [...records].sort((a, b) => {
        let valA = a[field];
        let valB = b[field];

        if (field === 'duration') {
            valA = Number(valA);
            valB = Number(valB);
        } else if (field === 'dueDate' || field === 'createdAt') {
            valA = new Date(valA);
            valB = new Date(valB);
        } else {
            valA = String(valA).toLowerCase();
            valB = String(valB).toLowerCase();
        }

        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
    });
};

/**
 * Gets sort class for table headers
 */
const getSortClass = (field) => {
    if (currentSort.field !== field) return '';
    return currentSort.direction === 'asc' ? 'sort-asc' : 'sort-desc';
};

/**
 * Formats duration in minutes to human readable format
 */
const formatDuration = (minutes) => {
    if (minutes === 0) return '0 minutes';
    if (minutes < 60) return minutes + ' minutes';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return hours + ' hours';
    return hours + 'h ' + remainingMinutes + 'm';
};

/**
 * Attaches event listeners to record buttons
 */
const attachRecordEvents = () => {
    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const record = currentRecords.find(r => r.id === id);
            if (record) {
                // Trigger edit event
                const event = new CustomEvent('editRecord', { detail: record });
                document.dispatchEvent(event);
            }
        });
    });

    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            if (confirm('Are you sure you want to delete this record?')) {
                const event = new CustomEvent('deleteRecord', { detail: { id } });
                document.dispatchEvent(event);
            }
        });
    });

    // Sort headers
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const field = th.dataset.sort;
            if (currentSort.field === field) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.field = field;
                currentSort.direction = 'asc';
            }
            renderRecords(currentRecords, currentSearch);
        });
    });
};

/**
 * Updates the search results
 */
export const updateSearch = (records, pattern) => {
    currentSearch = pattern;
    renderRecords(records, pattern);
};

/**
 * Renders the dashboard stats
 */
export const renderStats = (records) => {
    const container = document.getElementById('stats-container');
    if (!container) return;

    const stats = getStats(records);
    const topTag = getTopTag(records);
    const trend = calculateTrend(records);

    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${stats.total}</div>
                <div class="stat-label">Total Records</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${formatDuration(stats.totalDuration)}</div>
                <div class="stat-label">Total Duration</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${topTag || 'N/A'}</div>
                <div class="stat-label">Top Tag</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.averageDuration.toFixed(1)}</div>
                <div class="stat-label">Avg Duration (min)</div>
            </div>
        </div>
        <div class="trend-section">
            <h3>7-Day Trend</h3>
            <div class="trend-chart">
                ${trend.map(day => `
                    <div class="trend-bar" style="height: ${(day.duration / Math.max(...trend.map(d => d.duration), 1)) * 100}%">
                        <span class="trend-bar-label">${day.label}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
};

/**
 * Updates the cap/target display
 */
export const renderCap = (records, target) => {
    const container = document.getElementById('cap-container');
    if (!container) return;

    const totalDuration = records.reduce((sum, r) => sum + r.duration, 0);
    const remaining = target - totalDuration;

    let message = '';
    let ariaLive = 'polite';

    if (remaining > 0) {
        message = `Remaining time: ${formatDuration(remaining)} to reach your weekly target of ${formatDuration(target)}`;
    } else if (remaining === 0) {
        message = `You have reached your weekly target of ${formatDuration(target)}!`;
    } else {
        message = `You have exceeded your weekly target by ${formatDuration(Math.abs(remaining))}!`;
        ariaLive = 'assertive';
    }

    container.innerHTML = `
        <div class="cap-display" role="status" aria-live="${ariaLive}">
            <p><strong>Weekly Target:</strong> ${formatDuration(target)}</p>
            <p><strong>Current Progress:</strong> ${formatDuration(totalDuration)}</p>
            <p class="${remaining >= 0 ? 'success' : 'danger'}">${message}</p>
        </div>
    `;
};