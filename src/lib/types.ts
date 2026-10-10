export type Standing = {
  id: number;
  name: string;
  owner: string;
  total_points: number | string;
};

export type TeamPlayerPoints = {
  team_id: number;
  player_id: number;
  name: string;
  total_points: number | string;
  games: number;
  is_current: boolean;
};

export type Transaction = {
  id: number;
  created_at: string;
  kind: 'free_agent' | 'trade';
  effective_date: string;
  description: string;
};

export type FantasyTeam = {
  id: number;
  name: string;
  owner: string;
};

export type BoxScore = {
  game_date: string;
};