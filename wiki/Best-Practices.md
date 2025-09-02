# Best Practices

Guidelines and recommendations for effective use of ocClasificame.

## 🎯 General Best Practices

### 1. Data Design

**Plan Your Categories:**
```javascript
// ✅ Good: Clear, meaningful categories
const permissionCategories = [
    { id: 'none', label: '🚫', title: 'No Access' },
    { id: 'read', label: '👀', title: 'Read Only' },
    { id: 'write', label: '✏️', title: 'Read/Write' },
    { id: 'admin', label: '👑', title: 'Administrator' }
];

// ❌ Avoid: Vague or confusing categories
const badCategories = [
    { id: 'cat1', label: 'C1', title: 'Category 1' },
    { id: 'stuff', label: 'S', title: 'Some Stuff' }
];
```

**Use Consistent Data Structure:**
```javascript
// ✅ Good: Consistent property names
const users = [
    { id: 'u001', name: 'John Doe', permission: 'read' },
    { id: 'u002', name: 'Jane Smith', permission: 'write' },
    { id: 'u003', name: 'Bob Admin', permission: 'admin' }
];

// ❌ Avoid: Inconsistent properties
const badUsers = [
    { userId: 1, fullName: 'John', access: 'read' },
    { id: 2, name: 'Jane', permission: 'write' },
    { empId: 'e3', displayName: 'Bob', level: 'admin' }
];
```

### 2. Configuration Strategy

**Start Simple, Add Features Gradually:**
```javascript
// Phase 1: Basic classification
const basicClassifier = new ocClasificame(categories, items, {
    title: 'Basic Classification',
    editable: true
});

// Phase 2: Add templates after users are comfortable
const templateClassifier = new ocClasificame(categories, items, {
    title: 'Classification with Templates',
    editable: true,
    showPlantillaMethod: true,
    savedClassifications: templates
});

// Phase 3: Full featured for power users
const fullClassifier = new ocClasificame(categories, items, {
    title: 'Advanced Classification',
    editable: true,
    showPlantillaMethod: true,
    canSavePlantillaMethod: true,
    showGroupMethod: true,
    crudGroupMethod: true,
    savedClassifications: templates,
    groups: groups
});
```

**Use Appropriate Defaults:**
```javascript
// ✅ Good: Set sensible defaults for your use case
const options = {
    title: 'User Permission Management',
    que_clasifica: 'usuario',
    que_clasifica_label: 'Users',
    unassignedDefaultTo: 'pending_review', // Clear default category
    editable: true,
    showToolbar: true
};
```

### 3. User Experience

**Provide Clear Visual Feedback:**
```javascript
// Use meaningful icons and labels
const taskCategories = [
    { id: 'todo', label: '📝', title: 'To Do' },
    { id: 'doing', label: '🔄', title: 'In Progress' },
    { id: 'review', label: '👀', title: 'Code Review' },
    { id: 'done', label: '✅', title: 'Completed' }
];
```

**Handle Empty States:**
```javascript
// Check for empty data and provide guidance
function createClassifierSafely(categories, items, options) {
    if (!items || items.length === 0) {
        alert('No items to classify. Please add some items first.');
        return null;
    }
    
    if (!categories || categories.length === 0) {
        alert('No categories defined. Please configure categories first.');
        return null;
    }
    
    return new ocClasificame(categories, items, options);
}
```

## 🎨 UI/UX Best Practices

### 1. Mobile-First Design

**Test on Real Devices:**
```javascript
// Configure for mobile users
const mobileOptions = {
    title: 'Mobile Classification',
    editable: true,
    showToolbar: true,    // Easier than drag on mobile
    showPlantillaMethod: false, // Simplify interface
    showGroupMethod: false
};

// Detect mobile and adjust accordingly
const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const classifier = new ocClasificame(categories, items, isMobile ? mobileOptions : desktopOptions);
```

### 2. Progressive Enhancement

