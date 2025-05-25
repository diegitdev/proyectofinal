package com.example.proyectofinal.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", 
                        "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", 
                        "http://localhost:5179", "http://localhost:5180"}, 
             allowCredentials = "false")
@RequestMapping("/uploads")
public class FileController {

    @Value("${upload.dir}")
    private String uploadDir;

    @GetMapping("/{folder}/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String folder, @PathVariable String filename) {
        try {
            // Construir la ruta completa al archivo
            Path filePath = Paths.get(uploadDir).resolve(folder).resolve(filename);
            Resource resource = new UrlResource(filePath.toUri());
            
            // Verificar si el archivo existe y es legible
            if (resource.exists() && resource.isReadable()) {
                // Determinar el tipo de contenido basado en la extensión del archivo
                String contentType = determineContentType(filename);
                
                System.out.println("Sirviendo archivo: " + filePath.toString() + " con tipo MIME: " + contentType);
                
                // Construir la respuesta con los headers adecuados
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*") // Permitir cualquier origen
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            } else {
                System.err.println("Archivo no encontrado o no legible: " + filePath.toString());
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            System.err.println("Error al construir URL para el archivo: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.err.println("Error al servir el archivo: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    private String determineContentType(String filename) {
        String extension = "";
        int i = filename.lastIndexOf('.');
        if (i > 0) {
            extension = filename.substring(i + 1).toLowerCase();
        }
        
        switch (extension) {
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            case "webp":
                return "image/webp";
            default:
                return "application/octet-stream";
        }
    }
} 