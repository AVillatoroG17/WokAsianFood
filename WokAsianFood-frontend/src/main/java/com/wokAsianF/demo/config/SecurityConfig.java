package com.wokAsianF.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpMethod;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
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
// ✅ 1. HABILITAR SEGURIDAD DE MÉTODO para que @PreAuthorize funcione
@EnableMethodSecurity(prePostEnabled = true)
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

						.requestMatchers("/api/cocina/**", "/cocina/**")
						.hasAnyAuthority("ROLE_COCINERO", "ROLE_ADMIN")

						// Corregir la regla de POST para evitar duplicados y conflictos
						.requestMatchers(HttpMethod.POST, "/api/ordenes", "/api/ordenes/**")
						.hasAnyAuthority("ROLE_MESERO", "ROLE_ADMIN")

						// ✅ 2. FIX CLAVE: Incluir ROLE_CAJERO y ROLE_ENCARGADO para obtener órdenes
						.requestMatchers(HttpMethod.GET, "/api/ordenes", "/api/ordenes/**")
						.hasAnyAuthority("ROLE_MESERO", "ROLE_ADMIN", "ROLE_COCINERO", "ROLE_CAJERO", "ROLE_ENCARGADO")

						.requestMatchers(HttpMethod.PUT, "/api/ordenes/**")
						.hasAnyAuthority("ROLE_MESERO", "ROLE_ADMIN")

						// ✅ NUEVA REGLA ESPECÍFICA para marcar como SERVIDA
						.requestMatchers(HttpMethod.PATCH, "/api/ordenes/*/servida")
						.hasAnyAuthority("ROLE_MESERO", "ROLE_ADMIN")

						// Regla para enviar a cocina y actualizar estado de la orden general
						.requestMatchers(HttpMethod.PATCH, "/api/ordenes/**")
						.hasAnyAuthority("ROLE_MESERO", "ROLE_ADMIN", "ROLE_COCINERO")

						.requestMatchers(HttpMethod.DELETE, "/api/ordenes/**")
						.hasAnyAuthority("ROLE_ADMIN")

						// Platillos - Permitir GET para todos los roles que lo necesiten
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

						// Configuración de Pagos: Debe incluir a Cajero
						.requestMatchers("/api/pagos/**")
						.hasAnyAuthority("ROLE_ADMIN", "ROLE_CAJERO", "ROLE_MESERO")

						// Estadísticas
						.requestMatchers("/api/v1/estadisticas")
						.hasAuthority("ROLE_ADMIN")

						// Usuarios (para crear usuarios)
						.requestMatchers("/api/usuarios/**")
						.hasAuthority("ROLE_ADMIN")

						.requestMatchers(HttpMethod.POST, "/api/mesas").hasAuthority("ROLE_ADMIN")
						.requestMatchers(HttpMethod.PUT, "/api/mesas/**").hasAuthority("ROLE_ADMIN")
						.requestMatchers(HttpMethod.DELETE, "/api/mesas/**").hasAuthority("ROLE_ADMIN")

						.requestMatchers(HttpMethod.GET, "/api/mesas", "/api/mesas/**")
						.hasAnyAuthority("ROLE_MESERO", "ROLE_ADMIN")

						.requestMatchers("/api/clientes/**").hasAnyAuthority("ROLE_MESERO", "ROLE_ADMIN")

						.anyRequest().authenticated())

				.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}
}
