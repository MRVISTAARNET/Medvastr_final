import os
import zipfile

zip_path = r"c:\Users\Admin\Desktop\Final_Medvastr\medvastr-backend-eb.zip"
backend_dir = r"c:\Users\Admin\Desktop\Final_Medvastr\backend"

# Remove existing zip if any
if os.path.exists(zip_path):
    os.remove(zip_path)

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    # 1. Add application.jar
    jar_path = os.path.join(backend_dir, "target", "backend-0.0.1-SNAPSHOT.jar")
    zf.write(jar_path, "application.jar")
    print("Added application.jar")

    # 2. Add Procfile
    proc_path = os.path.join(backend_dir, "Procfile")
    zf.write(proc_path, "Procfile")
    print("Added Procfile")

    # 3. Add .ebextensions directory recursively with forward slashes
    eb_dir = os.path.join(backend_dir, ".ebextensions")
    if os.path.exists(eb_dir):
        for root, _, files in os.walk(eb_dir):
            for file in files:
                full_p = os.path.join(root, file)
                rel_p = os.path.relpath(full_p, backend_dir)
                # Ensure forward slashes for Linux unzip compatibility
                arcname = rel_p.replace("\\", "/")
                zf.write(full_p, arcname)
                print(f"Added {arcname}")

print(f"Successfully created {zip_path}")
