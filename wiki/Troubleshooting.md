# Troubleshooting Guide

Common issues and solutions when using ocClasificame.

## 🚨 Quick Diagnostics

### Check Browser Console
Always check the browser console (F12 → Console) for error messages first.

### Verify Dependencies
Make sure all required dependencies are loaded:

```javascript
// Check if SortableJS is available
console.log('SortableJS loaded:', typeof Sortable !== 'undefined');

// Check if ocClasificame is available
console.log('ocClasificame loaded:', typeof ocClasificame !== 'undefined');

// Check browser support for dialog element
console.log('Dialog support:', 'showModal' in document.createElement('dialog'));
```

## 🐛 Common Issues

### 1. Widget Not Loading

**Symptoms:**
- "ocClasificame is not defined" error
- Nothing happens when trying to create widget

**Solutions:**

```javascript
// ❌ Problem: Script not loaded
new ocClasificame(categories, items); // ReferenceError

// ✅ Solution: Ensure script is loaded
<script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
<script src="path/to/oc_clasificame.js"></script>
<script>
    // Use after DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        const classifier = new ocClasificame(categories, items);
    });
</script>
```

**Checklist:**
- [ ] Verify file paths are correct
- [ ] Check network tab for 404 errors
- [ ] Ensure scripts load before usage
- [ ] Check for CORS issues with local files

### 2. Drag and Drop Not Working

**Symptoms:**
- Items don't move when dragged
- No visual feedback during drag
- Console errors about Sortable

**Solutions:**

```javascript
// ❌ Problem: SortableJS not loaded
const classifier = new ocClasificame(categories, items, {
    editable: true
});

// ✅ Solution: Load SortableJS first
<script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
<script>
    // Verify Sortable is available
    if (typeof Sortable === 'undefined') {
        console.error('SortableJS not loaded');
        return;
    }
    
    const classifier = new ocClasificame(categories, items, {
        editable: true
    });
</script>
```

**CSS Conflicts:**
```css
/* ❌ Problem: CSS preventing drag */
.oc-item {
    pointer-events: none; /* This breaks dragging */
}

/* ✅ Solution: Remove or modify conflicting CSS */
.oc-item {
    /* Remove pointer-events: none */
    cursor: grab;
}
```

**Checklist:**
- [ ] SortableJS library is loaded
- [ ] `editable: true` is set in options
- [ ] No CSS `pointer-events: none` on items
- [ ] No conflicting event handlers

### 3. Dialog Not Opening

**Symptoms:**
- No dialog appears when calling `openDialog()`
- Console errors about dialog methods

**Solutions:**

```javascript
// ❌ Problem: Browser doesn't support <dialog>
// Some older browsers don't support the dialog element

// ✅ Solution: Check support and provide fallback
async function openClassifier() {
    const classifier = new ocClasificame(categories, items);
    
    try {
        const result = await classifier.openDialog();
        console.log('Result:', result);
    } catch (error) {
        console.error('Dialog error:', error);
        
        // Check browser support
        if (!('showModal' in document.createElement('dialog'))) {
            alert('Your browser does not support the dialog element. Please upgrade your browser.');
        }
    }
}
```

**Browser Support:**
- Chrome/Edge: 37+
- Firefox: 98+
- Safari: 15.4+

**Polyfill Option:**
```html
<!-- Add polyfill for older browsers -->
<script src="https://cdn.jsdelivr.net/npm/dialog-polyfill@0.5.6/index.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/dialog-polyfill@0.5.6/index.css">
```

### 4. Items Not Displaying

**Symptoms:**
- Empty columns
- Some items missing
- Incorrect item counts

**Solutions:**

```javascript
// ❌ Problem: Mismatched property names
const items = [
    { userId: 1, userName: 'John', status: 'active' }
];

const options = {
    valueId: 'id',        // ❌ Wrong property name
    valueDisplay: 'name', // ❌ Wrong property name
    itemsCategoryIdKey: 'category' // ❌ Wrong property name
};

// ✅ Solution: Match property names
const options = {
    valueId: 'userId',
    valueDisplay: 'userName',
    itemsCategoryIdKey: 'status'
};
```

