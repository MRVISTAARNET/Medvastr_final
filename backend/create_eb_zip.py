import zipfile
import os
import shutil

zip_name = '../medvastr-prod-final.zip'
if os.path.exists(zip_name):
    os.remove(zip_name)

# Files to include at root
files_to_copy = {
    'target/backend-0.0.1-SNAPSHOT.jar': 'application.jar',
    'Procfile': 'Procfile'
}

# Directories to include at root
dirs_to_copy = {
    '.ebextensions': '.ebextensions',
    '.platform': '.platform'
}

with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
    # Add files
    for src, arc in files_to_copy.items():
        if os.path.exists(src):
            zipf.write(src, arc)
            print(f"Added file: {src} as {arc}")
        else:
            print(f"FAILED to find file: {src}")

    # Add directories
    for src_dir, arc_dir in dirs_to_copy.items():
        if os.path.exists(src_dir):
            for root, dirs, files in os.walk(src_dir):
                for file in files:
                    filepath = os.path.join(root, file)
                    # Create arcname relative to the parent of src_dir
                    rel_path = os.path.relpath(filepath, os.path.dirname(src_dir))
                    # Ensure forward slashes for Linux compatibility
                    rel_path = rel_path.replace('\\', '/')
                    zipf.write(filepath, rel_path)
                    print(f"Added dir file: {filepath} as {rel_path}")
        else:
            print(f"FAILED to find dir: {src_dir}")

print(f"Successfully created {zip_name}")
try:
    shutil.copy2(zip_name, 'medvastr-prod-final.zip')
    print("Copied zip to backend/medvastr-prod-final.zip")
except Exception as e:
    print(f"Non-blocking copy error: {e}")
