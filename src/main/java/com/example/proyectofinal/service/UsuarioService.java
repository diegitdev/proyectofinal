package com.example.proyectofinal.service;

import com.example.proyectofinal.model.Usuario;
import com.example.proyectofinal.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> findById(Long id) {
        return usuarioRepository.findById(id);
    }

    public Optional<Usuario> findByCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo);
    }

    @Transactional
    public Usuario save(Usuario usuario) {
        // Encriptar contraseña antes de guardar
        usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario update(Long id, Usuario usuario) {
        if (usuarioRepository.existsById(id)) {
            usuario.setId(id);
            // Si la contraseña está vacía, mantener la anterior
            if (usuario.getContrasena() == null || usuario.getContrasena().isEmpty()) {
                Usuario usuarioExistente = usuarioRepository.findById(id).orElseThrow();
                usuario.setContrasena(usuarioExistente.getContrasena());
            } else {
                usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));
            }
            return usuarioRepository.save(usuario);
        }
        return null;
    }

    @Transactional
    public void deleteById(Long id) {
        usuarioRepository.deleteById(id);
    }

    public boolean validateCredentials(String correo, String contrasena) {
        return usuarioRepository.findByCorreo(correo)
                .map(usuario -> passwordEncoder.matches(contrasena, usuario.getContrasena()))
                .orElse(false);
    }
} 