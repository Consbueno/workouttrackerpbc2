-- Seed: exercícios padrão (inseridos apenas se o usuário de sistema existir)
-- Este seed só roda uma vez (captura de IntegrityError no init_db)

-- Nota: exercícios do seed são vinculados ao primeiro usuário criado no sistema.
-- Em produção, cada usuário cria seus próprios exercícios ou importa estes como base.
-- O seed é aplicado apenas na primeira execução.

DO $$
DECLARE
    v_user_id INTEGER;
BEGIN
    SELECT id INTO v_user_id FROM users ORDER BY id LIMIT 1;
    IF v_user_id IS NULL THEN
        RETURN;
    END IF;

    INSERT INTO exercises (user_id, name, primary_muscle_group, secondary_muscle_group, equipment, exercise_type) VALUES
    -- Peito
    (v_user_id, 'Supino Reto com Barra', 'Peito', 'Tríceps', 'Barra', 'compound'),
    (v_user_id, 'Supino Inclinado com Halteres', 'Peito', 'Ombros', 'Halter', 'compound'),
    (v_user_id, 'Crucifixo com Halteres', 'Peito', NULL, 'Halter', 'isolation'),
    (v_user_id, 'Crossover na Polia', 'Peito', NULL, 'Polia/Cabo', 'isolation'),
    (v_user_id, 'Flexão de Braço', 'Peito', 'Tríceps', 'Peso Corporal', 'compound'),
    -- Costas
    (v_user_id, 'Puxada Frontal', 'Costas', 'Bíceps', 'Máquina', 'compound'),
    (v_user_id, 'Remada Curvada com Barra', 'Costas', 'Bíceps', 'Barra', 'compound'),
    (v_user_id, 'Remada Unilateral com Halter', 'Costas', 'Bíceps', 'Halter', 'compound'),
    (v_user_id, 'Puxada na Polia Alta', 'Costas', 'Bíceps', 'Polia/Cabo', 'compound'),
    (v_user_id, 'Levantamento Terra', 'Costas', 'Posterior', 'Barra', 'compound'),
    -- Ombros
    (v_user_id, 'Desenvolvimento com Barra', 'Ombros', 'Tríceps', 'Barra', 'compound'),
    (v_user_id, 'Desenvolvimento com Halteres', 'Ombros', 'Tríceps', 'Halter', 'compound'),
    (v_user_id, 'Elevação Lateral com Halteres', 'Ombros', NULL, 'Halter', 'isolation'),
    (v_user_id, 'Elevação Frontal com Halteres', 'Ombros', NULL, 'Halter', 'isolation'),
    (v_user_id, 'Remada Alta com Barra', 'Ombros', 'Trapézio', 'Barra', 'compound'),
    -- Bíceps
    (v_user_id, 'Rosca Direta com Barra', 'Bíceps', NULL, 'Barra', 'isolation'),
    (v_user_id, 'Rosca Alternada com Halteres', 'Bíceps', NULL, 'Halter', 'isolation'),
    (v_user_id, 'Rosca Martelo', 'Bíceps', 'Antebraço', 'Halter', 'isolation'),
    (v_user_id, 'Rosca na Polia', 'Bíceps', NULL, 'Polia/Cabo', 'isolation'),
    -- Tríceps
    (v_user_id, 'Tríceps Pulley', 'Tríceps', NULL, 'Polia/Cabo', 'isolation'),
    (v_user_id, 'Tríceps Testa com Barra', 'Tríceps', NULL, 'Barra', 'isolation'),
    (v_user_id, 'Tríceps Coice com Halter', 'Tríceps', NULL, 'Halter', 'isolation'),
    (v_user_id, 'Mergulho no Banco (Tríceps)', 'Tríceps', NULL, 'Peso Corporal', 'compound'),
    -- Quadríceps
    (v_user_id, 'Agachamento com Barra', 'Quadríceps', 'Glúteos', 'Barra', 'compound'),
    (v_user_id, 'Leg Press 45°', 'Quadríceps', 'Glúteos', 'Máquina', 'compound'),
    (v_user_id, 'Extensora', 'Quadríceps', NULL, 'Máquina', 'isolation'),
    (v_user_id, 'Agachamento Goblet', 'Quadríceps', 'Glúteos', 'Kettlebell', 'compound'),
    (v_user_id, 'Hack Squat', 'Quadríceps', 'Glúteos', 'Máquina', 'compound'),
    -- Posterior / Glúteos
    (v_user_id, 'Mesa Flexora', 'Posterior', NULL, 'Máquina', 'isolation'),
    (v_user_id, 'Stiff com Barra', 'Posterior', 'Glúteos', 'Barra', 'compound'),
    (v_user_id, 'Hip Thrust com Barra', 'Glúteos', 'Posterior', 'Barra', 'compound'),
    (v_user_id, 'Cadeira Abdutora', 'Glúteos', NULL, 'Máquina', 'isolation'),
    -- Panturrilha
    (v_user_id, 'Panturrilha em Pé na Máquina', 'Panturrilha', NULL, 'Máquina', 'isolation'),
    (v_user_id, 'Panturrilha Sentado', 'Panturrilha', NULL, 'Máquina', 'isolation'),
    -- Abdômen
    (v_user_id, 'Abdominal Crunch', 'Abdômen', NULL, 'Peso Corporal', 'isolation'),
    (v_user_id, 'Prancha', 'Abdômen', 'Core (Geral)', 'Peso Corporal', 'isometric'),
    (v_user_id, 'Abdominal na Polia', 'Abdômen', NULL, 'Polia/Cabo', 'isolation'),
    -- Trapézio / Lombar
    (v_user_id, 'Encolhimento com Barra', 'Trapézio', NULL, 'Barra', 'isolation'),
    (v_user_id, 'Hiperextensão Lombar', 'Lombar', NULL, 'Máquina', 'isolation')
    ON CONFLICT DO NOTHING;
END $$;
