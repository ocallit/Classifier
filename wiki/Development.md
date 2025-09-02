# Development Guide

Guide for developers who want to contribute to ocClasificame or integrate it into their development workflow.

## 🛠️ Development Setup

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Text editor or IDE (VS Code, WebStorm, etc.)
- Basic knowledge of HTML, CSS, and JavaScript (ES6+)
- Node.js (optional, for local server)

### Getting Started

1. **Clone the Repository**
   ```bash
   git clone https://github.com/ocallit/Classifier.git
   cd Classifier
   ```

2. **Explore the Structure**
   ```
   Classifier/
   ├── src/
   │   ├── oc_clasificame.js    # Main widget code
   │   └── oc_clasificame.css   # Widget styles
   ├── examples/
   │   └── clean_demo_html.html # Demo page
   ├── test/
   │   └── oc_clasificame_tests.html # Test suite
   ├── docs/
   │   └── oc_clasificame_docs.md    # API documentation
   └── wiki/                    # Documentation
   ```

3. **Run the Demo**
   ```bash
   # Option 1: Open directly in browser
   open examples/clean_demo_html.html
   
   # Option 2: Use a local server (recommended)
   npx http-server .
   # Then visit http://localhost:8080/examples/clean_demo_html.html
   ```

## 🔧 Development Workflow

### Making Changes

1. **Edit Source Files**
   - `src/oc_clasificame.js` - Main JavaScript functionality
   - `src/oc_clasificame.css` - Styling and layout

2. **Test Your Changes**
   ```bash
   # Open the demo page
   open examples/clean_demo_html.html
   
   # Run the test suite
   open test/oc_clasificame_tests.html
   ```

3. **Test in Different Browsers**
   - Chrome/Chromium
   - Firefox
   - Safari (macOS)
   - Edge (Windows)

### Local Development Server

For CORS and file loading issues, use a local server:

```bash
# Using Node.js http-server
npm install -g http-server
http-server -p 8080

# Using Python (Python 3)
python -m http.server 8080

# Using PHP
php -S localhost:8080
```

## 🏗️ Architecture Overview

### Core Components

#### 1. ocClasificame Class
The main widget class located in `src/oc_clasificame.js`:

```javascript
class ocClasificame {
    constructor(categories, items, options = {}) {
        // Initialization logic
    }
    
    // Public methods
    openDialog(dialogOptions = {}) { /* ... */ }
    closeDialog(save = false) { /* ... */ }
    getValue() { /* ... */ }
    search(searchTerm) { /* ... */ }
    
    // Private methods (prefixed with _)
    _initializeValues() { /* ... */ }
    _createDialog(dialogOptions) { /* ... */ }
    _setupSortable() { /* ... */ }
    // ... more private methods
}
```

#### 2. Key Methods

| Method | Purpose | Type |
|--------|---------|------|
| `constructor()` | Initialize widget with data and options | Public |
| `openDialog()` | Show classification interface | Public |
| `closeDialog()` | Close interface and handle results | Public |
| `getValue()` | Get current classification state | Public |
| `search()` | Filter visible items | Public |
| `_createDialog()` | Build HTML interface | Private |
| `_setupSortable()` | Initialize drag-and-drop | Private |
| `_setupEventListeners()` | Bind UI event handlers | Private |

### Data Flow

```
Input Data (categories, items, options)
    ↓
Constructor (validation, initialization)
    ↓
openDialog() → _createDialog() → HTML Interface
    ↓
User Interactions → Event Handlers → State Updates
    ↓
closeDialog() → getValue() → Return Results
```

### State Management

The widget maintains state in several properties:

```javascript
class ocClasificame {
    constructor(categories, items, options) {
        this.categories = categories;      // Category definitions
        this.items = items;               // Item data
        this.options = options;           // Configuration
        this.currentValues = {};          // Current classification state
        this.sortableInstances = [];     // Drag-and-drop instances
        this.dialogElement = null;       // DOM reference
        this.isOpen = false;             // Dialog state
        this.selectedGroupItems = [];    // Group selection state
    }
}
```

## 🧪 Testing

### Running Tests

The test suite is located in `test/oc_clasificame_tests.html`:

```bash
# Open in browser
open test/oc_clasificame_tests.html

# Or with local server
http-server .
# Visit http://localhost:8080/test/oc_clasificame_tests.html
```

### Test Categories

The test suite covers:

1. **Basic Functionality**
   - Widget initialization
   - Dialog opening/closing
   - Basic classification

2. **Drag and Drop**
   - Item movement between categories
   - State updates after drag operations

3. **Search and Filtering**
   - Item filtering by search terms
   - Counter updates

4. **Template Management**
   - Saving classifications
   - Loading saved templates
   - Template application

5. **Group Management**
   - Group loading
   - Bulk operations
   - Group classification

6. **Read-Only Mode**
   - Disabled interactions
   - Display-only behavior

### Writing New Tests

Add test cases to `test/oc_clasificame_tests.html`:

