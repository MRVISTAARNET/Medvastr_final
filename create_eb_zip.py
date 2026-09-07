import os
import zipfile

root_dir = r"c:\Users\Admin\Desktop\Final_Medvastr"
zip_path = os.path.join(root_dir, "medvastr-backend-eb.zip")
timestamped_zip = os.path.join(root_dir, "medvastr-deploy-20260907-1635.zip")
backend_dir = os.path.join(root_dir, "backend")

def create_bundle(target_path):
    if os.path.exists(target_path):
        os.remove(target_path)

    with zipfile.ZipFile(target_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        jar_path = os.path.join(backend_dir, "target", "backend-0.0.1-SNAPSHOT.jar")
        zf.write(jar_path, "application.jar")
        
        proc_path = os.path.join(backend_dir, "Procfile")
        zf.write(proc_path, "Procfile")

        eb_dir = os.path.join(backend_dir, ".ebextensions")
        if os.path.exists(eb_dir):
            for root, _, files in os.walk(eb_dir):
                for file in files:
                    full_p = os.path.join(root, file)
                    rel_p = os.path.relpath(full_p, backend_dir)
                    arcname = rel_p.replace("\\", "/")
                    zf.write(full_p, arcname)

    size_mb = os.path.getsize(target_path) / (1024 * 1024)
    print(f"Successfully created {target_path} ({size_mb:.2f} MB)")

create_bundle(zip_path)
create_bundle(timestamped_zip)
