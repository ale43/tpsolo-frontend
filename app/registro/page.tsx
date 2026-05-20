"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegistroPage() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const router = useRouter();

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue sola al presionar Enter

    if (!user || !pass || !confirmPass) {
      return alert("Por favor, completá todos los campos.");
    }

    if (pass !== confirmPass) {
      return alert("Las contraseñas no coinciden.");
    }

    try {
      const res = await fetch("http://localhost:8081/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password: pass }),
      });

      if (res.ok) {
        alert("¡Usuario creado con éxito! Ahora podés iniciar sesión.");
        router.push("/login"); // Te manda al login automáticamente
      } else {
        alert("Error al registrar el usuario. Quizás el nombre ya existe.");
      }
    } catch (error) {
      alert("Error: Asegurate que el servidor Java en NetBeans esté corriendo.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", backgroundColor: "#1e293b" }}>
      <div style={{ padding: "40px", backgroundColor: "white", borderRadius: "12px", width: "350px", textAlign: "center", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
        <h1 style={{ color: "#1e3a8a", marginBottom: "10px", fontSize: "24px", fontWeight: "bold" }}>Hotel Paraná</h1>
        <p style={{ color: "#64748b", marginBottom: "20px" }}>Crear una nueva cuenta</p>
        
        {/* Formulario de Registro */}
        <form onSubmit={handleRegistro}>
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
            style={{ display: "block", width: "100%", marginBottom: "15px", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "6px", color: "black" }} 
          />

          <input 
            type="password" 
            placeholder="Confirmar Contraseña" 
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)} 
            style={{ display: "block", width: "100%", marginBottom: "20px", padding: "12px", border: "1px solid #cbd5e1", borderRadius: "6px", color: "black" }} 
          />
          
          <button 
            type="submit"
            style={{ width: "100%", padding: "12px", background: "#10b981", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", marginBottom: "15px" }}
          >
            REGISTRARME
          </button>
        </form>

        {/* Botón para volver atrás */}
        <button 
          type="button"
          onClick={() => router.push("/login")}
          style={{ width: "100%", padding: "12px", background: "transparent", color: "#2563eb", border: "1px solid #2563eb", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
        >
          VOLVER AL LOGIN
        </button>
      </div>
    </div>
  );
}