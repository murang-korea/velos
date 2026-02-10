/**
 * SaveManager Class
 * 게임 데이터의 영구 저장 및 로드를 담당
 */
class SaveManager {
    constructor() {
        this.SAVE_KEY = 'VELOS_CONQUEST_SAVE_DATA';
        this.autoSaveInterval = 60; // 60초마다 자동 저장
        this.timer = 0;

        // 기본 데이터 구조
        this.data = {
            player: {
                level: 1,
                exp: 0,
                hp: 100,
                unlockedSkills: []
            },
            progress: {
                currentPlanet: 'EARTH',
                clearedStages: 0
            },
            settings: {
                soundVolume: 0.5,
                isTutorialDone: false
            },
            lastSaved: null
        };

        this.init();
    }

    /**
     * 초기 로드
     */
    init() {
        this.load();
    }

    /**
     * 로컬 스토리지에서 데이터 불러오기
     */
    load() {
        try {
            const savedData = localStorage.getItem(this.SAVE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                // 기존 데이터와 병합 (신규 업데이트 필드 누락 방지)
                this.data = { ...this.data, ...parsedData };
                console.log("Game Data Loaded Successfully.");
            }
        } catch (error) {
            console.error("Failed to load game data:", error);
        }
    }

    /**
     * 로컬 스토리지에 데이터 저장
     */
    save() {
        try {
            this.data.lastSaved = new Date().toISOString();
            const serializedData = JSON.stringify(this.data);
            localStorage.setItem(this.SAVE_KEY, serializedData);
            console.log("Game Data Saved.");
        } catch (error) {
            console.error("Failed to save game data:", error);
        }
    }

    /**
     * 특정 데이터 업데이트 (예: 레벨 업)
     * @param {string} category - player, progress 등
     * @param {Object} newData - 업데이트할 정보
     */
    updateData(category, newData) {
        if (this.data[category]) {
            this.data[category] = { ...this.data[category], ...newData };
        }
    }

    /**
     * 매 프레임 Game.update에서 호출되는 자동 저장 로직
     * @param {number} deltaTime 
     */
    update(deltaTime) {
        this.timer += deltaTime;
        if (this.timer >= this.autoSaveInterval) {
            this.save();
            this.timer = 0;
        }
    }

    /**
     * 저장 데이터 초기화 (새 게임)
     */
    reset() {
        localStorage.removeItem(this.SAVE_KEY);
        location.reload(); // 초기화 후 재시작
    }

    // --- Getter 함수들 ---
    getPlayerLevel() { return this.data.player.level; }
    getCurrentPlanet() { return this.data.progress.currentPlanet; }
}

// 싱글톤 인스턴스로 수출
export default new SaveManager();
