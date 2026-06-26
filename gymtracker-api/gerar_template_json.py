#!/usr/bin/env python3
"""Gera template-vtaper-16w.json para importação no GymTracker."""
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

SPLITS_META = [
    (1, "A", "Peito + Triceps",           ["Peito", "Triceps"]),
    (2, "B", "Costas Largura + Biceps",   ["Costas", "Biceps"]),
    (3, "C", "Ombros",                     ["Ombros", "Trapezio"]),
    (4, "D", "Pernas",                     ["Quadriceps", "Isquiotibiais", "Gluteos", "Panturrilha"]),
    (5, "E", "Costas Espessura + Core",   ["Costas", "Core"]),
]

BLOCKS = [
    (1, "Resistencia", 1,  4,  "blue",   "15-25", "50-65% 1RM", 45),
    (2, "Hipertrofia", 5,  10, "yellow", "8-12",  "65-80% 1RM", 75),
    (3, "Forca",       11, 15, "red",    "3-6",   "80-92% 1RM", 180),
    (4, "Deload",      16, 16, "gray",   "12-15", "50-60% 1RM", 60),
]

SPLITS_DATA = {
    1: [
        {"name": "Supino c/ Halteres (plano)",                       "pmg": "Peito",     "equip": "dumbbell",   "type": "compound",  "cfg": [(1,3,"20",45),(2,4,"10",75),(3,5,"4",180),(4,2,"15",60)]},
        {"name": "Supino Inclinado c/ Halteres (30 graus)",          "pmg": "Peito",     "equip": "dumbbell",   "type": "compound",  "cfg": [(1,3,"18",45),(2,4,"10",75),(3,4,"5",180),(4,2,"12",60)]},
        {"name": "Crossover na Polia (declinado)",                   "pmg": "Peito",     "equip": "cable",      "type": "isolation", "cfg": [(1,3,"20",30),(2,3,"12",60),(3,3,"8",90),(4,2,"15",45)]},
        {"name": "Peck Deck / Fly Maquina",                          "pmg": "Peito",     "equip": "machine",    "type": "isolation", "cfg": [(1,3,"20",30),(2,3,"12",60),(4,2,"15",45)]},
        {"name": "Triceps Corda (polia alta)",                       "pmg": "Triceps",   "equip": "cable",      "type": "isolation", "cfg": [(1,3,"20",30),(2,4,"12",60),(3,4,"6",90),(4,2,"15",45)]},
        {"name": "Triceps Testa c/ Halteres",                        "pmg": "Triceps",   "equip": "dumbbell",   "type": "isolation", "cfg": [(1,3,"18",30),(2,3,"10",60),(3,4,"5",120),(4,2,"12",45)]},
        {"name": "Triceps Coice c/ Halter",                          "pmg": "Triceps",   "equip": "dumbbell",   "type": "isolation", "cfg": [(1,3,"15",30),(2,3,"12",60)]},
    ],
    2: [
        {"name": "Puxada Frontal (Lat Pulldown)",                    "pmg": "Costas",    "equip": "cable",      "type": "compound",  "cfg": [(1,3,"20",45),(2,4,"10",75),(3,5,"4",180),(4,2,"15",60)]},
        {"name": "Pullover c/ Halter (deitado)",                     "pmg": "Costas",    "equip": "dumbbell",   "type": "compound",  "cfg": [(1,3,"18",45),(2,4,"10",75),(3,3,"6",120),(4,2,"12",60)]},
        {"name": "Remada na Maquina (sentado)",                      "pmg": "Costas",    "equip": "machine",    "type": "compound",  "cfg": [(1,3,"20",45),(2,4,"10",75),(4,2,"15",60)]},
        {"name": "Remada Unilateral c/ Halter",                      "pmg": "Costas",    "equip": "dumbbell",   "type": "compound",  "cfg": [(1,3,"18",45),(2,4,"10",75),(3,4,"5",150),(4,2,"12",60)]},
        {"name": "Puxada Neutra Fechada",                            "pmg": "Costas",    "equip": "cable",      "type": "compound",  "cfg": [(1,3,"18",30),(2,3,"12",60)]},
        {"name": "Rosca Direta c/ Halteres",                         "pmg": "Biceps",    "equip": "dumbbell",   "type": "isolation", "cfg": [(1,3,"20",30),(2,3,"12",60),(3,3,"6",90),(4,2,"15",45)]},
        {"name": "Rosca Martelo",                                    "pmg": "Biceps",    "equip": "dumbbell",   "type": "isolation", "cfg": [(1,3,"18",30),(2,3,"10",60),(3,3,"5",90),(4,2,"12",45)]},
        {"name": "Rosca Concentrada",                                "pmg": "Biceps",    "equip": "dumbbell",   "type": "isolation", "cfg": [(1,3,"15",30),(2,3,"12",60)]},
    ],
    3: [
        {"name": "Desenvolvimento c/ Halteres (sentado c/ encosto)", "pmg": "Ombros",    "equip": "dumbbell",   "type": "compound",  "cfg": [(1,3,"18",45),(2,4,"10",75),(3,5,"4",180),(4,2,"15",60)]},
        {"name": "Elevacao Lateral c/ Halteres",                    "pmg": "Ombros",    "equip": "dumbbell",   "type": "isolation", "cfg": [(1,3,"20",30),(2,4,"12",60),(3,3,"8",90),(4,2,"15",45)]},
        {"name": "Elevacao Lateral na Polia (unilateral)",           "pmg": "Ombros",    "equip": "cable",      "type": "isolation", "cfg": [(1,3,"20",30),(2,4,"12",60),(4,2,"15",45)]},
        {"name": "Desenvolvimento na Maquina",                       "pmg": "Ombros",    "equip": "machine",    "type": "compound",  "cfg": [(1,3,"18",45),(2,3,"10",75),(3,4,"5",150)]},
        {"name": "Elevacao Frontal c/ Halteres",                    "pmg": "Ombros",    "equip": "dumbbell",   "type": "isolation", "cfg": [(1,3,"18",30),(2,3,"12",60)]},
        {"name": "Face Pull na Polia",                               "pmg": "Ombros",    "equip": "cable",      "type": "isolation", "cfg": [(1,3,"20",30),(2,3,"15",45),(3,3,"12",60),(4,2,"15",45)]},
        {"name": "Encolhimento c/ Halteres",                         "pmg": "Trapezio",  "equip": "dumbbell",   "type": "isolation", "cfg": [(1,3,"20",30),(2,3,"12",60),(3,3,"6",90)]},
    ],
    4: [
        {"name": "Leg Press 45 graus",                               "pmg": "Quadriceps","equip": "machine",    "type": "compound",  "cfg": [(1,3,"20",45),(2,4,"10",75),(3,5,"4",180),(4,2,"15",60)]},
        {"name": "Hack Squat na Maquina",                            "pmg": "Quadriceps","equip": "machine",    "type": "compound",  "cfg": [(1,3,"18",45),(2,4,"10",75),(3,4,"5",180),(4,2,"12",60)]},
        {"name": "Leg Press Unilateral",                             "pmg": "Quadriceps","equip": "machine",    "type": "isolation", "cfg": [(1,3,"15",45),(2,3,"10",75)]},
        {"name": "Cadeira Extensora",                                "pmg": "Quadriceps","equip": "machine",    "type": "isolation", "cfg": [(1,3,"20",30),(2,4,"12",60),(3,3,"8",90),(4,2,"15",45)]},
        {"name": "Mesa Flexora (Lying Curl)",                        "pmg": "Isquiotibiais","equip": "machine", "type": "isolation", "cfg": [(1,3,"20",30),(2,4,"12",60),(3,3,"8",90),(4,2,"15",45)]},
        {"name": "Hip Thrust c/ Barra",                              "pmg": "Gluteos",   "equip": "barbell",    "type": "compound",  "cfg": [(1,3,"18",45),(2,4,"10",75),(3,4,"5",150),(4,2,"12",60)]},
        {"name": "Panturrilha Sentado (maquina)",                   "pmg": "Panturrilha","equip": "machine",   "type": "isolation", "cfg": [(1,3,"20",30),(2,4,"15",45),(3,3,"10",60),(4,2,"15",30)]},
        {"name": "Panturrilha em Pe (maquina)",                     "pmg": "Panturrilha","equip": "machine",   "type": "isolation", "cfg": [(1,3,"20",30),(2,3,"15",45)]},
    ],
    5: [
        {"name": "Remada c/ Halteres (peito apoiado no banco inclinado)", "pmg": "Costas","equip": "dumbbell", "type": "compound",  "cfg": [(1,3,"18",45),(2,4,"10",75),(3,5,"5",180),(4,2,"12",60)]},
        {"name": "Remada Baixa na Polia (sentado)",                  "pmg": "Costas",    "equip": "cable",      "type": "compound",  "cfg": [(1,3,"20",45),(2,4,"10",75),(3,4,"5",150),(4,2,"15",60)]},
        {"name": "Remada Maquina (peito apoiado)",                   "pmg": "Costas",    "equip": "machine",    "type": "compound",  "cfg": [(1,3,"18",45),(2,4,"12",75),(4,2,"15",60)]},
        {"name": "Face Pull na Polia",                               "pmg": "Ombros",    "equip": "cable",      "type": "isolation", "cfg": [(1,3,"20",30),(2,3,"15",45),(3,3,"12",60),(4,2,"15",45)]},
        {"name": "Prancha Frontal",                                  "pmg": "Core",      "equip": "bodyweight", "type": "isometric", "cfg": [(1,3,"30s",30),(2,4,"40s",30),(3,3,"45s",45),(4,2,"30s",30)]},
        {"name": "Abdominal Infra na Polia (Kneeling Crunch)",      "pmg": "Core",      "equip": "cable",      "type": "isolation", "cfg": [(1,3,"20",30),(2,4,"15",30),(3,3,"12",30),(4,2,"15",30)]},
        {"name": "Elevacao de Pernas (paralela ou deitado)",         "pmg": "Core",      "equip": "bodyweight", "type": "isolation", "cfg": [(1,3,"15",30),(2,4,"12",30),(3,3,"10",45),(4,2,"12",30)]},
    ],
}