**Layer Functionality:**
```javascript
// Base functionality for all users
const baseOptions = {
    title: 'Classification',
    editable: true,
    showToolbar: true
};

// Enhanced features for advanced users
const enhancedOptions = {
    ...baseOptions,
    showPlantillaMethod: true,
    canSavePlantillaMethod: userRole === 'admin',
    showGroupMethod: userRole !== 'basic',
    crudGroupMethod: userRole === 'admin'
};
```

### 3. Accessibility

**Provide Alternative Input Methods:**
```javascript
// Always enable toolbar for accessibility
const accessibleOptions = {
    title: 'Accessible Classification',
    editable: true,
    showToolbar: true,  // Important for keyboard users
    // Drag-and-drop AND buttons available
};
```

**Use Semantic HTML:**
```css
/* Ensure good contrast ratios */
.oc-item {
    background: #ffffff;
    color: #333333;
    border: 2px solid #cccccc;
}

.oc-item:focus {
    outline: 2px solid #0066cc;
    outline-offset: 2px;
}
```

## 🔧 Performance Best Practices

### 1. Data Management

**Limit Initial Load:**
```javascript
// For large datasets, implement pagination
function createPaginatedClassifier(allItems, page = 1, itemsPerPage = 50) {
    const startIndex = (page - 1) * itemsPerPage;
    const paginatedItems = allItems.slice(startIndex, startIndex + itemsPerPage);
    
    return new ocClasificame(categories, paginatedItems, {
        title: `Classification (Page ${page})`,
        editable: true
    });
}
```

**Implement Search-Based Loading:**
```javascript
// Load items based on search criteria
async function createSearchableClassifier(searchTerm = '') {
    let items;
    
    if (searchTerm) {
        items = await searchItems(searchTerm);
    } else {
        items = await getRecentItems(100); // Limit initial load
    }
    
    return new ocClasificame(categories, items, {
        title: 'Searchable Classification',
        editable: true
    });
}
```

### 2. Memory Management

**Clean Up When Done:**
```javascript
let currentClassifier = null;

async function openClassificationDialog() {
    // Clean up previous instance
    if (currentClassifier && currentClassifier.isOpen) {
        currentClassifier.closeDialog(false);
    }
    
    currentClassifier = new ocClasificame(categories, items, options);
    
    try {
        const result = await currentClassifier.openDialog();
        return result;
    } finally {
        // Cleanup happens automatically, but you can null the reference
        currentClassifier = null;
    }
}
```

### 3. Optimize for Large Datasets

**Disable Debug Mode in Production:**
```javascript
const productionOptions = {
    title: 'Production Classification',
    debug: false,  // Important for performance
    editable: true
};
```

**Consider Virtual Scrolling for Huge Lists:**
```javascript
// For thousands of items, consider pre-filtering
function filterItemsForClassification(allItems, filters) {
    // Apply business logic to reduce dataset size
    return allItems
        .filter(item => matchesFilters(item, filters))
        .slice(0, 500); // Hard limit for performance
}
```

## 🛡️ Security Best Practices

### 1. Input Validation

**Validate Data Before Use:**
```javascript
function validateClassificationData(categories, items) {
    // Validate categories
    if (!Array.isArray(categories) || categories.length === 0) {
        throw new Error('Invalid categories data');
    }
    
    categories.forEach((cat, index) => {
        if (!cat.id || typeof cat.id !== 'string') {
            throw new Error(`Category ${index} missing valid id`);
        }
    });
    
    // Validate items
    if (!Array.isArray(items)) {
        throw new Error('Items must be an array');
    }
    
    items.forEach((item, index) => {
        if (!item.id) {
            throw new Error(`Item ${index} missing id`);
        }
    });
    
    return true;
}
```

### 2. XSS Prevention

**Sanitize Display Content:**
```javascript
// If item names come from user input, sanitize them
function sanitizeItemName(name) {
    if (typeof name !== 'string') return 'Invalid Name';
    
    // Basic HTML escaping
    return name
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Apply when creating items
const safeItems = userItems.map(item => ({
    ...item,
    name: sanitizeItemName(item.name)
}));
```

### 3. Authorization

