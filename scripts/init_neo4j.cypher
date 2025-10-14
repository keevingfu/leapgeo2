// GEO Platform Knowledge Graph Initialization
// Neo4j Cypher Script
// Version: 1.0

// ============================================
// 1. CLEAN UP EXISTING DATA (Optional)
// ============================================
MATCH (n) DETACH DELETE n;

// ============================================
// 2. CREATE CONSTRAINTS
// ============================================
CREATE CONSTRAINT brand_id IF NOT EXISTS FOR (b:Brand) REQUIRE b.id IS UNIQUE;
CREATE CONSTRAINT product_id IF NOT EXISTS FOR (p:Product) REQUIRE p.id IS UNIQUE;
CREATE CONSTRAINT feature_id IF NOT EXISTS FOR (f:Feature) REQUIRE f.id IS UNIQUE;
CREATE CONSTRAINT problem_id IF NOT EXISTS FOR (pr:Problem) REQUIRE pr.id IS UNIQUE;
CREATE CONSTRAINT scenario_id IF NOT EXISTS FOR (s:Scenario) REQUIRE s.id IS UNIQUE;
CREATE CONSTRAINT usergroup_id IF NOT EXISTS FOR (u:UserGroup) REQUIRE u.id IS UNIQUE;

// ============================================
// 3. SWEETNIGHT PROJECT KNOWLEDGE GRAPH
// ============================================

// Brand
CREATE (sweetnight:Brand {id: 'sweetnight', label: 'SweetNight', project_id: 'sweetnight'});

// Products
CREATE (coolnest:Product {id: 'coolnest', label: 'CoolNest', project_id: 'sweetnight'});
CREATE (l6:Product {id: 'l6', label: 'L6 Mattress', project_id: 'sweetnight'});

// Features
CREATE (cooling:Feature {id: 'cooling', label: 'Cooling Technology', project_id: 'sweetnight'});
CREATE (firmness:Feature {id: 'firmness', label: 'Adjustable Firmness', project_id: 'sweetnight'});
CREATE (breathable:Feature {id: 'breathable', label: 'Breathability', project_id: 'sweetnight'});

// Problems
CREATE (back_pain:Problem {id: 'back-pain', label: 'Back Pain', project_id: 'sweetnight'});
CREATE (hot_sleep:Problem {id: 'hot-sleep', label: 'Hot Sleep / Heat Issue', project_id: 'sweetnight'});

// Scenarios
CREATE (summer:Scenario {id: 'summer', label: 'Summer Sleep', project_id: 'sweetnight'});

// User Groups
CREATE (athletes:UserGroup {id: 'athletes', label: 'Athletes', project_id: 'sweetnight'});
CREATE (office_workers:UserGroup {id: 'office-workers', label: 'Office Workers', project_id: 'sweetnight'});

// Relationships
MATCH (b:Brand {id: 'sweetnight'}), (p:Product {id: 'coolnest'})
CREATE (b)-[:HAS_PRODUCT]->(p);

MATCH (b:Brand {id: 'sweetnight'}), (p:Product {id: 'l6'})
CREATE (b)-[:HAS_PRODUCT]->(p);

MATCH (p:Product {id: 'coolnest'}), (f:Feature {id: 'cooling'})
CREATE (p)-[:HAS_FEATURE]->(f);

MATCH (p:Product {id: 'coolnest'}), (f:Feature {id: 'breathable'})
CREATE (p)-[:HAS_FEATURE]->(f);

MATCH (p:Product {id: 'l6'}), (f:Feature {id: 'firmness'})
CREATE (p)-[:HAS_FEATURE]->(f);

MATCH (f:Feature {id: 'cooling'}), (pr:Problem {id: 'hot-sleep'})
CREATE (f)-[:SOLVES]->(pr);

MATCH (f:Feature {id: 'firmness'}), (pr:Problem {id: 'back-pain'})
CREATE (f)-[:SOLVES]->(pr);

MATCH (f:Feature {id: 'cooling'}), (s:Scenario {id: 'summer'})
CREATE (f)-[:APPLIES_TO]->(s);

MATCH (u:UserGroup {id: 'athletes'}), (f:Feature {id: 'cooling'})
CREATE (u)-[:NEEDS]->(f);

MATCH (u:UserGroup {id: 'office-workers'}), (pr:Problem {id: 'back-pain'})
CREATE (u)-[:HAS_PROBLEM]->(pr);

// ============================================
// 4. EUFY PROJECT KNOWLEDGE GRAPH
// ============================================

// Brand
CREATE (eufy:Brand {id: 'eufy', label: 'Eufy', project_id: 'eufy'});

// Products
CREATE (x10_pro:Product {id: 'x10-pro', label: 'X10 Pro Omni', project_id: 'eufy'});
CREATE (x9_pro:Product {id: 'x9-pro', label: 'X9 Pro', project_id: 'eufy'});
CREATE (robovac:Product {id: 'robovac', label: 'RoboVac Series', project_id: 'eufy'});

