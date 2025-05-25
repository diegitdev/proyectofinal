package com.example.proyectofinal.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.proyectofinal.dto.LoginDTO;
import com.example.proyectofinal.model.Usuario;
import com.example.proyectofinal.service.UsuarioService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", 
                        "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", 
                        "http://localhost:5179", "http://localhost:5180"}, 
             allowCredentials = "true")
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {
        try {
            // Registrar la solicitud para depuración
            System.out.println("Intento de login para: " + loginDTO.getCorreo());
            
            // Verificar credenciales
            if (loginDTO.getCorreo() == null || loginDTO.getContrasena() == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "mensaje", "Correo y contraseña son obligatorios"
                ));
            }

            // Validar credenciales
            boolean credencialesValidas = usuarioService.validateCredentials(
                loginDTO.getCorreo(), loginDTO.getContrasena());
            
            if (!credencialesValidas) {
                System.out.println("Credenciales inválidas para: " + loginDTO.getCorreo());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "mensaje", "Credenciales incorrectas"
                ));
            }
            
            // Obtener usuario
            Usuario usuario = usuarioService.findByCorreo(loginDTO.getCorreo())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            // Crear token simple (para un sistema real se usaría JWT)
            String token = generateSimpleToken(usuario);
            
            // Preparar respuesta
            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("token", token);
            respuesta.put("id", usuario.getId());
            respuesta.put("nombre", usuario.getNombre());
            respuesta.put("correo", usuario.getCorreo());
            respuesta.put("rol", usuario.getRol());
            
            System.out.println("Login exitoso para: " + loginDTO.getCorreo());
            return ResponseEntity.ok(respuesta);
            
        } catch (Exception e) {
            System.err.println("Error en login: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "mensaje", "Error interno del servidor",
                "error", e.getMessage()
            ));
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Usuario usuario) {
        try {
            // Registrar la solicitud para depuración
            System.out.println("Intento de registro para: " + usuario.getCorreo());
            
            // Validar datos básicos
            if (usuario.getNombre() == null || usuario.getCorreo() == null || usuario.getContrasena() == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "mensaje", "Nombre, correo y contraseña son obligatorios"
                ));
            }
            
            // Verificar si el correo ya existe
            if (usuarioService.findByCorreo(usuario.getCorreo()).isPresent()) {
                System.out.println("Correo ya existe: " + usuario.getCorreo());
                return ResponseEntity.badRequest().body(Map.of(
                    "mensaje", "Este correo ya está registrado"
                ));
            }
            
            // Establecer el rol por defecto
            if (usuario.getRol() == null || usuario.getRol().isEmpty()) {
                usuario.setRol("CLIENTE");
            }
            
            // Guardar el usuario
            Usuario nuevoUsuario = usuarioService.save(usuario);
            
            // Crear token simple
            String token = generateSimpleToken(nuevoUsuario);
            
            // Preparar respuesta
            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("token", token);
            respuesta.put("id", nuevoUsuario.getId());
            respuesta.put("nombre", nuevoUsuario.getNombre());
            respuesta.put("correo", nuevoUsuario.getCorreo());
            respuesta.put("rol", nuevoUsuario.getRol());
            
            System.out.println("Registro exitoso para: " + usuario.getCorreo());
            return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
            
        } catch (Exception e) {
            System.err.println("Error en registro: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "mensaje", "Error interno del servidor",
                "error", e.getMessage()
            ));
        }
    }
    
    private String generateSimpleToken(Usuario usuario) {
        // En un sistema real, aquí usaríamos JWT u otra tecnología de token
        // Por ahora, generamos un token simple basado en información del usuario
        return "token-" + usuario.getId() + "-" + System.currentTimeMillis();
    }
} 