**Check Permissions:**
```javascript
function createAuthorizedClassifier(user, categories, items) {
    const options = {
        title: 'Classification',
        editable: user.canEdit,
        showPlantillaMethod: user.canViewTemplates,
        canSavePlantillaMethod: user.canSaveTemplates,
        showGroupMethod: user.canUseGroups,
        crudGroupMethod: user.canManageGroups
    };
    
    // Filter items based on user permissions
    const authorizedItems = items.filter(item => 
        user.canAccessItem && user.canAccessItem(item)
    );
    
    return new ocClasificame(categories, authorizedItems, options);
}
```

## 📊 Integration Best Practices

### 1. Backend Integration

**Handle Async Operations Properly:**
```javascript
async function saveClassificationToServer(result) {
    try {
        const response = await fetch('/api/classifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAuthToken()}`
            },
            body: JSON.stringify({
                classification: result,
                timestamp: new Date().toISOString(),
                userId: getCurrentUserId()
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const savedData = await response.json();
        return savedData;
        
    } catch (error) {
        console.error('Save failed:', error);
        throw error; // Re-throw for UI handling
    }
}

// Use with proper error handling
async function handleClassification() {
    const classifier = new ocClasificame(categories, items, options);
    
    try {
        const result = await classifier.openDialog();
        await saveClassificationToServer(result);
        showSuccessMessage('Classification saved successfully!');
    } catch (error) {
        if (error.message === 'User cancelled') {
            showInfoMessage('Classification cancelled');
        } else {
            showErrorMessage('Failed to save classification: ' + error.message);
        }
    }
}
```

### 2. State Management

**Maintain Consistency:**
```javascript
// Redux/Vuex/similar state management
function updateApplicationState(classificationResult) {
    // Update your application state
    store.dispatch('updateClassification', {
        result: classificationResult,
        timestamp: Date.now()
    });
    
    // Notify other components
    eventBus.emit('classificationUpdated', classificationResult);
    
    // Persist to local storage if needed
    localStorage.setItem('lastClassification', JSON.stringify(classificationResult));
}
```

### 3. Framework Integration

**React Best Practices:**
```jsx
// Use refs to maintain classifier instance
function useClassifier(categories, items, options) {
    const classifierRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    
    const openClassification = useCallback(async () => {
        if (!classifierRef.current) {
            classifierRef.current = new ocClasificame(categories, items, options);
        }
        
        setIsOpen(true);
        try {
            const result = await classifierRef.current.openDialog();
            return result;
        } finally {
            setIsOpen(false);
        }
    }, [categories, items, options]);
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (classifierRef.current && classifierRef.current.isOpen) {
                classifierRef.current.closeDialog(false);
            }
        };
    }, []);
    
    return { openClassification, isOpen };
}
```

**Vue Best Practices:**
```vue
<script>
export default {
    data() {
        return {
            classifier: null,
            isClassifying: false
        };
    },
    methods: {
        async openClassification() {
            if (this.isClassifying) return;
            
            this.isClassifying = true;
            
            if (!this.classifier) {
                this.classifier = new ocClasificame(
                    this.categories, 
                    this.items, 
                    this.options
                );
            }
            
            try {
                const result = await this.classifier.openDialog();
                this.$emit('classification-complete', result);
            } catch (error) {
                this.$emit('classification-cancelled');
            } finally {
                this.isClassifying = false;
            }
        }
    },
    beforeDestroy() {
        if (this.classifier && this.classifier.isOpen) {
            this.classifier.closeDialog(false);
        }
    }
};
</script>
```

## 🧪 Testing Best Practices

### 1. Unit Testing

**Test Data Validation:**
```javascript
describe('Classification Data Validation', () => {
    test('should reject empty categories', () => {
        expect(() => {
            new ocClasificame([], [{ id: 1, name: 'test' }]);
        }).toThrow('categories array is required and cannot be empty');
    });
    
    test('should handle items with missing categories', () => {
        const categories = [{ id: 'cat1', label: 'C1', title: 'Category 1' }];
        const items = [
            { id: 1, name: 'Valid Item', category: 'cat1' },
            { id: 2, name: 'Invalid Item', category: 'nonexistent' }
        ];
        
        const classifier = new ocClasificame(categories, items);
        const result = classifier.getValue();
        
        // Item with invalid category should be in first category
        expect(result.cat1).toContain('2');
    });
});
```

### 2. Integration Testing

**Test Complete Workflow:**
```javascript
async function testCompleteWorkflow() {
    const categories = [
        { id: 'todo', label: 'Todo', title: 'To Do' },
        { id: 'done', label: 'Done', title: 'Completed' }
    ];
    
    const items = [
        { id: 1, name: 'Task 1', category: 'todo' },
        { id: 2, name: 'Task 2', category: 'todo' }
    ];
    
    const classifier = new ocClasificame(categories, items, {
        title: 'Test Classification',
        editable: true
    });
    
    // Test initial state
    const initialState = classifier.getValue();
    expect(initialState.todo).toEqual(['1', '2']);
    expect(initialState.done).toEqual([]);
    
    // Test item movement
    classifier._moveItemTo('1', 'done', false);
    const afterMove = classifier.getValue();
    expect(afterMove.todo).toEqual(['2']);
    expect(afterMove.done).toEqual(['1']);
    
    return true;
}
```

## 📝 Documentation Best Practices

### 1. Comment Your Configuration

```javascript
// Production configuration for user permission management
const productionConfig = {
    title: 'User Permission Management',
    que_clasifica: 'usuario',           // For API/database identification
    que_clasifica_label: 'Users',       // UI display label
    
    // Data mapping
    valueId: 'userId',                  // Maps to user.userId
    valueDisplay: 'fullName',           // Maps to user.fullName
    itemsCategoryIdKey: 'permission',   // Maps to user.permission
    
    // Feature flags
    editable: userRole !== 'viewer',    // Read-only for viewers
    showToolbar: true,                  // Always show for accessibility
    showPlantillaMethod: true,          // Enable templates
    canSavePlantillaMethod: userRole === 'admin', // Only admins can save
    
    // Error handling
    unassignedDefaultTo: 'pending',     // Safe default for invalid permissions
    debug: environment === 'development'
};
```

### 2. Document Your Patterns

```javascript
/**
 * Creates a classification interface for managing user permissions
 * 
 * @param {Array} users - User objects from the database
 * @param {Object} currentUser - The user performing the classification
 * @returns {Promise} Resolves with updated permission assignments
 */
