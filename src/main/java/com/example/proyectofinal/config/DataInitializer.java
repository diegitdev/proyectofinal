package com.example.proyectofinal.config;

import java.util.Arrays;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.proyectofinal.model.Categoria;
import com.example.proyectofinal.model.NotaOlfativa;
import com.example.proyectofinal.model.Perfume;
import com.example.proyectofinal.model.Usuario;
import com.example.proyectofinal.repository.CategoriaRepository;
import com.example.proyectofinal.repository.NotaOlfativaRepository;
import com.example.proyectofinal.repository.PerfumeRepository;
import com.example.proyectofinal.service.UsuarioService;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioService usuarioService;
    
    @Autowired
    private CategoriaRepository categoriaRepository;
    
    @Autowired
    private NotaOlfativaRepository notaOlfativaRepository;
    
    @Autowired
    private PerfumeRepository perfumeRepository;
    
    @Override
    @Transactional
    public void run(String... args) throws Exception {
        try {
            // Crear categorías
            Categoria categoria1 = new Categoria();
            categoria1.setNombre("Florales");
            categoriaRepository.save(categoria1);

            Categoria categoria2 = new Categoria();
            categoria2.setNombre("Cítricos");
            categoriaRepository.save(categoria2);

            // Crear notas olfativas
            NotaOlfativa nota1 = new NotaOlfativa();
            nota1.setNombre("Rosa");
            nota1.setDescripcion("Nota floral dulce y romántica");
            notaOlfativaRepository.save(nota1);

            NotaOlfativa nota2 = new NotaOlfativa();
            nota2.setNombre("Limón");
            nota2.setDescripcion("Nota cítrica fresca y energética");
            notaOlfativaRepository.save(nota2);

            // Crear perfumes
            Perfume perfume1 = new Perfume();
            perfume1.setNombre("Rosa del Desierto");
            perfume1.setPrecio(89.99);
            perfume1.setDescripcion("Un perfume floral con notas de rosa y jazmín");
            perfume1.setImagen("https://www.neo2.com/wp-content/uploads/2022/07/nuevo-perfume-unisex-louis-vuitton-fleur-du-desert-2.jpg");
            perfume1.setCategorias(Arrays.asList(categoria1));
            perfume1.setNotasOlfativas(Arrays.asList(nota1, nota2));
            perfumeRepository.save(perfume1);

            Perfume perfume2 = new Perfume();
            perfume2.setNombre("Citrus Fresh");
            perfume2.setPrecio(79.99);
            perfume2.setDescripcion("Un perfume cítrico refrescante");
            perfume2.setImagen("https://media.revistagq.com/photos/62fb4628862d960172aa68b0/master/w_1600%2Cc_limit/U0ffed9fd738d44f182ad2016c5abab12X.jpg");
            perfume2.setCategorias(Arrays.asList(categoria2));
            perfume2.setNotasOlfativas(Arrays.asList(nota1, nota2));
            perfumeRepository.save(perfume2);

            // Crear categorías adicionales
            Categoria categoria3 = new Categoria();
            categoria3.setNombre("Amaderados");
            categoriaRepository.save(categoria3);

            Categoria categoria4 = new Categoria();
            categoria4.setNombre("Orientales");
            categoriaRepository.save(categoria4);

            // Crear notas olfativas adicionales
            NotaOlfativa nota3 = new NotaOlfativa();
            nota3.setNombre("Sándalo");
            nota3.setDescripcion("Nota amaderada, cálida y cremosa");
            notaOlfativaRepository.save(nota3);

            NotaOlfativa nota4 = new NotaOlfativa();
            nota4.setNombre("Vainilla");
            nota4.setDescripcion("Nota dulce, cálida y reconfortante");
            notaOlfativaRepository.save(nota4);

            NotaOlfativa nota5 = new NotaOlfativa();
            nota5.setNombre("Jazmín");
            nota5.setDescripcion("Nota floral intensa y exótica");
            notaOlfativaRepository.save(nota5);

            NotaOlfativa nota6 = new NotaOlfativa();
            nota6.setNombre("Madera de Cedro");
            nota6.setDescripcion("Nota seca, amaderada y elegante");
            notaOlfativaRepository.save(nota6);

            // Perfume 3
            Perfume perfume3 = new Perfume();
            perfume3.setNombre("Sándalo Místico");
            perfume3.setPrecio(99.99);
            perfume3.setDescripcion("Perfume amaderado con sándalo y cedro");
            perfume3.setImagen("https://fraguru.com/mdimg/perfume/375x500.12345.jpg");
            perfume3.setCategorias(Arrays.asList(categoria3));
            perfume3.setNotasOlfativas(Arrays.asList(nota3, nota6));
            perfumeRepository.save(perfume3);

            // Perfume 4
            Perfume perfume4 = new Perfume();
            perfume4.setNombre("Vainilla Oriental");
            perfume4.setPrecio(109.99);
            perfume4.setDescripcion("Aromas orientales con vainilla y jazmín");
            perfume4.setImagen("https://fraguru.com/mdimg/perfume/375x500.54321.jpg");
            perfume4.setCategorias(Arrays.asList(categoria4));
            perfume4.setNotasOlfativas(Arrays.asList(nota4, nota5));
            perfumeRepository.save(perfume4);

            // Perfume 5
            Perfume perfume5 = new Perfume();
            perfume5.setNombre("Bosque Encantado");
            perfume5.setPrecio(95.50);
            perfume5.setDescripcion("Fragancia amaderada y floral");
            perfume5.setImagen("https://fraguru.com/mdimg/perfume/375x500.67890.jpg");
            perfume5.setCategorias(Arrays.asList(categoria3, categoria1));
            perfume5.setNotasOlfativas(Arrays.asList(nota3, nota1, nota5));
            perfumeRepository.save(perfume5);

            // Perfume 6
            Perfume perfume6 = new Perfume();
            perfume6.setNombre("Cítrico Oriental");
            perfume6.setPrecio(88.00);
            perfume6.setDescripcion("Fusión de cítricos y especias orientales");
            perfume6.setImagen("https://fraguru.com/mdimg/perfume/375x500.13579.jpg");
            perfume6.setCategorias(Arrays.asList(categoria2, categoria4));
            perfume6.setNotasOlfativas(Arrays.asList(nota2, nota4));
            perfumeRepository.save(perfume6);

            // Perfume 7
            Perfume perfume7 = new Perfume();
            perfume7.setNombre("Jardín de Jazmín");
            perfume7.setPrecio(92.75);
            perfume7.setDescripcion("Perfume floral con predominio de jazmín");
            perfume7.setImagen("https://fraguru.com/mdimg/perfume/375x500.24680.jpg");
            perfume7.setCategorias(Arrays.asList(categoria1));
            perfume7.setNotasOlfativas(Arrays.asList(nota5, nota1));
            perfumeRepository.save(perfume7);

            // Perfume 8
            Perfume perfume8 = new Perfume();
            perfume8.setNombre("Cedro Intenso");
            perfume8.setPrecio(105.00);
            perfume8.setDescripcion("Fragancia intensa de madera de cedro");
            perfume8.setImagen("https://fraguru.com/mdimg/perfume/375x500.11223.jpg");
            perfume8.setCategorias(Arrays.asList(categoria3));
            perfume8.setNotasOlfativas(Arrays.asList(nota6));
            perfumeRepository.save(perfume8);

            // Perfume 9
            Perfume perfume9 = new Perfume();
            perfume9.setNombre("Dulce Amanecer");
            perfume9.setPrecio(98.90);
            perfume9.setDescripcion("Notas dulces de vainilla y flores");
            perfume9.setImagen("https://fraguru.com/mdimg/perfume/375x500.33445.jpg");
            perfume9.setCategorias(Arrays.asList(categoria1, categoria4));
            perfume9.setNotasOlfativas(Arrays.asList(nota4, nota1, nota5));
            perfumeRepository.save(perfume9);

            // Perfume 10
            Perfume perfume10 = new Perfume();
            perfume10.setNombre("Cítrico Amaderado");
            perfume10.setPrecio(102.30);
            perfume10.setDescripcion("Cítricos frescos con fondo amaderado");
            perfume10.setImagen("https://fraguru.com/mdimg/perfume/375x500.55667.jpg");
            perfume10.setCategorias(Arrays.asList(categoria2, categoria3));
            perfume10.setNotasOlfativas(Arrays.asList(nota2, nota3, nota6));
            perfumeRepository.save(perfume10);

            // Perfume 11
            Perfume perfume11 = new Perfume();
            perfume11.setNombre("Esencia de Verano");
            perfume11.setPrecio(87.40);
            perfume11.setDescripcion("Fragancia fresca y vibrante con limón y jazmín");
            perfume11.setImagen("https://fraguru.com/mdimg/perfume/375x500.77889.jpg");
            perfume11.setCategorias(Arrays.asList(categoria2, categoria1));
            perfume11.setNotasOlfativas(Arrays.asList(nota2, nota5));
            perfumeRepository.save(perfume11);

            // Perfume 12
            Perfume perfume12 = new Perfume();
            perfume12.setNombre("Noche Oriental");
            perfume12.setPrecio(115.60);
            perfume12.setDescripcion("Perfume intenso y cálido con vainilla y sándalo");
            perfume12.setImagen("https://fraguru.com/mdimg/perfume/375x500.99001.jpg");
            perfume12.setCategorias(Arrays.asList(categoria4, categoria3));
            perfume12.setNotasOlfativas(Arrays.asList(nota4, nota3));
            perfumeRepository.save(perfume12);

            // Crear usuario admin
            Usuario admin = new Usuario();
            admin.setNombre("Administrador");
            admin.setCorreo("admin@perfumes.com");
            admin.setContrasena("admin123");
            admin.setRol("ADMIN");
            usuarioService.save(admin);

            // Crear usuario normal
            Usuario usuario = new Usuario();
            usuario.setNombre("Usuario Normal");
            usuario.setCorreo("usuario@perfumes.com");
            usuario.setContrasena("usuario123");
            usuario.setRol("USUARIO");
            usuarioService.save(usuario);
            
            System.out.println("Inicialización de datos completada con éxito");
        } catch (Exception e) {
            System.err.println("Error al inicializar datos: " + e.getMessage());
            e.printStackTrace();
        }
    }
} 