import zipfile
import os

def zip_dir(path, zip_handler):
    for root, dirs, files in os.walk(path):
        for file in files:
            # Create a relative path for the file in the zip
            rel_path = os.path.relpath(os.path.join(root, file), path)
            # Use forward slashes for the zip entry name (VERY IMPORTANT for Linux AWS)
            zip_entry_name = rel_path.replace('\\', '/')
            zip_handler.write(os.path.join(root, file), zip_entry_name)

if __name__ == "__main__":
    zip_name = 'medvastr-prod-FINAL-SOLID.zip'
    source_dir = 'deploy_fixed'
    
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        zip_dir(source_dir, zip_file)
    
    print(f"Successfully created {zip_name} with forward slashes.")
