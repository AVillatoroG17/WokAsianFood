package com.wokAsianF.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpMethod;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import com.wokAsianF.demo.seguridad.jwt.JwtRequestFilter;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtRequestFilter jwtRequestFilter;

    public SecurityConfig(JwtRequestFilter jwtRequestFilter) {
        this.jwtRequestFilter = jwtRequestFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        // ✅ AGREGADO PATCH que faltaba
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()

                        // Cocina
                        .requestMatchers("/api/cocina/**", "/cocina/**")
                        .hasAnyAuthority("ROLE_COCINERO", "ROLE_ADMIN")

                        // ✅ Órdenes - CORREGIDO: Agregados PATCH y orden específico
                        .requestMatchers(HttpMethod.POST, "/api/ordenes", "/api/ordenes/**").permitAll()
                        
                        .requestMatchers(HttpMethod.GET, "/api/ordenes", "/api/ordenes/**")
                        .hasAnyAuthority("ROLE_MESERO", "ROLE_ADMIN", "ROLE_COCINERO")
                        
                        .requestMatchers(HttpMethod.PUT, "/api/ordenes/**")
                        .hasAnyAuthority("ROLE_MESERO", "ROLE_ADMIN")
                        
                        // ✅ AGREGADO: PATCH para actualizar estados
                        .requestMatchers(HttpMethod.PATCH, "/api/ordenes/**")
                        .hasAnyAuthority("ROLE_MESERO", "ROLE_ADMIN", "ROLE_COCINERO")
                        
                        .requestMatchers(HttpMethod.DELETE, "/api/ordenes/**")
                        .hasAnyAuthority("ROLE_ADMIN")

                        // Platillos - ✅ Permitir GET para todos los roles que lo necesiten
                        .requestMatchers(HttpMethod.GET, "/api/platillos", "/api/platillos/**")
                        .hasAnyAuthority("ROLE_MESERO", "ROLE_ADMIN", "ROLE_COCINERO")
                        
                        .requestMatchers(HttpMethod.POST, "/api/platillos")
                        .hasAuthority("ROLE_ADMIN")
                        
                        .requestMatchers(HttpMethod.PUT, "/api/platillos/**")
                        .hasAuthority("ROLE_ADMIN")
                        
                        .requestMatchers(HttpMethod.PATCH, "/api/platillos/**")
                        .hasAuthority("ROLE_ADMIN")
                        
                        .requestMatchers(HttpMethod.DELETE, "/api/platillos/**")
                        .hasAuthority("ROLE_ADMIN")

                        // Mesas y clientes
                        .requestMatchers("/api/mesas/**", "/api/clientes/**")
                        .hasAnyAuthority("ROLE_MESERO", "ROLE_ADMIN")

                        // Estadísticas
                        .requestMatchers("/api/v1/estadisticas")
                        .hasAuthority("ROLE_ADMIN")

                        // Usuarios (para crear usuarios)
                        .requestMatchers("/api/usuarios/**")
                        .hasAuthority("ROLE_ADMIN")

                        .anyRequest().authenticated())

                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}