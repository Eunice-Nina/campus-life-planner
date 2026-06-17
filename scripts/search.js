
import { compileRegex } from './validators.js';

/**
 * Highlights matching text using <mark> tags
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
 */
export const filterByTag = (records, tag) => {
    if (!tag || tag.trim() === '') return records;
    
    const regex = new RegExp(`(?=.*${tag})`, 'i');
    return records.filter(record => regex.test(record.tag));
};

/**
 * Parse search query for special commands
 */
export const parseSearchQuery = (query) => {
    const result = {
        text: query,
        tagFilter: null,
        dateFilter: null
    };

    const tagMatch = query.match(/@tag:(\w+)/);
    if (tagMatch) {
        result.tagFilter = tagMatch[1];
        result.text = query.replace(/@tag:\w+/, '').trim();
    }

    const dateMatch = query.match(/date:(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
        result.dateFilter = dateMatch[1];
        result.text = query.replace(/date:\d{4}-\d{2}-\d{2}/, '').trim();
    }

    return result;
};