// Features
CREATE (self_empty:Feature {id: 'self-empty', label: 'Self-Emptying', project_id: 'eufy'});
CREATE (mapping:Feature {id: 'mapping', label: 'Smart Mapping', project_id: 'eufy'});
CREATE (suction:Feature {id: 'suction', label: 'Strong Suction', project_id: 'eufy'});
CREATE (mopping:Feature {id: 'mopping', label: 'Mopping Function', project_id: 'eufy'});

// Problems
CREATE (pet_hair:Problem {id: 'pet-hair', label: 'Pet Hair Removal', project_id: 'eufy'});
CREATE (carpet_clean:Problem {id: 'carpet-clean', label: 'Deep Carpet Cleaning', project_id: 'eufy'});
CREATE (noise:Problem {id: 'noise', label: 'Noise Level', project_id: 'eufy'});

// Scenarios
CREATE (multi_floor:Scenario {id: 'multi-floor', label: 'Multi-Floor Homes', project_id: 'eufy'});

// User Groups
CREATE (pet_owners:UserGroup {id: 'pet-owners', label: 'Pet Owners', project_id: 'eufy'});
CREATE (busy_professionals:UserGroup {id: 'busy-professionals', label: 'Busy Professionals', project_id: 'eufy'});

// Relationships
MATCH (b:Brand {id: 'eufy'}), (p:Product {id: 'x10-pro'})
CREATE (b)-[:HAS_PRODUCT]->(p);

MATCH (b:Brand {id: 'eufy'}), (p:Product {id: 'x9-pro'})
CREATE (b)-[:HAS_PRODUCT]->(p);

MATCH (b:Brand {id: 'eufy'}), (p:Product {id: 'robovac'})
CREATE (b)-[:HAS_PRODUCT]->(p);

MATCH (p:Product {id: 'x10-pro'}), (f:Feature {id: 'self-empty'})
CREATE (p)-[:HAS_FEATURE]->(f);

MATCH (p:Product {id: 'x10-pro'}), (f:Feature {id: 'mapping'})
CREATE (p)-[:HAS_FEATURE]->(f);

MATCH (p:Product {id: 'x10-pro'}), (f:Feature {id: 'mopping'})
CREATE (p)-[:HAS_FEATURE]->(f);

MATCH (p:Product {id: 'x9-pro'}), (f:Feature {id: 'suction'})
CREATE (p)-[:HAS_FEATURE]->(f);

MATCH (f:Feature {id: 'suction'}), (pr:Problem {id: 'pet-hair'})
CREATE (f)-[:SOLVES]->(pr);

MATCH (f:Feature {id: 'suction'}), (pr:Problem {id: 'carpet-clean'})
CREATE (f)-[:SOLVES]->(pr);

MATCH (f:Feature {id: 'self-empty'}), (u:UserGroup {id: 'busy-professionals'})
CREATE (f)-[:BENEFITS]->(u);

MATCH (f:Feature {id: 'mapping'}), (s:Scenario {id: 'multi-floor'})
CREATE (f)-[:APPLIES_TO]->(s);

MATCH (u:UserGroup {id: 'pet-owners'}), (pr:Problem {id: 'pet-hair'})
CREATE (u)-[:HAS_PROBLEM]->(pr);

// ============================================
// 5. HISENSE PROJECT KNOWLEDGE GRAPH
// ============================================

// Brand
CREATE (hisense:Brand {id: 'hisense', label: 'Hisense', project_id: 'hisense'});

// Products
CREATE (u8k:Product {id: 'u8k', label: 'U8K', project_id: 'hisense'});
CREATE (qn90c:Product {id: 'qn90c', label: 'QN90C', project_id: 'hisense'});

// Relationships
MATCH (b:Brand {id: 'hisense'}), (p:Product {id: 'u8k'})
CREATE (b)-[:HAS_PRODUCT]->(p);

MATCH (b:Brand {id: 'hisense'}), (p:Product {id: 'qn90c'})
CREATE (b)-[:HAS_PRODUCT]->(p);

// ============================================
// 6. VERIFICATION QUERIES
// ============================================

// Count nodes by type
MATCH (n:Brand) RETURN 'Brand' as type, count(n) as count
UNION
MATCH (n:Product) RETURN 'Product' as type, count(n) as count
UNION
MATCH (n:Feature) RETURN 'Feature' as type, count(n) as count
UNION
MATCH (n:Problem) RETURN 'Problem' as type, count(n) as count
UNION
MATCH (n:Scenario) RETURN 'Scenario' as type, count(n) as count
UNION
MATCH (n:UserGroup) RETURN 'UserGroup' as type, count(n) as count
ORDER BY type;
