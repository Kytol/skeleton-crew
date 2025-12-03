import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from 'ui-lib';
import { MissionService } from '../../services/mission.service';
import { SquadService } from '../../services/squad.service';
import { Mission, DIFFICULTY_CONFIG, MISSION_TYPE_CONFIG } from '../../models/mission.model';

@Component({
  selector: 'app-mission-board',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="mission-board">
      <div class="board-header">
        <h2>🗺️ Mission Board</h2>
        <div class="stats">
          <span class="stat">✅ {{ missionService.completedMissionsCount() }} Completed</span>
          <span class="stat gold">💰 {{ missionService.goldEarned() }} Gold Earned</span>
        </div>
      </div>

      @if (missionService.inProgressMissions().length > 0) {
        <div class="active-missions">
          <h3>⏳ Active Missions</h3>
          @for (active of missionService.inProgressMissions(); track active.id) {
            <div class="active-mission-card">
              <div class="mission-info">
                <span class="type">{{ getMissionTypeIcon(active.mission.type) }}</span>
                <div class="details">
                  <span class="name">{{ active.mission.name }}</span>
                  <span class="time">{{ active.timeRemaining }}</span>
                </div>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" [style.width.%]="active.progress"></div>
              </div>
              <span class="probability">{{ active.successProbability }}% success</span>
            </div>
          }
        </div>
      }

      <div class="missions-grid">
        @for (mission of missionService.availableMissions(); track mission.id) {
          <div class="mission-card" [class]="mission.difficulty" (click)="selectMission(mission)">
            <div class="card-header">
              <span class="type-badge">{{ getMissionTypeIcon(mission.type) }} {{ getMissionTypeLabel(mission.type) }}</span>
              <span class="difficulty-badge" [style.background]="getDifficultyColor(mission.difficulty)">
                {{ getDifficultyIcon(mission.difficulty) }} {{ mission.difficulty | titlecase }}
              </span>
            </div>
            <h4>{{ mission.name }}</h4>
            <p class="description">{{ mission.description }}</p>
            <div class="requirements">
              <span>👥 Min {{ mission.requirements.minSquadSize }}</span>
              <span>📊 Lv.{{ mission.requirements.minTotalLevel }}+</span>
              <span>⏱️ {{ mission.duration }}m</span>
            </div>
            <div class="rewards">
              <span class="gold">💰 {{ mission.rewards.gold }}</span>
              <span class="xp">⭐ {{ mission.rewards.experience }} XP</span>
              @if (mission.rewards.bonusItems && mission.rewards.bonusItems.length > 0) {
                <span class="items">🎁 +{{ mission.rewards.bonusItems!.length }} items</span>
              }
            </div>
          </div>
        }
      </div>

      @if (selectedMission()) {
        <div class="modal-overlay" (click)="closeBriefing()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <button class="close-btn" (click)="closeBriefing()">✕</button>
            
            <div class="briefing-header">
              <span class="type-icon">{{ getMissionTypeIcon(selectedMission()!.type) }}</span>
              <div>
                <h3>{{ selectedMission()!.name }}</h3>
                <span class="difficulty" [style.color]="getDifficultyColor(selectedMission()!.difficulty)">
                  {{ getDifficultyIcon(selectedMission()!.difficulty) }} {{ selectedMission()!.difficulty | titlecase }}
                </span>
              </div>
            </div>

            <p class="briefing-desc">{{ selectedMission()!.description }}</p>

            <div class="briefing-section">
              <h4>📋 Requirements</h4>
              <ul>
                <li>Minimum Squad Size: {{ selectedMission()!.requirements.minSquadSize }} members</li>
                <li>Minimum Total Level: {{ selectedMission()!.requirements.minTotalLevel }}</li>
                @if (selectedMission()!.requirements.recommendedRaces?.length) {
                  <li>Recommended Races: {{ selectedMission()!.requirements.recommendedRaces?.join(', ') }}</li>
                }
                @if (selectedMission()!.requirements.recommendedClasses?.length) {
                  <li>Recommended Classes: {{ selectedMission()!.requirements.recommendedClasses?.join(', ') }}</li>
                }
              </ul>
            </div>

            <div class="briefing-section">
              <h4>🎁 Rewards</h4>
              <div class="reward-list">
                <span class="reward gold">💰 {{ selectedMission()!.rewards.gold }} Gold</span>
                <span class="reward xp">⭐ {{ selectedMission()!.rewards.experience }} XP</span>
                @for (item of selectedMission()!.rewards.bonusItems || []; track item) {
                  <span class="reward item">🎁 {{ item }}</span>
                }
              </div>
            </div>

            <div class="squad-check">
              <h4>⚔️ Your Squad</h4>
              <div class="check-item" [class.pass]="squadService.squadSize() >= selectedMission()!.requirements.minSquadSize">
                {{ squadService.squadSize() >= selectedMission()!.requirements.minSquadSize ? '✅' : '❌' }}
                Squad Size: {{ squadService.squadSize() }}/{{ selectedMission()!.requirements.minSquadSize }}
              </div>
              <div class="success-probability">
                <span class="label">Success Probability:</span>
                <span class="value" [class.high]="successProbability() >= 70" [class.low]="successProbability() < 40">
                  {{ successProbability() }}%
                </span>
              </div>
            </div>

            <div class="briefing-actions">
              <ui-button variant="outline" (clicked)="closeBriefing()">Cancel</ui-button>
              <ui-button 
                variant="primary" 
                [disabled]="!canStartMission()"
                (clicked)="startMission()"
              >
                ⚔️ Deploy Squad
              </ui-button>
            </div>
          </div>
        </div>
      }

      @if (latestResult()) {
        <div class="modal-overlay" (click)="closeResult()">
          <div class="modal-content result-modal" [class]="latestResult()!.success ? 'success' : 'failure'" (click)="$event.stopPropagation()">
            <div class="result-header">
              <span class="result-icon">{{ latestResult()!.success ? '🏆' : '💀' }}</span>
              <h3>{{ latestResult()!.success ? 'Mission Complete!' : 'Mission Failed' }}</h3>
            </div>
            <div class="result-rewards">
              <div class="reward-item">
                <span class="label">Gold Earned</span>
                <span class="value">💰 {{ latestResult()!.goldEarned }}</span>
              </div>
              <div class="reward-item">
                <span class="label">Experience</span>
                <span class="value">⭐ {{ latestResult()!.experienceEarned }}</span>
              </div>
              @if (latestResult()!.bonusItems.length > 0) {
                <div class="reward-item">
                  <span class="label">Items Found</span>
                  <span class="value">🎁 {{ latestResult()!.bonusItems.join(', ') }}</span>
                </div>
              }
            </div>
            <ui-button variant="primary" (clicked)="closeResult()">Continue</ui-button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .mission-board { padding: 20px 0; }
    .board-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .board-header h2 { color: var(--accent-gold); margin: 0; }
    .stats { display: flex; gap: 20px; }
    .stat { color: var(--text-secondary); font-size: 0.9rem; }
    .stat.gold { color: var(--accent-gold); font-weight: bold; }
    .active-missions { margin-bottom: 24px; }
    .active-missions h3 { color: var(--text-primary); margin: 0 0 12px; font-size: 1rem; }
    .active-mission-card {
      background: var(--bg-card); border: 2px solid var(--border-progress);
      border-radius: 8px; padding: 12px 16px; margin-bottom: 8px;
    }
    .mission-info { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
    .type { font-size: 1.5rem; }
    .details { display: flex; flex-direction: column; }
    .name { color: var(--text-primary); font-weight: bold; }
    .time { color: var(--accent-gold); font-size: 0.85rem; }
    .progress-bar { height: 6px; background: var(--border-secondary); border-radius: 3px; overflow: hidden; margin-bottom: 4px; }
    .progress-fill { height: 100%; background: var(--accent-gold); transition: width 0.3s; }
    .probability { color: var(--text-muted); font-size: 0.8rem; }
    .missions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
    .mission-card {
      background: var(--bg-card); border: 2px solid var(--border-primary);
      border-radius: 12px; padding: 16px; cursor: pointer; transition: all 0.2s;
    }
    .mission-card:hover { transform: translateY(-2px); border-color: var(--accent-gold); }
    .mission-card.legendary { border-color: #a35ac4; }
    .card-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
    .type-badge { color: var(--text-secondary); font-size: 0.8rem; }
    .difficulty-badge { padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; color: #fff; }
    .mission-card h4 { color: var(--text-white); margin: 0 0 8px; }
    .description { color: var(--text-secondary); font-size: 0.85rem; margin: 0 0 12px; }
    .requirements { display: flex; gap: 12px; margin-bottom: 12px; font-size: 0.8rem; color: var(--text-muted); }
    .rewards { display: flex; gap: 12px; padding-top: 12px; border-top: 1px solid var(--border-secondary); }
    .gold { color: var(--accent-gold); font-weight: bold; }
    .xp { color: #5ac47a; }
    .items { color: #a35ac4; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: var(--bg-secondary); border: 2px solid var(--border-primary); border-radius: 16px; padding: 24px; max-width: 500px; width: 90%; position: relative; }
    .close-btn { position: absolute; top: 16px; right: 16px; background: transparent; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer; }
    .briefing-header { display: flex; gap: 16px; align-items: center; margin-bottom: 16px; }
    .type-icon { font-size: 3rem; }
    .briefing-header h3 { color: var(--text-white); margin: 0 0 4px; }
    .difficulty { font-size: 0.9rem; }
    .briefing-desc { color: var(--text-secondary); margin-bottom: 20px; }
    .briefing-section { margin-bottom: 20px; }
    .briefing-section h4 { color: var(--accent-gold); margin: 0 0 12px; font-size: 0.95rem; }
    .briefing-section ul { margin: 0; padding-left: 20px; color: var(--text-secondary); }
    .briefing-section li { margin-bottom: 6px; }
    .reward-list { display: flex; flex-wrap: wrap; gap: 12px; }
    .reward { padding: 6px 12px; background: var(--card-overlay); border-radius: 6px; font-size: 0.9rem; }
    .reward.gold { color: var(--accent-gold); }
    .reward.xp { color: #5ac47a; }
    .reward.item { color: #a35ac4; }
    .squad-check { background: var(--card-overlay); padding: 16px; border-radius: 8px; margin-bottom: 20px; }
    .squad-check h4 { color: var(--text-primary); margin: 0 0 12px; }
    .check-item { color: var(--text-secondary); margin-bottom: 8px; }
    .check-item.pass { color: #5ac47a; }
    .success-probability { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border-secondary); }
    .success-probability .label { color: var(--text-secondary); }
    .success-probability .value { font-size: 1.5rem; font-weight: bold; color: var(--accent-gold); }
    .success-probability .value.high { color: #5ac47a; }
    .success-probability .value.low { color: #c45a5a; }
    .briefing-actions { display: flex; justify-content: flex-end; gap: 12px; }
    .result-modal { text-align: center; }
    .result-modal.success { border-color: #5ac47a; }
    .result-modal.failure { border-color: #c45a5a; }
    .result-header { margin-bottom: 20px; }
    .result-icon { font-size: 4rem; display: block; margin-bottom: 12px; }
    .result-header h3 { color: var(--text-white); margin: 0; }
    .result-rewards { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
    .reward-item { display: flex; justify-content: space-between; padding: 12px; background: var(--card-overlay); border-radius: 8px; }
    .reward-item .label { color: var(--text-secondary); }
    .reward-item .value { color: var(--accent-gold); font-weight: bold; }
  `]
})
export class MissionBoardComponent {
  missionService = inject(MissionService);
  squadService = inject(SquadService);

  selectedMission = signal<Mission | null>(null);
  latestResult = signal<any>(null);
  successProbability = signal(0);

  selectMission(mission: Mission): void {
    this.selectedMission.set(mission);
    this.successProbability.set(this.missionService.calculateSuccessProbability(mission.id));
  }

  closeBriefing(): void {
    this.selectedMission.set(null);
  }

  canStartMission(): boolean {
    const mission = this.selectedMission();
    if (!mission) return false;
    return this.squadService.squadSize() >= mission.requirements.minSquadSize;
  }

  startMission(): void {
    const mission = this.selectedMission();
    if (mission && this.missionService.startMission(mission.id)) {
      this.closeBriefing();
    }
  }

  closeResult(): void {
    this.latestResult.set(null);
  }

  getMissionTypeIcon(type: string): string {
    return MISSION_TYPE_CONFIG[type as keyof typeof MISSION_TYPE_CONFIG]?.icon || '📜';
  }

  getMissionTypeLabel(type: string): string {
    return MISSION_TYPE_CONFIG[type as keyof typeof MISSION_TYPE_CONFIG]?.label || type;
  }

  getDifficultyColor(difficulty: string): string {
    return DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG]?.color || '#666';
  }

  getDifficultyIcon(difficulty: string): string {
    return DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG]?.icon || '⭐';
  }
}
