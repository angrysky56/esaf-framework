#!/usr/bin/env python3
"""
Fix TypeScript import statements by removing .js extensions
"""

import os
import re
from pathlib import Path

def fix_imports_in_file(file_path: Path) -> bool:
    """Fix import statements in a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Pattern to match import statements with .js extensions
        patterns = [
            # from './something.js' or from '@/something.js'
            (r"from\s+['\"]([^'\"]*?)\.js['\"]", r"from '\1'"),
            # import something from './something.js'
            (r"import\s+([^'\"]*?)\s+from\s+['\"]([^'\"]*?)\.js['\"]", r"import \1 from '\2'"),
        ]
        
        for pattern, replacement in patterns:
            content = re.sub(pattern, replacement, content)
        
        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed imports in: {file_path}")
            return True
        
        return False
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main function to fix all imports"""
    project_root = Path("/home/ty/Repositories/ai_workspace/esaf-framework/src")
    
    if not project_root.exists():
        print(f"Project root not found: {project_root}")
        return
    
    # Find all TypeScript files
    ts_files = []
    for ext in ['*.ts', '*.tsx']:
        ts_files.extend(project_root.rglob(ext))
    
    print(f"Found {len(ts_files)} TypeScript files")
    
    fixed_count = 0
    for file_path in ts_files:
        if fix_imports_in_file(file_path):
            fixed_count += 1
    
    print(f"Fixed imports in {fixed_count} files")

if __name__ == "__main__":
    main()
