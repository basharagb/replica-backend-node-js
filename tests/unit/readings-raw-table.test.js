/**
 * Unit Test: Verify API uses readings_raw table
 * Tests that all repository classes correctly reference readings_raw instead of readings
 */

const fs = require('fs');
const path = require('path');

describe('readings_raw Table Usage', () => {
  
  const filesToCheck = [
    'src/infrastructure/repositories/ReadingRepository.js',
    'src/infrastructure/repositories/AlertRepository.js', 
    'src/application/services/ReadingService.js',
    'src/application/services/SiloService.js'
  ];

  test.each(filesToCheck)('should use readings_raw table in %s', (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check that there are no references to old 'readings' table (without _raw)
    const oldTableMatches = content.match(/FROM readings[^_]/g);
    expect(oldTableMatches).toBeNull();
    
    // Check that there are references to 'readings_raw' table
    const newTableMatches = content.match(/FROM readings_raw/g);
    expect(newTableMatches).not.toBeNull();
    expect(newTableMatches.length).toBeGreaterThan(0);
  });

  test('should have updated all SQL queries correctly', () => {
    let totalReadingsRawReferences = 0;
    let totalOldReadingsReferences = 0;
    
    filesToCheck.forEach(filePath => {
      const content = fs.readFileSync(filePath, 'utf8');
      
      const oldMatches = content.match(/FROM readings[^_]/g);
      const newMatches = content.match(/FROM readings_raw/g);
      
      if (oldMatches) totalOldReadingsReferences += oldMatches.length;
      if (newMatches) totalReadingsRawReferences += newMatches.length;
    });
    
    expect(totalOldReadingsReferences).toBe(0);
    expect(totalReadingsRawReferences).toBeGreaterThan(30); // Should have 32+ references
  });

  test('should maintain consistent SQL query structure', () => {
    const readingRepoPath = 'src/infrastructure/repositories/ReadingRepository.js';
    const content = fs.readFileSync(readingRepoPath, 'utf8');
    
    // Check for proper JOIN syntax with readings_raw
    const joinPatterns = [
      /FROM readings_raw r\s+INNER JOIN sensors s/g,
      /FROM readings_raw r1\s+INNER JOIN/g,
      /FROM readings_raw r2\s+INNER JOIN/g
    ];
    
    joinPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      expect(matches).not.toBeNull();
    });
  });
});
