# SortableJS Complete Implementation Guide

## Overview
SortableJS is a modern JavaScript library for creating reorderable drag-and-drop lists that works on modern browsers and touch devices without requiring jQuery. It has native support for touch devices and modern browsers (including IE9).

## Safari/iOS Compatibility Focus

### Key Safari-Specific Issues & Solutions

#### 1. Text Selection Problem in Safari
Safari has issues with text selection during drag operations, especially when forceFallback is enabled. After the first drag operation, subsequent drags may select text instead of dragging.

**Solution:**
```javascript
new Sortable(element, {
    forceFallback: false, // Avoid forcing fallback mode in Safari
    fallbackTolerance: 0, // Adjust if needed
    preventOnFilter: true
});
```

#### 2. Touch Device Optimization
For optimal Safari/iOS experience:

```javascript
new Sortable(element, {
    // Essential for touch devices
    delay: 100, // Small delay helps with accidental drags
    delayOnTouchOnly: true, // Only apply delay on touch devices
    touchStartThreshold: 10, // Prevent sensitive touch firing
    fallbackTolerance: 3, // Better mobile tolerance
    
    // Prevent text selection issues
    forceFallback: false,
    fallbackOnBody: true, // For nested lists
    
    // Smooth animations
    animation: 150,
    easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)"
});
```

### Trackpad & Mouse Compatibility

#### Magic Trackpad/Mouse Settings
iPadOS supports Bluetooth trackpads and mice with customizable settings under Settings > General > Trackpad & Mouse.

**Recommended iPad Settings:**
- **Tracking Speed**: Medium-high for precision
- **Natural Scrolling**: Enabled
- **Tap to Click**: Enabled for trackpads
- **Two Finger Secondary Click**: Enabled

#### SortableJS Configuration for Trackpad/Mouse
```javascript
new Sortable(element, {
    // Optimized for trackpad/mouse precision
    swapThreshold: 0.65, // Better precision for pointer devices
    fallbackTolerance: 1, // Lower tolerance for mouse precision
    dragoverBubble: false, // Prevent conflicts with nested elements
    
    // Handle detection for precise control
    handle: '.drag-handle', // Recommended for trackpad users
    
    // Cursor feedback
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag'
});
```

## Core Implementation

### Basic Setup
```html
<!-- Include SortableJS -->
<script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>

<!-- Basic HTML structure -->
<ul id="sortable-list">
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
</ul>

<script>
const sortable = new Sortable(document.getElementById('sortable-list'), {
    animation: 150,
    ghostClass: 'sortable-ghost'
});
</script>
```

### Advanced Configuration
```javascript
const sortable = new Sortable(element, {
    // Group settings (for multi-list sorting)
    group: {
        name: 'shared',
        pull: true, // Can drag out
        put: true   // Can receive items
    },
    
    // Behavior
    sort: true,              // Enable sorting within list
    disabled: false,         // Enable/disable sortable
    animation: 150,          // Animation speed (ms)
    easing: "cubic-bezier(1, 0, 0, 1)",
    
    // Touch/Mobile optimizations
    delay: 0,                // Delay before drag starts
    delayOnTouchOnly: false, // Only delay on touch
    touchStartThreshold: 0,  // Touch movement threshold
    
    // Drag handles and filters
    handle: '.drag-handle',          // Drag handle selector
    filter: '.no-drag',             // Elements to ignore
    draggable: '.draggable-item',   // Draggable elements
    
    // Visual feedback
    ghostClass: 'sortable-ghost',   // Placeholder class
    chosenClass: 'sortable-chosen', // Active item class
    dragClass: 'sortable-drag',     // Dragging item class
    
    // Advanced features
    swapThreshold: 1,        // Swap sensitivity
    invertSwap: false,       // Invert swap zones
    direction: 'vertical',   // 'vertical', 'horizontal', or function
    
    // Fallback options (for older browsers)
    forceFallback: false,    // Force fallback mode
    fallbackClass: 'sortable-fallback',
    fallbackOnBody: false,   // Append to body during drag
    fallbackTolerance: 0,    // Mouse movement threshold
    
    // Empty list handling
    emptyInsertThreshold: 5, // Distance for empty list insertion
    
    // Event handlers
    onStart: function(evt) {
        console.log('Dragging started');
    },
    onEnd: function(evt) {
        console.log('Dragging ended', {
            oldIndex: evt.oldIndex,
            newIndex: evt.newIndex,
            from: evt.from,
            to: evt.to
        });
    },
    onAdd: function(evt) {
        console.log('Item added from another list');
    },
    onRemove: function(evt) {
        console.log('Item removed to another list');
    },
    onUpdate: function(evt) {
        console.log('Item position changed');
    },
    onSort: function(evt) {
        console.log('Any sorting change occurred');
    },
    onMove: function(evt, originalEvent) {
        // Return false to cancel move
        // return evt.related.className.indexOf('no-drop') === -1;
    }
});
```

