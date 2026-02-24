<?php
/**
 * Project: ClassifyIt & TagIt Unified Mock API
 * Version: 3.0.0
 * Description: One responder to rule them all. Supports TagIt CRUD,
 * ClassifyIt Groups (Recursion), and Plantillas (Templates).
 */

session_start();
header('Content-Type: application/json');

// --- 1. SESSION-BASED PERSISTENCE SETUP ---

// Mock system items (The actual objects being classified)
if (!isset($_SESSION['system_items'])) {
    $_SESSION['system_items'] = [
      ['id' => 'p1', 'name' => 'Laptop Pro'],
      ['id' => 'p2', 'name' => 'Mouse Wireless'],
      ['id' => 'p3', 'name' => 'Keyboard Mechanical'],
      ['id' => 'p4', 'name' => 'Monitor 4K'],
      ['id' => 'p5', 'name' => 'USB-C Hub'],
    ];
}

// TagIt Catalog: The "tags" themselves
if (!isset($_SESSION['mock_tags'])) {
    $_SESSION['mock_tags'] = [
      ['id' => '10', 'text' => 'Hardware'],
      ['id' => '11', 'text' => 'Office'],
      ['id' => '12', 'text' => 'Peripheral']
    ];
}

// ClassifyIt Groups: Collections of system_items
if (!isset($_SESSION['groups'])) {
    $_SESSION['groups'] = [
      ['id' => 'g1', 'name' => 'Basic Set', 'description' => 'Essential gear'],
    ];
}

// Membership: groupId => [itemIds]
if (!isset($_SESSION['group_items'])) {
    $_SESSION['group_items'] = [
      'g1' => ['p2', 'p3'],
    ];
}

// Plantillas: Saved layouts of classifications
if (!isset($_SESSION['plantillas'])) {
    $_SESSION['plantillas'] = [];
}

// --- 2. HELPER FUNCTIONS ---

function sendJSON($success, $data = [], $error = null) {
    echo json_encode(['success' => $success, 'data' => $data, 'error' => $error]);
    exit;
}

// --- 3. REQUEST DISPATCHER ---

$action = $_REQUEST['action'] ?? '';

try {
    switch ($action) {

        // ==========================================
        // TAGIT ACTIONS (CRUD for the Tags list)
        // ==========================================

        case 'tagList':
            sendJSON(true, $_SESSION['mock_tags']);
            break;

        case 'tagAdd':
            $text = trim($_POST['text'] ?? '');
            if (empty($text)) sendJSON(false, [], 'Tag text required');
            $newId = (string)time();
            $_SESSION['mock_tags'][] = ['id' => $newId, 'text' => $text];
            sendJSON(true, ['id' => $newId]);
            break;

        case 'tagUpdate':
            $id = $_POST['id'] ?? '';
            $text = trim($_POST['text'] ?? '');
            foreach ($_SESSION['mock_tags'] as &$tag) {
                if ($tag['id'] == $id) {
                    $tag['text'] = $text;
                    sendJSON(true);
                }
            }
            sendJSON(false, [], 'Tag not found');
            break;

        case 'tagDelete':
            $id = $_POST['id'] ?? '';
            $_SESSION['mock_tags'] = array_filter($_SESSION['mock_tags'], fn($t) => $t['id'] != $id);
            sendJSON(true);
            break;

        // ==========================================
        // CLASSIFYIT GROUP ACTIONS (CRUD + Members)
        // ==========================================

        case 'listGroups':
            // Used by ClassifyIt to show the "Groups" dropdown with counts
            $list = array_map(function($g) {
                $g['itemCount'] = count($_SESSION['group_items'][$g['id']] ?? []);
                return $g;
            }, $_SESSION['groups']);
            sendJSON(true, $list);
            break;

        case 'getGroupItems':
            // Fetches the items belonging to a group for the Batch "¡Ponlos!" move
            $groupId = $_REQUEST['groupId'] ?? '';
            $itemIds = $_SESSION['group_items'][$groupId] ?? [];

            // Return full item objects that ClassifyIt expects
            $details = array_values(array_filter($_SESSION['system_items'],
              fn($i) => in_array($i['id'], $itemIds)
            ));
            sendJSON(true, $details);
            break;

        case 'saveGroup':
            // CRITICAL: Used by the "Manage Groups" recursive dialog to save/edit a group
            $id = $_POST['id'] ?? 'g' . time();
            $name = $_POST['name'] ?? 'New Group';
            $items = $_POST['items'] ?? []; // This is the list of item IDs classified into the group

            $found = false;
            foreach($_SESSION['groups'] as &$g) {
                if($g['id'] == $id) { $g['name'] = $name; $found = true; }
            }
            if(!$found) $_SESSION['groups'][] = ['id' => $id, 'name' => $name];

            $_SESSION['group_items'][$id] = $items;
            sendJSON(true, ['id' => $id]);
            break;

        case 'deleteGroup':
            $id = $_POST['id'] ?? '';
            $_SESSION['groups'] = array_filter($_SESSION['groups'], fn($g) => $g['id'] !== $id);
            unset($_SESSION['group_items'][$id]);
            sendJSON(true);
            break;

        // ==========================================
        // PLANTILLA ACTIONS (Layout State)
        // ==========================================

        case 'savePlantilla':
            // Saves the entire state of the columns
            $newP = [
              'id' => 'pl_' . time(),
              'name' => $_POST['name'] ?? 'Unnamed Layout',
              'description' => $_POST['description'] ?? '',
              'classification' => $_POST['classification'] // The categoryId => [itemIds] map
            ];
            $_SESSION['plantillas'][] = $newP;
            sendJSON(true, $newP);
            break;

        case 'listPlantillas':
            sendJSON(true, $_SESSION['plantillas']);
            break;

        default:
            sendJSON(false, [], "Action '$action' not recognized.");
            break;
    }
} catch (Exception $e) {
    sendJSON(false, [], $e->getMessage());
}
