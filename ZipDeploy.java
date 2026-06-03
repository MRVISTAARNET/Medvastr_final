import java.io.*;
import java.util.zip.*;
import java.nio.file.*;

public class ZipDeploy {
    public static void main(String[] args) throws Exception {
        String zipFile = "medvastr-deploy-latest.zip";
        FileOutputStream fos = new FileOutputStream(zipFile);
        ZipOutputStream zos = new ZipOutputStream(fos);

        // Add JAR
        File targetDir = new File("backend/target");
        File[] jars = targetDir
                .listFiles((d, n) -> n.endsWith(".jar") && !n.endsWith("-sources.jar") && !n.endsWith("-javadoc.jar"));
        if (jars != null && jars.length > 0) {
            File jar = jars[0];
            addToZip(jar, jar.getName(), zos);
        } else {
            System.out.println("No JAR found");
        }

        // Add Procfile
        File procfile = new File("backend/Procfile");
        if (procfile.exists()) {
            addToZip(procfile, "Procfile", zos);
        }

        // Add .ebextensions
        Path startPath = Paths.get("backend/.ebextensions");
        if (Files.exists(startPath)) {
            Files.walk(startPath).filter(p -> !Files.isDirectory(p)).forEach(p -> {
                String entryName = ".ebextensions/" + startPath.relativize(p).toString().replace("\\", "/");
                try {
                    addToZip(p.toFile(), entryName, zos);
                } catch (Exception e) {
                }
            });
        }

        zos.close();
        fos.close();
        System.out.println("Created ZIP: " + zipFile + " with correctly formatted forward-slash entries.");
    }

    private static void addToZip(File file, String name, ZipOutputStream zos) throws Exception {
        FileInputStream fis = new FileInputStream(file);
        ZipEntry zipEntry = new ZipEntry(name);
        zos.putNextEntry(zipEntry);

        byte[] bytes = new byte[1024];
        int length;
        while ((length = fis.read(bytes)) >= 0) {
            zos.write(bytes, 0, length);
        }
        zos.closeEntry();
        fis.close();
        System.out.println("Added: " + name);
    }
}
