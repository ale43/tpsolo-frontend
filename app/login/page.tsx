"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue sola al presionar Enter
    try {
      const res = await fetch("http://localhost:8081/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password: pass }),
      });
      const responseText = await res.text();
      if (responseText.trim().toLowerCase() === "true") {
        document.cookie = "sesion_usuario=activa; path=/; max-age=86400; SameSite=Strict";
        localStorage.setItem("auth", "true");
        router.push("/");
      } else {
        alert("Usuario o clave incorrectos");
      }
    } catch (error) {
      alert("Error: Servidor Java no disponible.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", backgroundColor: "#1e293b" }}>
      <div style={{ padding: "40px", backgroundColor: "white", borderRadius: "12px", width: "350px", textAlign: "center", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
        <h1 style={{ color: "#1e3a8a", marginBottom: "20px", fontSize: "24px", fontWeight: "bold" }}>Hotel Paraná</h1>
        <p style={{ color: "#64748b", marginBottom: "20px" }}>Ingrese sus credenciales</p>
        
        {/* Formulario de Login */}
        <form onSubmit={handleLogin}>
          <input 
            type="text" 
            placeholder="Usuario" 
            value={user}
            onChange={(e) => setUser(e.target.value)} 
            style={{ display: "block", width: "100%", marginBottom: "15px", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "6px", color: "black" }} 
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={pass}
            onChange={(e) => setPass(e.target.value)} 
            style={{ display: "block", width: "100%", marginBottom: "20px", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "6px", color: "black" }} 
          />
          <button 
            type="submit" 
            style={{ width: "100%", padding: "12px", background: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", marginBottom: "15px" }}
          >
            INGRESAR
          </button>
        </form>

        {/* Sección para ir a Registro */}
        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "15px" }}>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "10px" }}>¿No tiene cuenta?</p>
          <button 
            type="button" 
            onClick={() => router.push("/registro")} 
            style={{ width: "100%", padding: "12px", background: "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
          >
            CREAR CUENTA
          </button>
        </div>
      </div>
    </div>
  );
}