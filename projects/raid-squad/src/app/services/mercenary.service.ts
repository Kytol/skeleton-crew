import { Injectable, signal, computed } from '@angular/core';
import {
  Mercenary, MercenaryRace, MercenaryClass, MercenaryStatus,
  FilterOptions, SortOption, Skill, Equipment
} from '../models/mercenary.model';

@Injectable({ providedIn: 'root' })
export class MercenaryService {
  private mercenaries = signal<Mercenary[]>(this.generateMercenaries());

  readonly filters = signal<FilterOptions>({
    races: [],
    classes: [],
    levelRange: [1, 100],
    costRange: [0, 10000],
    status: 'all',
  });

  readonly searchQuery = signal('');
  readonly sortOption = signal<SortOption>('rating-desc');

  readonly allMercenaries = this.mercenaries.asReadonly();

  readonly filteredMercenaries = computed(() => {
    let result = [...this.mercenaries()];
    const f = this.filters();
    const query = this.searchQuery().toLowerCase();

    // Search
    if (query) {
      result = result.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.race.toLowerCase().includes(query) ||
        m.class.toLowerCase().includes(query) ||
        m.specialty.toLowerCase().includes(query)
      );
    }

    // Filter by race
    if (f.races.length > 0) {
      result = result.filter(m => f.races.includes(m.race));
    }

    // Filter by class
    if (f.classes.length > 0) {
      result = result.filter(m => f.classes.includes(m.class));
    }

    // Filter by level
    result = result.filter(m => m.level >= f.levelRange[0] && m.level <= f.levelRange[1]);

    // Filter by cost
    result = result.filter(m => m.hireCost >= f.costRange[0] && m.hireCost <= f.costRange[1]);

    // Filter by status
    if (f.status !== 'all') {
      result = result.filter(m => m.status === f.status);
    }

    // Sort
    const sort = this.sortOption();
    result.sort((a, b) => {
      switch (sort) {
        case 'level-asc': return a.level - b.level;
        case 'level-desc': return b.level - a.level;
        case 'cost-asc': return a.hireCost - b.hireCost;
        case 'cost-desc': return b.hireCost - a.hireCost;
        case 'rating-desc': return b.rating - a.rating;
        case 'name-asc': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

    return result;
  });

  readonly stats = computed(() => ({
    total: this.mercenaries().length,
    available: this.mercenaries().filter(m => m.status === 'available').length,
    hired: this.mercenaries().filter(m => m.status === 'hired').length,
    onMission: this.mercenaries().filter(m => m.status === 'on-mission').length,
  }));

  updateFilters(filters: Partial<FilterOptions>): void {
    this.filters.update(f => ({ ...f, ...filters }));
  }

  setSearch(query: string): void {
    this.searchQuery.set(query);
  }

  setSort(option: SortOption): void {
    this.sortOption.set(option);
  }

  hireMercenary(id: string): void {
    this.mercenaries.update(list =>
      list.map(m => m.id === id ? { ...m, status: 'hired' as const } : m)
    );
  }

  releaseMercenary(id: string): void {
    this.mercenaries.update(list =>
      list.map(m => m.id === id ? { ...m, status: 'available' as const } : m)
    );
  }

  getMercenaryById(id: string): Mercenary | undefined {
    return this.mercenaries().find(m => m.id === id);
  }

  private generateMercenaries(): Mercenary[] {
    const races: MercenaryRace[] = ['Orc', 'Goblin', 'Warlock', 'Troll', 'Undead', 'Demon', 'Dark Elf'];
    const classes: MercenaryClass[] = ['Warrior', 'Assassin', 'Mage', 'Tank', 'Healer', 'Berserker', 'Necromancer'];
    const names = [
      'Grommash', 'Zul\'jin', 'Kael\'thas', 'Arthas', 'Illidan', 'Thrall', 'Sylvanas',
      'Gul\'dan', 'Mannoroth', 'Archimonde', 'Kel\'Thuzad', 'Anub\'arak', 'Malfurion',
      'Tyrande', 'Vol\'jin', 'Cairne', 'Rexxar', 'Jaina', 'Medivh', 'Garona',
      'Durotan', 'Orgrim', 'Blackhand', 'Ner\'zhul', 'Teron', 'Cho\'gall', 'Kilrogg',
      'Zuluhed', 'Dentarg', 'Rend', 'Maim', 'Dal\'rend', 'Nekros', 'Draka'
    ];
    const specialties = [
      'Siege Warfare', 'Assassination', 'Dark Magic', 'Frontline Combat',
      'Healing Arts', 'Beast Taming', 'Necromancy', 'Stealth Operations',
      'Fire Magic', 'Frost Magic', 'Shadow Magic', 'Blood Magic'
    ];

    return names.map((name, i) => {
      const level = Math.floor(Math.random() * 99) + 1;
      const race = races[i % races.length];
      const cls = classes[i % classes.length];
      return {
        id: crypto.randomUUID(),
        name,
        race,
        class: cls,
        level,
        specialty: specialties[i % specialties.length],
        stats: {
          strength: Math.floor(Math.random() * 80) + 20,
          agility: Math.floor(Math.random() * 80) + 20,
          magic: Math.floor(Math.random() * 80) + 20,
          defense: Math.floor(Math.random() * 80) + 20,
          health: Math.floor(Math.random() * 800) + 200,
        },
        hireCost: Math.floor(level * 50 + Math.random() * 500),
        dailyUpkeep: Math.floor(level * 5 + Math.random() * 50),
        status: (['available', 'available', 'available', 'hired', 'on-mission'] as MercenaryStatus[])[Math.floor(Math.random() * 5)],
        skills: this.generateSkills(cls),
        equipment: this.generateEquipment(),
        avatar: this.getAvatar(race),
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        missionsCompleted: Math.floor(Math.random() * 100),
      };
    });
  }

  private generateSkills(cls: MercenaryClass): Skill[] {
    const skillSets: Record<MercenaryClass, Skill[]> = {
      'Warrior': [
        { id: '1', name: 'Cleave', description: 'Sweeping attack hitting multiple enemies', cooldown: 8, damage: 150 },
        { id: '2', name: 'Shield Bash', description: 'Stuns enemy for 2 seconds', cooldown: 12 },
      ],
      'Assassin': [
        { id: '1', name: 'Backstab', description: 'Critical hit from behind', cooldown: 6, damage: 200 },
        { id: '2', name: 'Vanish', description: 'Become invisible for 5 seconds', cooldown: 20 },
      ],
      'Mage': [
        { id: '1', name: 'Fireball', description: 'Launches a ball of fire', cooldown: 4, damage: 180 },
        { id: '2', name: 'Frost Nova', description: 'Freezes nearby enemies', cooldown: 15 },
      ],
      'Tank': [
        { id: '1', name: 'Taunt', description: 'Forces enemies to attack you', cooldown: 10 },
        { id: '2', name: 'Iron Skin', description: 'Reduces damage by 50%', cooldown: 25 },
      ],
      'Healer': [
        { id: '1', name: 'Heal', description: 'Restores 300 health', cooldown: 5 },
        { id: '2', name: 'Resurrection', description: 'Revives fallen ally', cooldown: 60 },
      ],
      'Berserker': [
        { id: '1', name: 'Rage', description: 'Increases damage by 100%', cooldown: 30 },
        { id: '2', name: 'Whirlwind', description: 'Spin attack hitting all nearby', cooldown: 10, damage: 120 },
      ],
      'Necromancer': [
        { id: '1', name: 'Raise Dead', description: 'Summons undead minion', cooldown: 20 },
        { id: '2', name: 'Life Drain', description: 'Steals health from enemy', cooldown: 8, damage: 100 },
      ],
    };
    return skillSets[cls] || [];
  }

  private generateEquipment(): Equipment[] {
    return [
      { id: '1', name: 'Battle Axe', slot: 'weapon', bonus: { strength: 15 } },
      { id: '2', name: 'Chain Mail', slot: 'armor', bonus: { defense: 20 } },
    ];
  }

  private getAvatar(race: MercenaryRace): string {
    const avatars: Record<MercenaryRace, string> = {
      'Orc': '👹', 'Goblin': '👺', 'Warlock': '🧙', 'Troll': '🧌',
      'Undead': '💀', 'Demon': '😈', 'Dark Elf': '🧝',
    };
    return avatars[race];
  }
}
