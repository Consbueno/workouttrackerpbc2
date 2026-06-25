export const MUSCLE_GROUPS = [
  'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Antebraço',
  'Quadríceps', 'Posterior', 'Glúteos', 'Panturrilha',
  'Abdômen', 'Trapézio', 'Lombar', 'Core (Geral)',
] as const

export const EQUIPMENT_OPTIONS = [
  'Barra', 'Halter', 'Máquina', 'Polia/Cabo', 'Peso Corporal',
  'Elástico', 'Kettlebell', 'Smith', 'Outro',
] as const

export const EXERCISE_TYPES = [
  { value: 'compound', label: 'Composto' },
  { value: 'isolation', label: 'Isolado' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'isometric', label: 'Isométrico' },
] as const

export const BLOCK_COLORS = [
  { value: 'blue', label: 'Azul', bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' },
  { value: 'yellow', label: 'Amarelo', bg: 'bg-yellow-500', text: 'text-yellow-500', border: 'border-yellow-500' },
  { value: 'red', label: 'Vermelho', bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500' },
  { value: 'gray', label: 'Cinza', bg: 'bg-gray-500', text: 'text-gray-500', border: 'border-gray-500' },
  { value: 'green', label: 'Verde', bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500' },
  { value: 'purple', label: 'Roxo', bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500' },
] as const

export const BODY_REGIONS = [
  'Cabeça/Pescoço',
  'Ombro Direito',
  'Ombro Esquerdo',
  'Braço/Cotovelo Direito',
  'Braço/Cotovelo Esquerdo',
  'Punho/Mão Direita',
  'Punho/Mão Esquerda',
  'Peito',
  'Costas Superiores',
  'Coluna (Lombar)',
  'Quadril',
  'Joelho Direito',
  'Joelho Esquerdo',
  'Perna Direita',
  'Perna Esquerda',
  'Tornozelo/Pé Direito',
  'Tornozelo/Pé Esquerdo',
] as const

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  completed: 'Concluído',
  missed: 'Falta',
  active: 'Ativo',
  archived: 'Arquivado',
}
