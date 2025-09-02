# Examples & Tutorials

Real-world examples and step-by-step tutorials for ocClasificame.

## 📚 Table of Contents

- [User Permission Management](#user-permission-management)
- [Task/Project Management](#taskproject-management)
- [E-commerce Product Categories](#e-commerce-product-categories)
- [Content Management](#content-management)
- [Read-Only Dashboards](#read-only-dashboards)
- [Advanced Template Usage](#advanced-template-usage)
- [Group Management Examples](#group-management-examples)

## 👥 User Permission Management

Perfect for admin panels and user role assignment.

### Basic Permission Classification

```javascript
const permissions = [
    { id: 'none', label: '❌', title: 'No Access' },
    { id: 'read', label: '👀', title: 'Read Only' },
    { id: 'write', label: '✏️', title: 'Read/Write' },
    { id: 'admin', label: '👑', title: 'Admin' }
];

const users = [
    { id: 1, name: 'John Doe', category: 'read' },
    { id: 2, name: 'Jane Smith', category: 'write' },
    { id: 3, name: 'Bob Admin', category: 'admin' },
    { id: 4, name: 'Alice User', category: 'none' }
];

const userClassifier = new ocClasificame(permissions, users, {
    title: 'User Permissions Management',
    que_clasifica_label: 'Users',
    editable: true,
    showToolbar: true
});

// Usage
async function managePermissions() {
    try {
        const result = await userClassifier.openDialog();
        
        // Send results to server
        await fetch('/api/permissions/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result)
        });
        
        showSuccess('Permissions updated successfully!');
    } catch (error) {
        showInfo('Permission update cancelled');
    }
}
```

### With Saved Templates

```javascript
const permissionTemplates = [
    {
        id: 'default_setup',
        name: 'Default Setup',
        description: 'Standard permission setup for new projects',
        classification: {
            none: [],
            read: ['1', '4'],
            write: ['2'],
            admin: ['3']
        }
    },
    {
        id: 'lockdown_mode',
        name: 'Lockdown Mode',
        description: 'Restricted access for maintenance',
        classification: {
            none: ['1', '2', '4'],
            read: [],
            write: [],
            admin: ['3']
        }
    }
];

const classifier = new ocClasificame(permissions, users, {
    title: 'User Permissions with Templates',
    savedClassifications: permissionTemplates,
    showPlantillaMethod: true,
    canSavePlantillaMethod: true
});
```

## 📋 Task/Project Management

Organize tasks by status, priority, or team assignment.

### Kanban-Style Task Board

```javascript
const taskStatuses = [
    { id: 'backlog', label: '📋', title: 'Backlog' },
    { id: 'todo', label: '📝', title: 'To Do' },
    { id: 'doing', label: '🔄', title: 'In Progress' },
    { id: 'review', label: '👀', title: 'Review' },
    { id: 'done', label: '✅', title: 'Done' }
];

const tasks = [
    { id: 't1', name: 'User authentication system', category: 'doing' },
    { id: 't2', name: 'Database schema design', category: 'done' },
    { id: 't3', name: 'API endpoint documentation', category: 'todo' },
    { id: 't4', name: 'Frontend login page', category: 'review' },
    { id: 't5', name: 'Unit test coverage', category: 'backlog' }
];

const taskBoard = new ocClasificame(taskStatuses, tasks, {
    title: 'Sprint Planning Board',
    que_clasifica_label: 'Tasks',
    editable: true,
    showToolbar: true,
    unassignedDefaultTo: 'backlog' // New tasks go to backlog
});

// Integration with project management
async function updateTaskBoard() {
    try {
        const result = await taskBoard.openDialog();
        
        // Update each task's status
        for (const [status, taskIds] of Object.entries(result)) {
            for (const taskId of taskIds) {
                await updateTaskStatus(taskId, status);
            }
        }
        
        refreshProjectView();
    } catch (error) {
        console.log('Task update cancelled');
    }
}
```

### Priority-Based Classification

```javascript
const priorities = [
    { id: 'low', label: '🟢', title: 'Low Priority' },
    { id: 'medium', label: '🟡', title: 'Medium Priority' },
    { id: 'high', label: '🟠', title: 'High Priority' },
    { id: 'critical', label: '🔴', title: 'Critical' }
];

const priorityClassifier = new ocClasificame(priorities, tasks, {
    title: 'Task Priority Assignment',
    que_clasifica_label: 'Tasks',
    valueId: 'id',
    valueDisplay: 'name',
    itemsCategoryIdKey: 'priority' // Different property name
});
```

## 🛒 E-commerce Product Categories

Organize products into categories for better storefront management.

### Product Category Management

```javascript
const productCategories = [
    { id: 'electronics', label: '💻', title: 'Electronics' },
    { id: 'clothing', label: '👕', title: 'Clothing' },
    { id: 'books', label: '📚', title: 'Books' },
    { id: 'home', label: '🏠', title: 'Home & Garden' },
    { id: 'uncategorized', label: '❓', title: 'Uncategorized' }
];

const products = [
    { id: 'p1', name: 'Wireless Headphones', category: 'electronics' },
    { id: 'p2', name: 'Cotton T-Shirt', category: 'clothing' },
    { id: 'p3', name: 'JavaScript Guide', category: 'books' },
    { id: 'p4', name: 'Garden Tools Set', category: 'home' },
    { id: 'p5', name: 'Mystery Product', category: 'uncategorized' }
];

const productClassifier = new ocClasificame(productCategories, products, {
    title: 'Product Category Management',
    que_clasifica_label: 'Products',
    unassignedDefaultTo: 'uncategorized',
    editable: true
});

// Bulk categorization with groups
const productGroups = [
    { id: 'new_arrivals', name: 'New Arrivals', itemCount: 12 },
    { id: 'sale_items', name: 'Sale Items', itemCount: 8 },
    { id: 'bestsellers', name: 'Bestsellers', itemCount: 15 }
];

const advancedProductClassifier = new ocClasificame(productCategories, products, {
    title: 'Advanced Product Management',
    showGroupMethod: true,
    groups: productGroups,
    editable: true
});
```

## 📰 Content Management

Classify articles, posts, or media content.

### Article Status Management

```javascript
const articleStatuses = [
    { id: 'draft', label: '✏️', title: 'Draft' },
    { id: 'review', label: '👀', title: 'Under Review' },
    { id: 'approved', label: '✅', title: 'Approved' },
    { id: 'published', label: '🌐', title: 'Published' },
    { id: 'archived', label: '📦', title: 'Archived' }
];

const articles = [
    { id: 'a1', name: 'Getting Started with React', category: 'published' },
    { id: 'a2', name: 'Advanced CSS Techniques', category: 'review' },
    { id: 'a3', name: 'Database Optimization Tips', category: 'draft' },
    { id: 'a4', name: 'Mobile App Development', category: 'approved' }
];

const contentWorkflow = new ocClasificame(articleStatuses, articles, {
    title: 'Content Publishing Workflow',
    que_clasifica_label: 'Articles',
    editable: true,
    showToolbar: true
});

// Integration with CMS
async function updateContentWorkflow() {
    try {
        const result = await contentWorkflow.openDialog();
        
        // Update article statuses in CMS
        for (const [status, articleIds] of Object.entries(result)) {
            await updateArticleStatuses(articleIds, status);
        }
        
        await refreshCMSDashboard();
        showSuccess('Content workflow updated!');
    } catch (error) {
        showInfo('Workflow update cancelled');
    }
}
```

## 📊 Read-Only Dashboards

Display classifications without allowing modifications.

### Permission Audit Dashboard

```javascript
const auditClassifier = new ocClasificame(permissions, users, {
    title: 'Current User Permissions (Read-Only)',
    editable: false,
    showToolbar: false,
    que_clasifica_label: 'Users'
});

// Display current state
async function showPermissionAudit() {
    try {
        await auditClassifier.openDialog();
        console.log('Audit view closed');
    } catch (error) {
        console.log('Audit view closed');
    }
}
```

### Project Status Overview

```javascript
const statusOverview = new ocClasificame(taskStatuses, tasks, {
    title: 'Project Status Overview',
    editable: false,
    showToolbar: false,
    que_clasifica_label: 'Tasks'
});

// Refresh data before showing
async function showProjectOverview() {
    // Get latest data from server
    const latestTasks = await fetchLatestTasks();
    
    // Update the classifier data
    statusOverview.items = latestTasks;
    statusOverview._initializeValues();
    
    await statusOverview.openDialog();
}
```

## 📋 Advanced Template Usage

Save time with reusable classification templates.

### Multi-Environment Setup

```javascript
const environments = [
    { id: 'dev', label: 'DEV', title: 'Development' },
    { id: 'staging', label: 'STG', title: 'Staging' },
    { id: 'prod', label: 'PROD', title: 'Production' },
    { id: 'archived', label: 'ARC', title: 'Archived' }
];

const environmentTemplates = [
    {
        id: 'initial_deployment',
        name: 'Initial Deployment',
        description: 'Standard deployment pipeline setup',
        classification: {
            dev: ['feature1', 'feature2'],
            staging: ['hotfix1'],
            prod: ['release1'],
            archived: []
        }
    },
    {
        id: 'emergency_rollback',
        name: 'Emergency Rollback',
        description: 'Move everything back to staging for investigation',
        classification: {
            dev: [],
            staging: ['feature1', 'feature2', 'hotfix1', 'release1'],
            prod: [],
            archived: []
        }
    }
];

const deploymentClassifier = new ocClasificame(environments, features, {
    title: 'Feature Deployment Management',
    savedClassifications: environmentTemplates,
    showPlantillaMethod: true,
    canSavePlantillaMethod: true
});
```

## 👥 Group Management Examples

Efficiently manage large sets of items using groups.

### Team-Based Assignment

```javascript
const teams = [
    { id: 'frontend', name: 'Frontend Team', itemCount: 5 },
    { id: 'backend', name: 'Backend Team', itemCount: 7 },
    { id: 'devops', name: 'DevOps Team', itemCount: 3 },
    { id: 'qa', name: 'QA Team', itemCount: 4 }
];

const assignments = [
    { id: 'none', label: '⭕', title: 'Unassigned' },
    { id: 'assigned', label: '✅', title: 'Assigned' },
    { id: 'in_progress', label: '🔄', title: 'In Progress' },
    { id: 'completed', label: '✅', title: 'Completed' }
];

const teamAssignmentClassifier = new ocClasificame(assignments, tasks, {
    title: 'Team Task Assignment',
    showGroupMethod: true,
    crudGroupMethod: true,
    groups: teams,
    editable: true
});

// Assign entire team to a status
async function assignTeamTasks() {
    try {
        const result = await teamAssignmentClassifier.openDialog();
        
        // Process team assignments
        await processTeamAssignments(result);
        showSuccess('Team assignments updated!');
    } catch (error) {
        showInfo('Assignment cancelled');
    }
}
```

### Bulk Operations Example

```javascript
// Example: Moving all items from a specific group to a category
async function moveGroupToCategory(groupId, targetCategory) {
    // Get items in the group
    const groupItems = await fetchGroupItems(groupId);
    
    // Apply classification programmatically
    classifier.applyGroupClassification(groupId, targetCategory);
    
    // Get the updated state
    const result = classifier.getValue();
    
    return result;
}
```

## 🔧 Integration Patterns

### React Integration

```jsx
import React, { useState, useRef } from 'react';

function ClassificationComponent({ categories, items, onSave }) {
    const classifierRef = useRef(null);

    const handleClassify = async () => {
        if (!classifierRef.current) {
            classifierRef.current = new ocClasificame(categories, items, {
                title: 'React Classification',
                editable: true
            });
        }

        try {
            const result = await classifierRef.current.openDialog();
            onSave(result);
        } catch (error) {
            console.log('Classification cancelled');
        }
    };

    return (
        <button onClick={handleClassify}>
            Open Classification
        </button>
    );
}
```

### Vue.js Integration

```vue
<template>
  <button @click="openClassification">
    Classify Items
  </button>
</template>

<script>
export default {
  props: ['categories', 'items'],
  data() {
    return {
      classifier: null
    };
  },
  methods: {
    async openClassification() {
      if (!this.classifier) {
        this.classifier = new ocClasificame(this.categories, this.items, {
          title: 'Vue Classification',
          editable: true
        });
      }

      try {
        const result = await this.classifier.openDialog();
        this.$emit('classification-saved', result);
      } catch (error) {
        this.$emit('classification-cancelled');
      }
    }
  }
};
</script>
```

## 🚀 Performance Tips

### Large Dataset Handling

```javascript
// For large datasets, consider pagination or virtual scrolling
const largeDatasetClassifier = new ocClasificame(categories, items, {
    title: 'Large Dataset Classification',
    editable: true,
    // Consider limiting visible items or implementing search
    // The widget handles hundreds of items well, but thousands may need optimization
});

// Pre-filter items before initializing
const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
);
```

### Memory Management

```javascript
// Clean up classifier when no longer needed
function cleanup() {
    if (classifier && classifier.isOpen) {
        classifier.closeDialog(false);
    }
    classifier = null;
}

// Call cleanup on page unload or component unmount
window.addEventListener('beforeunload', cleanup);
```

## 📱 Mobile Considerations

### Touch-Friendly Configuration

```javascript
const mobileClassifier = new ocClasificame(categories, items, {
    title: 'Mobile-Friendly Classification',
    editable: true,
    showToolbar: true, // Buttons are easier than drag on mobile
    // The widget automatically adapts to mobile with responsive CSS
});
```

---

**Want to explore more?** Check out:
- [Configuration Guide](Configuration.md) - All available options
- [Template Management](Template-Management.md) - Advanced template features
- [Group Management](Group-Management.md) - Bulk operation details
- [Customization](Customization.md) - Styling and theming