SCHEDULE = [
    (1, 4, ["A","B","C","D"]),
    (2, 5, ["A","B","C","D","E"]),
    (3, 4, ["A","B","C","D"]),
    (4, 2, ["A","B"]),
]

template = {
    "nome": "Programa 16 Semanas - V-Taper",
    "total_semanas": 16,
    "weekly_cardio_freq": 2,
    "blocos": [],
    "splits": [],
}

for b_order, b_name, sw, ew, color, tr, ti, rest in BLOCKS:
    sched = next(s for s in SCHEDULE if s[0] == b_order)
    template["blocos"].append({
        "block_order": b_order,
        "nome": b_name,
        "semana_inicio": sw,
        "semana_fim": ew,
        "cor": color,
        "target_reps": tr,
        "target_intensity": ti,
        "rest_seconds": rest,
        "weekly_freq": sched[1],
        "split_letters": sched[2],
    })

for split_order, letter, desc, mgs in SPLITS_META:
    exlist = SPLITS_DATA[split_order]
    exercicios = []
    for ex_order, ex in enumerate(exlist, 1):
        configs = {}
        for blk_order, sets, reps, rest in ex["cfg"]:
            configs[str(blk_order)] = {"sets": sets, "reps": reps, "load_kg": 0, "rest_seconds": rest}
        exercicios.append({
            "nome": ex["name"],
            "primary_muscle_group": ex["pmg"],
            "equipment": ex["equip"],
            "exercise_type": ex["type"],
            "exercise_order": ex_order,
            "configs": configs,
        })
    template["splits"].append({
        "letter": letter,
        "split_order": split_order,
        "descricao": desc,
        "muscle_groups": mgs,
        "exercicios": exercicios,
    })

print(json.dumps(template, ensure_ascii=False, indent=2))
