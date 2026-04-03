/**
 * ホワサバ・カレンダービューア
 * viewer.js v1.1.0
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
            firstDay: 1, 
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek'
            },
            eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
            dayMaxEvents: true,
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
                // 重複排除ロジックを通してイベント生成
                const calendarEvents = this.generateCalendarEvents(data.events);
                
                this.calendar.removeAllEvents();
                this.calendar.addEventSource(calendarEvents);
                
                const stats = this.countEvents(calendarEvents);
                console.log(`Loaded: ${stats.actual} actuals, ${stats.forecast} forecasts.`);
            } catch (err) {
                alert("エラー: JSONの形式が正しくありません。" + err.message);
            }
        };
        reader.readAsText(file);
    }

    generateCalendarEvents(masterEvents) {
        const events = [];
        const generateRangeMonths = 12; // 今後12ヶ月分を計算
        const now = dayjs();
        const endLimit = now.add(generateRangeMonths, 'month');

        // 重複チェック用のSet (日付_イベント名)
        const actualRecords = new Set();

        // 1. 実績（once）を先に処理し、記録する
        masterEvents.filter(m => m.occurrence.frequency_type === 'once').forEach(master => {
            const startDay = dayjs(master.start).format('YYYY-MM-DD');
            actualRecords.add(`${startDay}_${master.name}`);

            events.push({
                title: `[実] ${master.name}`,
                start: master.start,
                end: master.end,
                backgroundColor: this.getCategoryColor(master.category),
                className: 'event-actual',
                extendedProps: { type: 'actual', category: master.category }
            });
        });

        // 2. 周期（weekly）を処理。実績と被る日はスキップ
        masterEvents.filter(m => m.occurrence.frequency_type === 'weekly').forEach(master => {
            let currentStart = dayjs(master.start);
            const intervalWeeks = master.occurrence.interval || 1;
            const durationHrs = master.occurrence.duration_hours;
            const color = this.getCategoryColor(master.category);

            while (currentStart.isBefore(endLimit)) {
                const dateKey = currentStart.format('YYYY-MM-DD');
                const collisionKey = `${dateKey}_${master.name}`;

                // 実績がない場合のみ、予測として追加
                if (!actualRecords.has(collisionKey)) {
                    const currentEnd = currentStart.add(durationHrs, 'hour');
                    events.push({
                        title: master.name,
                        start: currentStart.format('YYYY-MM-DDTHH:mm:ss'),
                        end: currentEnd.format('YYYY-MM-DDTHH:mm:ss'),
                        backgroundColor: color,
                        className: 'event-forecast',
                        extendedProps: { type: 'forecast', category: master.category }
                    });
                }
                currentStart = currentStart.add(intervalWeeks, 'week');
            }
        });

        return events;
    }

    countEvents(events) {
        return events.reduce((acc, ev) => {
            acc[ev.extendedProps.type]++;
            return acc;
        }, { actual: 0, forecast: 0 });
    }

    getCategoryColor(category) {
        const colors = {
            '戦争': '#ef4444',
            '内政': '#10b981',
            '課金': '#f59e0b',
            '同盟': '#3b82f6',
            '個人': '#8b5cf6',
            'バライベ': '#ec4899',
            '季節イベ': '#f472b6',
            '未分類': '#6b7280'
        };
        return colors[category] || '#4b5563';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new CalendarApp();
});