```javascript
// Example test case
async function testNewFeature() {
    console.log('Testing new feature...');
    
    const classifier = new ocClasificame(testCategories, testItems, {
        // Test configuration
    });
    
    try {
        // Test logic here
        const result = await classifier.openDialog();
        console.log('✅ New feature test passed');
        return true;
    } catch (error) {
        console.error('❌ New feature test failed:', error);
        return false;
    }
}

// Add to test runner
window.runAllTests = async function() {
    const tests = [
        // ... existing tests
        testNewFeature
    ];
    
    // Run tests...
};
```

## 🎨 Styling and CSS

### CSS Architecture

The CSS follows a component-based approach with BEM-like naming:

```css
/* Main component */
.oc-clasificame { /* Root container */ }

/* Dialog system */
.oc-dialog { /* Dialog wrapper */ }
.oc-dialog-content { /* Dialog content */ }
.oc-dialog-header { /* Dialog header */ }
.oc-dialog-body { /* Dialog body */ }
.oc-dialog-footer { /* Dialog footer */ }

/* Classification interface */
.oc-columns { /* Column container */ }
.oc-column { /* Individual column */ }
.oc-items-list { /* Items container */ }
.oc-item { /* Individual item */ }

/* Management interfaces */
.oc-classification-manager { /* Template management */ }
.oc-group-section { /* Group management */ }

/* States and modifiers */
.oc-readonly { /* Read-only mode */ }
.oc-item-readonly { /* Read-only items */ }
```

### Adding Custom Styles

Create a custom CSS file that overrides default styles:

```css
/* custom-clasificame.css */

/* Custom color scheme */
.oc-dialog-title {
    color: #your-brand-color;
}

.oc-item {
    background: linear-gradient(135deg, #your-color1, #your-color2);
    border-color: #your-border-color;
}

/* Custom button styles */
.oc-item-btn.pressed {
    background: #your-accent-color;
}

/* Custom column headers */
.oc-column-title {
    background: #your-header-color;
    color: #your-text-color;
}
```

Include it after the main CSS:

```html
<link rel="stylesheet" href="src/oc_clasificame.css">
<link rel="stylesheet" href="custom-clasificame.css">
```

### Responsive Design

The widget includes responsive design breakpoints:

```css
@media (max-width: 768px) {
    .oc-columns {
        flex-direction: column;
    }
    
    .oc-search-stats-row {
        flex-direction: column;
        align-items: stretch;
    }
}
```

## 🔧 Extending Functionality

### Adding New Methods

To add public methods to the widget:

```javascript
class ocClasificame {
    // ... existing code
    
    // New public method
    exportToCSV() {
        const result = this.getValue();
        const csv = this._convertToCSV(result);
        this._downloadCSV(csv, 'classification.csv');
    }
    
    // Helper methods (private)
    _convertToCSV(data) {
        // Implementation
    }
    
    _downloadCSV(content, filename) {
        // Implementation
    }
}
```

### Adding Event Callbacks

Extend the options to support custom callbacks:

```javascript
// In constructor
this.options = {
    // ... existing options
    onItemMoved: null,        // Callback when item is moved
    onDialogOpened: null,     // Callback when dialog opens
    onDialogClosed: null,     // Callback when dialog closes
    onSearchChanged: null,    // Callback when search changes
    ...options
};

// In event handlers
_moveItemTo(itemId, targetCategory) {
    // ... existing logic
    
    // Call callback if provided
    if (this.options.onItemMoved) {
        this.options.onItemMoved(itemId, targetCategory);
    }
}
```

Usage:

```javascript
const classifier = new ocClasificame(categories, items, {
    onItemMoved: (itemId, category) => {
        console.log(`Item ${itemId} moved to ${category}`);
    },
    onDialogOpened: () => {
        console.log('Classification dialog opened');
    }
});
```

### Adding New UI Components

To add new UI sections:

1. **Create HTML generator method:**
```javascript
_createNewSectionHTML() {
    return `
        <div class="oc-new-section">
            <h3>New Feature</h3>
            <button class="oc-new-btn" id="new-action">Action</button>
        </div>
    `;
}
```

2. **Integrate into main content:**
```javascript
createContent() {
    let html = "<div>";
    // ... existing sections
    html += this._createNewSectionHTML();
    html += "</div>";
    return html;
}
```

3. **Add event listeners:**
```javascript
_setupEventListeners() {
    // ... existing listeners
    
    const newBtn = this.dialogElement.querySelector('#new-action');
    if (newBtn) {
        newBtn.addEventListener('click', () => {
            this._handleNewAction();
        });
    }
}
```

4. **Add CSS styles:**
```css
.oc-new-section {
    padding: 16px;
    background: #f8f9fa;
    border-bottom: 1px solid #e0e0e0;
}

.oc-new-btn {
    /* Button styles */
}
```

## 🚀 Performance Optimization

### Large Datasets

For handling large numbers of items:

```javascript
// Implement virtual scrolling for item lists
_createItemsHTML(categoryId) {
    const categoryItems = this.items.filter(/* ... */);
    
    // For large datasets, consider pagination or virtual scrolling
    if (categoryItems.length > 1000) {
        return this._createVirtualizedItemsHTML(categoryId, categoryItems);
    }
    
    return this._createStandardItemsHTML(categoryItems);
}

_createVirtualizedItemsHTML(categoryId, items) {
    // Implementation for virtual scrolling
    // Only render visible items + buffer
}
```

### Memory Management

Implement proper cleanup:

```javascript
closeDialog(save = false) {
    // ... existing cleanup
    
    // Additional cleanup for large datasets
    this._cleanupVirtualScrolling();
    this._clearEventListeners();
    this._releaseMemory();
}
```

### Debounced Search

Implement search debouncing for better performance:

```javascript
_setupSearchEventListeners() {
    const searchInput = this.dialogElement.querySelector('.oc-search-input');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.search(e.target.value);
            }, 300); // 300ms delay
        });
    }
}
```

## 📚 Code Style and Standards

### JavaScript Standards

- Use ES6+ features (classes, arrow functions, const/let)
- Follow camelCase naming convention
- Use meaningful variable and function names
- Add JSDoc comments for public methods

```javascript
/**
 * Opens the classification dialog
 * @param {Object} dialogOptions - Dialog configuration options
 * @param {string} dialogOptions.title - Custom dialog title
 * @param {string} dialogOptions.width - Dialog width (CSS value)
 * @param {string} dialogOptions.height - Dialog height (CSS value)
 * @returns {Promise} Promise that resolves with classification results
 */
openDialog(dialogOptions = {}) {
    // Implementation
}
```

### CSS Standards

- Use BEM-like naming convention
- Prefix all classes with `oc-`
- Group related styles together
- Use CSS custom properties for theming

```css
/* Component block */
.oc-component { }

/* Component elements */
.oc-component-header { }
.oc-component-body { }

/* Component modifiers */
.oc-component--readonly { }
.oc-component--large { }
```

### HTML Standards

- Use semantic HTML elements
- Include proper ARIA attributes for accessibility
- Use data attributes for JavaScript hooks

```html
<div class="oc-item" 
     data-item-id="123" 
     data-category="active"
     role="listitem"
     aria-label="Task item">
    <span class="oc-item-label">Task name</span>
</div>
```

## 🤝 Contributing

### Contribution Workflow

1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/yourusername/Classifier.git
   cd Classifier
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Follow the code style guidelines
   - Add tests for new functionality
   - Update documentation as needed

4. **Test Your Changes**
   ```bash
   # Test in multiple browsers
   # Run the test suite
   # Test with different configurations
   ```

5. **Submit a Pull Request**
   - Include a clear description of changes
   - Reference any related issues
   - Include screenshots for UI changes

### Pull Request Guidelines

- **Title**: Clear and descriptive
- **Description**: Explain what changes were made and why
- **Testing**: Describe how the changes were tested
- **Breaking Changes**: Highlight any breaking changes
- **Documentation**: Update relevant documentation

### Issue Reporting

When reporting bugs or requesting features:

1. **Check Existing Issues**: Search for similar issues first
2. **Provide Details**: Include browser, version, configuration
3. **Minimal Example**: Provide a minimal reproduction case
4. **Expected vs Actual**: Describe expected and actual behavior

## 📊 Debugging

### Debug Mode

Enable debug mode for development:

```javascript
const classifier = new ocClasificame(categories, items, {
    debug: true  // Enables console logging
});
```

### Browser Developer Tools

Use browser dev tools effectively:

1. **Console**: Check for JavaScript errors and debug output
2. **Elements**: Inspect DOM structure and CSS
3. **Network**: Monitor API calls (if using backend features)
4. **Performance**: Profile performance with large datasets

### Common Debugging Scenarios

**Items not displaying:**
```javascript
// Check data structure
console.log('Categories:', categories);
console.log('Items:', items);
console.log('Options:', options);

// Check item property mapping
const item = items[0];
console.log('Item ID:', item[options.valueId]);
console.log('Item Display:', item[options.valueDisplay]);
console.log('Item Category:', item[options.itemsCategoryIdKey]);
```

**Drag and drop not working:**
```javascript
// Check SortableJS initialization
console.log('Sortable instances:', classifier.sortableInstances);

// Check for CSS conflicts
// Look for `pointer-events: none` or conflicting z-index
```

**Dialog not opening:**
```javascript
// Check for console errors
// Verify dialog element creation
console.log('Dialog element:', classifier.dialogElement);

// Check browser support for <dialog> element
console.log('Dialog support:', 'showModal' in document.createElement('dialog'));
```

## 🔄 Version Management

### Semantic Versioning

The project follows semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Process

1. Update version in documentation
2. Update changelog
3. Test thoroughly across browsers
4. Create release tag
5. Update examples and demos

---

**Ready to contribute?** Check out our [issue tracker](https://github.com/ocallit/Classifier/issues) for good first issues or areas where help is needed!