**Data Validation:**
```javascript
function validateData(categories, items, options) {
    // Check categories
    if (!categories || categories.length === 0) {
        throw new Error('Categories array is required and cannot be empty');
    }
    
    // Check items
    if (!items || !Array.isArray(items)) {
        throw new Error('Items must be an array');
    }
    
    // Check property names exist
    const idProp = options.valueId || 'id';
    const displayProp = options.valueDisplay || 'name';
    const categoryProp = options.itemsCategoryIdKey || 'category';
    
    items.forEach((item, index) => {
        if (!(idProp in item)) {
            console.warn(`Item ${index} missing ${idProp} property:`, item);
        }
        if (!(displayProp in item)) {
            console.warn(`Item ${index} missing ${displayProp} property:`, item);
        }
    });
    
    return true;
}

// Use before creating classifier
validateData(categories, items, options);
const classifier = new ocClasificame(categories, items, options);
```

### 5. Styling Issues

**Symptoms:**
- Broken layout
- Missing styles
- Overlapping elements

**Solutions:**

```html
<!-- ❌ Problem: CSS not loaded -->
<script src="oc_clasificame.js"></script>

<!-- ✅ Solution: Include CSS -->
<link rel="stylesheet" href="oc_clasificame.css">
<script src="oc_clasificame.js"></script>
```

**CSS Conflicts:**
```css
/* ❌ Problem: Global CSS affecting widget */
* {
    box-sizing: content-box; /* Breaks layout */
}

/* ✅ Solution: Scope or override */
.oc-clasificame * {
    box-sizing: border-box;
}
```

**Z-Index Issues:**
```css
/* ❌ Problem: Dialog behind other elements */
.oc-dialog {
    z-index: 10; /* Too low */
}

/* ✅ Solution: Increase z-index */
.oc-dialog {
    z-index: 9999;
}
```

### 6. Mobile Issues

**Symptoms:**
- Drag doesn't work on touch devices
- Interface too small on mobile
- Buttons hard to tap

**Solutions:**

```html
<!-- ❌ Problem: Missing viewport meta tag -->
<head>
    <title>My App</title>
</head>

<!-- ✅ Solution: Add viewport meta tag -->
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My App</title>
</head>
```

```javascript
// ✅ Mobile-optimized configuration
const mobileClassifier = new ocClasificame(categories, items, {
    title: 'Mobile Classification',
    editable: true,
    showToolbar: true,  // Buttons easier than drag on mobile
    showPlantillaMethod: false, // Simplify interface
    showGroupMethod: false
});
```

### 7. Performance Issues

**Symptoms:**
- Slow loading with many items
- Laggy drag operations
- Browser freezing

**Solutions:**

```javascript
// ❌ Problem: Too many items without optimization
const hugeItemsList = Array.from({length: 10000}, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    category: 'default'
}));

// ✅ Solution: Paginate or filter data
const filteredItems = hugeItemsList.slice(0, 100); // Show first 100

// Or implement search-based filtering
function filterItems(items, searchTerm) {
    if (!searchTerm) return items.slice(0, 100); // Limit initial load
    return items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 50); // Limit search results
}
```

**Optimize for Large Datasets:**
```javascript
const optimizedClassifier = new ocClasificame(categories, filteredItems, {
    title: 'Optimized Classification',
    showToolbar: false,  // Reduce DOM elements
    debug: false        // Disable debug logging
});
```

### 8. Template/Group Issues

**Symptoms:**
- Templates not loading
- Group operations not working
- Save/load functionality broken

**Solutions:**

```javascript
// ❌ Problem: Invalid template structure
const badTemplate = {
    id: '1',
    name: 'Bad Template',
    classification: [1, 2, 3] // ❌ Wrong format
};

// ✅ Solution: Correct template structure
const goodTemplate = {
    id: '1',
    name: 'Good Template',
    description: 'Template description',
    classification: {
        category1: ['item1', 'item2'],
        category2: ['item3'],
        category3: []
    }
};
```

**Debug Template Loading:**
```javascript
function debugTemplates(templates) {
    templates.forEach((template, index) => {
        console.log(`Template ${index}:`, template);
        
        if (!template.id) {
            console.error(`Template ${index} missing id`);
        }
        
        if (!template.classification || typeof template.classification !== 'object') {
            console.error(`Template ${index} has invalid classification`);
        }
    });
}

debugTemplates(savedClassifications);
```

