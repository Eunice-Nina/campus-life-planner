// scripts/app.js

import { loadRecords, saveRecords, loadSettings, saveSettings, exportJSON, importJSON, clearAllData, generateId } from './storage.js';
import { renderRecords, renderStats, renderCap, updateSearch } from './ui.js';
import { validateTitle, validateDate, validateDuration, validateTag } from './validators.js';

// App state
let state = {
    records: [],
    settings: {},
    currentSection: 'dashboard'
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Load data
    state.records = loadRecords();
    state.settings = loadSettings();
    
    // Setup navigation
    setupNavigation();
    
    // Setup form
    setupForm();
    
    // Setup search
    setupSearch();
    
    // Setup settings
    setupSettings();
    
    // Setup theme
    setupTheme();
    
    // Render initial data
    renderAll();
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Load seed data if empty
    if (state.records.length === 0) {
        loadSeedData();
    }
});

/**
 * Sets up navigation between sections
 */
const setupNavigation = () => {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.dataset.section;
            
            // Update active class
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Scroll to the section
            const targetSection = document.getElementById(`section-${section}`);
            if (targetSection) {
                targetSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
};

/**
 * Sets up the add/edit form
 */
const setupForm = () => {
    const form = document.getElementById('record-form');
    const submitBtn = document.getElementById('submit-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const editId = document.getElementById('edit-id');
    
    // Real-time validation
    const titleInput = document.getElementById('record-title');
    const dateInput = document.getElementById('record-due-date');
    const durationInput = document.getElementById('record-duration');
    const tagInput = document.getElementById('record-tag');
    
    [titleInput, dateInput, durationInput, tagInput].forEach(input => {
        input.addEventListener('input', () => {
            validateField(input);
            validateForm();
        });
        input.addEventListener('blur', () => {
            validateField(input);
        });
    });
    
    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        const record = {
            id: editId.value || generateId(),
            title: titleInput.value.trim(),
            dueDate: dateInput.value,
            duration: parseInt(durationInput.value),
            tag: tagInput.value.trim(),
            createdAt: editId.value ? findRecord(editId.value).createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (editId.value) {
            // Update existing record
            const index = state.records.findIndex(r => r.id === editId.value);
            if (index !== -1) {
                state.records[index] = record;
            }
        } else {
            // Add new record
            state.records.push(record);
        }
        
        // Save and render
        saveRecords(state.records);
        renderAll();
        resetForm();
        
        // Show success message
        showStatus('Record saved successfully!', 'success');
    });
    
    // Cancel edit
    cancelBtn.addEventListener('click', resetForm);
    
    // Listen for edit events from records
    document.addEventListener('editRecord', (e) => {
        const record = e.detail;
        editRecord(record);
    });
    
    // Listen for delete events from records
    document.addEventListener('deleteRecord', (e) => {
        const { id } = e.detail;
        deleteRecord(id);
    });
};

/**
 * Validates a single form field
 */
const validateField = (input) => {
    const id = input.id;
    const value = input.value;
    let isValid = true;
    let errorMessage = '';
    
    switch (id) {
        case 'record-title':
            isValid = validateTitle(value);
            errorMessage = isValid ? '' : 'Title cannot have leading or trailing spaces';
            break;
        case 'record-due-date':
            isValid = validateDate(value);
            errorMessage = isValid ? '' : 'Please enter a valid date (YYYY-MM-DD)';
            break;
        case 'record-duration':
            isValid = validateDuration(value);
            errorMessage = isValid ? '' : 'Duration must be a positive integer';
            break;
        case 'record-tag':
            isValid = validateTag(value);
            errorMessage = isValid ? '' : 'Tag can only contain letters, spaces, and hyphens';
            break;
    }
    
    const errorElement = document.getElementById(`${id.replace('record-', '')}-error`);
    if (errorElement) {
        errorElement.textContent = errorMessage;
    }
    
    input.classList.toggle('error', !isValid);
    return isValid;
};

/**
 * Validates the entire form
 */
const validateForm = () => {
    const fields = ['record-title', 'record-due-date', 'record-duration', 'record-tag'];
    let allValid = true;
    
    fields.forEach(id => {
        const input = document.getElementById(id);
        if (!validateField(input)) {
            allValid = false;
        }
    });
    
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = !allValid;
    
    return allValid;
};

/**
 * Resets the form to add mode
 */
const resetForm = () => {
    const form = document.getElementById('record-form');
    form.reset();
    document.getElementById('edit-id').value = '';
    document.getElementById('submit-btn').textContent = 'Add Record';
    document.getElementById('cancel-btn').hidden = true;
    document.getElementById('form-heading').textContent = 'Add New Record';
    
    // Clear validation errors
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-group input').forEach(el => el.classList.remove('error'));
    
    validateForm();
};

/**
 * Edits a record by loading it into the form
 */
const editRecord = (record) => {
    document.getElementById('record-title').value = record.title;
    document.getElementById('record-due-date').value = record.dueDate;
    document.getElementById('record-duration').value = record.duration;
    document.getElementById('record-tag').value = record.tag;
    document.getElementById('edit-id').value = record.id;
    document.getElementById('submit-btn').textContent = 'Update Record';
    document.getElementById('cancel-btn').hidden = false;
    document.getElementById('form-heading').textContent = 'Edit Record';
    
    // Scroll to add section
    const targetSection = document.getElementById('section-add-record');
    if (targetSection) {
        targetSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
    
    // Validate after loading
    setTimeout(validateForm, 0);
};

/**
 * Deletes a record with confirmation
 */
const deleteRecord = (id) => {
    if (!confirm('Are you sure you want to delete this record?')) {
        return;
    }
    
    state.records = state.records.filter(r => r.id !== id);
    saveRecords(state.records);
    renderAll();
    showStatus('Record deleted successfully!', 'info');
};

/**
 * Finds a record by ID
 */
const findRecord = (id) => {
    return state.records.find(r => r.id === id);
};

/**
 * Sets up search functionality
 */
const setupSearch = () => {
    const searchInput = document.getElementById('search-input');
    const clearBtn = document.getElementById('clear-search');
    
    searchInput.addEventListener('input', () => {
        const pattern = searchInput.value;
        updateSearch(state.records, pattern);
    });
    
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        updateSearch(state.records, '');
        searchInput.focus();
    });
};

