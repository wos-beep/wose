/**
 * ホワサバ・カレンダービューア
 * viewer.js v1.0.0
 */

class CalendarApp {
    constructor() {
        this.calendarEl = document.getElementById('calendar');
        this.calendar = null;
        this.initCalendar();
        this.setupEventListeners();
    }

    initCalendar() {
        this.calendar = new FullCalendar.Calendar(this.calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'ja',
            firstDay: 1, // 月曜開始
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek'
            },
            eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
            events: []
        });
        this.calendar.render();
    }

    setupEventListeners() {
        document.getElementById('import-btn').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });
        document.getElementById('import-file').addEventListener('change', (e) => this.handleImport(e));
    }

    handleImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                const calendarEvents = this.generateCalendarEvents(data.events);
                
                this.calendar.removeAllEvents();
                this.calendar.addEventSource(calendarEvents);
                alert(`${data.events.length}個のマスターデータから予定を生成しました。`);
            } catch (err) {
                alert("エラー: JSONの形式が正しくありません。" + err.message);
            }
        };
        reader.readAsText(file);
    }

    generateCalendarEvents(masterEvents) {
        const events = [];
        const generateRangeMonths = 12; // 1年分生成
        const now = dayjs();
        const endLimit = now.add(generateRangeMonths, 'month');

        masterEvents.forEach(master => {
            const startAnchor = dayjs(master.start); // UTCとして解釈（HTML5 input準拠）
            const durationHrs = master.occurrence.duration_hours;
            const color = this.getCategoryColor(master.category);

            if (master.occurrence.frequency_type === 'once') {
                // 単発イベント
                events.push({
                    title: master.name,
                    start: master.start,
                    end: master.end,
                    backgroundColor: color,
                    extendedProps: { category: master.category }
                });
            } else if (master.occurrence.frequency_type === 'weekly') {
                // 周期イベントの展開
                let currentStart = startAnchor;
                const intervalWeeks = master.occurrence.interval || 1;

                // 開始日から1年後まで作成
                while (currentStart.isBefore(endLimit)) {
                    const currentEnd = currentStart.add(durationHrs, 'hour');
                    
                    events.push({
                        title: master.name,
                        start: currentStart.format('YYYY-MM-DDTHH:mm:ss'),
                        end: currentEnd.format('YYYY-MM-DDTHH:mm:ss'),
                        backgroundColor: color,
                        extendedProps: { category: master.category }
                    });

                    currentStart = currentStart.add(intervalWeeks, 'week');
                }
            }
        });
        return events;
    }

    getCategoryColor(category) {
        const colors = {
            '戦争': '#ef4444', // red
            '内政': '#10b981', // emerald
            '課金': '#f59e0b', // amber
            '同盟': '#3b82f6', // blue
            '個人': '#8b5cf6', // violet
            'バライベ': '#ec4899', // pink
            '未分類': '#6b7280'  // gray
        };
        return colors[category] || '#4b5563';
    }
}

// 起動
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CalendarApp();
});