## 🔍 Debug Mode

Enable debug mode for detailed logging:

```javascript
const debugClassifier = new ocClasificame(categories, items, {
    debug: true,  // Enables console logging
    title: 'Debug Mode Classification'
});
```

Debug mode provides:
- Initialization details
- State change logging
- Event handler information
- Performance timing
- Error details

## 🧪 Testing Configuration

Create a minimal test case to isolate issues:

```javascript
// Minimal test configuration
const testCategories = [
    { id: 'cat1', label: 'C1', title: 'Category 1' },
    { id: 'cat2', label: 'C2', title: 'Category 2' }
];

const testItems = [
    { id: 'item1', name: 'Test Item 1', category: 'cat1' },
    { id: 'item2', name: 'Test Item 2', category: 'cat2' }
];

const testOptions = {
    title: 'Test Classification',
    editable: true,
    debug: true
};

// Test basic functionality
async function runBasicTest() {
    try {
        const classifier = new ocClasificame(testCategories, testItems, testOptions);
        console.log('✅ Classifier created successfully');
        
        const result = await classifier.openDialog();
        console.log('✅ Dialog opened and closed successfully', result);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

runBasicTest();
```

## 📱 Browser-Specific Issues

### Safari Issues

**Touch Events:**
- Safari may have different touch behavior
- Test on actual iOS devices, not just Safari desktop

**Dialog Support:**
- Ensure Safari version 15.4+ for dialog element support
- Consider polyfill for older versions

### Firefox Issues

**Drag and Drop:**
- Firefox has stricter CORS policies
- Ensure proper content types for local files

### Chrome/Edge Issues

**Security Restrictions:**
- Local file restrictions may prevent loading
- Use a local server for development

## 🆘 Getting Help

### Before Asking for Help

1. **Check the console** for error messages
2. **Test with minimal example** to isolate the issue
3. **Review the documentation** for similar issues
4. **Check browser compatibility**
5. **Verify all dependencies** are loaded

### Providing Information

When asking for help, include:

```javascript
// System information
console.log('Browser:', navigator.userAgent);
console.log('SortableJS:', typeof Sortable !== 'undefined');
console.log('ocClasificame:', typeof ocClasificame !== 'undefined');
console.log('Dialog support:', 'showModal' in document.createElement('dialog'));

// Configuration
console.log('Categories:', categories);
console.log('Items:', items);
console.log('Options:', options);

// Error details
// Include the exact error message and stack trace
```

### Where to Get Help

- **GitHub Issues**: [Report bugs or ask questions](https://github.com/ocallit/Classifier/issues)
- **Documentation**: Check the [Wiki](Home.md) for comprehensive guides
- **Examples**: Review [Examples & Tutorials](Examples.md) for similar use cases

## 🔧 Diagnostic Tools

### Browser Developer Tools

1. **Console Tab**: Check for JavaScript errors
2. **Network Tab**: Verify all resources load correctly
3. **Elements Tab**: Inspect DOM structure and CSS
4. **Sources Tab**: Debug JavaScript execution

### Testing Snippets

```javascript
// Test basic widget creation
function testWidgetCreation() {
    try {
        const classifier = new ocClasificame([
            { id: 'test', label: 'T', title: 'Test' }
        ], [
            { id: 1, name: 'Test Item', category: 'test' }
        ]);
        console.log('✅ Widget created successfully');
        return classifier;
    } catch (error) {
        console.error('❌ Widget creation failed:', error);
        return null;
    }
}

// Test dialog functionality
async function testDialogFunction(classifier) {
    if (!classifier) return;
    
    try {
        // Test opening dialog without waiting for user interaction
        classifier._createDialog();
        console.log('✅ Dialog HTML created');
        
        // Clean up
        if (classifier.dialogElement) {
            classifier.dialogElement.remove();
        }
        
    } catch (error) {
        console.error('❌ Dialog creation failed:', error);
    }
}

// Run diagnostics
const testClassifier = testWidgetCreation();
testDialogFunction(testClassifier);
```

---

**Still having issues?** Create a [minimal reproduction example](https://stackoverflow.com/help/minimal-reproducible-example) and [open an issue](https://github.com/ocallit/Classifier/issues) on GitHub with your browser details and error messages.