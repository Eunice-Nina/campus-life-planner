

const STORAGE_KEY = 'campus_life_planner_data';
const SETTINGS_KEY = 'campus_life_planner_settings';

/**
 * Load records from localStorage
 */
export const loadRecords = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('Error loading records:', error);
        return [];
    }
};

/**
 * Save records to localStorage
 */
export const saveRecords = (records) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
        return true;
    } catch (error) {
        console.error('Error saving records:', error);
        return false;
    }
};

/**
 * Load settings from localStorage
 */
export const loadSettings = () => {
    try {
        const data = localStorage.getItem(SETTINGS_KEY);
        if (!data) return getDefaultSettings();
        const parsed = JSON.parse(data);
        return { ...getDefaultSettings(), ...parsed };
    } catch (error) {
        console.error('Error loading settings:', error);
        return getDefaultSettings();
    }
};

/**
 * Save settings to localStorage
 */
export const saveSettings = (settings) => {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        return true;
    } catch (error) {
        console.error('Error saving settings:', error);
        return false;
    }
};

/**
 * Get default settings
 */
const getDefaultSettings = () => {
    return {
        unit: 'minutes', // 'minutes' or 'hours'
        weeklyTarget: 300, // minutes
        theme: 'light',
        sortField: 'dueDate',
        sortDirection: 'asc'
    };
};

/**
 * Export records as JSON
 */
export const exportJSON = (records) => {
    try {
        const data = JSON.stringify(records, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `campus_records_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return true;
    } catch (error) {
        console.error('Error exporting JSON:', error);
        return false;
    }
};

/**
 * Import records from JSON
 */
export const importJSON = (jsonData) => {
    try {
        const records = JSON.parse(jsonData);
        
        // Validate records structure
        if (!Array.isArray(records)) {
            throw new Error('Invalid data format: Expected an array');
        }

        // Validate each record
        records.forEach((record, index) => {
            if (!record.id || !record.title || !record.dueDate) {
                throw new Error(`Invalid record at index ${index}: Missing required fields`);
            }
            if (typeof record.duration !== 'number' || record.duration < 0) {
                throw new Error(`Invalid record at index ${index}: Duration must be a positive number`);
            }
        });

        return {
            success: true,
            records: records,
            count: records.length
        };
    } catch (error) {
        console.error('Error importing JSON:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Clear all data from localStorage
 */
export const clearAllData = () => {
    try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(SETTINGS_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing data:', error);
        return false;
    }
};

/**
 * Generate a unique ID for new records
 */
export const generateId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `rec_${timestamp}_${random}`;
};

/**
 * Validate a record object
 */
export const validateRecordStructure = (record) => {
    const requiredFields = ['id', 'title', 'dueDate', 'duration', 'tag'];
    const missingFields = requiredFields.filter(field => !record[field]);
    
    if (missingFields.length > 0) {
        return {
            valid: false,
            errors: [`Missing required fields: ${missingFields.join(', ')}`]
        };
    }

    if (typeof record.duration !== 'number' || record.duration < 0) {
        return {
            valid: false,
            errors: ['Duration must be a positive number']
        };
    }

    // Validate date format
    const datePattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    if (!datePattern.test(record.dueDate)) {
        return {
            valid: false,
            errors: ['Invalid date format. Expected YYYY-MM-DD']
        };
    }

    return {
        valid: true,
        errors: []
    };
};

/**
 * Migrate old data to new format if needed
 */
export const migrateData = (records) => {
    return records.map(record => {
        // Ensure all required fields exist
        const migrated = {
            id: record.id || generateId(),
            title: record.title || record.description || 'Untitled',
            dueDate: record.dueDate || record.date || new Date().toISOString().split('T')[0],
            duration: record.duration || record.amount || record.pages || 0,
            tag: record.tag || record.category || 'General',
            createdAt: record.createdAt || new Date().toISOString(),
            updatedAt: record.updatedAt || new Date().toISOString()
        };

        // Remove any extra fields
        const allowedFields = ['id', 'title', 'dueDate', 'duration', 'tag', 'createdAt', 'updatedAt'];
        Object.keys(migrated).forEach(key => {
            if (!allowedFields.includes(key)) {
                delete migrated[key];
            }
        });

        return migrated;
    });
};