import zipfile
import os
import glob

def create_zip():
    with zipfile.ZipFile("medvastr-deploy-latest.zip", "w", zipfile.ZIP_DEFLATED) as zf:
        # Add JAR to root
        jar_files = glob.glob("backend/target/*.jar")
        if not jar_files:
            print("No JAR found in backend/target/")
            return
        
        jar_path = None
        for f in jar_files:
            if not f.endswith("-sources.jar") and not f.endswith("-javadoc.jar"):
                jar_path = f
                break
        
        if jar_path:
            # We want the JAR at the root, so arcname is just the file name
            zf.write(jar_path, os.path.basename(jar_path))
        
        # Add Procfile to root
        if os.path.exists("backend/Procfile"):
            zf.write("backend/Procfile", "Procfile")
        
        # Add .ebextensions to root
        for root, dirs, files in os.walk("backend/.ebextensions"):
            for file in files:
                file_path = os.path.join(root, file)
                arc_name = file_path.replace("backend\\", "").replace("backend/", "")
                # Ensure forward slashes for zip (Linux expects this! Windows PowerShell Compress-Archive uses backslashes in the header!)
                arc_name = arc_name.replace("\\", "/")
                zf.write(file_path, arc_name)

    print("Created medvastr-deploy-latest.zip successfully with forward slashes.")

if __name__ == "__main__":
    create_zip()
