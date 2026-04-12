"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      // Esto le pega a tu controlador de Java en el puerto 8081
      const res = await fetch("http://localhost:8081/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password: pass }),
      });

      const success = await res.json();
      if (success) {
        // Guardamos la sesión en el navegador
        localStorage.setItem("auth", "true");
        router.push("/");
      } else {
        alert("Usuario o clave incorrectos");
      }
    } catch (error) {
      alert("Error: Asegurate que el servidor Java en NetBeans esté corriendo");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", backgroundColor: "#1e293b" }}>
      <div style={{ padding: "40px", backgroundColor: "white", borderRadius: "12px", width: "350px", textAlign: "center", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
        <h1 style={{ color: "#1e3a8a", marginBottom: "20px", fontSize: "24px", fontWeight: "bold" }}>Hotel Paraná</h1>
        <p style={{ color: "#64748b", marginBottom: "20px" }}>Ingrese sus credenciales</p>
        
        <input 
          type="text" 
          placeholder="Usuario" 
          onChange={(e) => setUser(e.target.value)} 
          style={{ display: "block", width: "100%", marginBottom: "15px", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "6px", color: "black" }} 
        />
        
        <input 
          type="password" 
          placeholder="Contraseña" 
          onChange={(e) => setPass(e.target.value)} 
          style={{ display: "block", width: "100%", marginBottom: "20px", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "6px", color: "black" }} 
        />
        
        <button 
          onClick={handleLogin} 
          style={{ width: "100%", padding: "12px", background: "#2563eb", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
        >
          INGRESAR
        </button>
      </div>
    </div>
  );
}