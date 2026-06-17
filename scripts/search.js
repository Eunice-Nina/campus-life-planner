

import { compileRegex } from './validators.js';

/**
 * Highlights matching text using <mark> tags
 * @param {string} text - The text to search in
 * @param {RegExp|null} regex - The compiled regex pattern
 * @returns {string} Text with <mark> tags around matches
 */
export const highlight = (text, regex) => {
    if (!regex || !text) return text;
    try {
        return text.replace(regex, (match) => `<mark>${match}</mark>`);
    } catch (e) {
        return text;
    }
};

/**
 * Filters records based on regex pattern
 * @param {Array} records - Array of record objects
 * @param {string} pattern - User input pattern
 * @returns {Array} Filtered records
 */
export const filterRecords = (records, pattern) => {
    if (!pattern || pattern.trim() === '') {
        return records;
    }

    const regex = compileRegex(pattern);
    if (!regex) return records;

    return records.filter(record => {
        const searchable = `${record.title} ${record.tag} ${record.dueDate}`;
        return regex.test(searchable);
    });
};

/**
 * Get search context for a record with highlighted matches
 * @param {Object} record - Record object
 * @param {string} pattern - Search pattern
 * @returns {Object} Record with highlighted fields
 */
export const getHighlightedRecord = (record, pattern) => {
    if (!pattern || pattern.trim() === '') {
        return { ...record };
    }

    const regex = compileRegex(pattern);
    if (!regex) return { ...record };

    return {
        ...record,
        title: highlight(record.title, regex),
        tag: highlight(record.tag, regex),
        dueDate: highlight(record.dueDate, regex)
    };
};

/**
 * Advanced search with tag filter using lookahead
 * @param {Array} records - Array of record objects
 * @param {string} tag - Tag to filter by
 * @returns {Array} Filtered records
 */
export const filterByTag = (records, tag) => {
    if (!tag || tag.trim() === '') return records;
    
    // Use lookahead to match tags containing the substring
    const regex = new RegExp(`(?=.*${tag})`, 'i');
    return records.filter(record => regex.test(record.tag));
};

/**
 * Parse search query for special commands
 * @param {string} query - Search query
 * @returns {Object} Parsed query with filters
 */
export const parseSearchQuery = (query) => {
    const result = {
        text: query,
        tagFilter: null,
        dateFilter: null
    };

    // Check for @tag: syntax
    const tagMatch = query.match(/@tag:(\w+)/);
    if (tagMatch) {
        result.tagFilter = tagMatch[1];
        result.text = query.replace(/@tag:\w+/, '').trim();
    }

    // Check for date range (simple)
    const dateMatch = query.match(/date:(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
        result.dateFilter = dateMatch[1];
        result.text = query.replace(/date:\d{4}-\d{2}-\d{2}/, '').trim();
    }

    return result;
};