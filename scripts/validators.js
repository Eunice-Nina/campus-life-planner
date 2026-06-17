
/**
 * Regular Expression validators for the Campus Life Planner
 */

// Title: No leading/trailing spaces, at least one non-space character
export const validateTitle = (value) => {
    const pattern = /^\S(?:.*\S)?$/;
    return pattern.test(value);
};

// Due Date: YYYY-MM-DD format with valid month and day ranges
export const validateDate = (value) => {
    const pattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    return pattern.test(value);
};

// Duration: Positive integer (including 0)
export const validateDuration = (value) => {
    const pattern = /^(0|[1-9]\d*)$/;
    return pattern.test(value);
};

// Tag: Letters, spaces, and hyphens only, no leading/trailing spaces
export const validateTag = (value) => {
    const pattern = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;
    return pattern.test(value);
};

// Advanced: Detect duplicate words (back-reference)
export const hasDuplicateWords = (value) => {
    const pattern = /\b(\w+)\s+\1\b/;
    return pattern.test(value);
};

// Advanced: Find time tokens (e.g., 14:30)
export const findTimeTokens = (value) => {
    const pattern = /\b\d{2}:\d{2}\b/g;
    return value.match(pattern) || [];
};

// Search filter with lookahead for tag filtering
export const createTagFilter = (tag) => {
    try {
        return new RegExp(`(?=.*${tag})`, 'i');
    } catch (e) {
        return null;
    }
};

// Safe regex compiler for search
export const compileRegex = (input, flags = 'i') => {
    try {
        return input ? new RegExp(input, flags) : null;
    } catch (e) {
        console.warn('Invalid regex pattern:', e.message);
        return null;
    }
};

// Validate a complete record object
export const validateRecord = (record) => {
    const errors = {};
    
    if (!record.title || !validateTitle(record.title)) {
        errors.title = 'Title cannot have leading/trailing spaces';
    }
    
    if (!record.dueDate || !validateDate(record.dueDate)) {
        errors.dueDate = 'Please enter a valid date (YYYY-MM-DD)';
    }
    
    if (!record.duration || !validateDuration(String(record.duration))) {
        errors.duration = 'Duration must be a positive integer';
    }
    
    if (!record.tag || !validateTag(record.tag)) {
        errors.tag = 'Tag can only contain letters, spaces, and hyphens';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};