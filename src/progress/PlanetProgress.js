/**
 * PlanetProgress Class
 * 행성별 점령도, 보스 클리어 상태 및 다음 스테이지 해금 관리
 */
import EventManager from '../core/EventManager.js';
import SaveManager from '../system/SaveManager.js';

export default class PlanetProgress {
    constructor() {
        // 행성 데이터 정의 (규칙 5번: 데이터 테이블 사용)
        this.PLANET_DATA = {
            EARTH: { name: "지구", targetScore: 100, next: "MARS" },
            MARS: { name: "화성", targetScore: 250, next: "JUPITER" },
            JUPITER: { name: "목성", targetScore: 500, next: null }
        };

        this.currentPlanetKey = SaveManager.getCurrentPlanet() || 'EARTH';
        this.currentScore = 0;
        this.isBossCleared = false;
        this.conquestPercentage = 0;

        this.init();
    }

    init() {
        // 보스 사망 이벤트 수신
        EventManager.on('BOSS_DIED', () => {
            this.isBossCleared = true;
            this.completePlanet();
        });

        // 적 처치 시 점수 획득 이벤트 수신
        EventManager.on('ENEMY_KILLED', (data) => {
            this.addProgress(data.score || 10);
        });
    }

    /**
     * 점령 진행도 추가
     */
    addProgress(amount) {
        const planet = this.PLANET_DATA[this.currentPlanetKey];
        this.currentScore += amount;

        // 진행률 계산 (0 ~ 100)
        this.conquestPercentage = Math.min(100, (this.currentScore / planet.targetScore) * 100);

        // UI 업데이트 알림
        EventManager.emit('PROGRESS_UPDATED', {
            percentage: this.conquestPercentage,
            planetName: planet.name
        });

        // 목표치 도달 시 보스 스폰 신호 전송
        if (this.currentScore >= planet.targetScore && !this.isBossCleared) {
            EventManager.emit('READY_FOR_BOSS', { planetKey: this.currentPlanetKey });
        }
    }

    /**
     * 행성 점령 완료 및 다음 행성 해금
     */
    completePlanet() {
        const planet = this.PLANET_DATA[this.currentPlanetKey];
        console.log(`${planet.name} Conquest Complete!`);

        const nextPlanet = planet.next;
        if (nextPlanet) {
            // 저장 데이터 업데이트
            SaveManager.updateData('progress', { 
                currentPlanet: nextPlanet,
                clearedStages: (SaveManager.data.progress.clearedStages || 0) + 1
            });
            SaveManager.save();

            EventManager.emit('PLANET_UNLOCKED', { nextPlanet });
        } else {
            EventManager.emit('GAME_COMPLETE');
        }
    }

    /**
     * 다음 행성으로 실제 이동
     */
    moveToNextPlanet() {
        const nextPlanet = this.PLANET_DATA[this.currentPlanetKey].next;
        if (nextPlanet) {
            this.currentPlanetKey = nextPlanet;
            this.currentScore = 0;
            this.isBossCleared = false;
            this.conquestPercentage = 0;
            
            // 맵 및 환경 재설정 신호
            EventManager.emit('MAP_CHANGE_REQUEST', { planetKey: nextPlanet });
        }
    }

    /**
     * 현재 상태 요약 (UI용)
     */
    getProgressInfo() {
        return {
            name: this.PLANET_DATA[this.currentPlanetKey].name,
            percent: this.conquestPercentage,
            isBossReady: this.currentScore >= this.PLANET_DATA[this.currentPlanetKey].targetScore
        };
    }
}
