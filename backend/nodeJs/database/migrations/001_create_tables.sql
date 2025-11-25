-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  height DECIMAL(5,2) NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  age_range VARCHAR(10) NOT NULL,
  allergies JSON,
  diseases JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(uuid),
  UNIQUE KEY unique_user_profile (user_id),
  INDEX idx_user_id (user_id)
);

-- OCR Scans Table
CREATE TABLE IF NOT EXISTS ocr_scans (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  image_url VARCHAR(500),
  extracted_text TEXT,
  parsed_data JSON,
  confidence DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(uuid),
  INDEX idx_user_created (user_id, created_at)
);

-- RAG Analyses Table
CREATE TABLE IF NOT EXISTS rag_analyses (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  ocr_scan_id VARCHAR(36),
  request_data JSON,
  rag_response JSON,
  suitability_score INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(uuid),
  FOREIGN KEY (ocr_scan_id) REFERENCES ocr_scans(id),
  INDEX idx_user_created (user_id, created_at),
  INDEX idx_suitability (suitability_score)
);