async function manageUserPermissions(users, currentUser) {
    // Validate permissions
    if (!currentUser.canManagePermissions) {
        throw new Error('Insufficient permissions');
    }
    
    // Configure based on user role
    const config = createPermissionConfig(currentUser);
    
    // Create classifier
    const classifier = new ocClasificame(permissionCategories, users, config);
    
    try {
        const result = await classifier.openDialog();
        return await savePermissions(result);
    } catch (error) {
        if (error.message === 'User cancelled') {
            return null; // User cancelled, no changes
        }
        throw error; // Re-throw unexpected errors
    }
}
```

## 🎯 Success Metrics

Track these metrics to measure effectiveness:

### 1. User Experience Metrics
- Time to complete classification
- Error rates (cancellations vs. saves)
- Feature usage (drag vs. buttons vs. templates)
- Mobile vs. desktop usage patterns

### 2. Technical Metrics
- Load time with different dataset sizes
- Memory usage during operation
- Browser compatibility issues
- API response times for save operations

### 3. Business Metrics
- Adoption rate among users
- Reduction in classification errors
- Time savings compared to previous methods
- User satisfaction scores

---

**Remember:** Start simple and add complexity gradually. Focus on your users' needs and iterate based on feedback and usage patterns.

**Next Steps:**
- **[Examples & Tutorials](Examples.md)** - See these practices in action
- **[Configuration Guide](Configuration.md)** - Detailed option explanations
- **[Troubleshooting](Troubleshooting.md)** - Common issues and solutions