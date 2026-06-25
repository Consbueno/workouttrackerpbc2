-- ============================================
-- GymTracker 16W — PostgreSQL Schema
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(200) NOT NULL UNIQUE,
    password_hash   VARCHAR(300) NOT NULL,
    full_name       VARCHAR(200) NOT NULL,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS athletes (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER NOT NULL REFERENCES users(id),
    full_name           VARCHAR(200) NOT NULL,
    birth_date          DATE NOT NULL,
    sex                 VARCHAR(1) NOT NULL CHECK (sex IN ('M', 'F')),
    weight_kg           NUMERIC(5,2) NOT NULL,
    height_cm           INTEGER NOT NULL,
    is_diabetic         BOOLEAN DEFAULT FALSE,
    is_hypertensive     BOOLEAN DEFAULT FALSE,
    is_cardiac          BOOLEAN DEFAULT FALSE,
    health_notes        TEXT,
    body_restrictions   JSONB DEFAULT '[]',
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS exercises (
    id                      SERIAL PRIMARY KEY,
    user_id                 INTEGER NOT NULL REFERENCES users(id),
    name                    VARCHAR(100) NOT NULL,
    primary_muscle_group    VARCHAR(50) NOT NULL,
    secondary_muscle_group  VARCHAR(50),
    equipment               VARCHAR(50) NOT NULL,
    exercise_type           VARCHAR(20) NOT NULL CHECK (exercise_type IN ('compound','isolation','cardio','isometric')),
    notes                   VARCHAR(500),
    is_active               BOOLEAN DEFAULT TRUE,
    created_at              TIMESTAMP DEFAULT NOW(),
    updated_at              TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gyms (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER NOT NULL REFERENCES users(id),
    name                VARCHAR(100) NOT NULL,
    address             TEXT,
    phone               VARCHAR(20),
    monthly_fee         NUMERIC(8,2),
    payment_due_day     INTEGER CHECK (payment_due_day BETWEEN 1 AND 31),
    preferred_schedule  VARCHAR(50),
    notes               TEXT,
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_programs (
    id                      SERIAL PRIMARY KEY,
    user_id                 INTEGER NOT NULL REFERENCES users(id),
    athlete_id              INTEGER NOT NULL REFERENCES athletes(id),
    gym_id                  INTEGER REFERENCES gyms(id),
    name                    VARCHAR(200) NOT NULL,
    total_weeks             INTEGER NOT NULL DEFAULT 16,
    weekly_training_freq    INTEGER NOT NULL,
    weekly_cardio_freq      INTEGER NOT NULL DEFAULT 0,
    status                  VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','archived')),
    created_at              TIMESTAMP DEFAULT NOW(),
    updated_at              TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_blocks (
    id                      SERIAL PRIMARY KEY,
    program_id              INTEGER NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
    block_order             INTEGER NOT NULL,
    name                    VARCHAR(50) NOT NULL,
    start_week              INTEGER NOT NULL,
    end_week                INTEGER NOT NULL,
    color                   VARCHAR(20) NOT NULL DEFAULT 'blue',
    target_reps             VARCHAR(20) NOT NULL,
    target_intensity        VARCHAR(30) NOT NULL,
    default_rest_seconds    INTEGER NOT NULL DEFAULT 60,
    created_at              TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_splits (
    id              SERIAL PRIMARY KEY,
    program_id      INTEGER NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
    letter          VARCHAR(5) NOT NULL,
    description     VARCHAR(200) NOT NULL,
    muscle_groups   TEXT[] NOT NULL,
    split_order     INTEGER NOT NULL,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS split_exercises (
    id              SERIAL PRIMARY KEY,
    split_id        INTEGER NOT NULL REFERENCES training_splits(id) ON DELETE CASCADE,
    exercise_id     INTEGER NOT NULL REFERENCES exercises(id),
    exercise_order  INTEGER NOT NULL,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS split_exercise_block_config (
    id                  SERIAL PRIMARY KEY,
    split_exercise_id   INTEGER NOT NULL REFERENCES split_exercises(id) ON DELETE CASCADE,
    block_id            INTEGER NOT NULL REFERENCES training_blocks(id) ON DELETE CASCADE,
    sets                INTEGER NOT NULL,
    reps                VARCHAR(20) NOT NULL,
    load_kg             NUMERIC(6,2) DEFAULT 0,
    rest_seconds        INTEGER NOT NULL DEFAULT 60,
    is_included         BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMP DEFAULT NOW(),
    UNIQUE(split_exercise_id, block_id)
);

CREATE TABLE IF NOT EXISTS training_days (
    id              SERIAL PRIMARY KEY,
    program_id      INTEGER NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
    split_id        INTEGER NOT NULL REFERENCES training_splits(id),
    block_id        INTEGER NOT NULL REFERENCES training_blocks(id),
    week_number     INTEGER NOT NULL,
    day_number      INTEGER NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','missed')),
    started_at      TIMESTAMP,
    completed_at    TIMESTAMP,
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_day_exercises (
    id                      SERIAL PRIMARY KEY,
    training_day_id         INTEGER NOT NULL REFERENCES training_days(id) ON DELETE CASCADE,
    split_exercise_id       INTEGER NOT NULL REFERENCES split_exercises(id),
    exercise_id             INTEGER NOT NULL REFERENCES exercises(id),
    planned_sets            INTEGER NOT NULL,
    planned_reps            VARCHAR(20) NOT NULL,
    planned_load_kg         NUMERIC(6,2) DEFAULT 0,
    planned_rest_seconds    INTEGER NOT NULL,
    actual_load_kg          NUMERIC(6,2),
    actual_reps             JSONB,
    is_completed            BOOLEAN DEFAULT FALSE,
    exercise_notes          TEXT,
    completed_at            TIMESTAMP,
    created_at              TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS measurements (
    id                      SERIAL PRIMARY KEY,
    user_id                 INTEGER NOT NULL REFERENCES users(id),
    athlete_id              INTEGER NOT NULL REFERENCES athletes(id),
    measurement_date        DATE NOT NULL,
    weight_kg               NUMERIC(5,2),
    body_fat_pct            NUMERIC(4,1),
    neck_cm                 NUMERIC(4,1),
    shoulders_cm            NUMERIC(4,1),
    chest_cm                NUMERIC(4,1),
    right_arm_relaxed_cm    NUMERIC(4,1),
    right_arm_flexed_cm     NUMERIC(4,1),
    left_arm_relaxed_cm     NUMERIC(4,1),
    left_arm_flexed_cm      NUMERIC(4,1),
    right_forearm_cm        NUMERIC(4,1),
    left_forearm_cm         NUMERIC(4,1),
    waist_cm                NUMERIC(4,1),
    hip_cm                  NUMERIC(4,1),
    right_thigh_cm          NUMERIC(4,1),
    left_thigh_cm           NUMERIC(4,1),
    right_calf_cm           NUMERIC(4,1),
    left_calf_cm            NUMERIC(4,1),
    fasting_glucose         INTEGER,
    systolic_bp             INTEGER,
    diastolic_bp            INTEGER,
    resting_hr              INTEGER,
    notes                   TEXT,
    created_at              TIMESTAMP DEFAULT NOW(),
    UNIQUE(athlete_id, measurement_date)
);

CREATE TABLE IF NOT EXISTS ai_analyses (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id),
    program_id      INTEGER NOT NULL REFERENCES training_programs(id),
    analysis_text   TEXT NOT NULL,
    input_payload   JSONB NOT NULL,
    model_used      VARCHAR(50) NOT NULL DEFAULT 'claude-sonnet-4-6',
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exercises_user ON exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_exercises_muscle ON exercises(primary_muscle_group);
CREATE INDEX IF NOT EXISTS idx_training_days_program ON training_days(program_id);
CREATE INDEX IF NOT EXISTS idx_training_days_status ON training_days(status);
CREATE INDEX IF NOT EXISTS idx_training_day_exercises_day ON training_day_exercises(training_day_id);
CREATE INDEX IF NOT EXISTS idx_measurements_athlete_date ON measurements(athlete_id, measurement_date);
CREATE INDEX IF NOT EXISTS idx_programs_user_status ON training_programs(user_id, status);