## CSS Styling for Safari Compatibility

```css
/* Essential styles for Safari compatibility */
.sortable-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.sortable-item {
    /* Prevent text selection issues in Safari */
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    
    /* Touch action for better mobile experience */
    touch-action: manipulation;
    
    /* Cursor feedback */
    cursor: grab;
    
    /* Basic styling */
    padding: 10px;
    margin: 5px 0;
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.sortable-item:active {
    cursor: grabbing;
}

/* Ghost element (placeholder) */
.sortable-ghost {
    opacity: 0.4;
    background: #c8c8c8;
}

/* Chosen element (being dragged) */
.sortable-chosen {
    cursor: grabbing !important;
    transform: rotate(5deg);
}

/* Dragging element */
.sortable-drag {
    opacity: 1;
    cursor: grabbing !important;
}

/* Drag handle */
.drag-handle {
    cursor: grab;
    display: inline-block;
    width: 20px;
    height: 20px;
    background: #ccc;
    margin-right: 10px;
}

.drag-handle:active {
    cursor: grabbing;
}

/* Mobile/touch optimizations */
@media (hover: none) and (pointer: coarse) {
    .sortable-item {
        /* Larger touch targets */
        min-height: 44px;
        padding: 15px;
    }
    
    .drag-handle {
        width: 30px;
        height: 30px;
    }
}
```

## Safari-Specific Best Practices

### 1. Avoid Force Fallback
```javascript
// DON'T - Can cause text selection issues in Safari
new Sortable(element, {
    forceFallback: true
});

// DO - Let Safari use native drag & drop
new Sortable(element, {
    forceFallback: false,
    fallbackTolerance: 3 // Only for older browsers
});
```

### 2. Handle Touch Events Properly
```javascript
new Sortable(element, {
    // Prevent accidental drags on sensitive touch screens
    touchStartThreshold: 10,
    
    // Only delay on touch devices
    delayOnTouchOnly: true,
    delay: 100,
    
    // Better mobile tolerance
    fallbackTolerance: 3
});
```

### 3. Optimize for Trackpad Users
```javascript
new Sortable(element, {
    // More precise swap threshold for trackpads
    swapThreshold: 0.65,
    
    // Prevent bubble issues with precise pointing
    dragoverBubble: false,
    
    // Use handles for better UX
    handle: '.drag-handle'
});
```

## Multi-List Implementation

```javascript
// Shared group for multiple lists
const sharedConfig = {
    group: 'shared-lists',
    animation: 150,
    ghostClass: 'sortable-ghost',
    
    // Safari optimizations
    forceFallback: false,
    delayOnTouchOnly: true,
    touchStartThreshold: 10
};

// List 1 - Can give and receive
new Sortable(document.getElementById('list1'), {
    ...sharedConfig,
    group: {
        name: 'shared-lists',
        pull: true,
        put: true
    }
});

// List 2 - Can only receive (clone from list1)
new Sortable(document.getElementById('list2'), {
    ...sharedConfig,
    group: {
        name: 'shared-lists',
        pull: 'clone',
        put: true
    }
});
```

## Event Handling Examples

```javascript
new Sortable(element, {
    onStart: function(evt) {
        // Add visual feedback
        document.body.classList.add('is-dragging');
    },
    
    onEnd: function(evt) {
        // Remove visual feedback
        document.body.classList.remove('is-dragging');
        
        // Save new order
        const newOrder = this.toArray();
        localStorage.setItem('list-order', JSON.stringify(newOrder));
    },
    
    onMove: function(evt, originalEvent) {
        // Prevent dropping on certain elements
        if (evt.related.classList.contains('no-drop')) {
            return false;
        }
        
        // Custom logic for trackpad users
        if (originalEvent.type === 'mousemove') {
            // Handle trackpad-specific behavior
        }
        
        return true; // Allow move
    }
});
```

