<!DOCTYPE html>
<html lang="ja" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ホワサバ・カレンダービューア v1.1.0</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js"></script>
    <style>
        body { background-color: #121212; color: #e0e0e0; }
        .fc { max-width: 1100px; margin: 0 auto; background: #1e1e1e; padding: 20px; border-radius: 8px; }
        .fc-toolbar-title { color: #60a5fa !important; font-size: 1.25rem !important; }
        .fc-col-header-cell { background: #2d2d2d; padding: 8px 0; }
        .fc-daygrid-day:hover { background: #252525; }
        .fc-event { cursor: pointer; border: none !important; padding: 2px 4px; margin-bottom: 1px; }
        .event-actual { border-left: 3px solid #fff !important; font-weight: bold; }
        .event-forecast { opacity: 0.8; border-left: 3px solid rgba(255,255,255,0.3) !important; }
    </style>
</head>
<body class="p-4 md:p-8">
    <header class="mb-8 border-b border-gray-700 pb-4 flex flex-col md:flex-row justify-between items-center max-w-5xl mx-auto gap-4">
        <div>
            <h1 class="text-xl font-bold text-blue-400">イベントカレンダー</h1>
            <p class="text-xs text-gray-500 mt-1">※実績データがある日は自動的に予測を非表示にします</p>
        </div>
        <div class="flex items-center space-x-4">
            <div class="text-xs flex space-x-3 mr-4">
                <span class="flex items-center"><span class="w-3 h-3 border-l-4 border-white mr-1"></span>実績</span>
                <span class="flex items-center opacity-60"><span class="w-3 h-3 border-l-4 border-gray-500 mr-1"></span>予測</span>
            </div>
            <button id="import-btn" class="bg-purple-700 hover:bg-purple-800 py-1.5 px-4 rounded text-white text-sm transition shadow-lg">JSON読み込み</button>
            <input type="file" id="import-file" class="hidden" accept=".json">
        </div>
    </header>

    <div id="calendar"></div>

    <script src="viewer.js"></script>
</body>
</html>