/**
 * Sets up settings
 */
const setupSettings = () => {
    // Export
    document.getElementById('export-btn').addEventListener('click', () => {
        if (state.records.length === 0) {
            showStatus('No records to export!', 'error');
            return;
        }
        exportJSON(state.records);
        showStatus('Export successful!', 'success');
    });
    
    // Import
    document.getElementById('import-input').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const fileNameSpan = document.getElementById('file-name');
        fileNameSpan.textContent = file.name;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const result = importJSON(event.target.result);
            if (result.success) {
                if (confirm(`Found ${result.count} records. Do you want to import them? This will replace all current data.`)) {
                    state.records = result.records;
                    saveRecords(state.records);
                    renderAll();
                    showStatus(`Successfully imported ${result.count} records!`, 'success');
                }
            } else {
                showStatus(`Import failed: ${result.error}`, 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    });
    
    // Clear data
    document.getElementById('clear-data-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear ALL data? This cannot be undone.')) {
            clearAllData();
            state.records = [];
            state.settings = loadSettings();
            renderAll();
            showStatus('All data cleared!', 'info');
        }
    });
    
    // Unit selector
    document.getElementById('unit-select').addEventListener('change', (e) => {
        state.settings.unit = e.target.value;
        saveSettings(state.settings);
        renderAll();
    });
    
    // Set target
    document.getElementById('set-target-btn').addEventListener('click', () => {
        const targetInput = document.getElementById('target-input');
        const target = parseInt(targetInput.value);
        if (target < 0 || isNaN(target)) {
            showStatus('Please enter a valid target (positive number)', 'error');
            return;
        }
        state.settings.weeklyTarget = target;
        saveSettings(state.settings);
        renderAll();
        showStatus(`Weekly target set to ${target} minutes`, 'success');
    });
    
    // Load settings values
    document.getElementById('unit-select').value = state.settings.unit || 'minutes';
    document.getElementById('target-input').value = state.settings.weeklyTarget || 300;
};

/**
 * Sets up theme toggle
 */
const setupTheme = () => {
    const navThemeToggle = document.getElementById('theme-toggle-nav');
    const settingsThemeToggle = document.getElementById('theme-toggle-settings');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeButtons('Dark Mode');
    }
    
    const toggleTheme = () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeButtons(isDark ? 'Dark Mode' : 'Light Mode');
    };
    
    if (navThemeToggle) {
        navThemeToggle.addEventListener('click', toggleTheme);
    }
    
    if (settingsThemeToggle) {
        settingsThemeToggle.addEventListener('click', toggleTheme);
    }
};

/**
 * Updates theme button text
 */
const updateThemeButtons = (text) => {
    const buttons = document.querySelectorAll('.theme-btn-nav, #theme-toggle-settings');
    buttons.forEach(btn => {
        if (btn) btn.textContent = text;
    });
};

/**
 * Sets up keyboard shortcuts
 */
const setupKeyboardShortcuts = () => {
    document.addEventListener('keydown', (e) => {
        // Ctrl+1 through Ctrl+5 for navigation
        if (e.ctrlKey && e.key >= '1' && e.key <= '5') {
            e.preventDefault();
            const sections = ['dashboard', 'records', 'add-record', 'settings', 'about'];
            const index = parseInt(e.key) - 1;
            if (index < sections.length) {
                const button = document.querySelector(`.nav-btn[data-section="${sections[index]}"]`);
                if (button) button.click();
            }
        }
        
        // Escape to cancel form
        if (e.key === 'Escape') {
            const cancelBtn = document.getElementById('cancel-btn');
            if (!cancelBtn.hidden) {
                resetForm();
            }
        }
    });
};

/**
 * Renders all components
 */
const renderAll = () => {
    // Render records
    const searchPattern = document.getElementById('search-input')?.value || '';
    renderRecords(state.records, searchPattern);
    
    // Render stats
    renderStats(state.records);
    
    // Render cap/target
    const target = state.settings.weeklyTarget || 300;
    renderCap(state.records, target);
};

/**
 * Shows a status message
 */
const showStatus = (message, type = 'info') => {
    let statusContainer = document.getElementById('status-container');
    if (!statusContainer) {
        statusContainer = document.createElement('div');
        statusContainer.id = 'status-container';
        statusContainer.setAttribute('role', 'status');
        statusContainer.setAttribute('aria-live', 'polite');
        document.body.appendChild(statusContainer);
    }
    
    statusContainer.textContent = message;
    statusContainer.className = `status-message ${type}`;
    statusContainer.style.display = 'block';
    
    clearTimeout(statusContainer._timeout);
    statusContainer._timeout = setTimeout(() => {
        statusContainer.style.display = 'none';
    }, 5000);
};

/**
 * Loads seed data
 */
const loadSeedData = async () => {
    try {
        const response = await fetch('seed.json');
        if (response.ok) {
            const seedData = await response.json();
            state.records = seedData;
            saveRecords(state.records);
            renderAll();
            showStatus('Loaded sample data!', 'info');
        }
    } catch (error) {
        console.log('No seed data found');
    }
};