## Common Issues & Solutions

### Issue 1: Jerky Scrolling on Mobile Safari
Mobile Safari can exhibit jerky scroll behavior during drag operations.

**Solution:**
```css
/* Prevent scroll issues */
.sortable-list {
    overflow: visible;
    -webkit-overflow-scrolling: touch;
}

/* During dragging */
body.is-dragging {
    overflow: hidden;
    -webkit-overflow-scrolling: auto;
}
```

### Issue 2: Cursor Issues with Trackpad
Cursor styling can be problematic due to pointer-events: none being applied during drag.

**Solution:**
```css
.sortable-chosen {
    cursor: grabbing !important;
}

.sortable-drag {
    cursor: grabbing !important;
    /* pointer-events will be disabled by SortableJS */
}
```

### Issue 3: Text Selection in Safari
**Solution:**
```css
.sortable-item {
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
}

/* Allow text in specific areas */
.sortable-item .text-content {
    -webkit-user-select: text;
    user-select: text;
}
```

## Performance Optimization

```javascript
// For large lists (100+ items)
new Sortable(element, {
    animation: 0,           // Disable animation for performance
    removeCloneOnHide: true, // Clean up clones
    emptyInsertThreshold: 0, // Disable empty threshold checks
    
    // Efficient event handling
    onMove: function(evt) {
        // Minimal logic here
        return true;
    }
});
```

## Complete Working Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>Safari-Compatible SortableJS</title>
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
    <style>
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .sortable-list {
            list-style: none;
            padding: 0;
            margin: 20px 0;
            border: 2px dashed #ddd;
            min-height: 50px;
            border-radius: 8px;
        }
        
        .sortable-item {
            display: flex;
            align-items: center;
            padding: 15px;
            margin: 10px;
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            cursor: grab;
            
            /* Safari compatibility */
            -webkit-user-select: none;
            user-select: none;
            touch-action: manipulation;
        }
        
        .sortable-item:active {
            cursor: grabbing;
        }
        
        .drag-handle {
            width: 20px;
            height: 20px;
            background: #666;
            margin-right: 15px;
            cursor: grab;
            border-radius: 3px;
        }
        
        .sortable-ghost {
            opacity: 0.4;
            background: #f0f0f0;
        }
        
        .sortable-chosen {
            transform: rotate(2deg);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Safari-Compatible Sortable List</h1>
        
        <ul id="sortable-list" class="sortable-list">
            <li class="sortable-item" data-id="1">
                <div class="drag-handle"></div>
                <span>Drag me around - Item 1</span>
            </li>
            <li class="sortable-item" data-id="2">
                <div class="drag-handle"></div>
                <span>I work on Safari & iOS - Item 2</span>
            </li>
            <li class="sortable-item" data-id="3">
                <div class="drag-handle"></div>
                <span>Trackpad friendly - Item 3</span>
            </li>
        </ul>
    </div>

    <script>
        // Safari-optimized configuration
        new Sortable(document.getElementById('sortable-list'), {
            // Core settings
            animation: 150,
            easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            
            // Safari compatibility
            forceFallback: false,
            fallbackTolerance: 3,
            
            // Touch/mobile optimization
            delay: 100,
            delayOnTouchOnly: true,
            touchStartThreshold: 10,
            
            // Precision for trackpad users
            swapThreshold: 0.65,
            handle: '.drag-handle',
            
            // Visual feedback
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            
            // Event handling
            onStart: function(evt) {
                console.log('Started dragging item:', evt.item.textContent);
            },
            
            onEnd: function(evt) {
                console.log('Moved from index', evt.oldIndex, 'to', evt.newIndex);
                
                // Save order
                const order = this.toArray();
                console.log('New order:', order);
            }
        });
    </script>
</body>
</html>
```

This guide provides comprehensive coverage for implementing SortableJS with optimal Safari, iOS, and trackpad compatibility. The key is avoiding `forceFallback`, properly handling touch thresholds, and providing appropriate visual feedback for different input methods.